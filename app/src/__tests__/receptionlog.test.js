import { describe, it, expect } from 'vitest'
import { rxView, rxActiveIndex, rxFade } from '../receptionlog.js'

const rec = (o) => ({ id: 1, rx_at: '2026-06-29T10:00:00Z', ...o })

describe('rxView — source select, ascending by rx_at, recent cap', () => {
  const filtered = [rec({ id: 1, rx_at: '2026-06-29T10:00:00Z' }), rec({ id: 2, rx_at: '2026-06-29T10:02:00Z' })]
  const all = [...filtered, rec({ id: 3, rx_at: '2026-06-29T10:01:00Z' })]

  it('filtered mode returns the filtered set, all mode the full set', () => {
    expect(rxView(filtered, all, 'filtered').map((r) => r.id)).toEqual([1, 2])
    expect(rxView(filtered, all, 'all').map((r) => r.id).sort()).toEqual([1, 2, 3])
  })
  it('sorts ascending by rx_at (newest last)', () => {
    expect(rxView(filtered, all, 'all').map((r) => r.id)).toEqual([1, 3, 2])
  })
  it('caps to the most recent N, dropping the oldest', () => {
    const many = Array.from({ length: 10 }, (_, i) => rec({ id: i, rx_at: `2026-06-29T10:0${i}:00Z` }))
    const out = rxView(many, many, 'filtered', 3)
    expect(out.map((r) => r.id)).toEqual([7, 8, 9])
  })
  it('handles empty / missing input', () => {
    expect(rxView([], [], 'filtered')).toEqual([])
    expect(rxView(undefined, undefined, 'all')).toEqual([])
  })
})

describe('rxActiveIndex — playhead index from scroll, clamped', () => {
  it('rounds scrollTop/lineH', () => {
    expect(rxActiveIndex(0, 20, 10)).toBe(0)
    expect(rxActiveIndex(58, 20, 10)).toBe(3)
    expect(rxActiveIndex(50, 20, 10)).toBe(3) // 2.5 rounds to 3 (banker-free Math.round)
  })
  it('clamps to [0, count-1] and returns -1 when empty', () => {
    expect(rxActiveIndex(-40, 20, 10)).toBe(0)
    expect(rxActiveIndex(9999, 20, 10)).toBe(9)
    expect(rxActiveIndex(0, 20, 0)).toBe(-1)
  })
})

describe('rxFade — playhead-relative opacity (6 above, 3 below, faster below)', () => {
  it('is 1 on the lane', () => { expect(rxFade(0)).toBe(1) })
  it('fades over ~6 lines above (negative d)', () => {
    expect(rxFade(-3)).toBeCloseTo(0.5)
    expect(rxFade(-6)).toBe(0)
    expect(rxFade(-9)).toBe(0)
  })
  it('fades faster over ~3 lines below (positive d)', () => {
    expect(rxFade(1)).toBeCloseTo(2 / 3)
    expect(rxFade(3)).toBe(0)
    expect(rxFade(5)).toBe(0)
  })
})
