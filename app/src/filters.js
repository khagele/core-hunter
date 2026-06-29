function hexPrefixMatch(a, b) {
  if (!a || !b) return false
  const x = a.toLowerCase(), y = b.toLowerCase()
  return x.startsWith(y) || y.startsWith(x)
}

export function makeFilter(opts) {
  const { sender, types, windowMs, directOnly } = opts
  return (rec, nowMs) => {
    if (directOnly && !rec.is_direct) return false
    if (sender && !hexPrefixMatch(rec.sender_key, sender.key)) return false
    if (types && !types.has(rec.packet_type)) return false
    if (windowMs != null) {
      const age = nowMs - Date.parse(rec.rx_at)
      if (!(age <= windowMs)) return false
    }
    return true
  }
}
