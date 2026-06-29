import { bytesToHex } from './decode.js'

// Zero-hop rule (iteration 2): only direct receptions are captured/published.
export function shouldCapture(cls) { return !!cls && cls.isDirect === true }

export function buildRecord(frame, cls, gps, nowIso) {
  return {
    rx_at: nowIso,
    raw: bytesToHex(frame.raw),
    snr: frame.snr,
    rssi: frame.rssi,
    lat: gps.lat,
    lon: gps.lon,
    acc_m: gps.acc_m,
    sender_kind: cls.sender.kind,
    sender_id: cls.sender.id,
    sender_label: cls.sender.label,
    channel_name: cls.channel,
    is_direct: cls.isDirect,
    hops: cls.hops,
    packet_type: cls.packetType,
  }
}
