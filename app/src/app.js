// core-hunter orchestrator — wires BLE → capture → IndexedDB queue → MQTT,
// renders the map FROM the IndexedDB store (resilient to BLE/MQTT drops),
// drives the HUD and controls.
//
// Pipeline per 0x88 frame:
//   parseFrame → code check → parsePacket → classifyReception
//   → GPS fix (drop if none) → buildRecord → queue.add → updateHud
//
// Render tick (1s): non-destructive queue.takeAll() → makeFilter → map.render
// Drain tick (5s):  non-destructive queue.takeAll() → publish unpublished rows
//                   → add id to state.published Set (no queue.remove ever)

import { WebBluetoothTransport } from './transport.js'
import { parseFrame, PUSH_CODE_LOG_RX_DATA } from './frames.js'
import { parsePacket, classifyReception } from './meshpacket.js'
import { buildRecord, shouldCapture } from './capture.js'
import { Queue } from './queue.js'
import { Publisher } from './publisher.js'
import { Gps } from './gps.js'
import { requestSelfInfo } from './selfinfo.js'
import { loadConfig, getConfig } from './config.js'
import { createHuntMap } from './huntmap.js'
import { makeFilter } from './filters.js'
import { rssiTier } from './signal.js'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const state = {
  transport: null,
  gps: new Gps(),
  queue: new Queue(),
  publisher: null,
  rxPubkey: '',
  name: '',
  map: null,
  connected: false,
  // Drain dedup: in-memory Set of row ids already published this session.
  // Rows are NEVER deleted from IndexedDB — the local store is the hunter's
  // working set; re-publish dedup is the backend's concern (via raw+rx_at).
  // On app restart the Set is empty, so rows are republished; that is fine.
  published: new Set(),
  filter: {
    sender: null,
    types: null,
    windowMs: 10 * 60 * 1000,
    directOnly: true,
  },
}

// ---------------------------------------------------------------------------
// DOM helpers
// ---------------------------------------------------------------------------

const el = (id) => document.getElementById(id)

// ---------------------------------------------------------------------------
// HUD
// ---------------------------------------------------------------------------

// SNR tier → bar fill 0–100%.  hot=100, warm=80, mid=60, cool=40, cold=20, none=10
const TIER_PCT = { hot: 100, warm: 80, mid: 60, cool: 40, cold: 20, none: 10 }

function updateHud(rec) {
  el('hud-snr').textContent = rec.snr != null ? rec.snr.toFixed(1) + ' dB' : '—'
  el('hud-rssi').textContent = rec.rssi != null ? rec.rssi + ' dBm' : '—'
  el('hud-hop').textContent = 'hop ' + (rec.hops != null ? rec.hops : '—')
  const offset = (getConfig() && getConfig().rssiCalibrationOffset) || 0
  const tier = rssiTier(rec.rssi, offset)
  const pct = TIER_PCT[tier] ?? 10
  el('hud-bar-fill').style.width = pct + '%'
}

function setDot(id, on) {
  const d = el(id)
  if (on) d.classList.add('on')
  else d.classList.remove('on')
}

// ---------------------------------------------------------------------------
// Capture pipeline
// ---------------------------------------------------------------------------

async function processFrame(dv) {
  const frame = parseFrame(dv)
  if (!frame || frame.code !== PUSH_CODE_LOG_RX_DATA) return

  const pkt = parsePacket(frame.raw)
  if (!pkt) return

  const cls = classifyReception('rx', pkt)
  if (!shouldCapture(cls)) return   // iteration 2: only zero-hop is captured/queued/published

  const fix = state.gps.latest()
  if (!fix) return // no GPS fix → drop (coverage without position is useless)

  const rec = buildRecord(frame, pkt, cls, fix, new Date().toISOString())
  await state.queue.add(rec)
  updateHud(rec)
}

// ---------------------------------------------------------------------------
// Render tick — reads ALL rows non-destructively (~every 1 s)
// ---------------------------------------------------------------------------
// queue.takeAll() uses a readonly IDB transaction (getAll) — it does NOT
// delete rows. It is safe to call it from the render path.

