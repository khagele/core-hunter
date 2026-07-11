// Central persistence for every UI setting. A setting registers itself here once
// and automatically gains two things:
//   1. reflection into the address bar (query string) — copy/paste the URL and a
//      second viewer sees the exact same view, down to the map zoom;
//   2. persistence in localStorage, so the view is restored on the next visit.
//
// Precedence on load is URL > stored > the field's own default: a shared link is
// explicit intent and wins over whatever the visitor had last time. New settings
// need one register()/bindControl() call and inherit both behaviours for free.

const STORAGE_KEY = 'ch-state'

// --- pure helpers (unit-tested) ---

// Merge the stored map and the URL params into a resolved state object. The URL
// value wins per key; empty strings from either source are treated as absent.
// A key listed in urlOnlyKeys never falls back to the stored value (#217) — it's
// either explicit in the URL, or left for the field's own default.
export function resolveState(keys, stored, urlParams, urlOnlyKeys = []) {
  const urlOnly = new Set(urlOnlyKeys)
  const out = {}
  for (const k of keys) {
    const u = urlParams.get(k)
    const v = u !== null && u !== '' ? u : (urlOnly.has(k) ? undefined : stored[k])
    if (v != null && v !== '') out[k] = v
  }
  return out
}

// Serialize a state snapshot to a query string, dropping null/undefined/empty.
export function snapshotToQuery(state) {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(state)) if (v != null && v !== '') p.set(k, String(v))
  return p.toString()
}

// Drop urlOnly keys from a state snapshot before it's written to localStorage
// (#217) — those fields still reflect into the URL via snapshotToQuery, just
// not into storage, so a plain revisit can't silently inherit an old value.
export function persistableState(state, urlOnlyKeys) {
  const urlOnly = new Set(urlOnlyKeys)
  const out = {}
  for (const [k, v] of Object.entries(state)) if (!urlOnly.has(k)) out[k] = v
  return out
}

// --- stateful registry (DOM/location glue) ---

const fields = []
let suspended = false // guard: programmatic set() during load() must not re-persist

// Register a custom field. `get` returns the current value as a string (''/null =
// absent), `set` applies a value read back from URL/storage.
export function register(field) {
  fields.push(field)
  return field
}

// Register a plain form control by element id and re-persist on the given DOM
// events. `checkbox: true` maps the checked state to '1'/''. `urlOnly: true`
// (#217) keeps the field shareable via URL but out of localStorage, so a plain
// revisit never silently inherits a stale saved value.
export function bindControl(key, id, { events = ['change'], checkbox = false, urlOnly = false } = {}) {
  const el = document.getElementById(id)
  if (!el) return null
  register({
    key,
    urlOnly,
    get: () => (checkbox ? (el.checked ? '1' : '') : el.value),
    set: (v) => { if (checkbox) el.checked = v === '1'; else el.value = v },
  })
  for (const ev of events) el.addEventListener(ev, save)
  return el
}

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

// Synchronous single-key read for state that must be applied before the registry
// exists (theme and the initial map view, needed at construction time).
export function initial(key, fallback) {
  const u = new URLSearchParams(location.search).get(key)
  if (u !== null && u !== '') return u
  const s = readStore()[key]
  return s != null && s !== '' ? s : fallback
}

function urlOnlyKeys() { return fields.filter((f) => f.urlOnly).map((f) => f.key) }

// Apply the merged URL+stored state to every registered field, then normalize the
// address bar and storage to that merged state.
export function load() {
  const merged = resolveState(fields.map((f) => f.key), readStore(), new URLSearchParams(location.search), urlOnlyKeys())
  suspended = true
  try {
    for (const f of fields) if (merged[f.key] != null) { try { f.set(merged[f.key]) } catch (_) {} }
  } finally { suspended = false }
  save()
}

// Snapshot every field and write it to both the address bar and localStorage
// (minus urlOnly fields, which are address-bar-only — #217).
export function save() {
  if (suspended) return
  const state = {}
  for (const f of fields) {
    const v = f.get()
    if (v != null && v !== '') state[f.key] = v
  }
  const qs = snapshotToQuery(state)
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname + location.hash)
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persistableState(state, urlOnlyKeys()))) } catch (_) {}
}
