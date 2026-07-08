// Pure decision logic for the hide → return-to-visible transition (#198).
// The DOM glue (visibilitychange listener, restarting gps.js, forcing a
// render/drain tick) lives in app.js; this module only answers the question
// that glue needs, given plain timestamps.

// GPS_STALE_MS mirrors gps.js's own watchPosition timeout (15s) — if no fix
// has landed within that window, the browser's own error callback would
// already have fired, so the watch is treated as stalled either way.
export const GPS_STALE_MS = 15000

// isGpsStalled: true when the geolocation watch looks like it stopped
// delivering fixes and should be restarted on return-to-visible.
export function isGpsStalled(lastFixAt, now, thresholdMs = GPS_STALE_MS) {
  return lastFixAt == null || (now - lastFixAt) > thresholdMs
}
