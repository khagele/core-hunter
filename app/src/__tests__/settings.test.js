import { describe, it, expect } from 'vitest'
import { isSettingsActive } from '../settings.js'

describe('isSettingsActive', () => {
  it('is false when attenuator is 0', () => {
    expect(isSettingsActive({ attenuatorDb: 0 })).toBe(false)
  })
  it('is true when the attenuator is non-zero', () => {
    expect(isSettingsActive({ attenuatorDb: -10 })).toBe(true)
  })
  it('is false for missing/undefined input', () => {
    expect(isSettingsActive({})).toBe(false)
    expect(isSettingsActive(undefined)).toBe(false)
  })
})
