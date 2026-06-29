import { describe, it, expect } from 'vitest'
import { classifyReception, parsePacket } from '../meshpacket.js'

// helper: build a minimal parsed-packet stub to exercise classify rules directly
const pkt = (over) => ({ routeType: 1, payloadType: 0, isAdvert: false, hops: [],
  advertPubkey: null, isDiscoverResp: false, discoverPubkey: null, ...over })

describe('classifyReception', () => {
  it('relayed packet is not attributed (1-byte axis dropped)', () => {
    const c = classifyReception('rx', pkt({ routeType: 1, hops: ['a1'] }))
    expect(c.senderKey).toBeNull()
    expect(c.senderKeylen).toBe(0)
    expect(c.src).toBeNull()
    expect(c.hops).toBe(1)
    expect(c.isDirect).toBe(false)
  })

  it('marks a 0-hop advert as direct with full pubkey', () => {
    const c = classifyReception('rx', pkt({ payloadType: 4, isAdvert: true, hops: [],
      advertPubkey: 'ab'.repeat(32) }))
    expect(c.isDirect).toBe(true)
    expect(c.senderKeylen).toBe(32)
    expect(c.src).toBe('advert')
    expect(c.packetType).toBe('advert')
  })

  it('keeps an unattributed 0-hop data packet as direct, sender null', () => {
    const c = classifyReception('rx', pkt({ routeType: 1, payloadType: 0, hops: [] }))
    expect(c.isDirect).toBe(true)
    expect(c.senderKey).toBeNull()
    expect(c.senderKeylen).toBe(0)
    expect(c.packetType).toBe('channel-msg')
  })

  it('returns hops count from path length for relayed packets, sender unattributed', () => {
    const c = classifyReception('rx', pkt({ routeType: 1, hops: ['a1', 'b2', 'c3'] }))
    expect(c.hops).toBe(3)
    expect(c.isDirect).toBe(false)
    expect(c.senderKey).toBeNull()
  })
})
