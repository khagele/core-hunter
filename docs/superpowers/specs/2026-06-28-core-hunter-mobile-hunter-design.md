# core-hunter — Iteratie 1 ontwerp: mobiele hunter + backend-ingestor

> Status: **goedgekeurd** (2026-06-28). Brainstorm-beslissingen: zie
> [`docs/2026-06-28-iteration-1-decisions.md`](../../2026-06-28-iteration-1-decisions.md).

## Doel

Een mobiele **node-hunting / direction-finding** tool om in het veld (rijdend/lopend) een **doel-node
van elk roltype** (companion, repeater, sensor, room-server, …) te lokaliseren. Een
public-channel-flooder is het motiverende voorbeeld, maar het doel kan elk zendend type zijn — de
methode is rol-agnostisch op RF-niveau. Verbeterde opvolger van `hunter.bouwens.co`. Iteratie 1 levert
de **mobiele hunter** die vanaf dag 1 naar een **backend** publiceert; bundeling van meerdere hunters
in een website volgt in een latere iteratie.

Kernprincipe (altijd vermelden in output): we meten **radio (SNR/RSSI) via mesh-topologie**, niet
GPS-tracking van het doel. We leiden *positie* af, geen transportmodus. DB is UTC; gebruiker rapporteert
lokaal CEST (UTC+2).

## Peilmethode — minder hops eerst, dan sterkste 0-hop signaal

De rol van het doel verandert de RF-receptie en de DF-analyse **niet**: SNR/RSSI wordt op het ontvangen
pakket gemeten, ongeacht of de zender een companion, repeater, sensor of room-server is, en alle nodes
op dezelfde channel delen dezelfde LoRa-parameters → signaalwaardes zijn onderling vergelijkbaar. Wat
per roltype verschilt is (a) welke pakkettypes/hoe vaak je het doel hoort en (b) hoe je de bron
identificeert.

Belangrijk: **niet elk doel adverteert.** Een companion stuurt geen adverts, dus je kunt 'm niet via
een 0-hop advert (volledige pubkey) vinden — je pakt 'm op zijn verkeer, vaak alleen identificeerbaar
via een roterende of 1-byte sender-prefix.

Daarom is **hop-count de primaire peilgradient**, niet alleen het signaal:
1. **Grof:** rijd rond met alle hops zichtbaar, vind waar het verkeer van het doel opduikt en op welke
   hop-counts; identificeer de sender-prefix (ook als die roteert).
2. **Inpeilen:** manoeuvreer tot de hop-count daalt — minder hops = dichter bij een directe RF-link.
3. **Eindfase:** zodra je de bron **0-hop** (`hops==0`) hoort, rijd binnen die 0-hop-ontvangsten naar de
   sterkste SNR/RSSI tot je op de fysieke locatie staat.

Dit stuurt de visualisatie: 0-hop wordt uitgelicht, gerelayde ontvangsten vervagen, en je kunt op
max-hops filteren.

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
  → twee onafhankelijke assen afleiden:
      hops          → is_direct = (hops == 0)          (peilgradient; 0-hop = DF-doel)
      sender_keylen → 1 / 2 / 3 / 32                   (identificatie; 1-byte BEWAARD, anders dan CoreDrive RX)
      sender_role   → uit advert indien aanwezig, anders leeg (opportunistisch)
  → tag GPS (phone) → queue.add (IndexedDB) → publish naar MQTT-topic
```

**Direct-only ↔ show-all toggle (hop-as):**
- De toggle bepaalt **de weergave** op de kaart: default toont alleen `is_direct=true` (0-hop); show-all
  toont alle hops. Visueel: 0-hop uitgelicht, gerelayd vervaagd; optioneel filter op max-hops.
- **1-byte staat los van de toggle:** 1-byte-prefixen worden nooit weggegooid (verschil met CoreDrive
  RX) — ze worden geplot en gepubliceerd ongeacht hop-filter, want een niet-adverterende companion is
  vaak alleen via zo'n prefix te herkennen.
- Naar **MQTT publiceren we alles** wat de companion hoort (alle hops, alle keylens), zodat de backend
  maximale data krijgt voor latere analyse. De toggle filtert alleen de lokale weergave, niet de
  upstream.

**Kaart (Leaflet, fullscreen):** twee toggle-bare lagen —
- *Punten:* losse ontvangsten gekleurd op SNR/RSSI; **0-hop uitgelicht, gerelayd vervaagd** (hop-count
  zichtbaar); klik → packet-details (incl. hops + sender_role) + knop "isoleer deze sender".
- *Hex-heat:* beste signaal per cel (gradient om naartoe te rijden), CoreScope-kleur/opacity-tiers.

**Filters (iteratie 1):**
- Sender — isoleer op full pubkey of 1-byte prefix (via punt-klik), toggle aan/uit.
- Packet-type — advert / channel-msg / overig (uit `meshpacket.js`).
- Tijdvenster — toon laatste N min (default 10), zodat oude punten vervagen tijdens het rijden.
- Hop-filter — direct-only (`hops==0`) ↔ show-all; optioneel max-hops-drempel. Primaire peil-as.

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
geen purge**. Eigen Docker-container op de deploy-host, volledig los van CoreScope.

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
| `sender_keylen` | INTEGER | 1 / 2 / 3 / 32 (prefix-lengte; identificatie-as, 1-byte bewaard) |
| `sender_role` | TEXT | roltype van de zender uit advert (repeater/companion/sensor/room/…); leeg indien niet geadverteerd |
| `is_direct` | INTEGER (0/1) | `hops==0` (echte zero-hop = peil-doel); gerelayd = 0 |
| `hops` | INTEGER | hop-count (primaire peilgradient) |
| `lat` | REAL | phone GPS |
| `lon` | REAL | phone GPS |
| `pos_acc_m` | REAL | GPS-nauwkeurigheid (m) |
| `mqtt_topic` | TEXT | volledig topic waarop ontvangen |

Niets wordt weggegooid; `raw` blijft altijd staan zodat we achteraf extra analyses kunnen draaien.

## MQTT-contract

- Topic: `meshcore/hunter/{rxPubkey}/packets`, QoS1.
- Payload (JSON): `{ origin_id:rxPubkey, origin:companionName, timestamp:rx_at(RFC3339),
  type:"PACKET", direction:"rx", raw, SNR, RSSI, is_direct, hops, sender_key, sender_keylen,
  sender_role, packet_type, gps:{lat,lon,acc_m} }`.

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
