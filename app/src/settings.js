// isSettingsActive reports whether any setting under the Settings sheet
// differs from its default — i.e. something that changes behaviour is on.
// Drives the settings button's active-dot, mirroring isFilterActive (filters.js).
export function isSettingsActive({ attenuatorDb, manualFix } = {}) {
  if (attenuatorDb) return true
  if (manualFix) return true
  return false
}
