import { relTime } from './feed.js'

// createFeedPanel wires the bottom Messages panel. Rows are built with the DOM
// API + textContent so attacker-controlled message text cannot inject HTML.
export function createFeedPanel(rootId, { onTapRow, onIsolate, onIgnore } = {}) {
  const root = document.getElementById(rootId)
  if (!root) return { render() {}, toggle() {} }
  const handle = root.querySelector('#feed-handle')
  const countEl = root.querySelector('#feed-count')
  const list = root.querySelector('#feed-list')
  let _lastSig = null

  function updateGlyph() {
    const collapsed = root.classList.contains('collapsed')
    handle.firstChild.textContent = (collapsed ? '▲' : '▼') + ' Messages '
  }
  updateGlyph()
  handle.addEventListener('click', () => { root.classList.toggle('collapsed'); updateGlyph() })

  function row(rec, nowMs, isolatedId, ignore) {
    const li = document.createElement('li')
    li.className = 'feed-item'

    const body = document.createElement('button')
    body.type = 'button'; body.className = 'feed-row'
    const rssi = document.createElement('span'); rssi.className = 'feed-rssi'; rssi.textContent = String(rec.rssi ?? '—')
    const label = document.createElement('span'); label.className = 'feed-label'
    label.textContent = rec.sender_label || rec.sender_id || '—'
    const mid = document.createElement('span'); mid.className = 'feed-mid'
    mid.textContent = rec.sender_kind === 'channel_name' ? (rec._text || '')
      : rec.sender_kind === 'discover_pubkey' ? 'discover' : 'advert'
    const time = document.createElement('span'); time.className = 'feed-time'
    time.textContent = relTime(rec.rx_at, nowMs)
    body.append(rssi, label, mid, time)
    body.addEventListener('click', () => onTapRow && onTapRow(rec))

    const iso = document.createElement('button'); iso.type = 'button'; iso.className = 'feed-iso'; iso.textContent = '⊙'
    iso.title = 'Isolate sender'
    iso.classList.toggle('active', isolatedId != null && rec.sender_id === isolatedId)
    iso.addEventListener('click', () => onIsolate && onIsolate(rec.sender_id))
    const ign = document.createElement('button'); ign.type = 'button'; ign.className = 'feed-ign'; ign.textContent = '⊘'
    const ignored = ignore != null && rec.sender_id != null && ignore.has(String(rec.sender_id).toLowerCase())
    ign.title = ignored ? 'Stop ignoring this ID' : 'Ignore this ID'
    ign.classList.toggle('active', ignored)
    ign.addEventListener('click', () => onIgnore && onIgnore(rec.sender_id))

    li.append(body, iso, ign)
    return li
  }

  function render(items, nowMs, isolatedId, ignore) {
    countEl.textContent = '(' + items.length + ')'
    // Key on the displayed label too, so a name resolved after the row first
    // appeared (async CoreScope lookup) repaints instead of being suppressed.
    // Also key on isolatedId and the ignore-set so toggling isolate/ignore
    // re-renders the active dots even when the item list itself hasn't changed.
    const sig = items.map((r) => (r.sender_label || r.sender_id || '') + r.rx_at).join('|') +
      '#' + (isolatedId || '') + '#' + (ignore ? [...ignore].sort().join(',') : '')
    if (sig === _lastSig) return
    _lastSig = sig
    list.replaceChildren(...items.map((rec) => row(rec, nowMs, isolatedId, ignore)))
  }

  return { render, toggle: () => root.classList.toggle('collapsed') }
}
