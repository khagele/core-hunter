import { describe, it, expect } from 'vitest'
import { compassHeading, bearingForHeading, nextCompassState, compassGlyph, resolveCourseHeading, COURSE_MIN_SPEED_MS, COMPASS_CYCLE } from '../rotation.js'

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
  it('guards non-finite headings to north-up instead of a NaN bearing', () => {
    // GeolocationCoordinates.heading is NaN when stationary per the W3C spec
    // (iOS Safari follows it) — a NaN bearing would corrupt the map transform.
    expect(bearingForHeading(NaN)).toBe(0)
    expect(bearingForHeading(Infinity)).toBe(0)
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
  it('holds the last known heading on a NaN heading (W3C: stationary devices report NaN, not null)', () => {
    // The exact "stopped at a light" path this feature targets on iOS Safari.
    expect(resolveCourseHeading(NaN, 45)).toBe(45)
    expect(resolveCourseHeading(NaN, null)).toBe(null)
  })
  it('ignores the reported heading below the minimum speed (low-speed course jitter)', () => {
    // Some devices keep reporting a noisy non-null heading while crawling —
    // gate on speed so the map does not swing to low-speed course noise.
    expect(resolveCourseHeading(90, 45, 1)).toBe(45)
    expect(resolveCourseHeading(90, 45, 0)).toBe(45)
    expect(resolveCourseHeading(90, null, 1)).toBe(null)
  })
  it('uses the fresh heading at or above the minimum speed', () => {
    expect(resolveCourseHeading(90, 45, COURSE_MIN_SPEED_MS)).toBe(90)
    expect(resolveCourseHeading(90, 45, 13.9)).toBe(90)
  })
  it('falls back to heading availability when speed is unavailable (null/NaN per spec)', () => {
    expect(resolveCourseHeading(90, 45, null)).toBe(90)
    expect(resolveCourseHeading(90, 45, NaN)).toBe(90)
    expect(resolveCourseHeading(90, 45, undefined)).toBe(90)
  })
})

// #259/#265: the FAB's progress ring indexes into COMPASS_CYCLE, so the cycle
// list and nextCompassState's actual advance have to stay in step. They drifted
// once already — the list carried a 'static' entry that no tap can produce, so
// a 4-segment ring described a 3-long cycle and every reading was off by one.
// Keeping the list next to nextCompassState makes that testable; while it lived
// in app.js (which exports nothing) reverting the fix left the suite green.
describe('COMPASS_CYCLE matches what a tap actually does (#259)', () => {
  it('holds exactly the states a tap can produce, in tap order', () => {
    expect(COMPASS_CYCLE).toEqual(['following', 'heading', 'driving'])
  })

  it('advances by exactly one position per tap, wrapping at the end', () => {
    let state = { follow: true, source: null }
    let idx = COMPASS_CYCLE.indexOf(compassGlyph(state))
    expect(idx).toBe(0)
    for (let tap = 1; tap <= COMPASS_CYCLE.length; tap++) {
      state = nextCompassState(state)
      const next = COMPASS_CYCLE.indexOf(compassGlyph(state))
      expect(next).toBe(tap % COMPASS_CYCLE.length)
      idx = next
    }
    // A full lap returns to where it started.
    expect(idx).toBe(0)
  })

  it('never produces a glyph that is missing from the cycle', () => {
    let state = { follow: true, source: null }
    for (let i = 0; i < 6; i++) {
      state = nextCompassState(state)
      expect(COMPASS_CYCLE).toContain(compassGlyph(state))
    }
  })

  it('leaves static outside the cycle — it is reachable only by panning', () => {
    expect(COMPASS_CYCLE).not.toContain('static')
    expect(compassGlyph({ follow: false, source: null })).toBe('static')
    // -1 is the contract the ring relies on for the all-muted rendering.
    expect(COMPASS_CYCLE.indexOf('static')).toBe(-1)
  })
})
