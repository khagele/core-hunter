import { describe, it, expect } from 'vitest'
import { isGpsStalled, shouldShowPausedBanner, GPS_STALE_MS, BANNER_MIN_HIDDEN_MS } from '../lifecycle.js'

describe('isGpsStalled — whether the geolocation watch needs a restart on return-to-visible', () => {
  it('is stalled when no fix has ever arrived', () => {
    expect(isGpsStalled(null, 10_000)).toBe(true)
  })

  it('is not stalled when the last fix is within the threshold', () => {
    expect(isGpsStalled(10_000, 10_000 + GPS_STALE_MS - 1)).toBe(false)
  })

  it('is stalled once the last fix is older than the threshold', () => {
    expect(isGpsStalled(10_000, 10_000 + GPS_STALE_MS + 1)).toBe(true)
  })

  it('accepts a custom threshold', () => {
    expect(isGpsStalled(0, 5_000, 4_000)).toBe(true)
    expect(isGpsStalled(0, 3_000, 4_000)).toBe(false)
  })
})

describe('shouldShowPausedBanner — whether a hide→visible gap is worth surfacing', () => {
  it('is false when the page was never hidden', () => {
    expect(shouldShowPausedBanner(null, 10_000)).toBe(false)
  })

  it('is false for a hide shorter than the minimum', () => {
    expect(shouldShowPausedBanner(10_000, 10_000 + BANNER_MIN_HIDDEN_MS - 1)).toBe(false)
  })

  it('is true once the hide reaches the minimum', () => {
    expect(shouldShowPausedBanner(10_000, 10_000 + BANNER_MIN_HIDDEN_MS)).toBe(true)
  })

  it('accepts a custom minimum', () => {
    expect(shouldShowPausedBanner(0, 500, 1_000)).toBe(false)
    expect(shouldShowPausedBanner(0, 1_000, 1_000)).toBe(true)
  })
})
