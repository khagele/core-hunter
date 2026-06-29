# core-hunter — Iteration 3: MeshCore decoder + sender identity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled packet parser with `@michaelhart/meshcore-decoder`, producing accurate packet types and a best-available sender identity per type (advert pubkey, direct sourceHash, decrypted channel sender name), surfaced in the popup, filters, and backend.

**Architecture:** A new `decode.js` wraps the decoder + a keyStore built from `channelKeys`. `classifyReception` is rewritten to map decoder output → a `{packetType, hops, isDirect, sender:{kind,id,label}, channel, text}` model. `capture.js`/`publisher.js`/`filters.js`/`huntmap.js`/`app.js` consume it. The Go ingestor gains additive nullable columns.

**Tech Stack:** Vite ES-module PWA, `@michaelhart/meshcore-decoder` (uses `crypto-js`, browser-safe), Vitest; Go 1.24 + `modernc.org/sqlite`.

## Global Constraints

- Decoder is authoritative for packet parsing; do not re-derive formats by hand.
- `sender.kind ∈ {advert_pubkey, direct_hash, channel_name, null}`. Hex ids (pubkey, sourceHash) are stored lowercase; channel sender is the decrypted name string.
- `is_direct = (pathLength === 0)`. Capture stays zero-hop-only (`shouldCapture` = `isDirect`).
- Decrypted channel **text is shown locally only — never put in the record, payload, or DB.** `raw` is always retained.
- `channelKeys` is a `{ displayName: hexSecret }` map; public channel preloaded as `8b3387e9c5cdea6ac9e5edbaa115cd72`.
- Backend changes are additive + no purge; migration on the **already-deployed** DB must be idempotent.
- Tests required for every logic change (Vitest in `app/`, `go test` in `server/`). Colours via CSS vars only. Explicit `git add`; one commit per logical change; commit body ends with `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Decoder runtime field names (verified): `decode(rawHex,{keyStore})` → `{ payloadType, pathLength, payload:{decoded:{...}}, ... }`. Advert decoded: `{publicKey, appData:{name?, deviceRole}}`. GroupText decoded: `{channelHash, decrypted?:{sender?, message}}`. Direct (Request/Response/TextMessage/Ack) decoded: `{sourceHash, ...}`. `PayloadType.Advert===4`, `PayloadType.GroupText===5`. `getPayloadTypeName(n)` → e.g. `'Advert'`,`'GroupText'`,`'Response'`.

---

## Task 1: config — `channelKeys` map

**Files:**
- Modify: `app/src/config.js` (add `channelKeys` to `normalizeConfig`)
- Modify: `app/public/config.example.json` (add `channelKeys` with public channel)
- Test: `app/src/__tests__/config.test.js` (create if absent)

**Interfaces:**
- Produces: `normalizeConfig(raw)` result gains `channelKeys: { [name:string]: string }` (hex secrets, lowercased; non-string/empty entries dropped). Missing → `{}`.

- [ ] **Step 1: Write the failing test**

`app/src/__tests__/config.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { normalizeConfig } from '../config.js'

