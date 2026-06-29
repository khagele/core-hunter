export function makeFilter(opts) {
  const { sender, types, windowMs, directOnly, ignore } = opts
  const wantId = sender && sender.id != null ? String(sender.id).toLowerCase() : null
  return (rec, nowMs) => {
    if (directOnly && !rec.is_direct) return false
    const id = rec.sender_id != null ? String(rec.sender_id).toLowerCase() : null
    if (wantId && id !== wantId) return false
    if (types && !types.has(rec.packet_type)) return false
    if (windowMs != null) {
      const age = nowMs - Date.parse(rec.rx_at)
      if (!(age <= windowMs)) return false
    }
    if (ignore && id != null && ignore.has(id)) return false
    return true
  }
}
