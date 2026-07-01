import { senderList, topSenders, relTime } from './feed.js'

const PAGE_SIZE = 6
const PINNED_COUNT = 3

function row(rec, nowMs, onSelect, isolatedId) {
  const li = document.createElement('li')
  li.className = 'tl-item'

  const btn = document.createElement('button')
  btn.type = 'button'; btn.className = 'tl-row'
  btn.classList.toggle('active', isolatedId != null && rec.sender_id === isolatedId)
  const label = document.createElement('span'); label.className = 'tl-label'
  label.textContent = rec.sender_label || rec.sender_id || '—'
  const rssi = document.createElement('span'); rssi.className = 'tl-rssi'
  rssi.textContent = String(rec.rssi ?? '—')
  const time = document.createElement('span'); time.className = 'tl-time'
  time.textContent = relTime(rec.rx_at, nowMs)
  btn.append(label, rssi, time)
  btn.addEventListener('click', () => onSelect && onSelect(rec.sender_id))

  li.appendChild(btn)
  return li
}

// createTargetList wires the target-sheet dropdown:
// - pinnedEl: top senders by combined recency+RSSI score, always the same
//   PINNED_COUNT rows regardless of scroll (may repeat entries from listEl).
// - listEl: the full sender list, name-sorted, lazily grown as the user
//   scrolls instead of rendering every sender ever heard up front.
export function createTargetList(listEl, { onSelect, pinnedEl } = {}) {
  let visible = PAGE_SIZE
  let lastRows = []
  let lastIgnore = new Set()
  let lastIsolatedId = null
  let _lastSig = null
  let _lastPinnedSig = null

  function render(rows, ignore, nowMs, isolatedId) {
    lastRows = rows
    lastIgnore = ignore
    lastIsolatedId = isolatedId ?? null

    if (pinnedEl) {
      const pinned = topSenders(rows, { ignore, count: PINNED_COUNT, nowMs })
      const pinnedSig = pinned.map((r) => (r.sender_label || r.sender_id || '') + r.rssi + r.rx_at).join('|') + '@' + lastIsolatedId
      if (pinnedSig !== _lastPinnedSig) {
        _lastPinnedSig = pinnedSig
        pinnedEl.replaceChildren(...pinned.map((rec) => row(rec, nowMs, onSelect, lastIsolatedId)))
      }
    }

    const items = senderList(rows, { ignore, limit: visible })
    const sig = items.map((r) => (r.sender_label || r.sender_id || '') + r.rssi + r.rx_at).join('|') + '#' + visible + '@' + lastIsolatedId
    if (sig === _lastSig) return
    _lastSig = sig
    listEl.replaceChildren(...items.map((rec) => row(rec, nowMs, onSelect, lastIsolatedId)))
  }

  // Reset back to the first page — call when the sheet is (re)opened.
  function reset() {
    visible = PAGE_SIZE
    _lastSig = null
    _lastPinnedSig = null
  }

  listEl.addEventListener('scroll', () => {
    if (listEl.scrollTop + listEl.clientHeight < listEl.scrollHeight - 24) return
    const total = senderList(lastRows, { ignore: lastIgnore }).length
    if (visible >= total) return
    visible += PAGE_SIZE
    _lastSig = null
    render(lastRows, lastIgnore, Date.now(), lastIsolatedId)
  })

  return { render, reset }
}
