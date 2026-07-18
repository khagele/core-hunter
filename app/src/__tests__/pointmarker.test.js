import { describe, it, expect } from 'vitest'
import { squareRing } from '../pointmarker.js'

describe('squareRing', () => {
  it('returns a closed ring of 5 points', () => {
    const ring = squareRing(51.0, 3.7, 3)
    expect(ring).toHaveLength(5)
    expect(ring[0]).toEqual(ring[4])
  })
  it('centers the ring on the given lat/lon', () => {
    const ring = squareRing(51.0, 3.7, 3)
    const avgLon = ring.slice(0, 4).reduce((s, [lo]) => s + lo, 0) / 4
    const avgLat = ring.slice(0, 4).reduce((s, [, la]) => s + la, 0) / 4
    expect(avgLon).toBeCloseTo(3.7, 6)
    expect(avgLat).toBeCloseTo(51.0, 6)
  })
  it('grows with halfWidthM', () => {
    const small = squareRing(51.0, 3.7, 1)
    const large = squareRing(51.0, 3.7, 10)
    const width = (ring) => ring[1][0] - ring[0][0]
    expect(width(large)).toBeGreaterThan(width(small))
  })
  it('widens the longitude delta at higher latitude (cos(lat) correction)', () => {
    // Same halfWidthM, same ground distance — but a degree of longitude covers
    // less ground near the poles, so the ring's longitude span must be wider.
    const equator = squareRing(0, 0, 5)
    const highLat = squareRing(70, 0, 5)
    const lonSpan = (ring) => ring[1][0] - ring[0][0]
    expect(lonSpan(highLat)).toBeGreaterThan(lonSpan(equator))
  })
  it('keeps the latitude span independent of latitude (no distortion N/S)', () => {
    const equator = squareRing(0, 0, 5)
    const highLat = squareRing(70, 0, 5)
    const latSpan = (ring) => ring[2][1] - ring[1][1]
    expect(latSpan(highLat)).toBeCloseTo(latSpan(equator), 9)
  })
})
