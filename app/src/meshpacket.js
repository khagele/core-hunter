import { getPayloadTypeName, getDeviceRoleName } from './decode.js'

const PT_ADVERT = 4
const PT_GROUP_TEXT = 5

export function bytesToHex(bytes) {
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

export function hexToBytes(hex) {
  const clean = hex.trim().toLowerCase();
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(clean.substr(i * 2, 2), 16);
  return out;
}

export function classifyReception(decoded, channelNameFor = () => null) {
  const pt = decoded.payloadType
  const hops = decoded.pathLength || 0
  const d = (decoded.payload && decoded.payload.decoded) || {}
  let sender = { kind: null, id: null, label: null }
  let channel = null
  let text = null

  if (pt === PT_ADVERT && d.publicKey) {
    const role = d.appData && d.appData.deviceRole != null ? getDeviceRoleName(d.appData.deviceRole) : null
    sender = { kind: 'advert_pubkey', id: d.publicKey.toLowerCase(), role, label: (d.appData && d.appData.name) || null }
  } else if (pt === PT_GROUP_TEXT) {
    channel = channelNameFor(d.channelHash)
    if (d.decrypted && d.decrypted.sender) {
      sender = { kind: 'channel_name', id: d.decrypted.sender, label: d.decrypted.sender }
      text = d.decrypted.message || null
    }
  } else if (d.publicKey) {
    // Discover/Control reply: carries the responding node's pubkey prefix + type
    // (that's what a discover is FOR — which, and what kind of, nodes are nearby).
    // No name in the packet → label stays null so the name is resolved by ID later.
    const id = d.publicKey.toLowerCase()
    sender = { kind: 'discover_pubkey', id, role: d.nodeTypeName || null, label: null }
  } else if (d.sourceHash) {
    const id = String(d.sourceHash).toLowerCase()
    sender = { kind: 'direct_hash', id, label: id }
  }

  return { packetType: getPayloadTypeName(pt), hops, isDirect: hops === 0, sender, channel, text }
}
