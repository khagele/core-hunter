import { MeshCoreDecoder, getPayloadTypeName, bytesToHex as _bytesToHex } from '@michaelhart/meshcore-decoder'
import CryptoJS from 'crypto-js'

// Wrap the decoder's uppercase bytesToHex to return lowercase (consistent with the rest of the codebase).
export function bytesToHex(bytes) { return _bytesToHex(bytes).toLowerCase() }

let keyStore = null
let hashToName = {}

// initDecoder builds the decryption keyStore + a 1-byte channel-hash → name map
// from the config channelKeys ({ name: hexSecret }). Call once at startup.
export function initDecoder(channelKeys) {
  const secrets = Object.values(channelKeys || {})
  keyStore = MeshCoreDecoder.createKeyStore({ channelSecrets: secrets })
  hashToName = {}
  for (const [name, hex] of Object.entries(channelKeys || {})) {
    const h = CryptoJS.SHA256(CryptoJS.enc.Hex.parse(hex)).toString(CryptoJS.enc.Hex)
    hashToName[h.slice(0, 2)] = name // firmware uses 1 byte of sha256(secret) as the channel hash
  }
}

export function decodePacket(rawHex) {
  try {
    return MeshCoreDecoder.decode(rawHex, keyStore ? { keyStore } : {})
  } catch (e) {
    return null
  }
}

export function channelNameFor(channelHash) {
  if (!channelHash) return null
  return hashToName[String(channelHash).toLowerCase()] || null
}

export { getPayloadTypeName }
