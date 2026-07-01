// Cold-start splash: shown until the first GPS fix arrives, per AGENTS.md
// (no coverage without a position, so hunting cannot start before that).
// splashState resolves the display state from the connection/GPS status.
export function splashState({ hasFix, connected, bleError, gpsError }) {
  if (hasFix) return 'hidden'
  if (bleError) return 'ble-error'
  if (!connected) return 'intro'
  if (gpsError) return 'gps-error'
  return 'waiting-gps'
}

export const SPLASH_COPY = {
  intro: 'Tap Connect below to start hunting.',
  'waiting-gps': 'Waiting for a GPS fix…',
  'gps-error': 'Could not get your location. Make sure location access is allowed for this site, then retry.',
  'ble-error': 'Could not connect to the hunter. Tap Connect below to retry.',
}
