# core-hunter — Mobile Hunter (Iteration 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone mobile *hunter* PWA (BLE companion → live map of directly-heard signal, drive toward the source) plus a Go MQTT ingestor that stores every reception without purge.

**Architecture:** Fork the proven CoreDrive RX capture→queue→MQTT pipeline into a new `app/` PWA, but (a) keep 1-byte prefixes, (b) treat hop-count as the primary direction-finding gradient (`is_direct = hops.length===0`), (c) replace the three-tab UI with a distinct map-first "Signal HUD" look & feel, and (d) publish *everything* the companion hears to a dedicated MQTT topic. A new Go `server/` ingestor subscribes and writes all receptions into its own SQLite DB (no purge). Multi-hunter website is a later iteration.

**Tech Stack:** Vite ES-module PWA, Web Bluetooth, phone Geolocation, `mqtt` 5.x over WSS, IndexedDB, Leaflet 1.9.4; Go 1.24 + `modernc.org/sqlite` (CGO-free) + `eclipse/paho.mqtt.golang`. (Go directive raised from 1.22 to 1.24 during A3: `paho.mqtt.golang` and `golang.org/x/*` require go 1.24, so `go mod tidy` pins 1.24 as the real floor.)

## Global Constraints

- Repo: single private repo `github.com/efiten/core-hunter`; keep `origin/master` always up to date. Push after each completed task.
- Sub-trees: PWA in `app/`, Go ingestor in `server/`. Do not import from sibling repos — copy + adapt.
- MQTT topic (PWA→backend): `meshcore/hunter/{rxPubkey}/packets`, QoS1.
- **Firmware is authoritative** for packet/protocol formats. Never guess byte layouts. Only parse fields the existing `meshpacket.js` parser already exposes (route type, path/hops, advert pubkey, discover pubkey). Anything deeper (channel-message sender fields, advert role flags) requires reading firmware first — see Task B9 / deferred notes.
- **1-byte prefixes are kept** (unlike CoreDrive RX / CoreScope). Never drop a reception for lacking attribution.
- `is_direct = (hops.length === 0)` — the DF goal. `sender_keylen ∈ {1,2,3,32}` is a *separate* identification axis.
- DB stores **everything, no purge**; raw packet hex always retained. DB is UTC.
- Tests required for every logic change (Vitest in `app/`, `go test` in `server/`). Colours via CSS variables only — no hardcoded hex in component styles. Explicit `git add <files>`; one commit per logical change.
- Distinct visual identity: `--ch-*` design tokens, map-first HUD layout. Must not look like CoreScope/CoreDrive RX.
- State in any position-bearing output: radio (SNR/RSSI) via mesh topology, **not** GPS tracking of the target.

---

## Phase A — Backend ingestor (Go, `server/`)

Build first so the PWA has a real endpoint to publish to. Ingest + store + health only; no query API (later iteration).

### Task A1: Go module scaffold + config + health endpoint

**Files:**
- Create: `server/go.mod`, `server/cmd/ingestor/main.go`, `server/internal/config/config.go`
- Test: `server/internal/config/config_test.go`

**Interfaces:**
- Produces: `config.Load(path string) (Config, error)`; `Config{ MQTTURL, MQTTUsername, MQTTPassword, MQTTTopic, DBPath, HTTPAddr string }`.

- [ ] **Step 1: Init module**

Run: `cd server && go mod init github.com/efiten/core-hunter/server && go get modernc.org/sqlite@v1.34.5 github.com/eclipse/paho.mqtt.golang@latest`
Expected: `go.mod` created with both deps.

- [ ] **Step 2: Write failing config test**

`server/internal/config/config_test.go`:
```go
package config

import "testing"

func TestLoadDefaultsTopic(t *testing.T) {
	c, err := Load("testdata/min.json")
	if err != nil {
		t.Fatalf("Load: %v", err)
	}
	if c.MQTTTopic != "meshcore/hunter/+/packets" {
		t.Fatalf("topic = %q, want default wildcard", c.MQTTTopic)
	}
	if c.DBPath == "" || c.HTTPAddr == "" {
		t.Fatalf("DBPath/HTTPAddr must have defaults, got %q / %q", c.DBPath, c.HTTPAddr)
	}
}
```
Create `server/internal/config/testdata/min.json`:
```json
{ "mqttUrl": "tcp://broker:1883", "mqttUsername": "ingestor", "mqttPassword": "x" }
```

- [ ] **Step 3: Run test, verify it fails**

Run: `cd server && go test ./internal/config/`
Expected: FAIL (no `Load`).

- [ ] **Step 4: Implement config**

`server/internal/config/config.go`:
```go
package config

import (
	"encoding/json"
	"os"
)

type Config struct {
	MQTTURL      string `json:"mqttUrl"`
	MQTTUsername string `json:"mqttUsername"`
	MQTTPassword string `json:"mqttPassword"`
	MQTTTopic    string `json:"mqttTopic"`
	DBPath       string `json:"dbPath"`
	HTTPAddr     string `json:"httpAddr"`
}

func Load(path string) (Config, error) {
	var c Config
	b, err := os.ReadFile(path)
	if err != nil {
		return c, err
	}
	if err := json.Unmarshal(b, &c); err != nil {
		return c, err
	}
	if c.MQTTTopic == "" {
		c.MQTTTopic = "meshcore/hunter/+/packets"
	}
	if c.DBPath == "" {
		c.DBPath = "data/hunter.db"
	}
	if c.HTTPAddr == "" {
		c.HTTPAddr = ":8090"
	}
	return c, nil
}
```

- [ ] **Step 5: Run test, verify pass**

Run: `cd server && go test ./internal/config/`
Expected: PASS.

- [ ] **Step 6: Minimal main with /healthz**

`server/cmd/ingestor/main.go`:
```go
package main

import (
	"log"
	"net/http"
	"os"

	"github.com/efiten/core-hunter/server/internal/config"
)

func main() {
	cfgPath := "config.json"
	if len(os.Args) > 1 {
		cfgPath = os.Args[1]
	}
	cfg, err := config.Load(cfgPath)
	if err != nil {
		log.Fatalf("config: %v", err)
	}
	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	log.Printf("ingestor listening on %s, topic %s", cfg.HTTPAddr, cfg.MQTTTopic)
	log.Fatal(http.ListenAndServe(cfg.HTTPAddr, nil))
}
```

- [ ] **Step 7: Build + commit**

Run: `cd server && go build ./... && go vet ./...`
```bash
git add server/go.mod server/go.sum server/cmd/ingestor/main.go server/internal/config/
git commit -m "feat(server): scaffold ingestor module, config loader, health endpoint"
```

---

### Task A2: Payload → row mapping (pure) + SQLite store (no purge)

**Files:**
- Create: `server/internal/store/reception.go`, `server/internal/store/store.go`
- Test: `server/internal/store/reception_test.go`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `store.Reception` struct with fields: `HunterPubkey, HunterName string; RxAt, IngestedAt string; SNR float64; RSSI int; Raw string; PacketType string; SenderKey string; SenderKeylen int; SenderRole string; IsDirect bool; Hops int; Lat, Lon, PosAccM float64; MQTTTopic string`.
  - `store.ParsePayload(topic string, body []byte, ingestedAt string) (Reception, error)` — maps the PWA JSON payload to a `Reception`.
  - `store.Open(path string) (*Store, error)`; `(*Store).Insert(r Reception) error`; `(*Store).Close() error`. Schema has **no** TTL/purge.

- [ ] **Step 1: Write failing mapping test**

