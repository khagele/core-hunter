import { hexCellAt, hexBoundary, hexResForZoom } from './hexgrid.js'
import { rssiTier, tierColorVar, fillOpacity, effectivePlotOffset } from './signal.js'
import { getConfig } from './config.js'
import { locate } from './locate.js'

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// Density-cloud ramp from the --ch-sig-* tokens (warm -> hot only), mirrors
// web/map.js's heatStops/heatColor so the single-hunter locate overlay looks
// the same as the multi-hunter one.
function heatStops() {
  const hex = (h) => { const s = h.replace('#', '').trim(); const n = s.length === 3 ? s.split('').map((x) => x + x).join('') : s; return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)] }
  return ['--ch-sig-mid', '--ch-sig-warm', '--ch-sig-hot'].map((nm) => hex(cssVar(nm)))
}
function heatColor(v, stops) {
  const t = Math.max(0, Math.min(1, v)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(t))
  const f = t - i
  const a = stops[i], b = stops[i + 1]
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f))
}
// Paint a normalized density grid to a canvas and return a Leaflet image overlay.
function heatmapOverlay(hm) {
  const { grid, rows, cols, bounds } = hm
  const canvas = document.createElement('canvas')
  canvas.width = cols; canvas.height = rows
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(cols, rows)
  const stops = heatStops()
  const FLOOR = 0.12
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r * cols + c]
      const y = rows - 1 - r
      const idx = (y * cols + c) * 4
      const [cr, cg, cb] = heatColor(v, stops)
      img.data[idx] = cr; img.data[idx + 1] = cg; img.data[idx + 2] = cb
      img.data[idx + 3] = v < FLOOR ? 0 : Math.round(210 * (v - FLOOR) / (1 - FLOOR))
    }
  }
  ctx.putImageData(img, 0, 0)
  return L.imageOverlay(canvas.toDataURL(), [[bounds.minLat, bounds.minLon], [bounds.maxLat, bounds.maxLon]],
    { opacity: 0.7, interactive: false })
}

