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

// planResume decides what the return-to-visible handler should do. It keys off
// `hiddenAt` (set only when we were connected at hide time), NOT the live
// `connected` flag: during a BLE drop the transport is in its reconnect/backoff
// loop so `connected` is false, yet the session is active and this is exactly
// the case the resume path targets (#198). Coming back mid-backoff, we also
// want to nudge the reconnect, since its backoff setTimeout was itself throttled
// while backgrounded. Pure so the branch logic is unit-testable; the side
// effects (nudge, gps restart, drain, banner) stay in app.js.
export function planResume({ hiddenAt, connected, lastGpsFixAt, now }) {
  if (hiddenAt == null) return { run: false, nudgeReconnect: false, restartGps: false, showBanner: false }
  return {
    run: true,
    nudgeReconnect: !connected,
    restartGps: isGpsStalled(lastGpsFixAt, now),
    showBanner: shouldShowPausedBanner(hiddenAt, now),
  }
}
