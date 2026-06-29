# core-hunter — Handover (resume on another system)

> Last updated: 2026-06-29. Read this first when picking the project up on a new machine.
> Everything below is committed to **https://github.com/efiten/core-hunter** (private, branch `master`).

## TL;DR

- **Phase A (Go MQTT ingestor, `server/`) is COMPLETE, reviewed, and pushed.** Builds CGO-free, all tests green.
- **Phase B (mobile hunter PWA, `app/`) is NOT started.** Full task-by-task plan is written and committed.
- **Deploy is PENDING** (ingestor not yet running on the server) — see "Deploy" below; needs an EMQX account + your go-ahead.

## Resume on a new machine

```bash
git clone https://github.com/efiten/core-hunter.git
cd core-hunter
# Phase A sanity check (needs Go 1.24+):
cd server && go test ./... && go build ./... && go vet ./...
```

Toolchain you'll need:
- **Go 1.24+** (paho.mqtt.golang requires the 1.24 language floor) — for `server/`.
- **Node 18+ / npm** — for `app/` (Phase B, Vite + Vitest). Not needed yet.
- **Docker** — only on the deploy host (the ingestor ships as a distroless container). Not needed for dev.

## Where everything lives

| What | Path |
|---|---|
| Project intent, scope, building blocks | `CLAUDE.md` |
| Iteration-1 design (architecture, data model, MQTT contract) | `docs/superpowers/specs/2026-06-28-core-hunter-mobile-hunter-design.md` |
| Brainstorm decisions log (all Q/options/answers) | `docs/2026-06-28-iteration-1-decisions.md` |
| **Implementation plan (bite-sized TDD tasks A1–A4, B1–B9)** | `docs/superpowers/plans/2026-06-29-core-hunter-mobile-hunter.md` |
| Contributor guide (for going public / other devs) | `AGENTS.md` |
| Backend code | `server/` |
| Frontend code (Phase B) | `app/` (to be created) |

> Note: the subagent-driven-development progress ledger lived in `.superpowers/sdd/` which is git-ignored scratch and does NOT travel with the repo. This HANDOVER file is the durable resume state. Git history (`git log --oneline`) is the authoritative record of what was built.

## Phase A — what's built (server/)

A Go service that subscribes to `meshcore/hunter/+/packets` (QoS1) and stores **every** reception in its own SQLite DB with **no purge** (full `raw` packet hex always retained, for later analysis).

Packages:
- `internal/config` — `config.Load(path)`; defaults topic `meshcore/hunter/+/packets`, db `data/hunter.db`, addr `:8090`.
- `internal/store` — `hunter_receptions` schema (no TTL), `ParsePayload(topic,body,ingestedAt)`, `Open/Insert/InsertRaw/Close`. SQLite via `modernc.org/sqlite` (CGO-free), single-writer pool, `busy_timeout`+WAL.
- `internal/ingest` — `Handle(Store, topic, body, now)`: broker-independent, **never drops a message** (parse-fail / empty / insert-fail all divert to the `raw_messages` dead-letter table).
- `cmd/ingestor` — wires config → store → paho MQTT → `ingest.Handle`; persistent session, `/healthz` (503 when MQTT down), graceful SIGTERM shutdown.

Hardening applied after a whole-branch review (all committed):
- **No data loss:** `raw_messages` dead-letter table catches parse + insert failures.
- **Persistent MQTT session** (`CleanSession=false`) so the broker queues messages while the ingestor is down.
- `/healthz` reflects MQTT connection; graceful shutdown closes the store; non-root distroless image.

MQTT payload contract the PWA must produce (Phase B builds this):
```json
{ "origin_id": "<rxPubkey>", "origin": "<name>", "timestamp": "<rx_at RFC3339>",
  "type": "PACKET", "direction": "rx", "raw": "<hex>", "SNR": -3.5, "RSSI": -92,
  "is_direct": true, "hops": 0, "sender_key": "a1", "sender_keylen": 1,
  "sender_role": null, "packet_type": "channel-msg",
  "gps": { "lat": 51.0, "lon": 4.0, "acc_m": 8 } }
```

## Deploy (PENDING — needs your go-ahead)

Not done yet. Steps when ready (host: deploy-host, per `~/.claude/CLAUDE.md`):
1. **Create an EMQX account** for the ingestor with subscribe rights on `meshcore/hunter/#` (ask/confirm before creating broker credentials).
2. Fill `server/config.json` from `server/config.example.json` (broker URL, user, pass).
3. Build + run (Docker on the host):
   ```bash
   docker build -t core-hunter-ingestor server/
   docker run -d --name core-hunter-ingestor --restart unless-stopped \
     -p 8090:8090 \
     -v $(pwd)/server/config.json:/app/config.json:ro \
     -v core-hunter-data:/app/data core-hunter-ingestor
   ```
4. **Non-root gotcha:** the image runs as uid 65532 (distroless nonroot). The `core-hunter-data` volume must be writable by that uid — `chown 65532:65532` the volume's mountpoint (or pre-create it) or the DB open will fail.
5. Verify: `curl localhost:8090/healthz` → `ok` (503 until MQTT connects).

## Phase B — how to continue (app/)

The plan's tasks **B1–B9** are fully specified (file paths, complete code, tests). Execution approach used so far is **subagent-driven-development** (one implementer subagent per task → task review → fix loop → final whole-branch review). To resume:

1. Open the plan, start at **Task B1** (PWA scaffold + design system).
2. Re-run the SDD loop (or implement inline) task by task.

Key Phase B decisions already locked (don't re-litigate):
- **Separate from CoreDrive RX**: fork its modules into `app/`, then adapt.
- **Capture rule** (`classifyReception` in `meshpacket.js`): keep **1-byte** prefixes (CoreDrive RX drops them); `is_direct = hops.length===0`; publish **everything** to MQTT (the direct/all toggle only filters the local view). Plot even unattributed 0-hop packets (a non-advertising companion has no advert/pubkey — found via its traffic + signal).
- **Map**: fullscreen Leaflet, two toggle layers — hop-aware points (0-hop highlighted, relayed faded) + hex-heat gradient. **Thermal semantics: hot = strong = close** ("drive toward the heat").
- **Look & feel must differ from CoreScope/CoreDrive RX**: map-first HUD (no tabbed browser), `--ch-*` tokens, **own main colours for BOTH light and dark themes** (not one theme with inverted tiles).
- **`sender_role`** is plumbed end-to-end but stays `null` until decoded **from firmware** (Task B9, firmware-authoritative — never guess byte layouts).

## Open items / notes

- Go floor was raised **1.22 → 1.24** during Phase A (paho + golang.org/x/* require it); plan + Dockerfile updated.
- Durability model: the PWA's IndexedDB queue drains to the broker; with the ingestor's persistent session the broker holds QoS1 messages during ingestor downtime — together that's the "no lost receptions" guarantee. Confirm on first real deploy.
- A query API / GeoJSON endpoints and the multi-hunter bundling **website** are a later iteration (not in this plan).
