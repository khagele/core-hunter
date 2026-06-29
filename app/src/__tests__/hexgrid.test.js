import { describe, it, expect } from 'vitest'
import { hexSizeForRes, hexResForZoom } from '../hexgrid.js'

describe('hexSizeForRes', () => {
  it('keeps the existing coarse bands', () => {
    expect(hexSizeForRes(11)).toBe(40)
    expect(hexSizeForRes(10)).toBe(90)
    expect(hexSizeForRes(9)).toBe(180)
    expect(hexSizeForRes(7)).toBe(720)
    expect(hexSizeForRes(6)).toBe(1500)
  })
  it('adds finer cells down to 3 m for the zoomed-in resolutions', () => {
    expect(hexSizeForRes(12)).toBe(20)
    expect(hexSizeForRes(13)).toBe(10)
    expect(hexSizeForRes(14)).toBe(5)
    expect(hexSizeForRes(15)).toBe(3)
    expect(hexSizeForRes(16)).toBe(3) // clamps at the finest band
  })
})

describe('hexResForZoom', () => {
  it('keeps the existing coarse mapping', () => {
    expect(hexResForZoom(15)).toBe(11)
    expect(hexResForZoom(14)).toBe(10)
    expect(hexResForZoom(13)).toBe(10)
    expect(hexResForZoom(9)).toBe(8)
    expect(hexResForZoom(6)).toBe(6)
  })
  it('goes finer each level past 15, down to 3 m at max zoom', () => {
    expect(hexResForZoom(16)).toBe(12) // 20 m
    expect(hexResForZoom(17)).toBe(13) // 10 m
    expect(hexResForZoom(18)).toBe(14) // 5 m
    expect(hexResForZoom(19)).toBe(15) // 3 m
  })
})
