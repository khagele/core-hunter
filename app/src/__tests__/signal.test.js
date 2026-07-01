import { describe, it, expect } from 'vitest'
import { snrTier, tierColorVar, fillOpacity, rssiTier, effectivePlotOffset } from '../signal.js'

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

describe('rssiTier — fixed dBm bands (hot = strong = close)', () => {
  it('maps RSSI dBm to tiers', () => {
    expect(rssiTier(-70)).toBe('hot')
    expect(rssiTier(-85)).toBe('warm')
    expect(rssiTier(-95)).toBe('mid')
    expect(rssiTier(-105)).toBe('cool')
    expect(rssiTier(-120)).toBe('cold')
    expect(rssiTier(null)).toBe('none')
  })
  it('applies calibration offset before banding', () => {
    // -92 + 5 = -87 → warm
    expect(rssiTier(-92, 5)).toBe('warm')
  })
})

describe('effectivePlotOffset — calibration + attenuator added back', () => {
  it('adds the attenuation magnitude back (a −20 dB attenuator → +20)', () => {
    expect(effectivePlotOffset(0, -20)).toBe(20)
    expect(effectivePlotOffset(0, -10)).toBe(10)
    expect(effectivePlotOffset(0, -30)).toBe(30)
  })
  it('stacks on top of the device calibration offset', () => {
    expect(effectivePlotOffset(5, -20)).toBe(25)
    expect(effectivePlotOffset(-3, -10)).toBe(7)
  })
  it('is a no-op at 0 dB and defaults missing args to 0', () => {
    expect(effectivePlotOffset(0, 0)).toBe(0)
    expect(effectivePlotOffset()).toBe(0)
    expect(effectivePlotOffset(8)).toBe(8)
  })
})
