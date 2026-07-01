import { describe, it, expect } from 'vitest'
import { splashState, SPLASH_COPY } from '../splash.js'

describe('splashState', () => {
  it('hides once a GPS fix has been acquired, regardless of other state', () => {
    expect(splashState({ hasFix: true, connected: false, bleError: true, gpsError: true })).toBe('hidden')
  })
  it('shows intro before connecting', () => {
    expect(splashState({ hasFix: false, connected: false, bleError: false, gpsError: false })).toBe('intro')
  })
  it('shows ble-error when the last connect attempt failed, even if previously connected', () => {
    expect(splashState({ hasFix: false, connected: false, bleError: true, gpsError: false })).toBe('ble-error')
  })
  it('shows waiting-gps once connected but no fix yet and no GPS error', () => {
    expect(splashState({ hasFix: false, connected: true, bleError: false, gpsError: false })).toBe('waiting-gps')
  })
  it('shows gps-error once connected and the GPS watch reported an error', () => {
    expect(splashState({ hasFix: false, connected: true, bleError: false, gpsError: true })).toBe('gps-error')
  })
})

describe('SPLASH_COPY', () => {
  it('has copy for every non-hidden state', () => {
    expect(Object.keys(SPLASH_COPY).sort()).toEqual(['ble-error', 'gps-error', 'intro', 'waiting-gps'])
  })
})
