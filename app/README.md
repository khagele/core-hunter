# core-hunter PWA — mobile hunter app

A progressive web app that scans a MeshCore mesh via BLE and plots every
directly-heard reception on a live thermal map so you can drive or walk
toward a target node.

## What it is

core-hunter is the mobile **hunter** side of the core-hunter system. The
phone pairs over BLE to a companion MeshCore radio, captures every packet
the radio hears (with SNR, RSSI, hop-count, and the phone's own GPS fix),
and renders them as a heat-map where **hot = strong = close**. Drive toward
the heat to home in on the target.

Receptions are stored locally in IndexedDB and published to an MQTT broker
so the server-side Go ingestor (`server/`) can aggregate observations from
multiple hunters in the field.

## Status & direction

**Built (iteration 1):** BLE scanner → capture → IndexedDB → live thermal map
(points + hex-heat) → MQTT drain. Unit-tested; pending field verification.

> **Iteration 2 (in review — [`../docs/2026-06-29-iteration-2-proposals.md`](../docs/2026-06-29-iteration-2-proposals.md)).**
> The design is narrowing to **zero-hop only**: only what the hunter hears
> *directly* tells you where a transmitter is, so relayed (>0-hop) traffic — and
> with it the 1-byte attribution axis — is dropped from logging, publishing, and
> the map. An **ignore-list** (mute known stations such as repeaters so they
> don't form false hotspots) and **multiple regional name resolvers** (e.g.
> BE/SF8, NL/SF7) are added. Sections below marked _(iter-1 — changing)_ describe
> current behaviour that iteration 2 revises.

## Build and run

```
npm install
```

**Dev server** (Vite — serves on `http://localhost:5173` by default):

```
npm run dev
```

Web Bluetooth and Geolocation both require a [secure context][secure]. The
dev server on `localhost` qualifies; any other host must be served over
HTTPS.

**Production build / preview:**

```
npm run build     # output in dist/
npm run preview   # serve the dist/ build locally
```

**Unit tests** (Vitest, no browser required):

```
npm run test
# or: npx vitest run
```

[secure]: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts

## Configuration

Copy the example config and fill in your broker details before running:

```
cp public/config.example.json public/config.json
```

`public/config.json` fields:

| Field | Required | Description |
|---|---|---|
| `mqttUrl` | yes | WSS URL of your EMQX broker, e.g. `wss://broker.example.com:8084/mqtt` |
| `mqttUsername` | yes | Publish-only EMQX account username |
| `mqttPassword` | yes | Publish-only EMQX account password |
| `resolveUrl` | no | CoreScope name-resolver endpoint — used to display human-readable node names |

`config.json` is gitignored; never commit credentials.

> _(iter-2 — in review.)_ The single `resolveUrl` becomes a `resolvers` array of
> multiple regional CoreScope endpoints, each with a label/spreading-factor, e.g.
> `{ "label": "BE", "sf": 8, "url": "…" }` and `{ "label": "NL", "sf": 7, "url": "…" }`.
> Resolvers are tried in order; the first unambiguous hit wins. `resolveUrl`
> stays supported as a single resolver. See the proposals doc.

## The capture rule

- **`is_direct = (hops === 0)`.** Only zero-hop receptions — where the radio
  heard the transmitter directly — point at where that transmitter actually is.
  A relayed packet's SNR/RSSI describes the *last repeater*, not the target.
- **Unattributed 0-hop packets are plotted.** A companion that never advertises
  has no pubkey on its data packets (`sender_key = null`); it is still plotted by
  signal, which is exactly how you find it.
- **Published to MQTT** on `meshcore/hunter/{rxPubkey}/packets` (QoS 1). UI
  filters affect only the **local map view**, not what is published; the backend
  deduplicates.

> _(iter-1 — changing.)_ The shipped code currently **also keeps relayed
> (>0-hop) receptions and 1-byte sender prefixes** (`sender_keylen = 1`) and
> publishes them too, treating hop-count as a gradient. **Iteration 2 removes
> this:** only zero-hop is logged, published, and plotted, and the 1-byte
> attribution axis is dropped (zero-hop senders are either a full advert pubkey
> or `null`). See the proposals doc.

## Thermal map semantics

The colour ramp runs **cold (blue) → hot (red)** for **weak (far) →
strong (close)**.

- **0-hop (direct) points** are drawn with an accent ring.
- **Relayed points** are currently rendered faded/smaller _(iter-1 — removed in
  iteration 2: relayed traffic is no longer plotted at all)_.
- Two map layers are available: individual **signal points** (tier colour +
  ring) and a **hex-heat** aggregate layer. Toggle between them with the layer
  button in the map controls.

## Resilience

Receptions are written to IndexedDB before any MQTT publish attempt. The map
renders from that local store on every tick. If BLE drops, MQTT drops, or
the browser is closed and reopened, the map reloads from the stored data.

The MQTT drain loop publishes rows to the broker but **never deletes local
rows**. The local IndexedDB is the working set; the backend deduplicates by
`(origin_id, rx_at, sender_key)`.

## sender_role

`sender_role` is plumbed end-to-end through the capture record, the MQTT
payload, and the ingestor schema, but it is always `null` in iteration 1.
Advert-role decoding is deferred until the byte layout can be confirmed from
MeshCore firmware source. The field will never contain a guessed value.

## Position disclaimer

Position is inferred from **radio measurements** (SNR, RSSI) via
mesh topology, not from GPS tracking of the target node. The GPS coordinates
stored with each reception are the **hunter phone's own position** at the
moment of reception. The map shows where *you* were when you heard the
target, and how well — not where the target is.
