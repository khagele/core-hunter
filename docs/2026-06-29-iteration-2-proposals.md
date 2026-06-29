# core-hunter — Iteratie 2: voorgestelde wijzigingen (TER BESPREKING)

> Datum: 2026-06-29. **Status: VOORSTEL — nog niet beslist, nog te overlopen met de anderen.**
> Dit document raakt de code (nog) niet. Het bouwt voort op de iteratie-1-beslissingen in
> [`2026-06-28-iteration-1-decisions.md`](2026-06-28-iteration-1-decisions.md); die log blijft ongewijzigd als
> historisch verslag van waartegen iteratie 1 gebouwd is. Wat hier bekrachtigd wordt, wordt iteratie-2-scope.
>
> Per item: **huidige beslissing → voorgestelde wijziging → open punten**.

## Dominant nieuw principe (van de gebruiker, 2026-06-29)

**Alleen wat de hunter RECHTSTREEKS hoort (zero-hop) is relevant.** Een gerelayd pakket (>0-hop) meet
SNR/RSSI op de **laatste repeater** die je hoorde, niet op het doel → nutteloos om het doel te lokaliseren.
Daarom: **enkel zero-hops loggen én naar MQTT doorsturen**; gerelayde packets vallen volledig weg
(niet plotten, niet loggen, niet publiceren).

Dit principe stuurt de wijzigingen aan Vraag 3, Vraag 4, en raakt eerdere beslissingen (zie onderaan).

---

## Vraag 3 — Wat vangt en plot de hunter precies?

**Huidige beslissing (iter 1):** Optie 3 — toggle direct-only-incl-1byte ↔ show-all. Naar MQTT wordt
*alles* gepubliceerd; de toggle filtert enkel de lokale weergave.

**Voorgestelde wijziging (iter 2):**
- **Capture:** de companion vangt alles wat hij fysiek hoort.
- **Loggen + doorsturen naar MQTT:** **uitsluitend zero-hop** (`is_direct`, `hops === 0`). Al het gerelayde
  verkeer wordt verworpen.
- **Plotten:** selectief, op basis van toggles — beide gaan over zero-hop verkeer:
  1. **Punten** — zero-hop ontvangsten, **filterbaar** (id/sender e.d.).
  2. **Heatmap** — zero-hop ontvangsten als **hotspots-heatmap**.

**Open punten:**
- De "show-all"-modus (gerelayde packets vervaagd tonen) **vervalt** — bevestigen.
- Hiermee vervalt ook het apart publiceren van "alles": MQTT krijgt nu **alle zero-hops** (= alles wat
  relevant is), niet meer het gerelayde verkeer.

---

## Vraag 4 — Hoe visualiseert de live kaart het signaal?

**Huidige beslissing (iter 1):** Optie 3 — beide lagen (punten + hex-heat) met toggle; klik op punt →
filter op sender.

**Voorgestelde wijziging (iter 2):**
1. Losse ontvangstpunten gekleurd op SNR/RSSI (klik → filter op **sender**).
2. Hex-grid heatmap (beste signaal per cel → gradient om naartoe te rijden).
3. Beide lagen, toggle. **(blijft Optie 3)**

**Open punten:**
- In een tussenversie was sprake van "klik → filter op sender **/ last-hop repeater**". Omdat onder het
  zero-hop-principe geen relays meer geplot worden, **vervalt het last-hop-repeater-filter**; het klik-filter
  is gewoon de **sender** (= het direct gehoorde toestel). Bevestigen.

---

## Voorstel NIEUW — Negeerlijst (ignore) voor ID's

**Aanleiding (gebruiker):** een repeater vlak bij de hunter adverteert zichzelf op zero-hop en zou een valse
**hotspot** op de heatmap maken. Door zulke ID's te markeren als *ignore* blijft de kaart gefocust op de
companions/doelen en wordt de heatmap bruikbaar.

**Doel:** de app bouwt een **heatmap van zero-hop observaties** op om een locatie te pinpointen. Bekende
stations (repeaters e.d.) kunnen anders een valse hotspot maken; ze negeren maakt de heatmap bruikbaarder
om op de companions/doelen te focussen.

