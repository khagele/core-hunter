import { describe, it, expect } from 'vitest'
import { buildDiscoverFrame, buildTracePathFrame } from '../discover.js'
describe('buildDiscoverFrame', () => {
  it('builds [0x37, 0x81, 0xff, ...tag] (7 bytes)', () => {
    const f = buildDiscoverFrame(new Uint8Array([1, 2, 3, 4]))
    expect(Array.from(f)).toEqual([0x37, 0x81, 0xff, 1, 2, 3, 4])
    expect(f.length).toBe(7)
  })
})

describe('buildTracePathFrame', () => {
  it('builds [0x24, tag(4 LE), authCode(4 LE), flags=0x00, ...path] for a one-hop path', () => {
    const f = buildTracePathFrame(0x04030201, 0, [0xab])
    expect(Array.from(f)).toEqual([0x24, 0x01, 0x02, 0x03, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0xab])
    expect(f.length).toBe(11)
  })
  it('encodes a non-zero authCode little-endian', () => {
    const f = buildTracePathFrame(0, 0x0000abcd, [0x11])
    expect(Array.from(f).slice(5, 9)).toEqual([0xcd, 0xab, 0x00, 0x00])
  })
  it('supports a multi-hop path', () => {
    const f = buildTracePathFrame(0, 0, [0x11, 0x22, 0x33])
    expect(Array.from(f).slice(10)).toEqual([0x11, 0x22, 0x33])
    expect(f.length).toBe(13)
  })
  it('throws on an empty path (firmware requires len > 10)', () => {
    expect(() => buildTracePathFrame(0, 0, [])).toThrow()
  })
})
