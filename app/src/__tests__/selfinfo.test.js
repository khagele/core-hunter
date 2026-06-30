import { describe, it, expect } from 'vitest'
import { parseSelfInfo } from '../selfinfo.js'

const hexToBytes = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)))

// Real SELF_INFO capture from a Heltec V4.3 companion running on SF7.
// Radio params sit at a fixed offset before the variable-length name:
// [48..51] freq kHz, [52..55] bw Hz, [56] spreading factor, [57] coding rate.
const SF7 =
  '050116166718d3a1b0c9c0e9be0b1bd9fa9707dec0741a4575b598d4c101341c56714f96860a1703ba16590001000101f2440d0024f4000007086b6173'

describe('parseSelfInfo — spreading factor (byte 56)', () => {
  it('reads SF7 from a real companion capture', () => {
    expect(parseSelfInfo(hexToBytes(SF7)).sf).toBe(7)
  })

  it('reads other SF values at the same offset', () => {
    const b = hexToBytes(SF7)
    b[56] = 8
    expect(parseSelfInfo(b).sf).toBe(8)
    b[56] = 12
    expect(parseSelfInfo(b).sf).toBe(12)
  })

  it('treats an out-of-range SF byte as unknown (null)', () => {
    const b = hexToBytes(SF7)
    b[56] = 0
    expect(parseSelfInfo(b).sf).toBeNull()
  })

  it('returns null SF when the frame is too short to include byte 56', () => {
    expect(parseSelfInfo(hexToBytes(SF7).slice(0, 50)).sf).toBeNull()
  })

  it('still returns the pubkey and name', () => {
    const info = parseSelfInfo(hexToBytes(SF7))
    expect(info.pubkey).toHaveLength(64)
    expect(info.name).toBe('kas')
  })

  it('returns null for a frame too short to parse at all', () => {
    expect(parseSelfInfo(hexToBytes('0501'))).toBeNull()
  })
})
