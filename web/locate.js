// Pure transmitter-location estimation from (lat, lon, rssi, acc_m) receive
// points. RSSI-weighted centroid + kernel-density heatmap; no TX-power
// calibration, no DOM/Leaflet. See docs/superpowers/specs/2026-06-30-rssi-locate-design.md.

const R_EARTH_M = 6371000
const RSSI_MIN = -120 // weak end of the weight ramp (dBm)
const RSSI_MAX = -40 // strong end of the weight ramp (dBm)

// Great-circle distance in metres between two {lat, lon}.
export function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

// RSSI (dBm) -> weight in [0,1], linear over RSSI_MIN..RSSI_MAX, clamped.
export function rssiWeight(rssi) {
  if (rssi == null || Number.isNaN(rssi)) return 0
  const w = (rssi - RSSI_MIN) / (RSSI_MAX - RSSI_MIN)
  return Math.max(0, Math.min(1, w))
}

// RSSI-weighted centroid of [{lat,lon,rssi}]. null when total weight is 0.
export function weightedCentroid(points) {
  let sw = 0, slat = 0, slon = 0
  for (const p of points) {
    const w = rssiWeight(p.rssi)
    sw += w; slat += w * p.lat; slon += w * p.lon
  }
  if (sw === 0) return null
  return { lat: slat / sw, lon: slon / sw }
}

const OUTLIER_FACTOR = 4
const MIN_OUTLIER_M = 200

// Median of a numeric array (0 for empty).
function median(xs) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Split points into inliers/outliers. Robust center = coordinate-wise median;
// outlier if distance > max(factor * medianDistance, floorM). This catches a
// lone far stray (a colliding 1-byte node) without flagging GPS jitter in a
// tight/stationary cluster (where MAD would collapse to 0).
export function rejectOutliers(points, opts = {}) {
  const factor = opts.factor ?? OUTLIER_FACTOR
  const floorM = opts.floorM ?? MIN_OUTLIER_M
  if (points.length < 3) return { inliers: points.slice(), outliers: [] }
  const center = {
    lat: median(points.map((p) => p.lat)),
    lon: median(points.map((p) => p.lon)),
  }
  const dists = points.map((p) => haversineM(p, center))
  const threshold = Math.max(factor * median(dists), floorM)
  const inliers = []
  const outliers = []
  points.forEach((p, i) => (dists[i] > threshold ? outliers : inliers).push(p))
  return { inliers, outliers }
}
