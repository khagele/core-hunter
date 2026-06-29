import { describe, it, expect } from 'vitest'
import { snrTier, tierColorVar, fillOpacity } from '../signal.js'

describe('thermal signal tiers (hot = strong)', () => {
  it('maps SNR to tiers', () => {
    expect(snrTier(0)).toBe('hot')
    expect(snrTier(-3)).toBe('warm')
    expect(snrTier(-7)).toBe('mid')
    expect(snrTier(-12)).toBe('cool')
    expect(snrTier(-20)).toBe('cold')
    expect(snrTier(null)).toBe('none')
  })
  it('exposes css var + opacity per tier', () => {
    expect(tierColorVar('hot')).toBe('--ch-sig-hot')
    expect(fillOpacity('hot')).toBeGreaterThan(fillOpacity('cold'))
    expect(fillOpacity('none')).toBeLessThan(fillOpacity('cool'))
  })
})
