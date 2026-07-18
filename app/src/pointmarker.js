// Small square footprint for a single reception's 3D "pillar" marker (#250) —
// the fill-extrusion twin of a flat point. Meter-scale, so the small-angle
// approximation (flat-earth over a few metres, longitude scaled by cos(lat))
// is exact enough; no need for hexgrid.js's full Mercator projection, which
// exists there to keep hex cells aligned to the server's shared grid — a
// per-point marker footprint has no such alignment requirement.
const EARTH_RADIUS_M = 6378137

// Returns a closed [lon, lat] ring (5 points) for a square centered on
// (lat, lon), `halfWidthM` metres from center to edge.
export function squareRing(lat, lon, halfWidthM) {
  const dLat = (halfWidthM / EARTH_RADIUS_M) * (180 / Math.PI)
  const dLon = dLat / Math.cos(lat * Math.PI / 180)
  return [
    [lon - dLon, lat - dLat],
    [lon + dLon, lat - dLat],
    [lon + dLon, lat + dLat],
    [lon - dLon, lat + dLat],
    [lon - dLon, lat - dLat],
  ]
}