describe('normalizeConfig channelKeys', () => {
  it('keeps a hex channelKeys map, lowercased', () => {
    const c = normalizeConfig({ mqttUrl: 'wss://x/ws', channelKeys: { public: '8B3387E9C5CDEA6AC9E5EDBAA115CD72' } })
    expect(c.channelKeys).toEqual({ public: '8b3387e9c5cdea6ac9e5edbaa115cd72' })
  })
  it('defaults to empty object when absent or malformed', () => {
    expect(normalizeConfig({ mqttUrl: 'wss://x/ws' }).channelKeys).toEqual({})
    expect(normalizeConfig({ mqttUrl: 'wss://x/ws', channelKeys: { bad: 123 } }).channelKeys).toEqual({})
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/config.test.js`
Expected: FAIL (`channelKeys` undefined).

- [ ] **Step 3: Implement**

In `app/src/config.js`, add to the `c` object literal in `normalizeConfig` (after `resolvers: [],`):
```js
    channelKeys: {},
```
Then, before `return c;`, insert:
```js
  if (raw.channelKeys && typeof raw.channelKeys === 'object' && !Array.isArray(raw.channelKeys)) {
    for (const [name, key] of Object.entries(raw.channelKeys)) {
      if (typeof key === 'string' && /^[0-9a-fA-F]+$/.test(key) && key.length > 0) {
        c.channelKeys[name] = key.toLowerCase();
      }
    }
  }
```

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/config.test.js`
Expected: PASS.

- [ ] **Step 5: Update config.example.json + commit**

Add to `app/public/config.example.json` (a top-level key):
```json
  "channelKeys": { "public": "8b3387e9c5cdea6ac9e5edbaa115cd72" }
```
```bash
git add app/src/config.js app/src/__tests__/config.test.js app/public/config.example.json
git commit -m "feat(app): config channelKeys map (public channel preloaded)"
```

---

## Task 2: `decode.js` — decoder wrapper + keyStore + channel-name map

**Files:**
- Modify: `app/package.json` (add dependency)
- Modify: `app/vite.config.js` (stub the decoder's CLI-only deps for the browser bundle)
- Create: `app/src/decode.js`
- Test: `app/src/__tests__/decode.test.js`

**Interfaces:**
- Consumes: `channelKeys` map (Task 1).
- Produces:
  - `initDecoder(channelKeys)` — builds the keyStore from the hex secrets and a `channelHash(1-byte) → name` map. Call once at startup.
  - `decodePacket(rawHex)` → the decoder's result object.
  - `channelNameFor(channelHash)` → display name or `null`.
  - re-exports `bytesToHex(Uint8Array) → hex` (from the decoder).

- [ ] **Step 1: Add the dependency**

Run: `cd app && npm install @michaelhart/meshcore-decoder`

- [ ] **Step 2: Stub CLI-only deps in Vite**

Edit `app/vite.config.js` to add a `resolve.alias` mapping so `chalk`/`commander` (pulled by the decoder's CLI, unused by `decode()`) resolve to an empty module in the browser build:
```js
import { readFileSync } from 'node:fs'
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
export default {
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { chalk: '/src/empty.js', commander: '/src/empty.js' } },
}
```
Create `app/src/empty.js`:
```js
export default {}
```

- [ ] **Step 3: Write the failing test (uses a REAL captured packet)**

`app/src/__tests__/decode.test.js`:
```js
import { describe, it, expect } from 'vitest'
import CryptoJS from 'crypto-js'
import { initDecoder, decodePacket, channelNameFor, bytesToHex } from '../decode.js'

// real 0-hop DIRECT Response packet captured live (sourceHash 4a)
const REAL_DIRECT = '0640774ad5974332ebc33dde2e08ef96b7b337d3358d'
// sha256(public secret) first byte — the 1-byte channel hash decode.js keys on
const PUBLIC_HASH1 = CryptoJS.SHA256(CryptoJS.enc.Hex.parse('8b3387e9c5cdea6ac9e5edbaa115cd72'))
  .toString(CryptoJS.enc.Hex).slice(0, 2)

describe('decode', () => {
  it('decodes a real direct packet (type + pathLength + sourceHash)', () => {
    initDecoder({ public: '8b3387e9c5cdea6ac9e5edbaa115cd72' })
    const d = decodePacket(REAL_DIRECT)
    expect(d.payloadType).toBe(1)        // Response
    expect(d.pathLength).toBe(0)
    expect(d.payload.decoded.sourceHash.toLowerCase()).toBe('4a')
  })
  it('maps a configured channel key to its name by 1-byte hash', () => {
    initDecoder({ public: '8b3387e9c5cdea6ac9e5edbaa115cd72' })
    expect(channelNameFor(PUBLIC_HASH1)).toBe('public')
    expect(channelNameFor('zz')).toBeNull()
  })
  it('bytesToHex round-trips', () => {
    expect(bytesToHex(new Uint8Array([0xde, 0xad]))).toBe('dead')
  })
})
```

- [ ] **Step 4: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/decode.test.js`
Expected: FAIL (`decode.js` missing).

- [ ] **Step 5: Implement `decode.js`**

`app/src/decode.js`:
```js
import { MeshCoreDecoder, getPayloadTypeName, bytesToHex } from '@michaelhart/meshcore-decoder'
import CryptoJS from 'crypto-js'

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
  return MeshCoreDecoder.decode(rawHex, keyStore ? { keyStore } : {})
}

export function channelNameFor(channelHash) {
  if (!channelHash) return null
  return hashToName[String(channelHash).toLowerCase()] || null
}

export { getPayloadTypeName, bytesToHex }
```

- [ ] **Step 6: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/decode.test.js`
Expected: PASS (3 tests).

- [ ] **Step 7: Verify the browser bundle builds with the decoder**

Run: `cd app && npm run build`
Expected: build succeeds (no unresolved `chalk`/`commander`).

- [ ] **Step 8: Commit**
```bash
git add app/package.json app/package-lock.json app/vite.config.js app/src/empty.js app/src/decode.js app/src/__tests__/decode.test.js
git commit -m "feat(app): decode.js wraps meshcore-decoder + channel keyStore"
```

---

## Task 3: `classifyReception` — map decoder output → capture model

**Files:**
- Modify: `app/src/meshpacket.js` (replace `classifyReception`; keep `bytesToHex`/`hexToBytes` utils)
- Test: `app/src/__tests__/classify.test.js`

**Interfaces:**
- Consumes: a decoder result object (Task 2) + a `channelNameFor` function.
- Produces: `classifyReception(decoded, channelNameFor = () => null)` →
  `{ packetType: string, hops: number, isDirect: boolean, sender: { kind, id, label }, channel: string|null, text: string|null }`.
  - `packetType` = `getPayloadTypeName(decoded.payloadType)`.
  - `hops` = `decoded.pathLength || 0`; `isDirect` = `hops === 0`.
  - Advert (`payloadType === 4`): `sender = { kind:'advert_pubkey', id: publicKey.toLowerCase(), label: appData.name || null }`.
  - GroupText (`payloadType === 5`): `channel = channelNameFor(channelHash)`; if `decrypted.sender` → `sender = { kind:'channel_name', id: decrypted.sender, label: decrypted.sender }`, `text = decrypted.message`.
  - else if `decoded.payload.decoded.sourceHash` → `sender = { kind:'direct_hash', id: sourceHash.toLowerCase(), label: sourceHash.toLowerCase() }`.
  - else `sender = { kind:null, id:null, label:null }`.

- [ ] **Step 1: Write the failing tests**

`app/src/__tests__/classify.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { classifyReception } from '../meshpacket.js'

const mk = (payloadType, decoded, pathLength = 0) => ({ payloadType, pathLength, payload: { decoded } })

describe('classifyReception', () => {
  it('advert → pubkey sender + name label', () => {
    const c = classifyReception(mk(4, { publicKey: 'AB'.repeat(32), appData: { name: 'Repeater-1' } }))
    expect(c.packetType).toBe('Advert')
    expect(c.isDirect).toBe(true)
    expect(c.sender).toEqual({ kind: 'advert_pubkey', id: 'ab'.repeat(32), label: 'Repeater-1' })
  })
  it('direct message → direct_hash sender from sourceHash', () => {
    const c = classifyReception(mk(1, { sourceHash: '4A' }))
    expect(c.packetType).toBe('Response')
    expect(c.sender).toEqual({ kind: 'direct_hash', id: '4a', label: '4a' })
  })
  it('group text decrypted → channel_name sender + text + channel', () => {
    const c = classifyReception(
      mk(5, { channelHash: '8b', decrypted: { sender: 'Spammer', message: 'buy now' } }),
      (h) => (h === '8b' ? 'public' : null),
    )
    expect(c.packetType).toBe('GroupText')
    expect(c.channel).toBe('public')
    expect(c.sender).toEqual({ kind: 'channel_name', id: 'Spammer', label: 'Spammer' })
    expect(c.text).toBe('buy now')
  })
  it('group text without key → no sender, no text', () => {
    const c = classifyReception(mk(5, { channelHash: 'ff' }))
    expect(c.sender).toEqual({ kind: null, id: null, label: null })
    expect(c.text).toBeNull()
  })
  it('hops from pathLength; relayed not direct', () => {
    const c = classifyReception(mk(1, { sourceHash: 'aa' }, 3))
    expect(c.hops).toBe(3); expect(c.isDirect).toBe(false)
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/classify.test.js`
Expected: FAIL (old `classifyReception` shape).

- [ ] **Step 3: Replace `classifyReception` in `meshpacket.js`**

Delete the existing `classifyReception` export (and the now-unused `parsePacket`, `deriveHeardKey`, `PACKET_TYPE`, route/payload constants — keep only `bytesToHex` and `hexToBytes`). Add:
```js
import { getPayloadTypeName } from './decode.js'

const PT_ADVERT = 4
const PT_GROUP_TEXT = 5

export function classifyReception(decoded, channelNameFor = () => null) {
  const pt = decoded.payloadType
  const hops = decoded.pathLength || 0
  const d = (decoded.payload && decoded.payload.decoded) || {}
  let sender = { kind: null, id: null, label: null }
  let channel = null
  let text = null

  if (pt === PT_ADVERT && d.publicKey) {
    sender = { kind: 'advert_pubkey', id: d.publicKey.toLowerCase(), label: (d.appData && d.appData.name) || null }
  } else if (pt === PT_GROUP_TEXT) {
    channel = channelNameFor(d.channelHash)
    if (d.decrypted && d.decrypted.sender) {
      sender = { kind: 'channel_name', id: d.decrypted.sender, label: d.decrypted.sender }
      text = d.decrypted.message || null
    }
  } else if (d.sourceHash) {
    const id = String(d.sourceHash).toLowerCase()
    sender = { kind: 'direct_hash', id, label: id }
  }

  return { packetType: getPayloadTypeName(pt), hops, isDirect: hops === 0, sender, channel, text }
}
```
> Keep `bytesToHex`/`hexToBytes` in `meshpacket.js` (other modules import `bytesToHex`). Remove all other parsing code.

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/classify.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**
```bash
git add app/src/meshpacket.js app/src/__tests__/classify.test.js
git commit -m "feat(app): classifyReception maps decoder output to sender model"
```

---

## Task 4: capture record + MQTT payload (new sender fields)

**Files:**
- Modify: `app/src/capture.js` (`buildRecord` new fields; `shouldCapture` unchanged)
- Modify: `app/src/publisher.js` (`buildPayload` new fields)
- Test: `app/src/__tests__/capture.test.js` (update), `app/src/__tests__/publisher.test.js` (update)

**Interfaces:**
- Consumes: `classifyReception` result (Task 3).
- Produces:
  - `buildRecord(frame, cls, gps, nowIso)` → `{ rx_at, raw, snr, rssi, lat, lon, acc_m, sender_kind, sender_id, sender_label, channel_name, is_direct, hops, packet_type }`. **No `text`.**
  - `Publisher.buildPayload(rxPubkey, rec, name)` → adds `sender_kind, sender_id, sender_label, channel_name`; removes `sender_key, sender_keylen, sender_role`.

- [ ] **Step 1: Update capture test**

Replace `app/src/__tests__/capture.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { buildRecord } from '../capture.js'

describe('buildRecord', () => {
  it('flattens frame + classification + gps; no decrypted text', () => {
    const frame = { snr: -3.5, rssi: -92, raw: new Uint8Array([0xde, 0xad]) }
    const cls = { packetType: 'GroupText', hops: 0, isDirect: true,
      sender: { kind: 'channel_name', id: 'Spammer', label: 'Spammer' }, channel: 'public', text: 'buy now' }
    const rec = buildRecord(frame, cls, { lat: 51, lon: 4, acc_m: 8 }, '2026-06-29T10:00:00Z')
    expect(rec).toEqual({
      rx_at: '2026-06-29T10:00:00Z', raw: 'dead', snr: -3.5, rssi: -92, lat: 51, lon: 4, acc_m: 8,
      sender_kind: 'channel_name', sender_id: 'Spammer', sender_label: 'Spammer', channel_name: 'public',
      is_direct: true, hops: 0, packet_type: 'GroupText',
    })
    expect('text' in rec).toBe(false)
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/capture.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `capture.js`**

Replace the body of `app/src/capture.js`:
```js
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
```

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/capture.test.js`
Expected: PASS.

- [ ] **Step 5: Update publisher test + implementation**

Replace `app/src/__tests__/publisher.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { Publisher } from '../publisher.js'

describe('Publisher.buildPayload', () => {
  it('includes new sender fields, drops legacy ones', () => {
    const rec = { rx_at: 't', raw: 'dead', snr: -3.5, rssi: -92, lat: 51, lon: 4, acc_m: 8,
      sender_kind: 'direct_hash', sender_id: '4a', sender_label: '4a', channel_name: null,
      is_direct: true, hops: 0, packet_type: 'Response' }
    const p = Publisher.buildPayload('aabb', rec, 'hunter-1')
    expect(p).toMatchObject({
      origin_id: 'aabb', origin: 'hunter-1', timestamp: 't', type: 'PACKET', direction: 'rx',
      raw: 'dead', SNR: -3.5, RSSI: -92, is_direct: true, hops: 0, packet_type: 'Response',
      sender_kind: 'direct_hash', sender_id: '4a', sender_label: '4a', channel_name: null,
      gps: { lat: 51, lon: 4, acc_m: 8 },
    })
    expect('sender_key' in p).toBe(false)
    expect('text' in p).toBe(false)
  })
})
```
Run (fail), then in `app/src/publisher.js` replace the `buildPayload` return object's `sender_key/sender_keylen/sender_role` lines with:
```js
      sender_kind: rec.sender_kind,
      sender_id: rec.sender_id,
      sender_label: rec.sender_label,
      channel_name: rec.channel_name,
```
Run: `cd app && npx vitest run src/__tests__/publisher.test.js` → PASS.

- [ ] **Step 6: Commit**
```bash
git add app/src/capture.js app/src/publisher.js app/src/__tests__/capture.test.js app/src/__tests__/publisher.test.js
git commit -m "feat(app): record + payload carry sender_kind/id/label + channel_name"
```

---

## Task 5: filters — isolate/ignore on `sender_id`

**Files:**
- Modify: `app/src/filters.js`
- Test: `app/src/__tests__/filters.test.js` (update)

**Interfaces:**
- Produces: `makeFilter({ sender, types, windowMs, directOnly, ignore })` → `(rec, nowMs) => boolean`.
  - `sender` = `{ id }` → keep only when `rec.sender_id` equals it (case-insensitive). Records with `sender_id == null` never match a sender filter.
  - `ignore` = a `Set` of lowercased `sender_id`s → drop matches.
  - `types` = `Set<string>` of `packet_type`; `windowMs`; `directOnly` unchanged.

- [ ] **Step 1: Update the test**

Replace `app/src/__tests__/filters.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { makeFilter } from '../filters.js'

const rec = (o) => ({ sender_id: '4a', packet_type: 'Response', is_direct: true,
  rx_at: '2026-06-29T10:00:00Z', ...o })
const now = Date.parse('2026-06-29T10:05:00Z')

describe('makeFilter', () => {
  it('isolates a sender by exact id (case-insensitive)', () => {
    const f = makeFilter({ sender: { id: '4A' }, types: null, windowMs: null, directOnly: false, ignore: null })
    expect(f(rec(), now)).toBe(true)
    expect(f(rec({ sender_id: 'bb' }), now)).toBe(false)
    expect(f(rec({ sender_id: null }), now)).toBe(false)
  })
  it('ignores listed sender ids', () => {
    const f = makeFilter({ sender: null, types: null, windowMs: null, directOnly: false, ignore: new Set(['4a']) })
    expect(f(rec(), now)).toBe(false)
    expect(f(rec({ sender_id: 'cc' }), now)).toBe(true)
  })
  it('directOnly drops relayed; window drops stale; types filter', () => {
    expect(makeFilter({ sender: null, types: null, windowMs: null, directOnly: true, ignore: null })(rec({ is_direct: false }), now)).toBe(false)
    expect(makeFilter({ sender: null, types: null, windowMs: 600000, directOnly: false, ignore: null })(rec({ rx_at: '2026-06-29T09:50:00Z' }), now)).toBe(false)
    expect(makeFilter({ sender: null, types: new Set(['Advert']), windowMs: null, directOnly: false, ignore: null })(rec({ packet_type: 'Response' }), now)).toBe(false)
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/filters.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement `filters.js`**

Replace `app/src/filters.js`:
```js
export function makeFilter(opts) {
  const { sender, types, windowMs, directOnly, ignore } = opts
  const wantId = sender && sender.id != null ? String(sender.id).toLowerCase() : null
  return (rec, nowMs) => {
    if (directOnly && !rec.is_direct) return false
    const id = rec.sender_id != null ? String(rec.sender_id).toLowerCase() : null
    if (wantId && id !== wantId) return false
    if (types && !types.has(rec.packet_type)) return false
    if (windowMs != null) {
      const age = nowMs - Date.parse(rec.rx_at)
      if (!(age <= windowMs)) return false
    }
    if (ignore && id != null && ignore.has(id)) return false
    return true
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/filters.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add app/src/filters.js app/src/__tests__/filters.test.js
git commit -m "feat(app): filter isolate/ignore on sender_id (exact, case-insensitive)"
```

---

## Task 6: orchestrator rewire + popup (glue — build + manual verify)

**Files:**
- Modify: `app/src/app.js` (frame→decode→classify→record pipeline; init decoder; pass `text` to popup; update sender filter/ignore shape)
- Modify: `app/src/huntmap.js` (popup shows sender by kind + decrypted text locally; Isolate/Ignore use `sender_id`)

**Interfaces:**
- Consumes: `decode.initDecoder/decodePacket/channelNameFor` (Task 2), `classifyReception` (Task 3), `buildRecord/shouldCapture` (Task 4), `makeFilter` (Task 5).

> `app.js` and `huntmap.js` are DOM/BLE glue — verified by `npm run build` + field test, not unit tests (see AGENTS.md).

- [ ] **Step 1: Rewire the capture pipeline in `app.js`**

At startup, after config loads, initialise the decoder:
```js
import { initDecoder, decodePacket, channelNameFor, bytesToHex } from './decode.js'
import { classifyReception } from './meshpacket.js'
import { buildRecord, shouldCapture } from './capture.js'
// ...after const cfg = await loadConfig():
initDecoder(cfg.channelKeys)
```
Replace the existing `processFrame` body (the old `parseFrame`→`parsePacket`→`classifyReception`→`buildRecord` chain) with:
```js
async function processFrame(dv) {
  const frame = parseFrame(dv)
  if (!frame || frame.code !== 0x88) return
  let decoded
  try { decoded = decodePacket(bytesToHex(frame.raw)) } catch (e) { return }
  if (!decoded || !decoded.isValid) return
  const cls = classifyReception(decoded, channelNameFor)
  // TEMP debug (bench) — remove after testing
  console.log(`[rx] hops=${cls.hops} direct=${cls.isDirect} snr=${frame.snr} rssi=${frame.rssi} type=${cls.packetType} sender=${cls.sender.id} captured=${shouldCapture(cls)}`)
  if (!shouldCapture(cls)) return
  const fix = state.gps.latest()
  if (!fix) { console.log('[rx] dropped: no GPS fix'); return }
  const rec = buildRecord(frame, cls, fix, new Date().toISOString())
  rec._text = cls.text // local-only, for the popup; stripped before publish
  await state.queue.add(rec)
}
```
> Ensure `rec._text` is **not** published: in the drain/publish path, `Publisher.buildPayload` already only copies known fields, so `_text` is naturally dropped. Do not add `_text` to `buildPayload`.

- [ ] **Step 2: Update sender-isolation + ignore wiring in `app.js`**

Where the `hunt:isolate-sender` event sets the filter, store `{ id }`:
```js
document.addEventListener('hunt:isolate-sender', (e) => { state.filter.sender = { id: e.detail.id } })
document.addEventListener('hunt:ignore-sender', (e) => { state.ignore.add(String(e.detail.id).toLowerCase()); })
```
and pass `ignore: state.ignore` into `makeFilter(...)` alongside the existing filter opts.

- [ ] **Step 3: Update the popup in `huntmap.js`**

In the marker popup builder, render the sender by kind and show decrypted text when present. Replace the sender/role lines with:
```js
const senderLine = r.sender_id
  ? `${r.sender_kind === 'channel_name' ? 'name' : r.sender_kind === 'advert_pubkey' ? 'node' : 'src'} ${esc(r.sender_label || r.sender_id)}`
  : 'sender — (none)'
const chanLine = r.channel_name ? `<br>channel ${esc(r.channel_name)}` : ''
const textLine = r._text ? `<br>“${esc(r._text)}”` : ''
```
and include `senderLine + chanLine + textLine` in the popup HTML. Wire the two buttons:
```js
`<button class="ch-isolate" ${r.sender_id ? '' : 'disabled'}>Isolate sender</button>`
`<button class="ch-ignore" ${r.sender_id ? '' : 'disabled'}>Ignore this ID</button>`
```
firing `hunt:isolate-sender` / `hunt:ignore-sender` with `detail: { id: r.sender_id }`.
> The map render must pass each record's `_text`, `sender_*`, and `channel_name` through to the popup (they already live on the record objects read from the store/queue snapshot).

- [ ] **Step 4: Build + manual verify**

Run: `cd app && npm run build`
Expected: build succeeds.
Manual (dev): `npm run dev`, connect companion; a direct message shows `src <hash>`, an advert shows `node <name/pubkey>`, a public-channel message shows `name <sender>` + the decrypted text; Isolate/Ignore enable and filter the map.

- [ ] **Step 5: Commit**
```bash
git add app/src/app.js app/src/huntmap.js
git commit -m "feat(app): rewire capture to decoder; popup shows sender + decrypted text"
```

---

## Task 7: backend — additive sender columns + payload mapping

**Files:**
- Modify: `server/internal/store/store.go` (schema columns + idempotent migration + Insert)
- Modify: `server/internal/store/reception.go` (struct + payload fields + ParsePayload)
- Test: `server/internal/store/reception_test.go` (extend)

**Interfaces:**
- Produces: `store.Reception` gains `SenderKind, SenderID, SenderLabel, ChannelName string`. `ParsePayload` maps payload `sender_kind, sender_id, sender_label, channel_name`. New nullable columns on `hunter_receptions`; migration is idempotent on the deployed DB.

- [ ] **Step 1: Write the failing test**

Append to `server/internal/store/reception_test.go`:
```go
func TestParsePayloadSenderFields(t *testing.T) {
	body := []byte(`{"origin_id":"aa","timestamp":"t","raw":"00","is_direct":true,"hops":0,
	  "sender_kind":"channel_name","sender_id":"Spammer","sender_label":"Spammer","channel_name":"public",
	  "packet_type":"GroupText","gps":{"lat":1,"lon":2}}`)
	r, err := ParsePayload("t", body, "now")
	if err != nil { t.Fatalf("ParsePayload: %v", err) }
	if r.SenderKind != "channel_name" || r.SenderID != "Spammer" || r.SenderLabel != "Spammer" || r.ChannelName != "public" {
		t.Fatalf("sender fields: %+v", r)
	}
}

func TestInsertSenderFieldsRoundTrip(t *testing.T) {
	st, _ := Open(":memory:"); defer st.Close()
	r, _ := ParsePayload("t", []byte(`{"origin_id":"aa","timestamp":"t","raw":"00","is_direct":true,"hops":0,"sender_kind":"direct_hash","sender_id":"4a","sender_label":"4a","packet_type":"Response","gps":{"lat":1,"lon":2}}`), "now")
	if err := st.Insert(r); err != nil { t.Fatalf("Insert: %v", err) }
	var kind, id string
	if err := st.db.QueryRow(`SELECT sender_kind, sender_id FROM hunter_receptions ORDER BY id DESC LIMIT 1`).Scan(&kind, &id); err != nil { t.Fatalf("scan: %v", err) }
	if kind != "direct_hash" || id != "4a" { t.Fatalf("got %q %q", kind, id) }
}
```

- [ ] **Step 2: Run, verify fail**

Run: `cd server && go test ./internal/store/`
Expected: FAIL (unknown fields / no such column).

- [ ] **Step 3: Add columns + idempotent migration in `store.go`**

In the `schema` const, add the four columns to the `CREATE TABLE` body (for fresh DBs):
```
  sender_kind   TEXT,
  sender_id     TEXT,
  sender_label  TEXT,
  channel_name  TEXT,
```
In `Open`, after `db.Exec(schema)`, run the idempotent migration for already-deployed DBs:
```go
	for _, col := range []string{"sender_kind", "sender_id", "sender_label", "channel_name"} {
		if _, err := db.Exec("ALTER TABLE hunter_receptions ADD COLUMN " + col + " TEXT"); err != nil &&
			!strings.Contains(err.Error(), "duplicate column name") {
			return nil, err
		}
	}
```
(add `"strings"` to imports). Extend the `INSERT` in `Insert` to include the four columns + four `?` placeholders + `r.SenderKind, r.SenderID, r.SenderLabel, r.ChannelName` args.

- [ ] **Step 4: Add struct + payload fields in `reception.go`**

Add to `Reception`: `SenderKind, SenderID, SenderLabel, ChannelName string`. Add to the `payload` struct: `` SenderKind string `json:"sender_kind"` `` etc. (4 fields). Map them in `ParsePayload`'s returned `Reception`.

- [ ] **Step 5: Run, verify pass**

Run: `cd server && go test ./internal/store/ && go build ./... && go vet ./...`
Expected: PASS, build+vet clean.

- [ ] **Step 6: Commit**
```bash
git add server/internal/store/store.go server/internal/store/reception.go server/internal/store/reception_test.go
git commit -m "feat(server): additive sender_kind/id/label + channel_name columns"
```

---

## Task 8: deploy the iteration-3 build

**Files:** none (operational).

- [ ] **Step 1: Rebuild + restart containers on meshcore-oracle**

The deployed config (`~/core-hunter-cfg/app-config.json`) needs `channelKeys` added. Append it (it is client-served, 644):
```bash
# add "channelKeys": { "public": "8b3387e9c5cdea6ac9e5edbaa115cd72" } to app-config.json
```
Then on oracle:
```bash
cd ~/core-hunter && git pull
docker build -t core-hunter-app app && docker rm -f core-hunter-app && \
  docker run -d --name core-hunter-app --restart unless-stopped -p 3002:80 \
  -v $HOME/core-hunter-cfg/app-config.json:/usr/share/nginx/html/config.json:ro core-hunter-app
docker build -t core-hunter-ingestor server && docker rm -f core-hunter-ingestor && \
  docker run -d --name core-hunter-ingestor --restart unless-stopped -p 8090:8090 \
  -v $HOME/core-hunter-cfg/ingestor-config.json:/app/config.json:ro -v $HOME/core-hunter-data:/app/data core-hunter-ingestor
```

- [ ] **Step 2: Verify end-to-end**

`curl localhost:8090/healthz` → ok. Open https://hunter.on8ar.eu, confirm a fresh build, and (field) confirm a public-channel message shows the decrypted sender name + Isolate/Ignore work, and the new `sender_kind/id/label/channel_name` columns populate (query via `sudo python3` sqlite).

---

## Verification (end-to-end)

1. `cd app && npm run test` → config/decode/classify/capture/publisher/filters suites PASS.
2. `cd app && npm run build` → bundles with the decoder, no `chalk`/`commander` errors.
3. `cd server && go test ./...` → store migration + payload tests PASS.
4. Field: public-channel message → decrypted sender name in popup + map filter by it; direct message → `direct_hash`; advert → pubkey/name; rows carry the new columns.

## Self-review notes (spec coverage)

- Decoder as parser → Tasks 2,3,6. Sender model (advert/direct/channel) → Task 3. channelKeys config like CoreScope → Tasks 1,8. Decrypted text local-only → Tasks 4 (excluded from record/payload), 6 (`_text` to popup, never published). is_direct=pathLength===0 → Task 3. Backend additive no-purge + idempotent migration on deployed DB → Task 7. Tests with real captured fixtures → Task 2 (real direct raw) + Task 3 (decoder-shaped fixtures). Vite chalk/commander exclusion → Task 2. Deploy → Task 8.
