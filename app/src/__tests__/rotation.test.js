import { describe, it, expect } from 'vitest'
import { compassHeading, bearingForHeading, nextCompassState } from '../rotation.js'

describe('compassHeading', () => {
  it('prefers iOS webkitCompassHeading when present', () => {
    expect(compassHeading({ webkitCompassHeading: 42, alpha: 300, absolute: true })).toBe(42)
  })
  it('derives heading from absolute alpha (Android): heading = 360 - alpha', () => {
    expect(compassHeading({ alpha: 90, absolute: true })).toBe(270)
    expect(compassHeading({ alpha: 0, absolute: true })).toBe(0)
    expect(compassHeading({ alpha: 360, absolute: true })).toBe(0)
  })
  it('returns null for non-absolute alpha (arbitrary zero point, unusable as compass)', () => {
    expect(compassHeading({ alpha: 90, absolute: false })).toBe(null)
  })
  it('returns null when there is no usable reading', () => {
    expect(compassHeading({ alpha: null, absolute: true })).toBe(null)
    expect(compassHeading({})).toBe(null)
  })
})

describe('bearingForHeading', () => {
  it('rotates the map opposite to the heading so the heading points up', () => {
    expect(bearingForHeading(0)).toBe(0)
    expect(bearingForHeading(90)).toBe(-90)
    expect(bearingForHeading(270)).toBe(-270)
  })
  it('normalizes headings outside 0..360', () => {
    expect(bearingForHeading(450)).toBe(-90)
    expect(bearingForHeading(-90)).toBe(-270)
  })
})

describe('nextCompassState', () => {
  // Google-Maps-style cycle: static -> follow (north up) -> follow + heading
  // rotation -> back to follow (north up). Panning drops to static elsewhere.
  it('static taps to following, north up', () => {
    expect(nextCompassState({ follow: false, heading: false })).toEqual({ follow: true, heading: false })
    expect(nextCompassState({ follow: false, heading: true })).toEqual({ follow: true, heading: false })
  })
  it('following (north up) taps to heading mode', () => {
    expect(nextCompassState({ follow: true, heading: false })).toEqual({ follow: true, heading: true })
  })
  it('heading mode taps back to following, north up', () => {
    expect(nextCompassState({ follow: true, heading: true })).toEqual({ follow: true, heading: false })
  })
})
