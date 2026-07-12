import { describe, it, expect } from 'vitest'
import { compassHeading, bearingForHeading, nextCompassState, compassGlyph, resolveCourseHeading } from '../rotation.js'

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
  // Google-Maps-style cycle: static -> follow (north up) -> follow + device
  // heading -> follow + GPS course ("driving mode", #242) -> back to follow
  // (north up). Panning drops to static elsewhere. `source` is null (north
  // up) | 'device' (magnetometer) | 'course' (GPS course-over-ground).
  it('static taps to following, north up', () => {
    expect(nextCompassState({ follow: false, source: null })).toEqual({ follow: true, source: null })
    expect(nextCompassState({ follow: false, source: 'device' })).toEqual({ follow: true, source: null })
    expect(nextCompassState({ follow: false, source: 'course' })).toEqual({ follow: true, source: null })
  })
  it('following (north up) taps to device-heading mode', () => {
    expect(nextCompassState({ follow: true, source: null })).toEqual({ follow: true, source: 'device' })
  })
  it('device-heading mode taps to GPS course (driving) mode', () => {
    expect(nextCompassState({ follow: true, source: 'device' })).toEqual({ follow: true, source: 'course' })
  })
  it('GPS course mode taps back to following, north up', () => {
    expect(nextCompassState({ follow: true, source: 'course' })).toEqual({ follow: true, source: null })
  })
})

describe('compassGlyph', () => {
  it('maps each compass state to its glyph', () => {
    expect(compassGlyph({ follow: false, source: null })).toBe('static')
    expect(compassGlyph({ follow: true, source: null })).toBe('following')
    expect(compassGlyph({ follow: true, source: 'device' })).toBe('heading')
    expect(compassGlyph({ follow: true, source: 'course' })).toBe('driving')
  })
  it('the previewed (next-state) glyph is what a tap produces, never static', () => {
    // The FAB icon previews the NEXT state, not the current one.
    expect(compassGlyph(nextCompassState({ follow: false, source: null }))).toBe('following') // panned → tap recenters
    expect(compassGlyph(nextCompassState({ follow: true, source: null }))).toBe('heading')     // centered → tap enables device heading
    expect(compassGlyph(nextCompassState({ follow: true, source: 'device' }))).toBe('driving') // device heading → tap enables GPS course
    expect(compassGlyph(nextCompassState({ follow: true, source: 'course' }))).toBe('following') // GPS course → tap back to north-up
  })
})

describe('resolveCourseHeading', () => {
  // GPS course is null when stationary/low-speed on most devices (#242).
  // Hold the last known heading instead of snapping to north-up every time
  // the hunter stops at a light.
  it('uses the fresh heading when the fix has one', () => {
    expect(resolveCourseHeading(90, 45)).toBe(90)
  })
  it('holds the last known heading when the fix has none', () => {
    expect(resolveCourseHeading(null, 45)).toBe(45)
  })
  it('stays null when neither the fix nor the last known heading exist yet', () => {
    expect(resolveCourseHeading(null, null)).toBe(null)
  })
})
