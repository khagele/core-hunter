import { describe, it, expect } from 'vitest'
import { buildRecord, shouldCapture } from '../capture.js'

describe('buildRecord', () => {
  it('flattens frame + classification + gps; no decrypted text', () => {
    const frame = { snr: -3.5, rssi: -92, raw: new Uint8Array([0xde, 0xad]) }
    const cls = { packetType: 'GroupText', hops: 0, isDirect: true,
      sender: { kind: 'channel_name', id: 'Spammer', label: 'Spammer' }, channel: 'public', text: 'buy now' }
    const rec = buildRecord(frame, cls, { lat: 51, lon: 4, acc_m: 8 }, '2026-06-29T10:00:00Z')
    expect(rec).toEqual({
      rx_at: '2026-06-29T10:00:00Z', raw: 'dead', snr: -3.5, rssi: -92, lat: 51, lon: 4, acc_m: 8,
      sender_kind: 'channel_name', sender_id: 'Spammer', sender_label: 'Spammer', channel_name: 'public',
      is_direct: true, hops: 0, packet_type: 'GroupText',
    })
    expect('text' in rec).toBe(false)
  })
})

describe('shouldCapture', () => {
  it('returns true for a direct (zero-hop) classification', () => {
    expect(shouldCapture({ isDirect: true })).toBe(true)
  })

  it('returns false for a relayed (non-zero-hop) classification', () => {
    expect(shouldCapture({ isDirect: false })).toBe(false)
  })
})
