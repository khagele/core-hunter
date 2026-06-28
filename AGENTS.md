# AGENTS.md — core-hunter contributiegids

> Voor menselijke en AI-contributors. Lees dit vóór je een PR opent. Project-specifieke regels staan
> hier; de gedetailleerde architectuur staat in `CLAUDE.md` en `docs/`.

## Wat is core-hunter

Een MeshCore **node-hunting / direction-finding** tool: een mobiele **hunter** (RX-scanner + live
kaart) waarmee je rijdend/lopend een *spammer* node lokaliseert op basis van radiosignaal (SNR/RSSI)
via mesh-topologie. Verbeterde opvolger van `hunter.bouwens.co`. Twee hergebruikte bases: de
**CoreDrive RX**-scanner en de **CoreScope** kaart/visualisatie-backend.

**Belangrijk principe:** we meten radio via mesh-topologie / RX-coverage, **niet** GPS-tracking van het
doel. We leiden *positie* af, geen transportmodus. Vermeld dit in elke output die positie suggereert.

## Repo-indeling

```
app/      mobiele hunter PWA (Vite ES-module, Web Bluetooth, mqtt 5.x, IndexedDB, Leaflet)
server/   Go MQTT-ingestor + SQLite (geen purge)
docs/     ontwerp-specs en beslissingen-logs
*.md      project- en bijdrage-documentatie
```

## Iteratie-status

Iteratie 1 = **mobiele hunter + backend-ingestor**. De website die alle hunters bundelt en server-side
filtering/polling biedt is een **latere** iteratie. Zie
`docs/superpowers/specs/2026-06-28-core-hunter-mobile-hunter-design.md` en
`docs/2026-06-28-iteration-1-decisions.md`.

## Harde regels

- **Firmware is authoritative** voor protocol/packet-formaten. Raad nooit packet-/topologie-formaten —
  lees de firmware-bron.
- **1-byte prefixen worden ondersteund** (anders dan in CoreDrive RX/CoreScope). Gooi ze niet weg.
- **Tests vereist** voor elke logica-wijziging (pure helpers: Vitest in de PWA, `go test` in de backend).
- **Geen speculatieve features** — doe exact wat gevraagd is; geen overbodige error-handling/validatie
  voor scenario's die niet kunnen optreden.
- **Expliciete staging** — `git add <bestand>`, nooit `git add -A`/`.`.
- **Één commit per logische wijziging.**
- **Kleuren via CSS-variabelen** — geen hardgecodeerde hex/rgb in component-styles.
- **Geen per-packet API-calls vanuit de frontend** — bulk fetch + client-side filteren.
- **DB is UTC.** Gebruiker rapporteert lokaal CEST (UTC+2).

## MQTT-contract (PWA → backend)

- Topic: `meshcore/hunter/{rxPubkey}/packets`, QoS1.
- Payload (JSON): `{ origin_id, origin, timestamp(RFC3339 rx_at), type:"PACKET", direction:"rx", raw,
  SNR, RSSI, is_direct, sender_key, sender_keylen, hops, packet_type, gps:{lat,lon,acc_m} }`.
- De PWA publiceert **alles** wat de companion hoort; de direct/all-toggle filtert alleen de lokale
  weergave, niet de upstream.

## Datamodel

Tabel `hunter_receptions` — alle ontvangsten, **geen purge**, `raw` (volledig pakket) blijft altijd
staan voor latere her-parsing. Volledig schema: zie het ontwerpdoc.

## Bouwen / draaien

Wordt aangevuld zodra de eerste implementatie staat (PWA: `npm install` + Vite dev/build; backend:
`go build` + Docker-container op de ingest-host). Tot dan is dit een spec-/scaffold-repo.
