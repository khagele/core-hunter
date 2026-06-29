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

## The capture rule — what makes this different from CoreDrive RX

- **1-byte sender prefixes are kept.** They are never dropped for "weak
  attribution." A one-byte key is treated as a short key (`sender_keylen = 1`),
  not discarded.
- **`is_direct = (hops === 0)`** — the flag is set only for zero-hop
  receptions; relayed traffic is always marked indirect regardless of signal
  strength.
- **Hop-count is the primary direction-finding gradient.** 0-hop means the
  radio heard the target's transmission with no relay in between; that is the
  strongest spatial signal.
- **Everything heard is published to MQTT** (`meshcore/hunter/{rxPubkey}/packets`,
  QoS 1). The direct-only / show-all toggle and the other filters in the UI
  affect only the **local map view** — they do not gate what is published.
  The backend receives all receptions and deduplicates.
- **Unattributed 0-hop packets are plotted.** A companion that never
  advertises can still be found via its traffic and its signal strength.

## Thermal map semantics

The colour ramp runs **cold (blue) → hot (red)** for **weak (far) →
strong (close)**.

- **0-hop (direct) points** are drawn with an accent ring to distinguish
  them from relayed observations.
- **Relayed points** are rendered faded/smaller.
- Two map layers are available: individual **signal points** (hop-aware
  colour + ring) and a **hex-heat** aggregate layer. Toggle between them
  with the layer button in the map controls.

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

Position is inferred from **radio measurements** (SNR, RSSI, hop-count) via
mesh topology, not from GPS tracking of the target node. The GPS coordinates
stored with each reception are the **hunter phone's own position** at the
moment of reception. The map shows where *you* were when you heard the
target, and how well — not where the target is.
