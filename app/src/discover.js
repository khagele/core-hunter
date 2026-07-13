// Zero-hop CONTROL/DISCOVER_REQ — makes nearby nodes reply directly (corescope-rx).
export const CMD_SEND_CONTROL_DATA = 0x37
export const CTRL_NODE_DISCOVER_REQ = 0x80  // sub_type 0x8 in the upper nibble
export const DISCOVER_PREFIX_ONLY = 0x01    // responders send an 8-byte pubkey prefix
export const DISCOVER_FILTER_ALL = 0xff     // type_filter: all ADV_TYPE_* bits

// tag = 4-byte Uint8Array (random; reflected in each DISCOVER_RESP).
export function buildDiscoverFrame(tag) {
  return new Uint8Array([CMD_SEND_CONTROL_DATA, CTRL_NODE_DISCOVER_REQ | DISCOVER_PREFIX_ONLY, DISCOVER_FILTER_ALL, ...tag])
}

// Directed zero-hop trace — pings one specific node via an explicit routing
// path, distinct from Discover's untargeted broadcast. Verified against
// MeshCore firmware (examples/companion_radio/MyMesh.cpp) and the official
// meshcore.js/meshcore_py reference clients: opcode 0x24, payload
// tag(4 LE)+authCode(4 LE)+flags(1, path_sz bits 0-1 = 0 → 1-byte hashes)
// followed by the path itself — one hash byte per hop, first hop = the
// target's pubkey-prefix byte (same prefix convention as Discover's
// DISCOVER_PREFIX_ONLY). Firmware rejects frames with len <= 10 (empty path)
// with ERR_CODE_ILLEGAL_ARG, so an empty path is rejected here too rather
// than sent.
export const CMD_SEND_TRACE_PATH = 0x24

export function buildTracePathFrame(tag, authCode, path) {
  if (!path || path.length === 0) throw new Error('buildTracePathFrame: path must be non-empty')
  const t = tag >>> 0
  const a = authCode >>> 0
  return new Uint8Array([
    CMD_SEND_TRACE_PATH,
    t & 0xff, (t >>> 8) & 0xff, (t >>> 16) & 0xff, (t >>> 24) & 0xff,
    a & 0xff, (a >>> 8) & 0xff, (a >>> 16) & 0xff, (a >>> 24) & 0xff,
    0x00,
    ...path,
  ])
}
