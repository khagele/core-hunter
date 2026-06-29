import { bytesToHex } from './meshpacket.js'

// shouldCapture enforces the iteration-2 zero-hop rule: only direct receptions
// (hops === 0, isDirect === true) are captured, queued, and published.
// Relayed packets describe the last repeater's RF conditions, not the target's.
export function shouldCapture(cls) { return !!cls && cls.isDirect === true }

export function buildRecord(frame, pkt, cls, gps, nowIso) {
  return {
    rx_at: nowIso,
    raw: bytesToHex(frame.raw),
    snr: frame.snr,
    rssi: frame.rssi,
    lat: gps.lat,
    lon: gps.lon,
    acc_m: gps.acc_m,
    sender_key: cls.senderKey,
    sender_keylen: cls.senderKeylen,
    sender_role: null, // iteration 1: advert role decoding deferred (Task B9)
    is_direct: cls.isDirect,
    hops: cls.hops,
    packet_type: cls.packetType,
  }
}
