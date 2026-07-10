import { describe, it, expect } from 'vitest'
import { isGpsStalled, shouldShowPausedBanner, planResume, GPS_STALE_MS, BANNER_MIN_HIDDEN_MS } from '../lifecycle.js'

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

describe('planResume — what the return-to-visible handler should do', () => {
  const now = 100_000

  it('does nothing when there was no active hidden session (hiddenAt null)', () => {
    const p = planResume({ hiddenAt: null, connected: true, lastGpsFixAt: now, now })
    expect(p.run).toBe(false)
    expect(p).toEqual({ run: false, nudgeReconnect: false, restartGps: false, showBanner: false })
  })

  it('runs when a connected session was backgrounded, GPS fresh + short hide → no side effects', () => {
    const p = planResume({ hiddenAt: now - 500, connected: true, lastGpsFixAt: now, now })
    expect(p).toEqual({ run: true, nudgeReconnect: false, restartGps: false, showBanner: false })
  })

  it('nudges the reconnect when BLE dropped while backgrounded (connected=false but session was active)', () => {
    // hiddenAt is set (was connected at hide time) even though we are now in
    // the reconnect/backoff window — the case the early-return used to miss.
    const p = planResume({ hiddenAt: now - 20_000, connected: false, lastGpsFixAt: now - 20_000, now })
    expect(p.run).toBe(true)
    expect(p.nudgeReconnect).toBe(true)
    expect(p.restartGps).toBe(true)   // 20s > GPS_STALE_MS
    expect(p.showBanner).toBe(true)   // 20s >= BANNER_MIN_HIDDEN_MS
  })

  it('does not nudge when still connected', () => {
    const p = planResume({ hiddenAt: now - 20_000, connected: true, lastGpsFixAt: now, now })
    expect(p.nudgeReconnect).toBe(false)
  })

  it('restartGps and showBanner mirror the underlying helpers', () => {
    const fresh = planResume({ hiddenAt: now - 1_000, connected: true, lastGpsFixAt: now - 1_000, now })
    expect(fresh.restartGps).toBe(false)
    expect(fresh.showBanner).toBe(false)
  })
})