`server/internal/store/reception_test.go`:
```go
package store

import "testing"

const samplePayload = `{
 "origin_id":"aabb","origin":"hunter-1","timestamp":"2026-06-29T10:00:00Z",
 "type":"PACKET","direction":"rx","raw":"deadbeef","SNR":-3.5,"RSSI":-92,
 "is_direct":true,"hops":0,"sender_key":"a1","sender_keylen":1,"sender_role":"",
 "packet_type":"channel-msg","gps":{"lat":51.0,"lon":4.0,"acc_m":8.0}
}`

func TestParsePayloadMapsAllFields(t *testing.T) {
	r, err := ParsePayload("meshcore/hunter/aabb/packets", []byte(samplePayload), "2026-06-29T10:00:01Z")
	if err != nil {
		t.Fatalf("ParsePayload: %v", err)
	}
	if r.HunterPubkey != "aabb" || r.HunterName != "hunter-1" {
		t.Fatalf("hunter fields wrong: %+v", r)
	}
	if !r.IsDirect || r.Hops != 0 || r.SenderKeylen != 1 || r.SNR != -3.5 || r.RSSI != -92 {
		t.Fatalf("signal/axis fields wrong: %+v", r)
	}
	if r.Raw != "deadbeef" || r.PacketType != "channel-msg" || r.Lat != 51.0 {
		t.Fatalf("payload fields wrong: %+v", r)
	}
	if r.IngestedAt != "2026-06-29T10:00:01Z" || r.MQTTTopic == "" {
		t.Fatalf("ingest meta wrong: %+v", r)
	}
}
```

- [ ] **Step 2: Run, verify fail**

Run: `cd server && go test ./internal/store/`
Expected: FAIL (no `ParsePayload`).

- [ ] **Step 3: Implement reception mapping**

`server/internal/store/reception.go`:
```go
package store

import "encoding/json"

type Reception struct {
	HunterPubkey string
	HunterName   string
	RxAt         string
	IngestedAt   string
	SNR          float64
	RSSI         int
	Raw          string
	PacketType   string
	SenderKey    string
	SenderKeylen int
	SenderRole   string
	IsDirect     bool
	Hops         int
	Lat          float64
	Lon          float64
	PosAccM      float64
	MQTTTopic    string
}

type payload struct {
	OriginID     string  `json:"origin_id"`
	Origin       string  `json:"origin"`
	Timestamp    string  `json:"timestamp"`
	Raw          string  `json:"raw"`
	SNR          float64 `json:"SNR"`
	RSSI         int     `json:"RSSI"`
	IsDirect     bool    `json:"is_direct"`
	Hops         int     `json:"hops"`
	SenderKey    string  `json:"sender_key"`
	SenderKeylen int     `json:"sender_keylen"`
	SenderRole   string  `json:"sender_role"`
	PacketType   string  `json:"packet_type"`
	GPS          struct {
		Lat   float64 `json:"lat"`
		Lon   float64 `json:"lon"`
		AccM  float64 `json:"acc_m"`
	} `json:"gps"`
}

func ParsePayload(topic string, body []byte, ingestedAt string) (Reception, error) {
	var p payload
	if err := json.Unmarshal(body, &p); err != nil {
		return Reception{}, err
	}
	return Reception{
		HunterPubkey: p.OriginID,
		HunterName:   p.Origin,
		RxAt:         p.Timestamp,
		IngestedAt:   ingestedAt,
		SNR:          p.SNR,
		RSSI:         p.RSSI,
		Raw:          p.Raw,
		PacketType:   p.PacketType,
		SenderKey:    p.SenderKey,
		SenderKeylen: p.SenderKeylen,
		SenderRole:   p.SenderRole,
		IsDirect:     p.IsDirect,
		Hops:         p.Hops,
		Lat:          p.GPS.Lat,
		Lon:          p.GPS.Lon,
		PosAccM:      p.GPS.AccM,
		MQTTTopic:    topic,
	}, nil
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd server && go test ./internal/store/`
Expected: PASS.

- [ ] **Step 5: Implement store with no-purge schema + round-trip test**

`server/internal/store/store.go`:
```go
package store

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

type Store struct{ db *sql.DB }

const schema = `
CREATE TABLE IF NOT EXISTS hunter_receptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  hunter_pubkey TEXT NOT NULL,
  hunter_name   TEXT,
  rx_at         TEXT NOT NULL,
  ingested_at   TEXT NOT NULL,
  snr           REAL,
  rssi          INTEGER,
  raw           TEXT NOT NULL,
  packet_type   TEXT,
  sender_key    TEXT,
  sender_keylen INTEGER,
  sender_role   TEXT,
  is_direct     INTEGER NOT NULL,
  hops          INTEGER NOT NULL,
  lat           REAL,
  lon           REAL,
  pos_acc_m     REAL,
  mqtt_topic    TEXT
);
CREATE INDEX IF NOT EXISTS idx_recv_rxat   ON hunter_receptions(rx_at);
CREATE INDEX IF NOT EXISTS idx_recv_sender ON hunter_receptions(sender_key);
CREATE INDEX IF NOT EXISTS idx_recv_geo    ON hunter_receptions(lat, lon);
`

func Open(path string) (*Store, error) {
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	if _, err := db.Exec(schema); err != nil {
		return nil, err
	}
	return &Store{db: db}, nil
}

func (s *Store) Insert(r Reception) error {
	_, err := s.db.Exec(
		`INSERT INTO hunter_receptions
		 (hunter_pubkey,hunter_name,rx_at,ingested_at,snr,rssi,raw,packet_type,
		  sender_key,sender_keylen,sender_role,is_direct,hops,lat,lon,pos_acc_m,mqtt_topic)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		r.HunterPubkey, r.HunterName, r.RxAt, r.IngestedAt, r.SNR, r.RSSI, r.Raw, r.PacketType,
		r.SenderKey, r.SenderKeylen, r.SenderRole, b2i(r.IsDirect), r.Hops, r.Lat, r.Lon, r.PosAccM, r.MQTTTopic,
	)
	return err
}

func (s *Store) Close() error { return s.db.Close() }

func b2i(b bool) int {
	if b {
		return 1
	}
	return 0
}
```
Append to `reception_test.go`:
```go
func TestInsertRoundTrip(t *testing.T) {
	st, err := Open(":memory:")
	if err != nil {
		t.Fatalf("Open: %v", err)
	}
	defer st.Close()
	r, _ := ParsePayload("t", []byte(samplePayload), "2026-06-29T10:00:01Z")
	if err := st.Insert(r); err != nil {
		t.Fatalf("Insert: %v", err)
	}
	var n int
	if err := st.db.QueryRow(`SELECT count(*) FROM hunter_receptions WHERE is_direct=1`).Scan(&n); err != nil {
		t.Fatalf("query: %v", err)
	}
	if n != 1 {
		t.Fatalf("rows=%d want 1", n)
	}
}
```

- [ ] **Step 6: Run, verify pass + commit**

Run: `cd server && go test ./internal/store/`
Expected: PASS (both tests).
```bash
git add server/internal/store/
git commit -m "feat(server): hunter_receptions store (no purge) + payload mapping"
```

---

### Task A3: Wire MQTT subscriber to the store

**Files:**
- Create: `server/internal/ingest/ingest.go`
- Modify: `server/cmd/ingestor/main.go` (wire subscriber + store)
- Test: `server/internal/ingest/ingest_test.go`

**Interfaces:**
- Consumes: `store.ParsePayload`, `store.Store.Insert`.
- Produces: `ingest.Handle(s Inserter, topic string, body []byte, now func() string) error` where `type Inserter interface { Insert(store.Reception) error }`. Pure handler (no live broker) so it is unit-testable.

- [ ] **Step 1: Write failing handler test**

`server/internal/ingest/ingest_test.go`:
```go
package ingest

