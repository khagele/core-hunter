// The app's out-of-the-box filter — the baseline the active-indicator compares
// against. Kept here as the single source of truth so app.js and isFilterActive
// can never drift apart.
export const DEFAULT_FILTER = { sender: null, types: null, windowMs: 600000, directOnly: false }

// isFilterActive reports whether the current filter differs from DEFAULT_FILTER,
// i.e. the user has narrowed something. Drives the filter button's active state.
export function isFilterActive(filter) {
  if (!filter) return false
  if (filter.sender) return true
  if (filter.directOnly !== DEFAULT_FILTER.directOnly) return true
  if (filter.windowMs !== DEFAULT_FILTER.windowMs) return true
  if (filter.types && [...filter.types].length > 0) return true
  return false
}

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
