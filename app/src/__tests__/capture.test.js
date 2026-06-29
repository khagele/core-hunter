import { describe, it, expect } from 'vitest'
import { buildRecord } from '../capture.js'

describe('buildRecord', () => {
  it('flattens frame + classification + gps into a queue record', () => {
    const frame = { snr: -3.5, rssi: -92, raw: new Uint8Array([0xde, 0xad]) }
    const cls = { senderKey: 'a1', senderKeylen: 1, src: 'rxlog', hops: 0, isDirect: true, packetType: 'channel-msg' }
    const gps = { lat: 51.0, lon: 4.0, acc_m: 8 }
    const rec = buildRecord(frame, null, cls, gps, '2026-06-29T10:00:00Z')
    expect(rec).toMatchObject({
      rx_at: '2026-06-29T10:00:00Z', raw: 'dead', snr: -3.5, rssi: -92,
      lat: 51.0, lon: 4.0, acc_m: 8, sender_key: 'a1', sender_keylen: 1,
      sender_role: null, is_direct: true, hops: 0, packet_type: 'channel-msg',
    })
  })
})
