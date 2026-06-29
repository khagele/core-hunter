import { describe, it, expect } from 'vitest'
import CryptoJS from 'crypto-js'
import { initDecoder, decodePacket, channelNameFor, bytesToHex } from '../decode.js'

// real 0-hop DIRECT Response packet captured live (sourceHash 4a)
const REAL_DIRECT = '0640774ad5974332ebc33dde2e08ef96b7b337d3358d'
// sha256(public secret) first byte — the 1-byte channel hash decode.js keys on
const PUBLIC_HASH1 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse('8b3387e9c5cdea6ac9e5edbaa115cd72'))
  .toString(CryptoJS.enc.Hex).slice(0, 2)

describe('decode', () => {
  it('decodes a real direct packet (type + pathLength + sourceHash)', () => {
    initDecoder({ public: '8b3387e9c5cdea6ac9e5edbaa115cd72' })
    const d = decodePacket(REAL_DIRECT)
    expect(d.payloadType).toBe(1)        // Response
    expect(d.pathLength).toBe(0)
    expect(d.payload.decoded.sourceHash.toLowerCase()).toBe('4a')
  })
  it('maps a configured channel key to its name by 1-byte hash', () => {
    initDecoder({ public: '8b3387e9c5cdea6ac9e5edbaa115cd72' })
    expect(channelNameFor(PUBLIC_HASH1)).toBe('public')
    expect(channelNameFor('zz')).toBeNull()
  })
  it('bytesToHex round-trips', () => {
    expect(bytesToHex(new Uint8Array([0xde, 0xad]))).toBe('dead')
  })
  it('returns null on a malformed packet instead of throwing', () => {
    initDecoder({ public: '8b3387e9c5cdea6ac9e5edbaa115cd72' })
    expect(decodePacket('zz')).toBeNull()
  })
})