import (
	"testing"

	"github.com/efiten/core-hunter/server/internal/store"
)

type fake struct{ got []store.Reception }

func (f *fake) Insert(r store.Reception) error { f.got = append(f.got, r); return nil }

func TestHandleInsertsParsedReception(t *testing.T) {
	f := &fake{}
	body := []byte(`{"origin_id":"aa","timestamp":"t","raw":"00","hops":2,"is_direct":false,"gps":{"lat":1,"lon":2}}`)
	if err := Handle(f, "meshcore/hunter/aa/packets", body, func() string { return "now" }); err != nil {
		t.Fatalf("Handle: %v", err)
	}
	if len(f.got) != 1 || f.got[0].Hops != 2 || f.got[0].IngestedAt != "now" {
		t.Fatalf("bad reception: %+v", f.got)
	}
}
```

- [ ] **Step 2: Run, verify fail**

Run: `cd server && go test ./internal/ingest/`
Expected: FAIL (no `Handle`).

- [ ] **Step 3: Implement handler**

`server/internal/ingest/ingest.go`:
```go
package ingest

import "github.com/efiten/core-hunter/server/internal/store"

type Inserter interface{ Insert(store.Reception) error }

func Handle(s Inserter, topic string, body []byte, now func() string) error {
	r, err := store.ParsePayload(topic, body, now())
	if err != nil {
		return err
	}
	return s.Insert(r)
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd server && go test ./internal/ingest/`
Expected: PASS.

- [ ] **Step 5: Wire paho subscriber in main.go**

Modify `server/cmd/ingestor/main.go` — after opening the store, connect MQTT and route messages through `ingest.Handle`:
```go
	st, err := store.Open(cfg.DBPath)
	if err != nil {
		log.Fatalf("store: %v", err)
	}
	defer st.Close()

	opts := mqtt.NewClientOptions().
		AddBroker(cfg.MQTTURL).
		SetUsername(cfg.MQTTUsername).
		SetPassword(cfg.MQTTPassword).
		SetClientID("core-hunter-ingestor").
		SetAutoReconnect(true)
	opts.SetOnConnectHandler(func(c mqtt.Client) {
		c.Subscribe(cfg.MQTTTopic, 1, func(_ mqtt.Client, m mqtt.Message) {
			if err := ingest.Handle(st, m.Topic(), m.Payload(), func() string {
				return time.Now().UTC().Format(time.RFC3339)
			}); err != nil {
				log.Printf("ingest error: %v", err)
			}
		})
		log.Printf("subscribed to %s", cfg.MQTTTopic)
	})
	client := mqtt.NewClient(opts)
	if t := client.Connect(); t.Wait() && t.Error() != nil {
		log.Fatalf("mqtt connect: %v", t.Error())
	}
```
Add imports `time`, `mqtt "github.com/eclipse/paho.mqtt.golang"`, `.../internal/ingest`, `.../internal/store`.

- [ ] **Step 6: Build + commit**

Run: `cd server && go build ./... && go vet ./... && go test ./...`
Expected: build OK, all tests PASS.
```bash
git add server/internal/ingest/ server/cmd/ingestor/main.go
git commit -m "feat(server): subscribe to hunter topic and persist receptions"
```

---

### Task A4: Dockerfile + example config

**Files:**
- Create: `server/Dockerfile`, `server/config.example.json`, `server/.dockerignore`

- [ ] **Step 1: Write config example**

`server/config.example.json`:
```json
{
  "mqttUrl": "tcp://<broker-host>:1883",
  "mqttUsername": "core-hunter-ingestor",
  "mqttPassword": "<set me>",
  "mqttTopic": "meshcore/hunter/+/packets",
  "dbPath": "/app/data/hunter.db",
  "httpAddr": ":8090"
}
```

- [ ] **Step 2: Write Dockerfile (multi-stage, CGO-free)**

`server/Dockerfile`:
```dockerfile
FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/ingestor ./cmd/ingestor

FROM gcr.io/distroless/static-debian12
COPY --from=build /out/ingestor /ingestor
VOLUME ["/app/data"]
EXPOSE 8090
ENTRYPOINT ["/ingestor", "/app/config.json"]
```

`server/.dockerignore`:
```
data/
*.db
```

- [ ] **Step 3: Verify build + commit**

Run: `cd server && docker build -t core-hunter-ingestor .`
Expected: image builds.
```bash
git add server/Dockerfile server/config.example.json server/.dockerignore
git commit -m "feat(server): containerize ingestor (CGO-free, data volume)"
```

> Deploy (manual, after user confirmation) on the deploy host: `docker run -d --name core-hunter-ingestor --restart unless-stopped -p 8090:8090 -v $(pwd)/config.json:/app/config.json:ro -v core-hunter-data:/app/data core-hunter-ingestor`. Requires an EMQX publish/subscribe account; ask before creating broker credentials.

---

## Phase B — Mobile hunter PWA (`app/`)

### Task B1: PWA scaffold + distinct look & feel design system

**Files:**
- Create: `app/package.json`, `app/vite.config.js`, `app/index.html`, `app/public/manifest.webmanifest`, `app/public/sw.js`, `app/public/config.example.json`, `app/src/styles/tokens.css`, `app/src/styles/app.css`
- Test: (visual; no unit test this task)

**Interfaces:**
- Produces: the `--ch-*` token set and the map-first HUD DOM skeleton consumed by all later UI tasks. Layout regions (by id): `#map`, `#topbar`, `#hud`, `#layer-toggle`, `#filter-btn`, `#filter-sheet`, `#settings-sheet`.

**Look & feel direction (must differ from CoreScope/CoreDrive RX):**
- **Layout:** map-first. Fullscreen `#map`; a slim translucent `#topbar` (target/sender chip + BLE/MQTT status dots); a bottom `#hud` "Signal HUD" with a large SNR/RSSI readout, a hop badge, and a horizontal "warmer/colder" signal bar as the primary cue; floating round buttons for layer toggle and filter sheet. Settings + filters are slide-over sheets — **no** Home/Map/Settings tabs, **no** node-browser table.
- **Thermal semantics (deliberate inversion of CoreScope):** for hunting, **hot = strong = close**. Ramp cold→hot = weak→strong so you "drive toward the heat." Document this in `tokens.css`.
- **Both themes get their own main colours.** Light and dark are distinct palettes (own bg/surface/text/accent), not one theme with inverted tiles. Default to dark; a settings toggle sets `data-theme="light"`. The thermal ramp has per-theme variants so tiers stay legible on a light basemap (darker, more saturated) and on a dark basemap (brighter).

- [ ] **Step 1: package.json**
```json
{
  "name": "core-hunter",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": { "mqtt": "^5.10.1" },
  "devDependencies": { "vite": "^5.4.0", "vitest": "^2.0.0" }
}
```
Run: `cd app && npm install`

- [ ] **Step 2: vite.config.js (inject version)**
```js
import { readFileSync } from 'node:fs'
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
export default {
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
}
```

- [ ] **Step 3: Design tokens (distinct identity)**

`app/src/styles/tokens.css` — both themes have their own main colours; the thermal ramp has per-theme variants so tiers stay legible on either basemap:
```css
/* ---- DARK theme (default): deep slate + radar-green accent ---- */
:root, [data-theme="dark"] {
  --ch-bg:        #0b0e14;
  --ch-surface:   rgba(18, 23, 33, 0.82);
  --ch-text:      #e6edf3;
  --ch-muted:     #8b98a9;
  --ch-accent:    #38e0a6;   /* radar green — primary accent */
  --ch-accent-2:  #ffb020;   /* amber — alerts / 0-hop highlight */
  --ch-basemap:   dark;      /* hint for tile choice (Task B6) */

  /* THERMAL ramp (bright variant for dark basemap): hot = strong = close */
  --ch-sig-hot:   #ff453a;   /* strongest  (SNR >= -2)  */
  --ch-sig-warm:  #ff9f0a;   /* strong     (-5..-2)     */
  --ch-sig-mid:   #ffd60a;   /* mid        (-9..-5)     */
  --ch-sig-cool:  #40c8ff;   /* weak       (-14..-9)    */
  --ch-sig-cold:  #5e7bff;   /* weakest    (< -14)      */
  --ch-sig-none:  #5b6675;   /* heard, no metric        */

  --ch-direct-glow: var(--ch-accent-2);  /* 0-hop ring */
  --ch-relayed-fade: 0.35;               /* opacity for hops>0 points */
}

/* ---- LIGHT theme: warm paper + teal accent (its own identity, not inverted dark) ---- */
[data-theme="light"] {
  --ch-bg:        #f4f1ea;
  --ch-surface:   rgba(255, 252, 245, 0.86);
  --ch-text:      #1b2430;
  --ch-muted:     #5a6675;
  --ch-accent:    #0e9f7e;   /* teal — primary accent */
  --ch-accent-2:  #b4530a;   /* burnt amber — alerts / 0-hop highlight */
  --ch-basemap:   light;

  /* THERMAL ramp (darker/saturated variant for legibility on a light basemap) */
  --ch-sig-hot:   #d11f1f;
  --ch-sig-warm:  #e07000;
  --ch-sig-mid:   #c79100;
  --ch-sig-cool:  #1577c0;
  --ch-sig-cold:  #3a44b8;
  --ch-sig-none:  #9aa3ad;

  --ch-direct-glow: var(--ch-accent-2);
  --ch-relayed-fade: 0.4;
}
```

- [ ] **Step 4: index.html (map-first HUD skeleton)**

`app/index.html`:
```html
<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>core-hunter</title>
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="/src/styles/tokens.css" />
  <link rel="stylesheet" href="/src/styles/app.css" />
</head>
<body>
  <div id="map"></div>
  <header id="topbar">
    <span id="target-chip">No target</span>
    <span id="status-dots"><i id="dot-ble"></i><i id="dot-mqtt"></i></span>
  </header>
  <section id="hud">
    <div id="hud-snr">—</div>
    <div id="hud-rssi">—</div>
    <span id="hud-hop">hop —</span>
    <div id="hud-bar"><div id="hud-bar-fill"></div></div>
    <button id="connect-btn">Connect</button>
  </section>
  <button id="layer-toggle" aria-label="Toggle layers">◑</button>
  <button id="filter-btn" aria-label="Filters">⚲</button>
  <aside id="filter-sheet" hidden></aside>
  <aside id="settings-sheet" hidden></aside>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script type="module" src="/src/app.js"></script>
</body>
</html>
```

- [ ] **Step 5: app.css (HUD layout) + manifest + sw + config example**

`app/src/styles/app.css` (key rules; colours via tokens only):
```css
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: var(--ch-bg); color: var(--ch-text);
  font-family: system-ui, sans-serif; }
#map { position: fixed; inset: 0; }
#topbar { position: fixed; top: 0; left: 0; right: 0; display: flex; justify-content: space-between;
  align-items: center; padding: 8px 12px; background: var(--ch-surface); backdrop-filter: blur(8px);
  font-size: 14px; z-index: 500; }
#status-dots i { display: inline-block; width: 10px; height: 10px; border-radius: 50%;
  margin-left: 6px; background: var(--ch-sig-none); }
#status-dots i.on { background: var(--ch-accent); }
#hud { position: fixed; left: 0; right: 0; bottom: 0; padding: 12px 16px env(safe-area-inset-bottom);
  background: var(--ch-surface); backdrop-filter: blur(10px); display: grid;
  grid-template-columns: auto auto 1fr auto; gap: 10px 14px; align-items: center; z-index: 500; }
#hud-snr { font-size: 34px; font-weight: 700; color: var(--ch-accent); }
#hud-hop { color: var(--ch-muted); }
#hud-bar { grid-column: 1 / -1; height: 8px; border-radius: 4px; background: #1b2230; overflow: hidden; }
#hud-bar-fill { height: 100%; width: 0; background: linear-gradient(90deg,
  var(--ch-sig-cold), var(--ch-sig-cool), var(--ch-sig-mid), var(--ch-sig-warm), var(--ch-sig-hot)); }
#layer-toggle, #filter-btn { position: fixed; right: 14px; width: 46px; height: 46px;
  border-radius: 50%; border: none; background: var(--ch-surface); color: var(--ch-text);
  font-size: 20px; z-index: 500; }
#layer-toggle { bottom: 150px; } #filter-btn { bottom: 204px; }
#filter-sheet, #settings-sheet { position: fixed; left: 0; right: 0; bottom: 0; max-height: 70%;
  overflow: auto; padding: 16px; background: var(--ch-surface); backdrop-filter: blur(12px);
  border-top-left-radius: 16px; border-top-right-radius: 16px; z-index: 600; }
[hidden] { display: none !important; }
```
`app/public/manifest.webmanifest`:
```json
{
  "name": "core-hunter",
  "short_name": "Hunter",
  "description": "MeshCore node-hunting / direction-finding scanner",
  "start_url": "/", "scope": "/", "display": "standalone", "orientation": "portrait",
  "background_color": "#0b0e14", "theme_color": "#0b0e14",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "purpose": "any" },
    { "src": "/icon-512.png", "sizes": "512x512", "purpose": "any maskable" }
  ]
}
```
`app/public/sw.js`:
```js
const CACHE = 'core-hunter-v1'
self.addEventListener('install', (e) => { self.skipWaiting() })
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))))
})
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request).then((r) => r || caches.match('/'))))
})
```
`app/public/config.example.json`:
```json
{
  "mqttUrl": "wss://broker.example:8084/ws",
  "mqttUsername": "core-hunter",
  "mqttPassword": "<publish-only EMQX account>",
  "resolveUrl": "https://corescope.example/api/nodes/resolve"
}
```

- [ ] **Step 6: Commit**
```bash
git add app/package.json app/vite.config.js app/index.html app/public/ app/src/styles/
git commit -m "feat(app): PWA scaffold with distinct map-first HUD look & feel"
```

---

### Task B2: Copy mechanical modules (transport, frames, gps, selfinfo, config, wakelock, sharelog, names) + extend queue

**Files:**
- Create (copy verbatim from `../corescope-rx/src/`): `app/src/transport.js`, `app/src/frames.js`, `app/src/gps.js`, `app/src/selfinfo.js`, `app/src/config.js`, `app/src/wakelock.js`, `app/src/wakelock-media.js`, `app/src/sharelog.js`, `app/src/names.js`
- Create (copy + edit): `app/src/queue.js`
- Test: `app/src/__tests__/queue.test.js` (smoke only — IndexedDB is mocked minimally; see note)

**Interfaces:**
- Produces: unchanged module APIs (`WebBluetoothTransport`, `parseFrame`, `Gps`, `requestSelfInfo`, `loadConfig`, `createWakeLock`, `shareLog`, `resolveName`). `Queue` now uses `DB_NAME='core-hunter'`, `STORE='receptions'`, and `add(record)` accepts the extended schema (Task B4).

- [ ] **Step 1: Copy the verbatim modules**

Run (from repo root, Git Bash):
```bash
for f in transport frames gps selfinfo config wakelock wakelock-media sharelog names; do
  cp "../corescope-rx/src/$f.js" "app/src/$f.js"
done
```
> These modules are platform glue with no capture-rule logic; they carry over unchanged. `names.js` `resolveUrl` may point at CoreScope's resolver (read-only name lookup) — acceptable.

- [ ] **Step 2: Copy queue.js and change DB/store names**

`cp ../corescope-rx/src/queue.js app/src/queue.js`, then edit the two constants:
```js
const DB_NAME = 'core-hunter'
const STORE = 'receptions'
```
No other change — `add/takeAll/remove/count` are schema-agnostic (store whatever object is passed).

- [ ] **Step 3: Commit (no test cycle — pure mechanical copy)**
```bash
git add app/src/transport.js app/src/frames.js app/src/gps.js app/src/selfinfo.js \
        app/src/config.js app/src/wakelock.js app/src/wakelock-media.js app/src/sharelog.js \
        app/src/names.js app/src/queue.js
git commit -m "feat(app): port platform modules from CoreDrive RX; rename IndexedDB to core-hunter"
```

---

### Task B3: meshpacket.js — keep 1-byte + expose hops as a first-class axis (TDD)

**Files:**
- Create (copy from `../corescope-rx/src/meshpacket.js`): `app/src/meshpacket.js`
- Test: `app/src/__tests__/meshpacket.test.js`

**Interfaces:**
- Consumes: `parseFrame` output `.raw` (Uint8Array).
- Produces:
  - `parsePacket(bytes)` unchanged: returns `{ routeType, payloadType, isAdvert, hops:[], advertPubkey, isDiscoverResp, discoverPubkey }`.
  - `classifyReception(direction, pkt)` (NEW, replaces direct dependence on `deriveHeardKey`'s 1-byte exclusion): returns
    `{ senderKey: string|null, senderKeylen: 0|1|2|3|32, src: 'rxlog'|'advert'|'discover'|null, hops: number, isDirect: boolean, packetType: string }`.
    - `hops = pkt.hops.length`; `isDirect = hops === 0`.
    - `senderKey/senderKeylen/src` follow the existing attribution (path[last] for FLOOD with hops>0; advertPubkey; discoverPubkey) **but keylen 1 is now allowed**.
    - When no attribution is possible (e.g. 0-hop FLOOD data packet with empty path), `senderKey=null, senderKeylen=0, src=null` — the reception is still valid and is plotted by signal.
    - `packetType`: `'advert'` | `'discover'` | `'channel-msg'` (FLOOD/DIRECT data) | `'other'`.

- [ ] **Step 1: Copy module, then write failing tests**

`cp ../corescope-rx/src/meshpacket.js app/src/meshpacket.js`

`app/src/__tests__/meshpacket.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { classifyReception, parsePacket } from '../meshpacket.js'

// helper: build a minimal parsed-packet stub to exercise classify rules directly
const pkt = (over) => ({ routeType: 1, payloadType: 0, isAdvert: false, hops: [],
  advertPubkey: null, isDiscoverResp: false, discoverPubkey: null, ...over })

describe('classifyReception', () => {
  it('keeps a 1-byte path-hash sender (NOT dropped like CoreDrive RX)', () => {
    const c = classifyReception('rx', pkt({ routeType: 1, hops: ['a1'] }))
    expect(c.senderKey).toBe('a1')
    expect(c.senderKeylen).toBe(1)
    expect(c.src).toBe('rxlog')
    expect(c.hops).toBe(1)
    expect(c.isDirect).toBe(false)
  })

  it('marks a 0-hop advert as direct with full pubkey', () => {
    const c = classifyReception('rx', pkt({ payloadType: 4, isAdvert: true, hops: [],
      advertPubkey: 'ab'.repeat(32) }))
    expect(c.isDirect).toBe(true)
    expect(c.senderKeylen).toBe(32)
    expect(c.src).toBe('advert')
    expect(c.packetType).toBe('advert')
  })

  it('keeps an unattributed 0-hop data packet as direct, sender null', () => {
    const c = classifyReception('rx', pkt({ routeType: 1, payloadType: 0, hops: [] }))
    expect(c.isDirect).toBe(true)
    expect(c.senderKey).toBeNull()
    expect(c.senderKeylen).toBe(0)
    expect(c.packetType).toBe('channel-msg')
  })

  it('returns hops count from path length for relayed packets', () => {
    const c = classifyReception('rx', pkt({ routeType: 1, hops: ['a1', 'b2', 'c3'] }))
    expect(c.hops).toBe(3)
    expect(c.isDirect).toBe(false)
    expect(c.senderKey).toBe('c3')
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/meshpacket.test.js`
Expected: FAIL (`classifyReception` not exported).

- [ ] **Step 3: Implement classifyReception in meshpacket.js**

Add to `app/src/meshpacket.js` (keep `parsePacket`, `isFloodRoute`, `bytesToHex`, `hexToBytes`, `deriveHeardKey` as-is for reference; add the new function):
```js
const PACKET_TYPE = (pkt) => {
  if (pkt.isAdvert) return 'advert'
  if (pkt.isDiscoverResp) return 'discover'
  if (pkt.payloadType === PAYLOAD_TYPE_TRACE) return 'other'
  return 'channel-msg'
}

export function classifyReception(direction, pkt) {
  const hops = pkt.hops ? pkt.hops.length : 0
  const isDirect = hops === 0
  const packetType = PACKET_TYPE(pkt)
  let senderKey = null, senderKeylen = 0, src = null

  if (direction === 'rx' && pkt.payloadType !== PAYLOAD_TYPE_TRACE) {
    if (isFloodRoute(pkt.routeType) && hops > 0) {
      senderKey = pkt.hops[pkt.hops.length - 1]
      senderKeylen = senderKey.length / 2   // 1-byte (keylen 1) now allowed
      src = 'rxlog'
    } else if (pkt.isAdvert && pkt.advertPubkey) {
      senderKey = pkt.advertPubkey
      senderKeylen = senderKey.length / 2
      src = 'advert'
    } else if (pkt.isDiscoverResp && pkt.discoverPubkey) {
      senderKey = pkt.discoverPubkey
      senderKeylen = senderKey.length / 2
      src = 'discover'
    }
  }
  return { senderKey, senderKeylen, src, hops, isDirect, packetType }
}
```
> `deriveHeardKey`'s old `if (keylen < 2) return null;` is **not** used by the hunter path; `classifyReception` is the hunter's capture rule. Leave `deriveHeardKey` in place (unused) to ease diffing against upstream, or delete it — either is fine; do not let it gate captures.

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/meshpacket.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add app/src/meshpacket.js app/src/__tests__/meshpacket.test.js
git commit -m "feat(app): classifyReception keeps 1-byte + exposes hops as DF axis"
```

---

### Task B4: Capture record + MQTT payload builder (TDD)

**Files:**
- Create: `app/src/capture.js`, `app/src/publisher.js` (copy from upstream then edit topic+payload)
- Test: `app/src/__tests__/capture.test.js`, `app/src/__tests__/publisher.test.js`

**Interfaces:**
- Consumes: `classifyReception` (B3), `parseFrame` (B2).
- Produces:
  - `buildRecord(frame, pkt, classification, gps, nowIso)` → record object:
    `{ rx_at, raw, snr, rssi, lat, lon, acc_m, sender_key, sender_keylen, sender_role, is_direct, hops, packet_type }`. `sender_role` is `null` for iteration 1 (see Task B9 / deferred).
  - `Publisher.buildPayload(rxPubkey, rec, name)` → payload JSON with the hunter fields.
  - `Publisher.publish(rxPubkey, rec, name, timeoutMs)` → topic `meshcore/hunter/{rxPubkey}/packets`.

- [ ] **Step 1: Write failing capture test**

`app/src/__tests__/capture.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { buildRecord } from '../capture.js'

describe('buildRecord', () => {
  it('flattens frame + classification + gps into a queue record', () => {
    const frame = { snr: -3.5, rssi: -92, raw: new Uint8Array([0xde, 0xad]) }
    const cls = { senderKey: 'a1', senderKeylen: 1, src: 'rxlog', hops: 0, isDirect: true, packetType: 'channel-msg' }
    const gps = { lat: 51.0, lon: 4.0, acc_m: 8 }
    const rec = buildRecord(frame, null, cls, gps, '2026-06-29T10:00:00Z')
    expect(rec).toMatchObject({
      rx_at: '2026-06-29T10:00:00Z', raw: 'dead', snr: -3.5, rssi: -92,
      lat: 51.0, lon: 4.0, acc_m: 8, sender_key: 'a1', sender_keylen: 1,
      sender_role: null, is_direct: true, hops: 0, packet_type: 'channel-msg',
    })
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/capture.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement capture.js**

`app/src/capture.js`:
```js
import { bytesToHex } from './meshpacket.js'

export function buildRecord(frame, pkt, cls, gps, nowIso) {
  return {
    rx_at: nowIso,
    raw: bytesToHex(frame.raw),
    snr: frame.snr,
    rssi: frame.rssi,
    lat: gps.lat,
    lon: gps.lon,
    acc_m: gps.acc_m,
    sender_key: cls.senderKey,
    sender_keylen: cls.senderKeylen,
    sender_role: null, // iteration 1: advert role decoding deferred (Task B9)
    is_direct: cls.isDirect,
    hops: cls.hops,
    packet_type: cls.packetType,
  }
}
```

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/capture.test.js`
Expected: PASS.

- [ ] **Step 5: Copy publisher.js, edit topic + payload, write failing test**

`cp ../corescope-rx/src/publisher.js app/src/publisher.js`

`app/src/__tests__/publisher.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { Publisher } from '../publisher.js'

describe('Publisher.buildPayload', () => {
  it('includes hunter DF fields and keeps gps nested', () => {
    const rec = { rx_at: 't', raw: 'dead', snr: -3.5, rssi: -92, lat: 51, lon: 4, acc_m: 8,
      sender_key: 'a1', sender_keylen: 1, sender_role: null, is_direct: true, hops: 0, packet_type: 'channel-msg' }
    const p = Publisher.buildPayload('aabb', rec, 'hunter-1')
    expect(p).toMatchObject({
      origin_id: 'aabb', origin: 'hunter-1', timestamp: 't', type: 'PACKET', direction: 'rx',
      raw: 'dead', SNR: -3.5, RSSI: -92, is_direct: true, hops: 0,
      sender_key: 'a1', sender_keylen: 1, sender_role: null, packet_type: 'channel-msg',
      gps: { lat: 51, lon: 4, acc_m: 8 },
    })
  })
})
```

- [ ] **Step 6: Run (fail), edit publisher, run (pass)**

Run: `cd app && npx vitest run src/__tests__/publisher.test.js` → FAIL.
Edit `buildPayload` to add the new fields and the topic constant:
```js
static buildPayload(rxPubkey, rec, name) {
  return {
    origin_id: rxPubkey,
    origin: name || undefined,
    timestamp: rec.rx_at,
    type: 'PACKET',
    direction: 'rx',
    raw: rec.raw,
    SNR: rec.snr,
    RSSI: rec.rssi,
    is_direct: rec.is_direct,
    hops: rec.hops,
    sender_key: rec.sender_key,
    sender_keylen: rec.sender_keylen,
    sender_role: rec.sender_role,
    packet_type: rec.packet_type,
    gps: { lat: rec.lat, lon: rec.lon, acc_m: rec.acc_m },
  }
}
```
And change the publish topic from `meshcore/client/${rxPubkey}/packets` to `meshcore/hunter/${rxPubkey}/packets`.
Re-run: expected PASS.

- [ ] **Step 7: Commit**
```bash
git add app/src/capture.js app/src/publisher.js app/src/__tests__/capture.test.js app/src/__tests__/publisher.test.js
git commit -m "feat(app): hunter capture record + MQTT payload on meshcore/hunter topic"
```

---

### Task B5: Filter predicates (sender / type / time window / hop) — pure, TDD

**Files:**
- Create: `app/src/filters.js`
- Test: `app/src/__tests__/filters.test.js`

**Interfaces:**
- Produces: `makeFilter(opts)` → `(rec, nowMs) => boolean`, where `opts = { sender:{key,keylen}|null, types:Set<string>|null, windowMs:number|null, directOnly:boolean }`.
  - sender match: prefix-aware (one is a hex prefix of the other), case-insensitive; null sender_key never matches a sender filter.
  - directOnly true → keep only `is_direct`.
  - windowMs → keep only `nowMs - Date.parse(rx_at) <= windowMs`.
  - types → keep only `types.has(rec.packet_type)`.

- [ ] **Step 1: Write failing tests**

`app/src/__tests__/filters.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { makeFilter } from '../filters.js'

const rec = (o) => ({ sender_key: 'aabb', packet_type: 'channel-msg', is_direct: true,
  rx_at: '2026-06-29T10:00:00Z', ...o })
const now = Date.parse('2026-06-29T10:05:00Z')

describe('makeFilter', () => {
  it('isolates a sender by prefix (1-byte matches full key)', () => {
    const f = makeFilter({ sender: { key: 'aa', keylen: 1 }, types: null, windowMs: null, directOnly: false })
    expect(f(rec(), now)).toBe(true)
    expect(f(rec({ sender_key: 'ccdd' }), now)).toBe(false)
    expect(f(rec({ sender_key: null }), now)).toBe(false)
  })
  it('directOnly drops relayed', () => {
    const f = makeFilter({ sender: null, types: null, windowMs: null, directOnly: true })
    expect(f(rec({ is_direct: false }), now)).toBe(false)
    expect(f(rec({ is_direct: true }), now)).toBe(true)
  })
  it('time window drops stale points', () => {
    const f = makeFilter({ sender: null, types: null, windowMs: 10 * 60 * 1000, directOnly: false })
    expect(f(rec({ rx_at: '2026-06-29T09:50:00Z' }), now)).toBe(false)
    expect(f(rec({ rx_at: '2026-06-29T10:01:00Z' }), now)).toBe(true)
  })
  it('type filter keeps only selected types', () => {
    const f = makeFilter({ sender: null, types: new Set(['advert']), windowMs: null, directOnly: false })
    expect(f(rec({ packet_type: 'advert' }), now)).toBe(true)
    expect(f(rec({ packet_type: 'channel-msg' }), now)).toBe(false)
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/filters.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement filters.js**

`app/src/filters.js`:
```js
function hexPrefixMatch(a, b) {
  if (!a || !b) return false
  const x = a.toLowerCase(), y = b.toLowerCase()
  return x.startsWith(y) || y.startsWith(x)
}

export function makeFilter(opts) {
  const { sender, types, windowMs, directOnly } = opts
  return (rec, nowMs) => {
    if (directOnly && !rec.is_direct) return false
    if (sender && !hexPrefixMatch(rec.sender_key, sender.key)) return false
    if (types && !types.has(rec.packet_type)) return false
    if (windowMs != null) {
      const age = nowMs - Date.parse(rec.rx_at)
      if (!(age <= windowMs)) return false
    }
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
git commit -m "feat(app): pure field filter predicates (sender/type/window/hop)"
```

---

### Task B6: Map module — fullscreen Leaflet, points (hop-aware) + hex-heat layers

**Files:**
- Create: `app/src/huntmap.js`, `app/src/signal.js`
- Test: `app/src/__tests__/signal.test.js`
- Copy + adapt (reference): `../corescope-rx/src/hexgrid.js` → `app/src/hexgrid.js`

**Interfaces:**
- Consumes: tokens from `tokens.css`, `hexCellAt`/`hexBoundary` from `hexgrid.js`, filtered records.
- Produces:
  - `signal.snrTier(snr)` → `'hot'|'warm'|'mid'|'cool'|'cold'|'none'` (thermal; hot=strong). Thresholds: `>=-2 hot`, `-5..-2 warm`, `-9..-5 mid`, `-14..-9 cool`, `<-14 cold`, null→`none`.
  - `signal.tierColorVar(tier)` → `--ch-sig-<tier>`; `signal.fillOpacity(tier)` → `0.7/0.58/0.46/0.34/0.24/0.18`.
  - `createHuntMap(containerId)` → `{ setPosition(lat,lon), render(records, nowMs), setLayerMode('points'|'hex'|'both'), applyBasemap(), destroy() }`. The basemap follows `--ch-basemap` (dark/light); the orchestrator re-calls `applyBasemap()` on theme toggle. Points: circleMarkers colour=tier, 0-hop drawn with an accent ring (`--ch-direct-glow`), relayed at `--ch-relayed-fade` opacity; click → popup (snr, rssi, hops, sender_key, sender_role, packet_type) + "Isolate sender" button firing a `hunt:isolate-sender` CustomEvent. Hex: bins filtered records via `hexCellAt`, best-SNR per cell → polygon colour/opacity by tier.

- [ ] **Step 1: Copy hexgrid + write failing signal test**

`cp ../corescope-rx/src/hexgrid.js app/src/hexgrid.js`

`app/src/__tests__/signal.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { snrTier, tierColorVar, fillOpacity } from '../signal.js'

describe('thermal signal tiers (hot = strong)', () => {
  it('maps SNR to tiers', () => {
    expect(snrTier(0)).toBe('hot')
    expect(snrTier(-3)).toBe('warm')
    expect(snrTier(-7)).toBe('mid')
    expect(snrTier(-12)).toBe('cool')
    expect(snrTier(-20)).toBe('cold')
    expect(snrTier(null)).toBe('none')
  })
  it('exposes css var + opacity per tier', () => {
    expect(tierColorVar('hot')).toBe('--ch-sig-hot')
    expect(fillOpacity('hot')).toBeGreaterThan(fillOpacity('cold'))
    expect(fillOpacity('none')).toBeLessThan(fillOpacity('cool'))
  })
})
```

- [ ] **Step 2: Run, verify fail**

Run: `cd app && npx vitest run src/__tests__/signal.test.js`
Expected: FAIL.

- [ ] **Step 3: Implement signal.js**

`app/src/signal.js`:
```js
export function snrTier(snr) {
  if (snr == null) return 'none'
  if (snr >= -2) return 'hot'
  if (snr >= -5) return 'warm'
  if (snr >= -9) return 'mid'
  if (snr >= -14) return 'cool'
  return 'cold'
}
export function tierColorVar(tier) { return `--ch-sig-${tier}` }
const OPACITY = { hot: 0.7, warm: 0.58, mid: 0.46, cool: 0.34, cold: 0.24, none: 0.18 }
export function fillOpacity(tier) { return OPACITY[tier] ?? 0.18 }
```

- [ ] **Step 4: Run, verify pass**

Run: `cd app && npx vitest run src/__tests__/signal.test.js`
Expected: PASS.

- [ ] **Step 5: Implement huntmap.js (no unit test — Leaflet/DOM; verify manually in Task B8)**

`app/src/huntmap.js` — use `L.circleMarker` for points and `L.polygon` for hex. Read tier colours via `getComputedStyle(document.documentElement).getPropertyValue(tierColorVar(tier))`. Key shape:
```js
import { hexCellAt, hexBoundary } from './hexgrid.js'
import { snrTier, tierColorVar, fillOpacity } from './signal.js'

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export function createHuntMap(containerId) {
  if (typeof L === 'undefined') return { setPosition() {}, render() {}, setLayerMode() {}, applyBasemap() {}, destroy() {} }
  const map = L.map(containerId, { zoomControl: false }).setView([51, 4], 14)
  const TILES = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  }
  let base = null
  function applyBasemap() {
    const which = cssVar('--ch-basemap') || 'dark'
    if (base) map.removeLayer(base)
    base = L.tileLayer(TILES[which] || TILES.dark, { maxZoom: 19 }).addTo(map)
  }
  applyBasemap()
  const pointLayer = L.layerGroup().addTo(map)
  const hexLayer = L.layerGroup().addTo(map)
  let mode = 'both', here = null

  function pointStyle(rec) {
    const tier = snrTier(rec.snr)
    return {
      radius: rec.is_direct ? 8 : 6,
      color: rec.is_direct ? cssVar('--ch-direct-glow') : cssVar(tierColorVar(tier)),
      weight: rec.is_direct ? 3 : 1,
      fillColor: cssVar(tierColorVar(tier)),
      fillOpacity: rec.is_direct ? fillOpacity(tier) : fillOpacity(tier) * 0.5,
    }
  }

  function render(records, nowMs) {
    pointLayer.clearLayers(); hexLayer.clearLayers()
    if (mode !== 'hex') {
      for (const r of records) {
        const m = L.circleMarker([r.lat, r.lon], pointStyle(r))
        m.bindPopup(popupHtml(r))
        m.on('popupopen', (e) => wireIsolate(e.popup, r))
        m.addTo(pointLayer)
      }
    }
    if (mode !== 'points') {
      const cells = new Map()
      for (const r of records) {
        const id = hexCellAt(r.lat, r.lon, 11)
        const cur = cells.get(id)
        if (!cur || (r.snr ?? -99) > (cur.best ?? -99)) cells.set(id, { best: r.snr })
      }
      for (const [id, c] of cells) {
        const ring = hexBoundary(id); if (!ring) continue
        const tier = snrTier(c.best)
        L.polygon(ring, { color: cssVar(tierColorVar(tier)), weight: 1,
          fillColor: cssVar(tierColorVar(tier)), fillOpacity: fillOpacity(tier) }).addTo(hexLayer)
      }
    }
  }
  function setPosition(lat, lon) {
    here = here || L.circleMarker([lat, lon], { radius: 6, color: cssVar('--ch-accent'), weight: 2 }).addTo(map)
    here.setLatLng([lat, lon])
  }
  function setLayerMode(m) { mode = m }
  function destroy() { map.remove() }
  return { setPosition, render, setLayerMode, applyBasemap, destroy }
}

function popupHtml(r) {
  const esc = (s) => String(s ?? '—').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  return `<div class="ch-popup">SNR ${esc(r.snr)} · RSSI ${esc(r.rssi)}<br>`
    + `hops ${esc(r.hops)} · ${esc(r.packet_type)}<br>`
    + `sender ${esc(r.sender_key)} (${esc(r.sender_keylen)}B)<br>`
    + `role ${esc(r.sender_role)}<br>`
    + `<button class="ch-isolate" ${r.sender_key ? '' : 'disabled'}>Isolate sender</button></div>`
}
function wireIsolate(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-isolate')
  if (btn && r.sender_key) btn.onclick = () => document.dispatchEvent(
    new CustomEvent('hunt:isolate-sender', { detail: { key: r.sender_key, keylen: r.sender_keylen } }))
}
```

- [ ] **Step 6: Commit**
```bash
git add app/src/huntmap.js app/src/signal.js app/src/hexgrid.js app/src/__tests__/signal.test.js
git commit -m "feat(app): fullscreen hunt map — hop-aware thermal points + hex-heat"
```

---

### Task B7: Orchestrator `app.js` — wire BLE → capture → queue → MQTT + map-from-IndexedDB + HUD/controls

**Files:**
- Create: `app/src/app.js`
- Modify: `app/index.html` (already references `/src/app.js`)
- Test: manual (BLE/MQTT/DOM) — see Verification.

**Interfaces:**
- Consumes: every prior module — `WebBluetoothTransport`, `parseFrame`, `parsePacket`, `classifyReception`, `buildRecord`, `Queue`, `Publisher`, `Gps`, `requestSelfInfo`, `loadConfig`, `createHuntMap`, `makeFilter`, `createWakeLock`.
- Produces: the running app. **Resilience rule:** the map is rendered from `Queue.takeAll()`-style reads of IndexedDB on every tick, never from volatile memory — a BLE/MQTT drop leaves the map intact.

- [ ] **Step 1: Implement app.js orchestration**

`app/src/app.js` — core wiring (condensed; follows CoreDrive RX `app.js` structure but with hunter capture + render-from-store):
```js
import { WebBluetoothTransport } from './transport.js'
import { parseFrame } from './frames.js'
import { parsePacket, classifyReception } from './meshpacket.js'
import { buildRecord } from './capture.js'
import { Queue } from './queue.js'
import { Publisher } from './publisher.js'
import { Gps } from './gps.js'
import { requestSelfInfo } from './selfinfo.js'
import { loadConfig } from './config.js'
import { createHuntMap } from './huntmap.js'
import { makeFilter } from './filters.js'
import { snrTier } from './signal.js'

const state = {
  transport: null, gps: new Gps(), queue: new Queue(), publisher: null,
  rxPubkey: '', name: '', map: null,
  filter: { sender: null, types: null, windowMs: 10 * 60 * 1000, directOnly: true },
  allRecords: [], // mirror of IndexedDB for rendering
}

async function processFrame(dv) {
  const frame = parseFrame(dv)
  if (!frame || frame.code !== 0x88) return
  const pkt = parsePacket(frame.raw)
  if (!pkt) return
  const cls = classifyReception('rx', pkt)
  const fix = state.gps.latest()
  if (!fix) return // no GPS → no row (matches CoreDrive RX rule)
  const rec = buildRecord(frame, pkt, cls, fix, new Date().toISOString())
  await state.queue.add(rec)
  updateHud(rec)
}

async function renderTick() {
  state.allRecords = await state.queue.takeAll() // read-only snapshot; do NOT remove here
  const f = makeFilter(state.filter)
  const now = Date.now()
  const visible = state.allRecords.filter((r) => f(r, now))
  state.map.render(visible, now)
}

async function drain() {
  const pending = await state.queue.takeAll()
  for (const rec of pending) {
    try { await state.publisher.publish(state.rxPubkey, rec, state.name); /* keep in store */ }
    catch { /* leave for next drain; map still shows it */ }
  }
}
// connectAll(): transport.connect → requestSelfInfo → gps.start → Publisher.connect → onFrame(processFrame)
// timers: renderTick every 1s; drain every 5s. (Drain must NOT delete rows — the local map is the
// hunter's working set; dedupe of re-publishes is the backend's concern via raw+rx_at.)
// document.addEventListener('hunt:isolate-sender', (e)=>{ state.filter.sender = e.detail; })
// wire #connect-btn, #layer-toggle (points/hex/both), #filter-btn sheet (type chips, window, directOnly).
```
> Implementer: complete `connectAll`, timers, and the control-sheet wiring against the existing `app/index.html` ids from Task B1. Mirror CoreDrive RX `app.js` connect/teardown flow, but (a) capture via `classifyReception`+`buildRecord`, (b) render from the store snapshot, (c) `drain()` must not delete rows.

- [ ] **Step 2: Build + dev-serve smoke**

Run: `cd app && npm run build`
Expected: build succeeds (no import errors).
Run: `cd app && npm run dev` and load on a phone over LAN/HTTPS; verify the map + HUD render and "Connect" prompts for BLE.

- [ ] **Step 3: Commit**
```bash
git add app/src/app.js
git commit -m "feat(app): orchestrator — capture to IndexedDB, render map from store, drain to MQTT"
```

---

### Task B8: End-to-end field/bench verification + README

**Files:**
- Create: `app/README.md`
- Modify: top-level `README.md` (link `app/` + `server/`)

- [ ] **Step 1: Bench test the pipeline**

With a companion radio: Connect → confirm BLE dot + MQTT dot turn on, SNR HUD updates on traffic, points appear, 0-hop points show the accent ring, relayed points are faded. Toggle layers (points/hex/both). Click a point → popup → "Isolate sender" filters the map. Toggle direct-only ↔ show-all. Kill BLE (walk out of range) → map stays populated. Reconnect → new points resume.

- [ ] **Step 2: Confirm backend receives**

On the ingest host: `curl localhost:8090/healthz` → `ok`. After publishing, query rows: count by `is_direct`, confirm 1-byte `sender_keylen=1` rows exist and `raw` is populated. (DB is UTC.)

- [ ] **Step 3: Write app/README + commit**

`app/README.md`: build/run, config.json fields, the capture rule (1-byte kept, hops=DF axis, publish-all), the thermal map semantics (hot=strong=close), and the "radio via mesh topology, not GPS tracking of the target" statement.
```bash
git add app/README.md README.md
git commit -m "docs: app README + link app/ and server/ from root"
```

---

### Task B9 (deferred within iteration 1): advert `sender_role` decoding

`sender_role` is plumbed end-to-end (column, payload, popup) but stays `null` until the advert role/type flags are decoded **from firmware** (project rule: never guess packet formats). When picked up: read the MeshCore firmware advert struct, add a `parseAdvertRole(pkt)` to `meshpacket.js` returning `'repeater'|'companion'|'room'|'sensor'|null`, set it in `classifyReception` for `src==='advert'`, and surface it in `buildRecord`. Add unit tests against real advert byte fixtures captured on the bench. Do not implement against assumed byte layouts.

---

## Verification (end-to-end)

1. **Backend unit:** `cd server && go test ./...` → all PASS.
2. **PWA unit:** `cd app && npm run test` → meshpacket/capture/publisher/filters/signal suites PASS.
3. **PWA build:** `cd app && npm run build` → no errors.
4. **Backend health:** `curl <host>:8090/healthz` → `ok`.
5. **Live pipeline (bench, Task B8):** companion → BLE → map points + HUD; 1-byte rows captured; 0-hop ring visible; isolate-sender filter works; direct/all toggle works; map survives BLE drop; rows land in `hunter_receptions` with `raw` + `is_direct` + `sender_keylen` populated.
6. **Distinct UI check:** side-by-side with CoreScope/CoreDrive RX — map-first HUD, `--ch-*` thermal palette, no tabbed node browser. Confirms the look & feel requirement.

## Self-review notes (coverage)

- Spec §Peilmethode (hops first-class, 0-hop goal, non-advertising companion) → Tasks B3 (hops axis, unattributed-0-hop kept), B6 (0-hop ring, thermal), B5 (direct toggle).
- Spec §Capture toggle (direct-only-incl-1byte ↔ show-all; publish all) → B3/B5/B7 (render filter vs publish-everything).
- Spec §Filters (sender/type/window/direct) → B5.
- Spec §Map (points + hex, toggle) → B6.
- Spec §Resilience (render from IndexedDB) → B7 render-from-store, drain does not delete.
- Spec §Datamodel + §MQTT contract → A2 (schema/no-purge) + B4 (payload) — field names aligned (`is_direct,hops,sender_key,sender_keylen,sender_role,packet_type,gps{}`).
- Spec §Backend (Go ingestor, own DB, no purge) → A1–A4.
- `sender_role` (opportunistic, firmware-gated) → plumbed B2/B4 + deferred decode B9.
