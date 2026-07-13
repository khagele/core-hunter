// Map-rotation helpers (#116). Pure logic only — the DeviceOrientation
// listener and the leaflet-rotate wiring live in app.js/huntmap.js.

// compassHeading extracts a compass heading (degrees clockwise from north,
// 0..360) from a DeviceOrientationEvent-shaped reading, or null when the
// reading is unusable. iOS exposes webkitCompassHeading directly; elsewhere
// only an *absolute* alpha can serve as a compass (relative alpha has an
// arbitrary zero point).
export function compassHeading(reading) {
  if (!reading) return null
  if (typeof reading.webkitCompassHeading === 'number') return reading.webkitCompassHeading
  if (reading.absolute === true && typeof reading.alpha === 'number') {
    return (360 - reading.alpha) % 360
  }
  return null
}

// bearingForHeading converts a compass heading into the map bearing that puts
// that heading at the top of the screen (rotate the map opposite to the
// heading). Input is normalized to 0..360 first. Non-finite input (the W3C
// Geolocation spec makes heading NaN while stationary) maps to north-up
// instead of poisoning the map transform with a NaN bearing.
export function bearingForHeading(heading) {
  if (!Number.isFinite(heading)) return 0
  const h = ((heading % 360) + 360) % 360
  return h === 0 ? 0 : -h
}

// nextCompassState advances the compass button through its Google-Maps-style
// cycle: static -> follow (north up) -> follow + device heading -> follow +
// GPS course ("driving mode", #242) -> follow (north up). Leaving follow
// happens by panning the map, not via the button. `source` is the rotation
// input: null (north up), 'device' (magnetometer), or 'course' (GPS
// course-over-ground — steadier than the magnetometer while actually driving).
export function nextCompassState({ follow, source }) {
  if (!follow) return { follow: true, source: null }
  if (source == null) return { follow: true, source: 'device' }
  if (source === 'device') return { follow: true, source: 'course' }
  return { follow: true, source: null }
}

// compassGlyph names the icon for a compass state: 'static' (not following),
// 'following' (centred, north up), 'heading' (rotates with the device), or
// 'driving' (rotates with GPS course-over-ground). The FAB previews the NEXT
// state via compassGlyph(nextCompassState(...)), so it shows what a tap will
// do rather than the current state.
export function compassGlyph({ follow, source }) {
  if (!follow) return 'static'
  if (source === 'device') return 'heading'
  if (source === 'course') return 'driving'
  return 'following'
}

// Below this ground speed (m/s) a reported GPS course is treated as noise:
// many devices emit a jittery but non-null heading while crawling, which
// would swing the map at every stop. ~2 m/s ≈ 7 km/h, comfortably above a
// walking shuffle and below the slowest driving this mode targets.
export const COURSE_MIN_SPEED_MS = 2

// resolveCourseHeading: per the W3C Geolocation spec, heading is null when
// unavailable and NaN while stationary (#242) — hold the last known heading
// in both cases instead of snapping to north-up at every light. When the fix
// carries a usable speed below COURSE_MIN_SPEED_MS the heading is ignored as
// low-speed jitter; a null/NaN speed (unavailable) falls back to trusting
// heading availability alone.
export function resolveCourseHeading(heading, lastKnown, speed) {
  if (Number.isFinite(speed) && speed < COURSE_MIN_SPEED_MS) return lastKnown
  return Number.isFinite(heading) ? heading : lastKnown
}
