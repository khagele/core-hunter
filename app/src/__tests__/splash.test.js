import { describe, it, expect } from 'vitest'
import { splashState, SPLASH_COPY, SPLASH_DISCLAIMER, SPLASH_BASICS, SPLASH_CALLOUTS, SPLASH_TAGLINE, APP_NAME } from '../splash.js'

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
  it('has a copy entry for every non-hidden state', () => {
    expect(Object.keys(SPLASH_COPY).sort()).toEqual(['ble-error', 'gps-error', 'intro', 'waiting-gps'])
  })
})

describe('SPLASH_DISCLAIMER', () => {
  it('states we map radio signal, not GPS tracking of the target (AGENTS.md §7)', () => {
    expect(SPLASH_DISCLAIMER).toMatch(/RSSI|signal/i)
    expect(SPLASH_DISCLAIMER).toMatch(/not GPS tracking/i)
    expect(SPLASH_DISCLAIMER).toMatch(/where you were/i)
  })
})

describe('SPLASH_BASICS', () => {
  it('is a non-empty list of non-empty strings', () => {
    expect(Array.isArray(SPLASH_BASICS)).toBe(true)
    expect(SPLASH_BASICS.length).toBeGreaterThan(0)
    for (const b of SPLASH_BASICS) expect(typeof b === 'string' && b.length > 0).toBe(true)
  })
})

describe('SPLASH_TAGLINE', () => {
  it('is a non-empty one-sentence description of what the app does', () => {
    expect(typeof SPLASH_TAGLINE).toBe('string')
    expect(SPLASH_TAGLINE.length).toBeGreaterThan(0)
  })
})

describe('SPLASH_CALLOUTS', () => {
  it('has copy for the three control groups', () => {
    expect(Object.keys(SPLASH_CALLOUTS).sort()).toEqual(['controls', 'fabs', 'menu'])
    for (const k of Object.keys(SPLASH_CALLOUTS)) expect(SPLASH_CALLOUTS[k].length).toBeGreaterThan(0)
  })
})

describe('APP_NAME', () => {
  it('is the Mesh-Hunter display name', () => {
    expect(APP_NAME).toBe('Mesh-Hunter')
  })
})
