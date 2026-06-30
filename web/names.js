// Client-side node-name resolution for the analysis map. Each distinct pubkey /
// pubkey-prefix is fetched from the CoreScope resolver at most once and cached.
// Resolvable = a full 32-byte pubkey (advert) OR a >= 4-byte prefix (discover
// reply) — CoreScope resolves those uniquely. 1-byte source/path hashes (2 hex)
// are ambiguous and skipped.
import { RESOLVE_URL } from './config.js'

const cache = new Map() // key (lowercase hex) -> name | ''
const FULL_PUBKEY = /^[0-9a-f]{64}$/i
// 2..32 bytes: discover 8-byte prefixes, advert pubkeys, AND CoreScope 2-byte
// relay path-prefixes (all resolve uniquely via CoreScope). 1-byte hashes (2 hex)
// stay excluded. Ambiguous results are handled by resolveName (cached as '').
const RESOLVABLE = /^[0-9a-f]{4,64}$/i

export function isFullPubkey(id) { return typeof id === 'string' && FULL_PUBKEY.test(id) }
export function isResolvableId(id) { return typeof id === 'string' && RESOLVABLE.test(id) }

// cachedName: resolved name ('' = resolved-but-unknown) or undefined if not yet
// looked up. Synchronous — use it while rendering.
export function cachedName(key) {
  const k = String(key).toLowerCase()
  return cache.has(k) ? cache.get(k) : undefined
}

// resolveName fetches a name for a full pubkey, caching the result. A unique hit
// caches the name; an ambiguous/not-found response caches '' (so we stop asking).
// Transport errors are NOT cached, so they retry on a later draw. Returns the
// name or ''.
export async function resolveName(key) {
  if (!RESOLVE_URL) return ''
  const k = String(key).toLowerCase()
  if (cache.has(k)) return cache.get(k)
  try {
    const r = await fetch(RESOLVE_URL + '?prefix=' + encodeURIComponent(k))
    if (!r.ok) return '' // transient — do not cache
    const j = await r.json()
    const name = !j.ambiguous && j.name ? j.name : ''
    cache.set(k, name)
    return name
  } catch {
    return '' // network error — do not cache, retry later
  }
}

// senderName picks the best label for a point: an existing server label wins
// (fill-only — advert broadcast names), then a cached resolved name for a
// resolvable id (full pubkey or discover prefix), then the raw id.
export function senderName(pt) {
  if (pt.sender_label) return pt.sender_label
  if (isResolvableId(pt.sender_id)) {
    const hit = cachedName(pt.sender_id)
    if (hit) return hit
  }
  return pt.sender_id || '—'
}
