import { describe, it, expect } from 'vitest'
import { isSettingsActive } from '../settings.js'

describe('isSettingsActive', () => {
  it('is false when attenuator is 0 and no manual fix is set', () => {
    expect(isSettingsActive({ attenuatorDb: 0, manualFix: null })).toBe(false)
  })
  it('is true when the attenuator is non-zero', () => {
    expect(isSettingsActive({ attenuatorDb: -10, manualFix: null })).toBe(true)
  })
  it('is true when a manual position override is set', () => {
    expect(isSettingsActive({ attenuatorDb: 0, manualFix: { lat: 51.05, lon: 3.72, acc_m: 10 } })).toBe(true)
  })
  it('is false for missing/undefined input', () => {
    expect(isSettingsActive({})).toBe(false)
    expect(isSettingsActive(undefined)).toBe(false)
  })
})