async function renderTick() {
  try {
    // Keep MQTT dot honest — reflects live broker connection state each tick
    setDot('dot-mqtt', state.publisher != null && state.publisher.connected())

    if (state.map) {
      const rows = await state.queue.takeAll()
      const now = Date.now()
      const fn = makeFilter(state.filter)
      const visible = rows.filter((r) => fn(r, now))
      state.map.render(visible, now)
    }
  } catch (_) {
    // silent — render failure must not crash the loop
  }
  setTimeout(renderTick, 1000)
}

// ---------------------------------------------------------------------------
// Drain tick — publish pending rows to MQTT (~every 5 s)
// ---------------------------------------------------------------------------
// Dedup via state.published (in-memory Set of row ids).
// Rows are NEVER removed from IndexedDB. If publish fails, the row stays
// unpublished and will be retried on the next drain.

async function drainLoop() {
  if (state.publisher && state.publisher.connected() && state.rxPubkey) {
    try {
      const rows = await state.queue.takeAll()
      let n = 0
      for (const r of rows) {
        if (state.published.has(r.id)) continue
        try {
          await state.publisher.publish(state.rxPubkey, r, state.name)
          state.published.add(r.id)
          n++
        } catch (_) {
          // publish failed — leave for next drain
        }
      }
      if (n > 0) console.debug('[drain] published', n, 'record(s)')
    } catch (_) {
      // queue read failed — retry next cycle
    }
  }
  setTimeout(drainLoop, 5000)
}

// ---------------------------------------------------------------------------
// Connect / disconnect
// ---------------------------------------------------------------------------

async function connectAll() {
  const btn = el('connect-btn')
  btn.disabled = true
  btn.textContent = 'Connecting…'

  try {
    // Dispose any prior transport first. On a spontaneous BLE drop the old
    // transport stays in its reconnect backoff loop (_intentional=false); without
    // this, a fresh connect would orphan it and double-capture once it reconnects.
    if (state.transport) {
      try { await state.transport.disconnect() } catch (_) {}
      state.transport = null
    }

    // 1. BLE transport
    state.transport = new WebBluetoothTransport()
    state.transport.onStatus((s) => {
      const on = s === 'connected'
      setDot('dot-ble', on)
      if (!on) state.connected = false
    })
    await state.transport.connect()
    state.connected = true
    setDot('dot-ble', true)

    // 2. Self info (companion pubkey + name)
    const info = await requestSelfInfo(state.transport, 'core-hunter')
    state.rxPubkey = info.pubkey.toLowerCase()
    state.name = info.name || ''

    // 3. GPS
    state.gps.start((fix) => {
      if (state.map) state.map.setPosition(fix.lat, fix.lon)
    })

    // 4. MQTT publisher
    const cfg = getConfig()
    if (cfg && cfg.mqttUrl) {
      state.publisher = new Publisher({
        url: cfg.mqttUrl,
        username: cfg.mqttUsername,
        password: cfg.mqttPassword,
        clientId: state.rxPubkey,
      })
      await state.publisher.connect()
      setDot('dot-mqtt', true)
    }

    // 5. Register frame handler
    state.transport.onFrame(processFrame)

    btn.textContent = 'Disconnect'
    btn.disabled = false
  } catch (e) {
    console.error('[connect]', e)
    btn.textContent = 'Connect (retry)'
    btn.disabled = false
    await disconnectAll(true)
  }
}

async function disconnectAll(silent) {
  setDot('dot-ble', false)
  setDot('dot-mqtt', false)
  state.connected = false

  if (state.publisher) { state.publisher.end(); state.publisher = null }
  try { state.gps.stop() } catch (_) {}
  if (state.transport) {
    try { await state.transport.disconnect() } catch (_) {}
    state.transport = null
  }

  if (!silent) {
    const btn = el('connect-btn')
    btn.textContent = 'Connect'
    btn.disabled = false
  }
}

// ---------------------------------------------------------------------------
// Filter sheet helpers
// ---------------------------------------------------------------------------

const FILTER_PACKET_TYPES = ['advert', 'discover', 'channel-msg', 'other']

