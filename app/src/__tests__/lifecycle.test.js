import { describe, it, expect } from 'vitest'
import { isGpsStalled, GPS_STALE_MS } from '../lifecycle.js'

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