**Voorstel:**
- Een **negeerlijst** van ID's (advert-pubkeys; eventueel prefix). Zero-hop ontvangsten van een genegeerde ID
  worden **uit de kaart en de heatmap** gehouden.
- **Ignore is een weergave-/queryfilter, geen capture-filter.** De DB bewaart álle zero-hops (Vraag 6, geen
  purge); negeren gebeurt op het moment van visualiseren. Zo kan je de negeerlijst aanpassen zonder data te
  verliezen, en kunnen verschillende analyses anders negeren.
- **App-zijde:** tik op een punt → "**negeer deze ID**" (de tegenhanger van de bestaande "isoleer sender").
  Negeerlijst persistent bewaren (localStorage) over sessies.
- **Backend-zijde (NIEUW, gebruiker):** dezelfde negeer-mogelijkheid moet in de **online backend** bestaan —
  bij het opbouwen van de (gebundelde) heatmap/coverage worden genegeerde stations server-side uitgesloten.
  Dit hoort bij de website-iteratie (zie hieronder).
- Niet-geadverteerde companions zijn op zero-hop onherkenbaar (`sender = null`) → niet negeerbaar en blijven
  dus altijd zichtbaar. Repeaters adverteren wél → herkenbaar → negeerbaar. De lijst raakt net het juiste.

**Beslist (gebruiker, 2026-06-29):**
- **Reikwijdte:** ignore = weergave-/queryfilter (app + backend); loggen blijft volledig (geen purge).
- **Matchen op volledige pubkey** — altijd beschikbaar bij zero-hop, dus geen prefix-matching nodig.
- **Backend-negeerlijst is globaal** (geldt voor alle hunters).

---

## Voorstel NIEUW — Naam-resolutie (pubkey → naam)

Omdat ignore (en de weergave) op de **volledige pubkey** werkt, willen we die pubkey ook leesbaar tonen.

**Beslist (gebruiker, 2026-06-29):**
- Pubkey → naam via een **API-connectie naar CoreScope-omgeving(en)**; **meerdere omgevingen mogelijk**
  (de naam kan in verschillende CoreScope-instanties bekend zijn).
- **Ook in de mobiele app** (niet enkel server-side voor de web-app): een **lijst van resolvers** in de
  app-`config.json`, elk met een regio-/SF-label. Concreet voorbeeld: één resolver voor **België (SF8)** en
  één voor **Nederland (SF7)**.
- Terugwaarts compatibel: een losse `resolveUrl` blijft werken (= één naamloze resolver).

Voorgestelde config-vorm (mobiele app):
```json
"resolvers": [
  { "label": "BE", "sf": 8, "url": "https://corescope-be.example/api/nodes/resolve" },
  { "label": "NL", "sf": 7, "url": "https://corescope-nl.example/api/nodes/resolve" }
]
```

**Resolutiestrategie (voorstel):** alle resolvers bevragen **in volgorde, eerste eenduidige (niet-ambigue)
treffer wint** (pubkeys zijn uniek → botsingen onwaarschijnlijk). SF/`label` is een **regiolabel** dat de
probeervolgorde bepaalt; de resolutie zelf gebeurt op de pubkey, niet op de SF. Cache per key (incl. welke
resolver antwoordde). Optioneel de regio tonen bij de naam (bv. `NodeX · NL`).

**Open punten:**
- Regio tonen bij de naam: ja/nee?
- Eventueel de actieve regio automatisch afleiden uit de companion (SF), zodat die resolver eerst gevraagd
  wordt — firmware-/companion-afhankelijk, mogelijk later.

> Raakt het bestaande `names.js` / `resolveUrl` (nu één endpoint, client-side). Iter 2: meerdere endpoints,
> zowel in de mobiele app-config als server-side voor de web-app.

## Voorstel NIEUW — Signaalmaat: RSSI als default

**Aanleiding:** voor peilen wil je een zuivere **nabijheids-/vermogensmaat**. RSSI ≈ ontvangen vermogen
(vooral padverlies → afstand). SNR vermengt het signaal met de **lokale ruisvloer** van de companion en is
daardoor minder geschikt als afstandsindicator.

**Beslist (gebruiker, 2026-06-29):**
- **Default signaalmaat = RSSI**, zowel in de app als op de website. SNR blijft **opgeslagen** (en mag
  getoond worden), maar de kleur/heatmap gaat standaard op RSSI.
