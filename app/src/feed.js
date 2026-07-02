// discover_pubkey rows are DISCOVER_RESP replies — a directly-heard node
// announcing itself, so they belong in the feed like adverts do (#129).
const FEED_KINDS = new Set(['channel_name', 'advert_pubkey', 'discover_pubkey'])

// TARGET_KINDS additionally allows 'relay' — a last-hop repeater attributed via
// path[last] of a relayed FLOOD packet (see meshpacket.js classifyReception).
// It carries no message text, so it stays out of FEED_KINDS/the message feed,
// but it is a valid directly-heard node and belongs in the target dropdown.
const TARGET_KINDS = new Set([...FEED_KINDS, 'relay'])

export function feedItems(records, { ignore, limit = 50 } = {}) {
  const ig = ignore || new Set()
  return (records || [])
    .filter((r) => FEED_KINDS.has(r.sender_kind))
    .filter((r) => !(r.sender_id != null && ig.has(String(r.sender_id).toLowerCase())))
    .slice()
    .sort((a, b) => Date.parse(b.rx_at) - Date.parse(a.rx_at))
    .slice(0, limit)
}

// dedupeSenders collapses receptions into one row per heard sender, keeping
// the most recent reception for each (used as the basis for both the
// alphabetical list and the recency/RSSI-ranked pinned section).
function dedupeSenders(records, ignore) {
  const ig = ignore || new Set()
  const bySender = new Map()
  for (const r of records || []) {
    if (!TARGET_KINDS.has(r.sender_kind)) continue
    if (r.sender_id == null) continue
    const id = String(r.sender_id)
    if (ig.has(id.toLowerCase())) continue
    const prev = bySender.get(id)
    if (!prev || Date.parse(r.rx_at) > Date.parse(prev.rx_at)) bySender.set(id, r)
  }
  return [...bySender.values()]
}

// senderList sorts deduped senders by name so the target dropdown stays
// stable while signals change. `limit` slices the same sort for lazy-loaded
// batches.
export function senderList(records, { ignore, limit = Infinity } = {}) {
  return dedupeSenders(records, ignore)
    .sort((a, b) =>
      String(a.sender_label || a.sender_id).localeCompare(String(b.sender_label || b.sender_id), undefined, { sensitivity: 'base' }))
    .slice(0, limit)
}

// topSenders ranks deduped senders by a combined recency+RSSI score, for the
// pinned section above the alphabetical list. Every 30s since the last
// reception costs roughly 1 dB, so a strong-but-stale sender still loses
// ground to a weaker one heard moments ago.
export function topSenders(records, { ignore, count = 3, nowMs } = {}) {
  const score = (r) => r.rssi - (nowMs - Date.parse(r.rx_at)) / 1000 / 30
  return dedupeSenders(records, ignore)
    .sort((a, b) => score(b) - score(a))
    .slice(0, count)
}

export function relTime(rxAt, nowMs) {
  if (rxAt == null || Number.isNaN(Date.parse(rxAt))) return '—'
  const s = Math.max(0, Math.round((nowMs - Date.parse(rxAt)) / 1000))
  if (s < 60) return s + 's'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  return Math.floor(s / 3600) + 'h'
}
