import { describe, it, expect } from 'vitest'
import { Publisher } from '../publisher.js'

describe('Publisher.buildPayload', () => {
  it('includes new sender fields, drops legacy ones', () => {
    const rec = { rx_at: 't', raw: 'dead', snr: -3.5, rssi: -92, lat: 51, lon: 4, acc_m: 8,
      sender_kind: 'direct_hash', sender_id: '4a', sender_label: '4a', channel_name: null,
      is_direct: true, hops: 0, packet_type: 'Response' }
    const p = Publisher.buildPayload('aabb', rec, 'hunter-1')
    expect(p).toMatchObject({
      origin_id: 'aabb', origin: 'hunter-1', timestamp: 't', type: 'PACKET', direction: 'rx',
      raw: 'dead', SNR: -3.5, RSSI: -92, is_direct: true, hops: 0, packet_type: 'Response',
      sender_kind: 'direct_hash', sender_id: '4a', sender_label: '4a', channel_name: null,
      gps: { lat: 51, lon: 4, acc_m: 8 },
    })
    expect('sender_key' in p).toBe(false)
    expect('text' in p).toBe(false)
  })
})
