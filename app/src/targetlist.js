import { senderList, topSenders, relTime, targetParts } from './feed.js'

const PAGE_SIZE = 6
const PINNED_COUNT = 3

// Lowercased sender id for a row, matching how the selection set is keyed.
function rowKey(rec) {
  return rec.sender_id != null ? String(rec.sender_id).toLowerCase() : null
}

function row(rec, nowMs, onSelect, selectedIds) {
  const li = document.createElement('li')
  li.className = 'tl-item'

  const key = rowKey(rec)
  const selected = !!(selectedIds && key && selectedIds.has(key))

  // The whole row toggles the target — a big touch target with a checkbox that
  // shows state. It reads as a toggle to assistive tech (aria-pressed).
  const btn = document.createElement('button')
  btn.type = 'button'; btn.className = 'tl-row'
  btn.classList.toggle('active', selected)
  btn.setAttribute('aria-pressed', String(selected))

  const check = document.createElement('span'); check.className = 'tl-check'; check.setAttribute('aria-hidden', 'true')

  const { primary, secondary } = targetParts(rec)
  const name = document.createElement('span'); name.className = 'tl-name'; name.textContent = primary

  // Second line: short id prefix + RSSI + time-ago, right-aligned together so
  // none of them ever overlaps the name line above (#215).
  const meta = document.createElement('span'); meta.className = 'tl-meta'
  if (secondary) {
    const prefix = document.createElement('span'); prefix.className = 'tl-prefix'; prefix.textContent = secondary
    meta.appendChild(prefix)
  }
  const rssi = document.createElement('span'); rssi.className = 'tl-rssi'
  rssi.textContent = String(rec.rssi ?? '—')
  const time = document.createElement('span'); time.className = 'tl-time'
  time.textContent = relTime(rec.rx_at, nowMs)
  meta.append(rssi, time)

  btn.append(check, name, meta)
  btn.addEventListener('click', () => onSelect && onSelect(rec.sender_id, rec.sender_label))

  li.appendChild(btn)
  return li
}

// createTargetList wires the target-sheet dropdown:
// - pinnedEl: top senders by combined recency+RSSI score, always the same
//   PINNED_COUNT rows regardless of scroll (may repeat entries from listEl).
// - listEl: the full sender list, name-sorted, lazily grown as the user
//   scrolls instead of rendering every sender ever heard up front.
// selectedIds is the Set of lowercased target ids (multi-select, #178); each
// row reflects membership and the whole row toggles it.
export function createTargetList(listEl, { onSelect, pinnedEl } = {}) {
  let visible = PAGE_SIZE
  let lastRows = []
  let lastIgnore = new Set()
  let lastSelected = null
  let _lastSig = null
  let _lastPinnedSig = null

  const selSig = (sel) => (sel ? [...sel].sort().join(',') : '')

  function render(rows, ignore, nowMs, selectedIds) {
    lastRows = rows
    lastIgnore = ignore
    lastSelected = selectedIds || null
    const selKey = selSig(lastSelected)

    if (pinnedEl) {
      const pinned = topSenders(rows, { ignore, count: PINNED_COUNT, nowMs })
      const pinnedSig = pinned.map((r) => (r.sender_label || r.sender_id || '') + r.rssi + r.rx_at).join('|') + '@' + selKey
      if (pinnedSig !== _lastPinnedSig) {
        _lastPinnedSig = pinnedSig
        pinnedEl.replaceChildren(...pinned.map((rec) => row(rec, nowMs, onSelect, lastSelected)))
      }
    }

    const items = senderList(rows, { ignore, limit: visible })
    const sig = items.map((r) => (r.sender_label || r.sender_id || '') + r.rssi + r.rx_at).join('|') + '#' + visible + '@' + selKey
    if (sig === _lastSig) return
    _lastSig = sig
    listEl.replaceChildren(...items.map((rec) => row(rec, nowMs, onSelect, lastSelected)))
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
    render(lastRows, lastIgnore, Date.now(), lastSelected)
  })

  return { render, reset }
}