export function createHuntMap(containerId) {
  if (typeof L === 'undefined') return { setPosition() {}, centerOn() {}, recenter() {}, stopFollow() {}, onFollowChange() {}, onLocate() {}, render() {}, setLayerMode() {}, applyBasemap() {}, focusReception() {}, setAttenuator() {}, destroy() {} }
  const cfg = getConfig()
  const calibrationOffset = (cfg && cfg.rssiCalibrationOffset) || 0
  // Plot offset = calibration + attenuator added back. Attenuator is set at
  // runtime (settings), so the offset is computed per render, not captured once.
  let attenuatorDb = 0
  const currentOffset = () => effectivePlotOffset(calibrationOffset, attenuatorDb)
  const map = L.map(containerId, { zoomControl: false }).setView([51, 4], 14)
  const TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  }
  let base = null
  function applyBasemap() {
    const which = cssVar('--ch-basemap') || 'dark'
    if (base) map.removeLayer(base)
    // CARTO's raster basemaps serve native tiles up to z20; maxZoom was capped
    // at 19, one level short of what the tiles actually support.
    base = L.tileLayer(TILES[which] || TILES.dark, { maxZoom: 20 }).addTo(map)
  }
  applyBasemap()
  const pointLayer = L.layerGroup().addTo(map)
  const hexLayer = L.layerGroup().addTo(map)
  const locateLayer = L.layerGroup().addTo(map)
  let mode = 'both', here = null, lastIsolatedId = null, onLocateCb = null

  let popupOpen = false
  map.on('popupopen', () => { popupOpen = true })
  map.on('popupclose', () => { popupOpen = false })

  // Follow mode: the map auto-centres on each GPS fix until the user drags the
  // map, then it stops following and a recenter button (wired in app.js) is
  // shown. follow is only released once we have a position to return to, so the
  // button is never offered when recenter would be a no-op.
  // On the first fix we zoom in to ACQUIRE_ZOOM (street level for hunting);
  // after that, follow keeps whatever zoom the user has set.
  const ACQUIRE_ZOOM = 18
  let follow = true, lastPos = null, onFollow = null, acquired = false
  map.on('dragstart', () => {
    if (follow && lastPos) { follow = false; if (onFollow) onFollow(false) }
  })
  // stopFollow mirrors the dragstart handler for the compass-button tap that
  // stops following without an actual pan (pressing the button while it
  // already shows the "following" glyph).
  function stopFollow() {
    if (follow) { follow = false; if (onFollow) onFollow(false) }
  }

  function pointStyle(rec) {
    const tier = rssiTier(rec.rssi, currentOffset())
    const color = cssVar(tierColorVar(tier))
    return {
      radius: 8,
      color,
      weight: 1,
      fillColor: color,
      fillOpacity: fillOpacity(tier),
    }
  }

  // Rendering is data-driven (the 1s tick calls render with fresh rows), but the
  // hex resolution depends on the zoom and Leaflet misplaces vector layers if they
  // are torn down and rebuilt mid zoom-animation — the rebuilt polygons miss the
  // animation transform and appear shifted from the basemap until the next
  // reproject. So cache the latest rows, skip rebuilds while a zoom is animating
  // (the existing layers animate correctly), and do one clean rebuild on zoomend.
  let lastRecords = []
  let zooming = false
  map.on('zoomstart', () => { zooming = true })
  map.on('zoomend', () => { zooming = false; draw() })

  function render(records, isolatedId) {
    lastRecords = records
    lastIsolatedId = isolatedId ?? null
    draw()
  }

  // Single-hunter "locate": when a sender is isolated, estimate its position
  // from this hunter's own receptions of it (RSSI-weighted centroid + density
  // heatmap, same pure algorithm as the multi-hunter web version — see
  // locate.js). No API/DB read here, just whatever this hunter has walked past.
  function drawLocate(records) {
    locateLayer.clearLayers()
    if (!lastIsolatedId) { if (onLocateCb) onLocateCb(null); return }
    const points = records
      .filter((r) => r.sender_id === lastIsolatedId && r.lat != null && r.lon != null)
      .map((r) => ({ lat: r.lat, lon: r.lon, rssi: r.rssi }))
    const res = locate(points)
    if (res.heatmap) heatmapOverlay(res.heatmap).addTo(locateLayer)
    if (res.centroid) {
      L.marker([res.centroid.lat, res.centroid.lon], {
        icon: L.divIcon({ className: '', html: '<div class="lc-centroid"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).bindTooltip('weighted estimate').addTo(locateLayer)
    }
    if (res.strongest) {
      L.marker([res.strongest.lat, res.strongest.lon], {
        icon: L.divIcon({ className: '', html: '<div class="lc-strongest">★</div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).bindTooltip('strongest reception').addTo(locateLayer)
    }
    if (onLocateCb) onLocateCb(res)
  }
  // onLocate registers a callback invoked with the locate() result (or null
  // when no sender is isolated) every render tick — drives the info readout.
  function onLocate(cb) { onLocateCb = cb }

  function draw() {
    if (popupOpen) return   // don't rebuild markers while the user is inspecting a popup (it would close it)
    if (zooming) return     // mid zoom-animation: keep current layers; zoomend triggers a clean rebuild
    const records = lastRecords
    pointLayer.clearLayers(); hexLayer.clearLayers()
    drawLocate(records)
    if (mode !== 'hex') {
      for (const r of records) {
        if (r.lat == null || r.lon == null) continue
        const m = L.circleMarker([r.lat, r.lon], pointStyle(r))
        m.bindPopup(popupHtml(r, lastIsolatedId))
        m.on('popupopen', (e) => { wireIsolate(e.popup, r); wireIgnore(e.popup, r) })
        m.addTo(pointLayer)
      }
    }
    if (mode !== 'points') {
      const cells = new Map()
      const res = hexResForZoom(map.getZoom())   // finer cells the more you zoom in
      for (const r of records) {
        if (r.lat == null || r.lon == null) continue
        const id = hexCellAt(r.lat, r.lon, res)
        const cur = cells.get(id)
        if (!cur || (r.rssi ?? -999) > (cur.best ?? -999)) cells.set(id, { best: r.rssi })
      }
      for (const [id, c] of cells) {
        // hexBoundary returns [lat,lon] pairs (closed ring) — directly usable by L.polygon
        const ring = hexBoundary(id); if (!ring) continue
        const tier = rssiTier(c.best, currentOffset())
        L.polygon(ring, { color: cssVar(tierColorVar(tier)), weight: 1,
          fillColor: cssVar(tierColorVar(tier)), fillOpacity: fillOpacity(tier) }).addTo(hexLayer)
      }
    }
  }
  function setPosition(lat, lon) {
    lastPos = [lat, lon]
    here = here || L.circleMarker([lat, lon], { radius: 6, color: cssVar('--ch-accent'), weight: 2 }).addTo(map)
    here.setLatLng([lat, lon])
    if (follow) {
      map.setView([lat, lon], acquired ? (map.getZoom() ?? ACQUIRE_ZOOM) : ACQUIRE_ZOOM)
      acquired = true
    }
  }
  function centerOn(lat, lon) { map.setView([lat, lon], map.getZoom() ?? 15) }
  // recenter re-enables follow and snaps back to the last known position.
  function recenter() {
    if (!lastPos) return
    follow = true
    map.setView(lastPos, map.getZoom() ?? 15)
    if (onFollow) onFollow(true)
  }
  // onFollowChange registers a callback invoked with the follow flag whenever it
  // flips (false when the user pans away, true on recenter).
  function onFollowChange(cb) { onFollow = cb }
  function setLayerMode(m) { mode = m }
  // setAttenuator updates the runtime attenuator (dB) used in the plot offset.
  // The next render tick repaints with the new tiers.
  function setAttenuator(db) { attenuatorDb = Number(db) || 0 }
  function focusReception(rec) {
    if (!rec || rec.lat == null || rec.lon == null) return
    centerOn(rec.lat, rec.lon)
    const popup = L.popup({ autoPan: true }).setLatLng([rec.lat, rec.lon]).setContent(popupHtml(rec, lastIsolatedId)).openOn(map)
    wireIsolate(popup, rec)
    wireIgnore(popup, rec)
  }
  function destroy() { map.remove() }
  return { setPosition, centerOn, recenter, stopFollow, onFollowChange, onLocate, render, setLayerMode, applyBasemap, focusReception, setAttenuator, destroy }
}

function popupHtml(r, isolatedId) {
  const esc = (s) => String(s ?? '—').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const kindLabel = { channel_name: 'name', advert_pubkey: 'node', discover_pubkey: 'node', relay: 'relay' }[r.sender_kind] || 'src'
  const senderLine = r.sender_id
    ? `${kindLabel} ${esc(r.sender_label || r.sender_id)}`
    : 'sender — (none)'
  const chanLine = r.channel_name ? `<br>channel ${esc(r.channel_name)}` : ''
  const textLine = r._text ? `<br>"${esc(r._text)}"` : ''
  const isolated = r.sender_id && r.sender_id === isolatedId
  const isolateBtn = isolated
    ? `<button class="ch-isolate active" disabled>Isolated ✓</button>`
    : `<button class="ch-isolate" ${r.sender_id ? '' : 'disabled'}>Isolate sender</button>`
  return `<div class="ch-popup">SNR ${esc(r.snr)} · RSSI ${esc(r.rssi)}<br>`
    + `${esc(r.packet_type)}<br>`
    + senderLine + chanLine + textLine + '<br>'
    + isolateBtn
    + ` <button class="ch-ignore" ${r.sender_id ? '' : 'disabled'}>Ignore this ID</button></div>`
}
function wireIsolate(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-isolate')
  if (!btn || !r.sender_id || btn.disabled) return
  // Optimistic feedback: the next render tick will confirm this via
  // popupHtml's isolatedId check, but that tick is 1s away and the popup
  // doesn't rebuild while open (see draw()'s popupOpen guard) — without this,
  // clicking gives no visible response until the popup is closed and reopened.
  btn.onclick = () => {
    document.dispatchEvent(new CustomEvent('hunt:isolate-sender', { detail: { id: r.sender_id } }))
    btn.textContent = 'Isolated ✓'
    btn.disabled = true
    btn.classList.add('active')
  }
}
function wireIgnore(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-ignore')
  if (btn && r.sender_id) btn.onclick = () => document.dispatchEvent(
    new CustomEvent('hunt:ignore-sender', { detail: { id: r.sender_id } }))
}
