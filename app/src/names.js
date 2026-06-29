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

// orderResolvers returns a new array with resolvers whose sf matches
// companionSf placed first (preserving their relative order), followed by the
// rest in their original order. When companionSf is null/undefined (or no
// resolver matches), returns the resolvers in config order unchanged.
//
// NOTE: companionSf is currently always undefined — the companion's spreading
// factor is not yet readable from SELF_INFO/DEVICE_INFO firmware responses.
// SF-ordered selection is firmware-gated (same pattern as sender_role). Wire
// companionSf once the firmware exposes SF in its info replies.
export function orderResolvers(resolvers, companionSf) {
  if (companionSf == null) return resolvers.slice();
  const matching = resolvers.filter(r => r.sf === companionSf);
  const rest = resolvers.filter(r => r.sf !== companionSf);
  if (matching.length === 0) return resolvers.slice();
  return [...matching, ...rest];
}

// resolveName resolves a heard key (2-3 byte prefix or full pubkey) to a name.
// companionSf defaults to undefined — SF is firmware-gated (see orderResolvers
// comment above). Resolvers are queried in order; first unambiguous hit wins.
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
