# core-hunter — Iteratie 1 brainstorm: vragen, opties & beslissingen

> Datum: 2026-06-28. Dit document legt het volledige brainstorm-traject vast (alle vragen, alle
> aangeboden opties en de gekozen antwoorden) zodat de keuzes achteraf met anderen te overlopen en
> eventueel aan te passen zijn. Het uitgewerkte ontwerp staat in
> [`docs/superpowers/specs/2026-06-28-core-hunter-mobile-hunter-design.md`](superpowers/specs/2026-06-28-core-hunter-mobile-hunter-design.md).

## Uitgangspunt (van de gebruiker)

Bouw core-hunter = **scanner (CoreDrive RX)** + **kaart/puntvisualisatie (CoreScope)**. Hergebruik een
deel van CoreScope (database e.d.) samen met CoreDrive RX. De RX-tool van de *hunter* moet:
- een **aparte repo** zijn (los van CoreDrive RX);
- gebruikt worden om al rijdend een *spammer* te zoeken;
- **1-byte** ondersteunen (in tegenstelling tot CoreScope/CoreDrive RX);
- een kaartje tonen met signaalwaardes, zodat de hunter gericht naar een betere waarde kan rijden om
  zo de locatie van de spammer te vinden.

Verbeterde versie van een bestaande methode (`hunter.bouwens.co`, tijdelijk offline):
- mobiel (Bluefy browser op iOS), companion via Bluetooth koppelen;
- "direct only" kiezen → binnenkomende packets worden met signaalsterkte op de kaart geplot;
- ook zero-hop repeaters verschijnen → even overleggen;
- packet aanklikken → filteren op sender-id (roteert tijdens spam) of andere packet-onderdelen;
- bij bekende repeaters juist zónder filter peilen om de bron zichtbaar te maken (repeater + node
  beide op de kaart);
- regelmatig screenshots; verbinding valt soms weg → kaart loopt leeg.

De website moet data van **alle hunters** bundelen en op verschillende manieren laten filteren/pollen
om de exacte locatie van een spammer te bepalen.

---

## Vraag 1 — Focus van iteratie 1

**Opties:**
1. Mobiele hunter eerst (A).
2. End-to-end dunne verticale slice (A+B+C minimaal).
3. Backend + bundeling eerst (B+C).

**Antwoord:** **Optie 1 — mobiele hunter eerst**, maar **publiceren naar backend vanaf het begin**.
Aanvullend: **private GitHub-repo** met ALLE info (ook alle MD-bestanden) aanmaken zodat morgen vanaf
een andere PC verder ontwikkeld kan worden; deze repo continu up-to-date houden. Plus een **AGENTS.md**
voor wanneer het project publiek gaat en andere devs meehelpen.

## Vraag 2 — Hoe publiceert de hunter naar de backend?

**Opties:**
1. Hergebruik bestaande MQTT-broker (EMQX) op een eigen `hunter`-topic; kleine Go-ingestor subscribet.
2. Directe HTTP POST naar nieuwe backend (eigen retry/batching in PWA).
3. Beide (MQTT + HTTP fallback).

**Antwoord:** **Optie 1 — MQTT op eigen `hunter`-topic** (`meshcore/hunter/{rxPubkey}/packets`).

## Vraag 3 — Wat vangt en plot de hunter precies?

**Opties:**
1. Direct-only, maar inclusief 1-byte (zero-hop + 1-byte; relays eruit).
2. Alles wat de companion fysiek hoort (elk `0x88`-frame; filtering puur client-side).
3. Toggle: default optie 1, schakelaar "show all" naar optie 2.

**Antwoord:** **Optie 3 — toggle direct-only-incl-1byte ↔ show-all.**

## Vraag 4 — Hoe visualiseert de live kaart het signaal?

**Opties:**
1. Losse ontvangstpunten gekleurd op SNR/RSSI (klik → filter op sender).
2. Hex-grid heatmap (beste signaal per cel → gradient om naartoe te rijden).
3. Beide lagen, toggle.

**Antwoord:** **Optie 3 — beide lagen (punten + hex-heat) met toggle.**

## Vraag 5 — Welke filters in de veld-UI voor iteratie 1?

**Opties:**
1. Volledige set: sender + packet-type + tijdvenster + direct/all.
2. Minimaal: alleen sender + direct/all.
3. Aanpassen.

**Antwoord:** **Optie 1 — sender + type + tijdvenster (default ~10 min) + direct/all.** Bewust niet in
iter 1: vrije packet-byte-queries, multi-sender-selectie, server-side filtering over andere hunters.

## Vraag 6 — Waar slaat de backend-ingestor op?

**Opties:**
1. Eigen, aparte core-hunter SQLite-DB (eigen schema + retentie; eigen container).
2. Schrijven in bestaande CoreScope-DB (`client_receptions`).

**Antwoord:** **Optie 1 — eigen DB/ingestor/container**, en **zoveel mogelijk data opslaan ZONDER
purge**, zodat achteraf nog extra analyses mogelijk zijn.

---

## Bevestigde requirements (geen vraag, ter vastlegging)

- **Connection-drop resilience:** kaart wordt opgebouwd uit lokale IndexedDB, niet uit live geheugen;
  BLE/MQTT-drop laat de kaart staan en vult bij na reconnect.
- **Iteratie-1-kaart toont eigen ontvangsten;** bundeling van alle hunters is de website (latere iter).
- **Publiceren naar MQTT = alles** wat de companion hoort (max data voor de backend); de direct/all-
  toggle filtert alleen de lokale weergave.
