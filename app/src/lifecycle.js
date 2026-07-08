// Pure decision logic for the hide → return-to-visible transition (#198, #199).
// The DOM glue (visibilitychange listener, restarting gps.js, forcing a
// render/drain tick, showing the banner) lives in app.js; this module only
// answers the two yes/no questions that glue needs, given plain timestamps.

// GPS_STALE_MS mirrors gps.js's own watchPosition timeout (15s) — if no fix
// has landed within that window, the browser's own error callback would
// already have fired, so the watch is treated as stalled either way.
export const GPS_STALE_MS = 15000

// BANNER_MIN_HIDDEN_MS: a hide shorter than this (e.g. a quick notification-
// shade peek) doesn't get flagged as a paused-capture gap.
export const BANNER_MIN_HIDDEN_MS = 2000

// isGpsStalled: true when the geolocation watch looks like it stopped
// delivering fixes and should be restarted on return-to-visible.
export function isGpsStalled(lastFixAt, now, thresholdMs = GPS_STALE_MS) {
  return lastFixAt == null || (now - lastFixAt) > thresholdMs
}

// shouldShowPausedBanner: true when the page was hidden long enough during an
// active session to be worth surfacing as a "capture paused" gap.
export function shouldShowPausedBanner(hiddenAt, visibleAt, minMs = BANNER_MIN_HIDDEN_MS) {
  return hiddenAt != null && (visibleAt - hiddenAt) >= minMs
}
