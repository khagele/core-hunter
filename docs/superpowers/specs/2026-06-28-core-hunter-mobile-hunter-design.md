# core-hunter — Iteratie 1 ontwerp: mobiele hunter + backend-ingestor

> Status: **goedgekeurd** (2026-06-28). Brainstorm-beslissingen: zie
> [`docs/2026-06-28-iteration-1-decisions.md`](../../2026-06-28-iteration-1-decisions.md).

## Doel

Een mobiele **node-hunting / direction-finding** tool om in het veld (rijdend/lopend) een *spammer*
node te lokaliseren. Verbeterde opvolger van `hunter.bouwens.co`. Iteratie 1 levert de **mobiele
hunter** die vanaf dag 1 naar een **backend** publiceert; bundeling van meerdere hunters in een
website volgt in een latere iteratie.

Kernprincipe (altijd vermelden in output): we meten **radio (SNR/RSSI) via mesh-topologie**, niet
GPS-tracking van het doel. We leiden *positie* af, geen transportmodus. DB is UTC; gebruiker rapporteert
lokaal CEST (UTC+2).

## Scope iteratie 1

In scope:
- Mobiele hunter PWA: BLE companion → capture → live kaart → MQTT-publish + lokale persistentie.
- Eigen Go-ingestor + eigen SQLite-DB (geen purge) die alle hunter-receptions bewaart.

Bewust *niet* in iteratie 1 (latere iteraties):
- Website die alle hunters bundelt + server-side filteren/pollen.
- Vrije packet-byte-queries, multi-sender-selectie, query-API op de backend.

## Architectuur

```
[companion radio] --BLE--> [hunter PWA] --MQTT(WSS)--> [EMQX broker]
                                  |                          |
                          IndexedDB (lokaal)       meshcore/hunter/{rxPubkey}/packets
                          live kaart (eigen data)            |
                                                     [core-hunter ingestor (Go)]
                                                             |
                                                     [SQLite, geen purge]
                                                             |
                                            (website multi-hunter — latere iteratie)
```

Eén private GitHub-repo `core-hunter` bevat alles: `app/` (PWA), `server/` (Go ingestor), `docs/`,
alle MD's, `AGENTS.md`.

## Component 1 — Mobiele hunter (PWA)

**Stack:** Vite ES-module PWA, Web Bluetooth + phone Geolocation, `mqtt` 5.x over WSS, IndexedDB
(`core-hunter` / store `receptions`). Leaflet kaart fullscreen (niet de CoreDrive mini-map).

**Capture-pijplijn:**
```
BLE 0x88 → frames.parse {snr(÷4.0), rssi, raw} → meshpacket.parse
  → capture-classificatie:
      zero-hop (FLOOD path-len 0 / advert / discover)  → is_direct=true
      1-byte prefix                                      → is_direct=true  (NIEUW t.o.v. CoreDrive RX)
      gerelayd (hops>0 / DIRECT-route)                   → is_direct=false
  → tag GPS (phone) → queue.add (IndexedDB) → publish naar MQTT-topic
```

**Direct-only ↔ show-all toggle:**
- De toggle bepaalt **de weergave** op de kaart (default: alleen `is_direct=true`; show-all toont ook
  gerelayd).
- Naar **MQTT publiceren we alles** wat de companion hoort, zodat de backend maximale data krijgt voor
  latere analyse. (De toggle filtert lokaal, niet de upstream.)
- Belangrijk verschil met CoreDrive RX: 1-byte-prefixen worden **niet** weggegooid — ze tellen als
  `is_direct=true` en worden geplot en gepubliceerd.

**Kaart (Leaflet, fullscreen):** twee toggle-bare lagen —
- *Punten:* losse ontvangsten gekleurd op SNR/RSSI; klik → packet-details + knop "isoleer deze sender".
- *Hex-heat:* beste signaal per cel (gradient om naartoe te rijden), CoreScope-kleur/opacity-tiers.

**Filters (iteratie 1):**
- Sender — isoleer op full pubkey of 1-byte prefix (via punt-klik), toggle aan/uit.
- Packet-type — advert / channel-msg / overig (uit `meshpacket.js`).
- Tijdvenster — toon laatste N min (default 10), zodat oude punten vervagen tijdens het rijden.
- Direct-only ↔ show-all.

