import { haversineM } from './locate.js'

// Auto-ping gate (#233): fires when EITHER the interval has elapsed OR the
// hunter has moved past the threshold since the last fire, whichever comes
// first — a steady baseline cadence while stationary/slow, sped up by
// movement while driving. Defaults picked from a duty-cycle estimate at SF7
// (~46ms airtime per ~13-byte frame): 10s alone is ~0.46% duty cycle for
// this feature, comfortable headroom below a 1% sub-band with no other
// traffic on the hunter's own radio.
export const INTERVAL_MS = 10000
export const MOVE_THRESHOLD_M = 50

export function shouldAutoFire({ lastFireAt, lastLat, lastLon, now, lat, lon, intervalMs = INTERVAL_MS, moveThresholdM = MOVE_THRESHOLD_M }) {
  if (lastFireAt == null) return true
  if (now - lastFireAt >= intervalMs) return true
  if (lat == null || lon == null || lastLat == null || lastLon == null) return false
  return haversineM({ lat: lastLat, lon: lastLon }, { lat, lon }) >= moveThresholdM
}

// Target repeater trace-pings can't all fire in the same tick — space them
// out so the radio sends one at a time.
export const STAGGER_MS = 1500

export function staggerTargets(ids) {
  return (ids || []).map((id, i) => ({ id, delayMs: i * STAGGER_MS }))
}
