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
// heading). Input is normalized to 0..360 first.
export function bearingForHeading(heading) {
  const h = ((heading % 360) + 360) % 360
  return h === 0 ? 0 : -h
}

// nextCompassState advances the compass button through its Google-Maps-style
// cycle: static -> follow (north up) -> follow + heading rotation -> follow
// (north up). Leaving follow happens by panning the map, not via the button.
export function nextCompassState({ follow, heading }) {
  if (!follow) return { follow: true, heading: false }
  return { follow: true, heading: !heading }
}

// compassGlyph names the icon for a compass state: 'static' (not following),
// 'following' (centred, north up), or 'heading' (map rotates with the device).
// The FAB previews the NEXT state via compassGlyph(nextCompassState(...)), so it
// shows what a tap will do rather than the current state.
export function compassGlyph({ follow, heading }) {
  return !follow ? 'static' : heading ? 'heading' : 'following'
}