function buildFilterSheet() {
  const sheet = el('filter-sheet')
  sheet.innerHTML = `
    <div class="filter-sheet-inner">
      <h2>Filters</h2>
      <label>
        <input type="checkbox" id="fs-direct-only" />
        Direct only
      </label>
      <label>
        Window
        <select id="fs-window">
          <option value="600000">10 min</option>
          <option value="1800000">30 min</option>
          <option value="3600000">1 h</option>
          <option value="0">All time</option>
        </select>
      </label>
      <div class="fs-type-row">
        <span class="fs-type-label">Types</span>
        <div id="fs-type-chips" class="fs-type-chips">
          ${FILTER_PACKET_TYPES.map(t => `<button class="fs-chip" data-type="${t}">${t}</button>`).join('')}
        </div>
      </div>
      <button id="fs-close">Done</button>
    </div>`

  const chk = el('fs-direct-only')
  const sel = el('fs-window')

  chk.checked = state.filter.directOnly
  sel.value = String(state.filter.windowMs)

  chk.addEventListener('change', () => { state.filter.directOnly = chk.checked })
  sel.addEventListener('change', () => { state.filter.windowMs = Number(sel.value) || null })

  // Type chips — clicking a chip toggles it; when nothing is selected, types → null
  el('fs-type-chips').addEventListener('click', (e) => {
    const chip = e.target.closest('.fs-chip')
    if (!chip) return
    chip.classList.toggle('active')
    const selected = [...el('fs-type-chips').querySelectorAll('.fs-chip.active')]
      .map(c => c.dataset.type)
    state.filter.types = selected.length > 0 ? new Set(selected) : null
  })

  el('fs-close').addEventListener('click', () => { sheet.hidden = true })
}

function buildSettingsSheet() {
  const sheet = el('settings-sheet')
  sheet.innerHTML = `
    <div class="settings-sheet-inner">
      <h2>Settings</h2>
      <label>
        <input type="checkbox" id="ss-theme" />
        Light theme
      </label>
      <button id="ss-close">Done</button>
    </div>`

  const chk = el('ss-theme')
  chk.checked = document.documentElement.dataset.theme === 'light'
  chk.addEventListener('change', () => {
    const theme = chk.checked ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    if (state.map) state.map.applyBasemap()
  })
  el('ss-close').addEventListener('click', () => { sheet.hidden = true })
}

// ---------------------------------------------------------------------------
// Layer-mode cycling
// ---------------------------------------------------------------------------

const LAYER_MODES = ['both', 'points', 'hex']
let layerIdx = 0

function cycleLayer() {
  layerIdx = (layerIdx + 1) % LAYER_MODES.length
  if (state.map) state.map.setLayerMode(LAYER_MODES[layerIdx])
}

// ---------------------------------------------------------------------------
// Isolate-sender event
// ---------------------------------------------------------------------------

document.addEventListener('hunt:isolate-sender', (e) => {
  state.filter.sender = e.detail || null
  const chip = el('target-chip')
  if (e.detail && e.detail.key) {
    chip.textContent = e.detail.key.slice(0, 12) + '…'
    chip.classList.add('active')
  } else {
    chip.textContent = 'No target'
    chip.classList.remove('active')
  }
})

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

window.addEventListener('DOMContentLoaded', async () => {
  // Load runtime config (non-fatal if missing — user may be offline)
  try {
    await loadConfig()
  } catch (e) {
    console.warn('[config]', e.message)
  }

  // Initialise map
  state.map = createHuntMap('map')

  // Build sheets (static HTML injected once)
  buildFilterSheet()
  buildSettingsSheet()

  // Wire controls
  el('connect-btn').addEventListener('click', () => {
    if (state.connected) disconnectAll()
    else connectAll()
  })

  el('layer-toggle').addEventListener('click', cycleLayer)

  el('filter-btn').addEventListener('click', () => {
    const sheet = el('filter-sheet')
    sheet.hidden = !sheet.hidden
    if (!sheet.hidden) el('settings-sheet').hidden = true
  })

  el('settings-btn').addEventListener('click', () => {
    const sheet = el('settings-sheet')
    sheet.hidden = !sheet.hidden
    if (!sheet.hidden) el('filter-sheet').hidden = true
  })

  // Target chip tap → clear isolation
  el('target-chip').addEventListener('click', () => {
    if (state.filter.sender) {
      document.dispatchEvent(new CustomEvent('hunt:isolate-sender', { detail: null }))
    }
  })

  // Start background loops
  renderTick()
  drainLoop()
})
