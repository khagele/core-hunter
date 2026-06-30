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

const DEFAULT_COLS = 64
const DEFAULT_ROWS = 64

// Bounding box of points, padded by marginFrac on each side.
function boundsOf(points, marginFrac = 0.15) {
  let minLat = Infinity, minLon = Infinity, maxLat = -Infinity, maxLon = -Infinity
  for (const p of points) {
    minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat)
    minLon = Math.min(minLon, p.lon); maxLon = Math.max(maxLon, p.lon)
  }
  const dLat = (maxLat - minLat) || 0.001
  const dLon = (maxLon - minLon) || 0.001
  return {
    minLat: minLat - dLat * marginFrac, maxLat: maxLat + dLat * marginFrac,
    minLon: minLon - dLon * marginFrac, maxLon: maxLon + dLon * marginFrac,
  }
}

// RSSI-weighted Gaussian kernel-density grid over the points' bounds, normalized
// 0..1. Each point adds weight * exp(-d^2 / 2sigma^2); sigma tightens for strong
// points (stronger -> a sharper, more localized hot spot). Row 0 = minLat (south).
export function densityGrid(points, opts = {}) {
  const cols = opts.cols ?? DEFAULT_COLS
  const rows = opts.rows ?? DEFAULT_ROWS
  const bounds = boundsOf(points.length ? points : [{ lat: 0, lon: 0 }])
  const grid = new Float32Array(rows * cols)
  if (!points.length) return { grid, rows, cols, bounds }
  const diagM = haversineM(
    { lat: bounds.minLat, lon: bounds.minLon },
    { lat: bounds.maxLat, lon: bounds.maxLon },
  )
  const baseSigma = Math.max(diagM * 0.12, 30)
  let peak = 0
  for (let r = 0; r < rows; r++) {
    const lat = bounds.minLat + ((r + 0.5) / rows) * (bounds.maxLat - bounds.minLat)
    for (let c = 0; c < cols; c++) {
      const lon = bounds.minLon + ((c + 0.5) / cols) * (bounds.maxLon - bounds.minLon)
      let v = 0
      for (const p of points) {
        const w = rssiWeight(p.rssi)
        if (w === 0) continue
        const sigma = baseSigma * (1.1 - 0.6 * w) // strong -> tighter kernel
        const d = haversineM({ lat, lon }, p)
        v += w * Math.exp(-(d * d) / (2 * sigma * sigma))
      }
      grid[r * cols + c] = v
      if (v > peak) peak = v
    }
  }
  if (peak > 0) for (let i = 0; i < grid.length; i++) grid[i] /= peak
  return { grid, rows, cols, bounds }
}

// Convergence + geometry feedback. searchRadiusM = RSSI-weighted RMS distance to
// the centroid (shrinks as good data accumulates). encirclement = fraction of 8
// azimuth sectors around the centroid that contain a point (low = one-sided).
export function geometryStats(points, centroid) {
  if (!centroid || !points.length) {
    return { n: points.length, searchRadiusM: null, encirclement: 0 }
  }
  let sw = 0, swd2 = 0
  const sectors = new Array(8).fill(false)
  for (const p of points) {
    const w = rssiWeight(p.rssi)
    const d = haversineM(p, centroid)
    sw += w; swd2 += w * d * d
    const ang = Math.atan2(p.lon - centroid.lon, p.lat - centroid.lat) // [-pi, pi]
    const sector = (Math.floor((ang + Math.PI) / (Math.PI / 4)) % 8 + 8) % 8
    sectors[sector] = true
  }
  const searchRadiusM = sw > 0 ? Math.sqrt(swd2 / sw) : null
  const encirclement = sectors.filter(Boolean).length / 8
  return { n: points.length, searchRadiusM, encirclement }
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
