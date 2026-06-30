// Client-side node-name resolution for the analysis map. Mirrors the scanner
// app's names.js: each distinct full pubkey is fetched from the CoreScope
// resolver at most once and cached in memory. Only full 32-byte pubkeys are
// resolvable; 1-byte source/path hashes are ambiguous and skipped.
import { RESOLVE_URL } from './config.js'

const cache = new Map() // key (lowercase hex) -> name | ''
const FULL_PUBKEY = /^[0-9a-f]{64}$/i

export function isFullPubkey(id) { return typeof id === 'string' && FULL_PUBKEY.test(id) }

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
// (fill-only), then a cached resolved name for a full pubkey, then the raw id.
export function senderName(pt) {
  if (pt.sender_label) return pt.sender_label
  if (isFullPubkey(pt.sender_id)) {
    const hit = cachedName(pt.sender_id)
    if (hit) return hit
  }
  return pt.sender_id || '—'
}
