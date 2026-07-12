// Kinds that name a directly-heard node, so they can be selected as a target.
// discover_pubkey is a DISCOVER_RESP reply (#129); relay is a last-hop repeater
// attributed via path[last] of a relayed FLOOD packet (see meshpacket.js).
const TARGET_KINDS = new Set(['channel_name', 'advert_pubkey', 'discover_pubkey', 'relay'])

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

// A node id can be a full 64-char pubkey; only the first 3 bytes are shown so
// the target list never renders (and overlaps on) a full-length hex string.
const ID_PREFIX_HEX_CHARS = 6

function idPrefix(id) {
  return id.slice(0, ID_PREFIX_HEX_CHARS)
}

// targetParts splits a sender row into a primary label and a muted secondary
// prefix for the target list (#178, #215). The byte-prefix is always surfaced
// when a name resolves, so duplicate names and different-length prefixes of
// the same node are distinguishable. Unresolved rows show the prefix plus a
// "name not resolved" marker as the primary line, so every row still reads
// name-first even before resolution completes.
export function targetParts(rec) {
  const id = rec.sender_id != null ? String(rec.sender_id) : ''
  const label = rec.sender_label ? String(rec.sender_label) : ''
  if (!id) return { primary: label || '—', secondary: '' }
  const prefix = idPrefix(id)
  if (label) return { primary: label, secondary: prefix }
  return { primary: `${prefix} (name not resolved)`, secondary: prefix }
}

export function relTime(rxAt, nowMs) {
  if (rxAt == null || Number.isNaN(Date.parse(rxAt))) return '—'
  const s = Math.max(0, Math.round((nowMs - Date.parse(rxAt)) / 1000))
  if (s < 60) return s + 's'
  if (s < 3600) return Math.floor(s / 60) + 'm'
  return Math.floor(s / 3600) + 'h'
}
