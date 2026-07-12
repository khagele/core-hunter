import { describe, it, expect } from 'vitest'
import { shouldAutoFire, INTERVAL_MS, MOVE_THRESHOLD_M, staggerTargets, STAGGER_MS } from '../autoping.js'

const BASE = { lastFireAt: null, lastLat: null, lastLon: null, now: 0, lat: 51.0, lon: 3.7 }

describe('shouldAutoFire', () => {
  it('fires immediately when it has never fired', () => {
    expect(shouldAutoFire({ ...BASE })).toBe(true)
  })
  it('fires once the interval has elapsed, even without movement', () => {
    const opts = { ...BASE, lastFireAt: 0, lastLat: 51.0, lastLon: 3.7, now: INTERVAL_MS }
    expect(shouldAutoFire(opts)).toBe(true)
  })
  it('does not fire before the interval elapses without enough movement', () => {
    const opts = { ...BASE, lastFireAt: 0, lastLat: 51.0, lastLon: 3.7, now: INTERVAL_MS - 1, lat: 51.0, lon: 3.7 }
    expect(shouldAutoFire(opts)).toBe(false)
  })
  it('fires early once moved past the threshold, before the interval elapses', () => {
    // ~0.00045 deg lat ~= 50m
    const opts = { ...BASE, lastFireAt: 0, lastLat: 51.0, lastLon: 3.7, now: 1000, lat: 51.00045, lon: 3.7 }
    expect(shouldAutoFire(opts)).toBe(true)
  })
  it('does not fire early for movement under the threshold', () => {
    const opts = { ...BASE, lastFireAt: 0, lastLat: 51.0, lastLon: 3.7, now: 1000, lat: 51.00001, lon: 3.7 }
    expect(shouldAutoFire(opts)).toBe(false)
  })
  it('falls back to the interval-only check when no GPS fix is available', () => {
    expect(shouldAutoFire({ ...BASE, lastFireAt: 0, lastLat: null, lastLon: null, now: 500, lat: null, lon: null })).toBe(false)
    expect(shouldAutoFire({ ...BASE, lastFireAt: 0, lastLat: null, lastLon: null, now: INTERVAL_MS, lat: null, lon: null })).toBe(true)
  })
  it('exposes the agreed defaults', () => {
    expect(INTERVAL_MS).toBe(10000)
    expect(MOVE_THRESHOLD_M).toBe(50)
  })
})

describe('staggerTargets', () => {
  it('spaces target ids STAGGER_MS apart, preserving order, first at 0', () => {
    expect(staggerTargets(['aa', 'bb', 'cc'])).toEqual([
      { id: 'aa', delayMs: 0 },
      { id: 'bb', delayMs: STAGGER_MS },
      { id: 'cc', delayMs: STAGGER_MS * 2 },
    ])
  })
  it('returns an empty array for no targets', () => {
    expect(staggerTargets([])).toEqual([])
  })
  it('defaults STAGGER_MS to 1500', () => {
    expect(STAGGER_MS).toBe(1500)
  })
})