**Resilience:** de kaart wordt **altijd herbouwd uit IndexedDB**, nooit uit vluchtig geheugen. BLE- of
MQTT-drop laat de kaart staan; de offline-queue draint naar MQTT bij reconnect. Lost het grootste
pijnpunt van het origineel op ("verbinding valt weg → kaart leeg").

**Hergebruik uit `corescope-rx` (kopiëren in deze repo, daarna aanpassen):**
`transport.js`, `frames.js`, `meshpacket.js` (capture-regel: 1-byte toelaten), `gps.js`, `queue.js`
(nieuwe DB-naam/store), `publisher.js` (nieuw topic + payload), `monitor.js`, `motion.js`,
`hexgrid.js`, `localmap.js` → fullscreen kaart, `names.js`, `recent.js`, `selfinfo.js`, `config.js`,
`wakelock*.js`.

## Component 2 — Backend-ingestor + DB

**Stack:** Go. Subscribe op `meshcore/hunter/+/packets` via EMQX; schrijf elke reception in **SQLite,
geen purge**. Eigen Docker-container op deploy-host, volledig los van CoreScope.

Iteratie 1: alleen **ingest + opslag** + een `/healthz`-endpoint. Geen query-API (komt met de website).
Leent het pure hex-binning-patroon van CoreScope (`hexgrid.go`) waar nuttig, maar dat is pas relevant
voor de latere query/website-laag.

## Datamodel — `hunter_receptions` (alles bewaren, geen purge)

| kolom | type | omschrijving |
|---|---|---|
| `id` | INTEGER PK | autoincrement |
| `hunter_pubkey` | TEXT | rx companion pubkey (= `{rxPubkey}` in topic) |
| `hunter_name` | TEXT | companion-naam |
| `rx_at` | TEXT (RFC3339) | ontvangsttijd op de telefoon |
| `ingested_at` | TEXT (RFC3339) | tijd van wegschrijven door ingestor |
| `snr` | REAL | SNR (÷4.0 al toegepast) |
| `rssi` | INTEGER | RSSI |
| `raw` | TEXT (hex) | **volledig** ruw pakket — nooit weggooien, voor latere her-parsing |
| `packet_type` | TEXT | advert / channel-msg / discover / overig |
| `sender_key` | TEXT | afgeleide sender (pubkey of prefix) |
| `sender_keylen` | INTEGER | 1 / 2 / 3 / 32 (prefix-lengte) |
| `is_direct` | INTEGER (0/1) | zero-hop of 1-byte = 1; gerelayd = 0 |
| `hops` | INTEGER | hop-count indien bekend |
| `lat` | REAL | phone GPS |
| `lon` | REAL | phone GPS |
| `pos_acc_m` | REAL | GPS-nauwkeurigheid (m) |
| `mqtt_topic` | TEXT | volledig topic waarop ontvangen |

Niets wordt weggegooid; `raw` blijft altijd staan zodat we achteraf extra analyses kunnen draaien.

## MQTT-contract

- Topic: `meshcore/hunter/{rxPubkey}/packets`, QoS1.
- Payload (JSON): `{ origin_id:rxPubkey, origin:companionName, timestamp:rx_at(RFC3339),
  type:"PACKET", direction:"rx", raw, SNR, RSSI, is_direct, sender_key, sender_keylen, hops,
  packet_type, gps:{lat,lon,acc_m} }`.

## Testing

- **Unit-tests** voor pure helpers:
  - PWA (Vitest): capture-classificatie incl. 1-byte, `snrToPct`, hex-binning, payload-builder,
    filter-predicaten (sender/type/tijdvenster).
  - Backend (Go test): payload-parsing → row-mapping, idempotentie/insert.
- UI / BLE / MQTT end-to-end: handmatig in het veld (niet automatiseerbaar).

## Open punten / latere iteraties

- Website die alle hunters bundelt: server-side filteren/pollen, multi-hunter merge, gedeelde live
  kaart, sender-rotatie-correlatie over hunters heen.
- Query-API op de backend (`/api/...`) + hex-coverage GeoJSON per hunter / globaal.
- Hosting/deploy-details ingestor-container (env, volume, restart-policy) — uitwerken bij implementatie.
