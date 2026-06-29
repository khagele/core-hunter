import { describe, it, expect } from 'vitest'
import { Publisher } from '../publisher.js'

describe('Publisher.buildPayload', () => {
  it('includes hunter DF fields and keeps gps nested', () => {
    const rec = { rx_at: 't', raw: 'dead', snr: -3.5, rssi: -92, lat: 51, lon: 4, acc_m: 8,
      sender_key: 'a1', sender_keylen: 1, sender_role: null, is_direct: true, hops: 0, packet_type: 'channel-msg' }
    const p = Publisher.buildPayload('aabb', rec, 'hunter-1')
    expect(p).toMatchObject({
      origin_id: 'aabb', origin: 'hunter-1', timestamp: 't', type: 'PACKET', direction: 'rx',
      raw: 'dead', SNR: -3.5, RSSI: -92, is_direct: true, hops: 0,
      sender_key: 'a1', sender_keylen: 1, sender_role: null, packet_type: 'channel-msg',
      gps: { lat: 51, lon: 4, acc_m: 8 },
    })
  })
})
