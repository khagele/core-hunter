// On-the-fly node-name resolution: per heard prefix/pubkey, requests are sent
// to each configured CoreScope resolver in order. Resolvers are configured in
// config.json as a `resolvers` array (each { label?, sf?, url }). A bare
// `resolveUrl` is supported for back-compat (synthesized to a one-element
// resolvers array by normalizeConfig). Cached in memory for the session, so
// each distinct node is fetched at most once. A name is returned only when the
// prefix resolves uniquely across the first responding resolver; ambiguous/
// not-found → '' (caller shows the prefix).
import { getConfig } from './config.js';

const cache = new Map(); // key (lowercase hex) -> name | ''

// A full MeshCore public key is 32 bytes = 64 lowercase-hex chars. Only these
// can be resolved unambiguously; 1-byte path/source hashes (2 hex) cannot.
const FULL_PUBKEY = /^[0-9a-f]{64}$/i;
export function isFullPubkey(id) { return typeof id === 'string' && FULL_PUBKEY.test(id); }

// resolvableKey decides whether a reception's sender should be looked up.
// Fill-only: skip when a name is already present (advert appData.name, channel
// sender). Resolve only when the sender_id is a full pubkey (advert/discover) —
// never a 1-byte hash. Returns the lowercase key to resolve, or null.
export function resolvableKey(rec) {
  if (!rec || rec.sender_label) return null;
  return isFullPubkey(rec.sender_id) ? rec.sender_id.toLowerCase() : null;
}

// cachedName returns a previously-resolved name ('' = resolved-but-unknown) for
// a key, or undefined when it has not been resolved yet. Synchronous — safe to
// call from a render loop; pair with a fire-and-forget resolveName() for misses.
export function cachedName(key) {
  const k = String(key).toLowerCase();
  return cache.has(k) ? cache.get(k) : undefined;
}

// orderResolvers returns a new array with resolvers whose sf matches
// companionSf placed first (preserving their relative order), followed by the
// rest in their original order. When companionSf is null/undefined (or no
// resolver matches), returns the resolvers in config order unchanged.
//
// companionSf is read from the companion's SELF_INFO reply (byte 56) and passed
// in by app.js; it is null when the frame is too short or out of range.
export function orderResolvers(resolvers, companionSf) {
  if (companionSf == null) return resolvers.slice();
  const matching = resolvers.filter(r => r.sf === companionSf);
  const rest = resolvers.filter(r => r.sf !== companionSf);
  if (matching.length === 0) return resolvers.slice();
  return [...matching, ...rest];
}

// resolveName resolves a heard key (2-3 byte prefix or full pubkey) to a name.
// companionSf (the connected companion's spreading factor) puts the matching-SF
// resolver first; null falls back to config order. Resolvers are queried in
// order; first unambiguous hit wins.
// Returns '' when unconfigured, ambiguous, or unknown.
// Network/transport errors are NOT cached (retry later); '' is only cached
// when all resolvers responded but none produced a unique name.
export async function resolveName(key, companionSf /* = undefined */) {
  const c = getConfig();
  const resolvers = c && c.resolvers && c.resolvers.length > 0 ? c.resolvers : [];
  if (resolvers.length === 0) return '';

  const k = key.toLowerCase();
  if (cache.has(k)) return cache.get(k);

  const ordered = orderResolvers(resolvers, companionSf);

  let anyNetworkError = false;
  for (const resolver of ordered) {
    try {
      const r = await fetch(resolver.url + '?prefix=' + encodeURIComponent(k));
      if (!r.ok) {
        // HTTP error from this resolver — treat as "no result", continue.
        continue;
      }
      const j = await r.json();
      const name = !j.ambiguous && j.name ? j.name : '';
      if (name) {
        cache.set(k, name);
        return name;
      }
      // ambiguous or not found — try next resolver
    } catch (e) {
      // Transient network error — mark so we don't cache '' at the end.
      anyNetworkError = true;
    }
  }

  // All resolvers responded (or errored). Only cache '' if there were no
  // network errors (i.e. every resolver definitively had no unique name).
  if (!anyNetworkError) cache.set(k, '');
  return '';
}