- **App: vaste RSSI-schaal (dBm-banden)** — niet auto-geschaald. Voorbeeldbanden (drempels nog in het veld
  af te stemmen): `≥ −80` heet · `−80…−90` warm · `−90…−100` mid · `−100…−110` koel · `< −110` koud.
- **Website: elke hunter op zijn eigen relatieve schaal** bij het bundelen — vangt de per-toestel-offsets op
  (antenne-gain, kabel-/connectorverlies, RSSI-kalibratie) zonder expliciete kalibratie.

**Caveats (vastgelegd):**
- RSSI heeft **per-toestel-offsets** → absolute waarden van verschillende companions zijn niet 1-op-1
  vergelijkbaar (vandaar de relatieve website-schaal).
- Onder de ruisvloer (negatieve SNR) berekent de LoRa-chip de packet-RSSI mede *uit* de SNR → daar zijn de
  twee gekoppeld. Exacte RSSI-semantiek is chip-/firmware-afhankelijk (verifiëren indien het precies moet).

**Impact op code:** `signal.js` kleurt nu op SNR (`snrTier`); iter-2 voegt `rssiTier(rssi)` met vaste banden
toe en de kaart/HUD/heatmap kleuren standaard op RSSI. De thermische ramp (`--ch-sig-*`) blijft hergebruikt.
Website: per-hunter relatieve normalisatie vóór het mergen.

## Website / online backend (latere iteratie — scope-aanvulling)

De website bundelt de zero-hop observaties van **alle hunters** tot één heatmap om een doel te lokaliseren
(conform het oorspronkelijke uitgangspunt). Nieuw t.o.v. iter 1: de **negeerlijst moet ook hier werken** —
server-side stations uitsluiten bij het opbouwen van de gebundelde heatmap/coverage. Dit vergt de query-API /
GeoJSON-endpoints die al als "latere iteratie" genoteerd stonden; ignore wordt daar een queryparameter.
Signaalmaat = **RSSI**, met **elke hunter op zijn eigen relatieve schaal** vóór het mergen (zie de
Signaalmaat-sectie) om per-toestel-offsets op te vangen.

## Geraakte eerdere beslissingen / requirements (gevolg van het zero-hop-principe)

> Deze volgen logisch uit het bovenstaande en moeten mee bekrachtigd worden.

- **Vraag 7 — "1-byte altijd bewaren": VERVALT** (beslist, gebruiker 2026-06-29). Een 1-byte sender komt
  *uitsluitend* van `path[last]` bij een **gerelayd** FLOOD-pakket (`hops>0`), en dat verkeer loggen we niet
  meer. Bij enkel zero-hop is `sender_keylen` altijd **32** (advert/discover-pubkey) of **0** (onherkenbaar).
  De 1-byte-identificatie-as verdwijnt dus; matchen/negeren gebeurt op de volledige pubkey.
- **Vraag 7 — "hop-count als primaire peilgradient":** wordt feitelijk **binair** (je hoort het direct of
  niet). De gradient om "naartoe te rijden" is dan **SNR/RSSI** binnen de zero-hop-ontvangsten.
- **Bevestigde requirement "naar MQTT = alles publiceren":** wordt **"naar MQTT = alle zero-hops"**.
- **`sender_role` (Vraag 7, opportunistisch):** nog steeds nuttig — om bij een herkenbare zero-hop advert
  een repeater te kunnen markeren voor de negeerlijst. Decode blijft firmware-afhankelijk (was al uitgesteld).

## Impact op de reeds gebouwde code (NA bekrachtiging, niet nu)

- `meshpacket.js · classifyReception` — enkel records voor `hops === 0`; de `hops>0 → path[last]`-tak
  (incl. 1-byte) vervalt.
- `capture.js` / `publisher.js` — enkel zero-hop doorsturen.
- `huntmap.js` — vervaagde relay-punten weg; negeerlijst toepassen op punten + hex-binning.
- `filters.js` — negeer-predicaat (exclusielijst) toevoegen; `directOnly` wordt impliciet altijd waar.
- Server `hunter_receptions` — schema blijft; ontvangt enkel nog zero-hops.
- README's + de B8-verificatiestap ("controleer 1-byte rijen") herzien.
