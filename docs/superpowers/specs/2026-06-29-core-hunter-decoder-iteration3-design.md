# core-hunter — Iteration 3 design: adopt the MeshCore decoder + sender identity

> Status: **approved** (2026-06-29). Supersedes the hand-rolled parser in iterations 1–2.
> Builds on the deployed stack (PWA at https://hunter.on8ar.eu, Go ingestor + SQLite).

## Problem

Field testing showed the hunter cannot identify a transmitter. The hand-rolled `meshpacket.js`:
- **mislabels packet types** — it lumps everything that isn't an advert/discover/trace into `channel-msg`. Real captures during testing were DIRECT `REQ`/`RESPONSE` messages (`payloadType` 0/1, `routeType` 2), wrongly stored as `channel-msg`.
- **surfaces no sender** for channel or direct traffic (only 0-hop adverts/discover get a pubkey, and none appeared), so the popup shows `sender — (0B)` and Isolate/Ignore are dead.

To hunt a public-channel spammer you must read the (rotating) sender from channel messages — which requires decrypting the channel. `@michaelhart/meshcore-decoder` does this correctly and its scheme matches the firmware (`BaseChatMesh.cpp`: channel hash = SHA256(secret), AES-128, 2-byte MAC).

## Goal

Replace the hand-rolled parsing with the decoder, producing accurate packet types and a best-available **sender identity per packet type**, including decrypted channel-message sender names. Surface it in the popup + Isolate/Ignore + backend. Capture stays zero-hop-focused for DF; storage stays no-purge.

## Decisions (locked)

1. **Adopt `@michaelhart/meshcore-decoder`** (TS/JS npm) as the PWA packet parser.
2. **Channel keys via config** as a `channelKeys` map (mirrors CoreScope), public channel preloaded.
3. **Sender identity per type:** advert→pubkey, direct→`sourceHash` (1B), channel→decrypted name.
4. **Channel text:** shown locally in the popup, **not stored** server-side (raw retained → re-derivable).
5. **`is_direct` stays `pathLength === 0`** (we heard the transmitter directly = the DF signal).

## Architecture & module map (`app/src/`)

```
BLE 0x88 ─▶ frames.parse {snr,rssi,raw}        (UNCHANGED)
            ─▶ decode.decodePacket(rawHex)      (NEW — wraps the decoder + keyStore)
            ─▶ classifyReception(decoded)        (REWRITTEN around decoder output)
            ─▶ capture.buildRecord                (sender fields added)
            ─▶ queue.add (IndexedDB) ─▶ publisher.publish (payload fields added)
   render: huntmap popup (sender by kind + decrypted text) / filters.makeFilter (isolate/ignore on sender.id)
```

- **`decode.js` (new):** `buildKeyStore(channelKeys)` once at startup; `decodePacket(rawHex) → decoded` (the decoder's result). Owns the dependency on `@michaelhart/meshcore-decoder`. Hex helpers come from the decoder (`hexToBytes`/`bytesToHex`).
- **`meshpacket.js`:** packet parsing removed/replaced. If any tiny util is still imported elsewhere, re-export from `decode.js` instead. Do not keep dead parsing code.
- **`classifyReception(decoded)` (rewritten):** maps decoder output → the capture model (below). Pure, unit-tested.
- **`capture.js`, `publisher.js`, `huntmap.js`, `filters.js`:** consume the new sender model.
- **Build:** Vite must exclude/alias the decoder's CLI-only deps (`chalk`, `commander`) so the browser bundle stays clean; AES comes from `crypto-js` (pure JS, browser-safe).

## Sender identity model

`classifyReception` returns:
```
{
  packetType,                 // accurate, from decoder payloadType: advert | req | response | txt | ack | grp_txt | grp_data | path | trace | ...
  hops,                       // decoder pathLength
  isDirect,                   // hops === 0
  channel,                    // channel display name when decrypted, else null
  text,                       // decrypted channel-message text (LOCAL ONLY — never persisted), else null
  sender: { kind, id, label } // see table
}
```

| packet type | `sender.kind` | `sender.id` | `sender.label` |
|---|---|---|---|
| advert | `advert_pubkey` | full pubkey (hex) | advert name/role; resolver-resolved name |
| direct (req/resp/txt/ack) | `direct_hash` | `sourceHash` (1-byte hex) | the hash prefix |
| channel (grp_txt) | `channel_name` | decrypted sender **name** (rotates) | the name |
| undecryptable / unknown | `null` | `null` | — |

- Isolate/Ignore operate on `sender.id`. `direct_hash` is 1-byte → collision-prone; surfaced but labelled as weak.
- A channel message whose key is not configured → `kind=null` (no `text`, no name) but still plotted by signal.

## Config (mirrors CoreScope `channelKeys`)

```json
{
  "mqttUrl": "...", "mqttUsername": "...", "mqttPassword": "...",
  "resolveUrl": "https://corsproxy.on8ar.eu/cs/api/nodes/resolve",
  "channelKeys": { "public": "8b3387e9c5cdea6ac9e5edbaa115cd72" }
}
```
- `channelKeys` is a `{ displayName: hexSecret }` map. The public channel (`8b3387e9c5cdea6ac9e5edbaa115cd72`, = base64 `izOH6cXN6mrJ5e26oRXNcg==`) is preloaded in `config.example.json` and the live config. Extra channels are added by appending entries.
- `config.js` normalizes `channelKeys` and `decode.js` builds the decoder keyStore from the hex secrets (the decoder derives channel hashes via SHA256).
- Back-compat: a missing `channelKeys` → only undecryptable channel messages (no crash).

## Backend (Go ingestor — additive, no purge)

Add nullable columns to `hunter_receptions`: `sender_kind TEXT`, `sender_id TEXT`, `sender_label TEXT`, `channel_name TEXT`. Existing columns (`sender_key`, `sender_keylen`, `sender_role`, …) stay for back-compat. `store.go` schema uses `CREATE TABLE IF NOT EXISTS` + idempotent `ALTER TABLE ADD COLUMN` guarded for existing DBs. `ParsePayload` maps the new payload fields; older payloads (missing them) default to empty. **No decrypted text column** — the message body is not persisted.

MQTT payload gains: `sender_kind`, `sender_id`, `sender_label`, `channel_name`. Existing fields unchanged.

## Testing

- **Pure unit tests (Vitest)** with **real captured raw packets as fixtures** (already have direct REQ/RESPONSE samples from the live DB):
  - `decode.decodePacket` returns the expected payload type / route type / pathLength / sourceHash for the fixtures.
  - `classifyReception` maps each kind correctly: advert→pubkey, direct→`direct_hash` + 1-byte id, grp_txt→`channel_name` + decrypted name + `text`.
  - A **channel-decrypt fixture**: a GRP_TXT packet + the public key → asserts the extracted sender name and text (capture a real public-channel GRP_TXT during testing for this fixture; if none is available at build time, use a firmware-encoded vector).
  - `makeFilter` isolates/ignores on `sender.id` across kinds.
- **Go:** `ParsePayload` round-trips the new fields; `ALTER TABLE` migration is idempotent on an existing DB.
- DOM/BLE/decrypt-in-browser verified by build + field test.

## Out of scope (YAGNI)

- Advert Ed25519 signature verification (the decoder can; not needed for hunting).
- Persisting decrypted message text.
- Private channels beyond the configured `channelKeys`.
- Hardware/firmware-gated `sender_role` decoding remains deferred (advert role only, opportunistic).

## Open follow-ups (later iterations)

- The analysis website + query/GeoJSON API (server-side ignore-list, per-hunter RSSI normalization).
- Remove the `// TEMP debug` logging in `app/src/app.js` once field testing is complete.
