import { describe, it, expect } from 'vitest'
import { haversineM, rssiWeight, weightedCentroid } from './locate.js'

describe('haversineM', () => {
  it('is ~0 for identical points', () => {
    expect(haversineM({ lat: 51, lon: 4 }, { lat: 51, lon: 4 })).toBeCloseTo(0, 5)
  })
  it('matches a known ~111.2 km per degree of latitude', () => {
    const d = haversineM({ lat: 51, lon: 4 }, { lat: 52, lon: 4 })
    expect(d).toBeGreaterThan(111000)
    expect(d).toBeLessThan(111400)
  })
})

describe('rssiWeight', () => {
  it('clamps weak to 0 and strong to 1', () => {
    expect(rssiWeight(-130)).toBe(0)
    expect(rssiWeight(-30)).toBe(1)
  })
  it('is 0.5 at the midpoint (-80 dBm)', () => {
    expect(rssiWeight(-80)).toBeCloseTo(0.5, 6)
  })
  it('returns 0 for null/NaN', () => {
    expect(rssiWeight(null)).toBe(0)
    expect(rssiWeight(NaN)).toBe(0)
  })
})

describe('weightedCentroid', () => {
  it('is the midpoint for two equal-RSSI points', () => {
    const c = weightedCentroid([
      { lat: 0, lon: 0, rssi: -80 },
      { lat: 2, lon: 4, rssi: -80 },
    ])
    expect(c.lat).toBeCloseTo(1, 6)
    expect(c.lon).toBeCloseTo(2, 6)
  })
  it('is pulled toward the stronger point', () => {
    const c = weightedCentroid([
      { lat: 0, lon: 0, rssi: -40 }, // weight 1
      { lat: 10, lon: 0, rssi: -80 }, // weight 0.5
    ])
    // (1*0 + 0.5*10)/1.5 = 3.333...
    expect(c.lat).toBeCloseTo(10 / 3, 5)
  })
  it('returns null when all weights are 0', () => {
    expect(weightedCentroid([{ lat: 1, lon: 1, rssi: -130 }])).toBeNull()
  })
})

import { rejectOutliers } from './locate.js'


describe('rejectOutliers', () => {
  const cluster = [
    { lat: 51.0000, lon: 4.0000, rssi: -70 },
    { lat: 51.0002, lon: 4.0001, rssi: -72 },
    { lat: 51.0001, lon: 4.0003, rssi: -75 },
    { lat: 50.9999, lon: 3.9998, rssi: -73 },
  ]

  it('flags a single far stray (colliding node) and keeps the cluster', () => {
    const stray = { lat: 51.5, lon: 4.6, rssi: -95 } // ~70 km away
    const { inliers, outliers } = rejectOutliers([...cluster, stray])
    expect(outliers).toHaveLength(1)
    expect(outliers[0]).toEqual(stray)
    expect(inliers).toHaveLength(4)
  })

  it('flags nothing for a tight stationary cluster (GPS jitter only)', () => {
    const { outliers } = rejectOutliers(cluster)
    expect(outliers).toHaveLength(0)
  })

  it('returns all inliers when fewer than 3 points', () => {
    const two = cluster.slice(0, 2)
    expect(rejectOutliers(two)).toEqual({ inliers: two, outliers: [] })
  })
})

import { densityGrid } from './locate.js'
import { geometryStats } from './locate.js'

describe('geometryStats', () => {
  const centroid = { lat: 51, lon: 4 }

  it('encirclement is low for one-sided sampling, high when surrounded', () => {
    const oneSide = [
      { lat: 51.01, lon: 4.00, rssi: -70 },
      { lat: 51.02, lon: 4.00, rssi: -70 },
      { lat: 51.03, lon: 4.00, rssi: -70 },
    ]
    const around = [
      { lat: 51.01, lon: 4.00, rssi: -70 },
      { lat: 50.99, lon: 4.00, rssi: -70 },
      { lat: 51.00, lon: 4.01, rssi: -70 },
      { lat: 51.00, lon: 3.99, rssi: -70 },
    ]
    expect(geometryStats(oneSide, centroid).encirclement).toBeLessThan(0.3)
    expect(geometryStats(around, centroid).encirclement).toBeGreaterThan(0.4)
  })

  it('search radius shrinks when points are closer to the centroid', () => {
    const far = [
      { lat: 51.05, lon: 4, rssi: -70 }, { lat: 50.95, lon: 4, rssi: -70 },
    ]
    const near = [
      { lat: 51.005, lon: 4, rssi: -70 }, { lat: 50.995, lon: 4, rssi: -70 },
    ]
    expect(geometryStats(near, centroid).searchRadiusM)
      .toBeLessThan(geometryStats(far, centroid).searchRadiusM)
  })

  it('returns null radius for no centroid', () => {
    expect(geometryStats([{ lat: 51, lon: 4, rssi: -70 }], null).searchRadiusM).toBeNull()
  })
})

describe('densityGrid', () => {
  const pts = [
    { lat: 51.000, lon: 4.000, rssi: -60 },
    { lat: 51.010, lon: 4.010, rssi: -90 },
    { lat: 50.990, lon: 3.990, rssi: -90 },
  ]

  it('returns a normalized grid of the requested size', () => {
    const { grid, rows, cols } = densityGrid(pts, { cols: 16, rows: 16 })
    expect(grid).toHaveLength(16 * 16)
    expect(Math.max(...grid)).toBeCloseTo(1, 6) // peak normalized to 1
    expect(Math.min(...grid)).toBeGreaterThanOrEqual(0)
  })

  it('peaks nearer the strongest-RSSI point', () => {
    const { grid, rows, cols, bounds } = densityGrid(pts, { cols: 16, rows: 16 })
    let best = 0, bi = 0
    grid.forEach((v, i) => { if (v > best) { best = v; bi = i } })
    const r = Math.floor(bi / cols), c = bi % cols
    const lat = bounds.minLat + ((r + 0.5) / rows) * (bounds.maxLat - bounds.minLat)
    const lon = bounds.minLon + ((c + 0.5) / cols) * (bounds.maxLon - bounds.minLon)
    // strongest point is at (51.000, 4.000); peak cell should be closer to it
    // than to the weak point at (51.010, 4.010)
    const dStrong = Math.hypot(lat - 51.0, lon - 4.0)
    const dWeak = Math.hypot(lat - 51.01, lon - 4.01)
    expect(dStrong).toBeLessThan(dWeak)
  })

  it('returns an all-zero grid for no points', () => {
    const { grid } = densityGrid([], { cols: 8, rows: 8 })
    expect(Math.max(...grid)).toBe(0)
  })
})
