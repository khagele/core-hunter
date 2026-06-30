# RSSI Locate — live transmitter-location estimation on the analysis website

Date: 2026-06-30

## Goal

Add a **Locate** overlay to the analysis website that estimates *where a selected
node is* from the receive points (lat/lon) and RSSI values logged by **all hunters**
over a timeframe, and updates **live** as new data arrives. A follower on the website
sees the search area tighten and can direct the hunters in the field — each hunter's
app shows only its own data, the website aggregates everyone's.

This is the post-hoc / live **coordination view**; the per-hunter live "hot/cold"
scanner stays in the PWA.

## What this is / is not

- **Is:** a *search-area estimate* — best-guess centroid + an uncertainty heatmap to
  narrow a field search — plus convergence/geometry feedback that guides driving.
- **Is not:** GPS tracking of the target, nor a precise fix. We infer *position* from
  radio coverage / mesh topology, not transport mode.
- **Accuracy reality (state it in the UI):** without the node's TX power, antenna and
  path-loss exponent, *absolute* trilateration is not reliably recoverable — RSSI's
  exponential distance dependence turns routine 6–10 dB shadowing/body/vehicle swings
  into ±50–100 % distance error. A single sparse one-sided pass is **hundreds of
  metres**. **Active encirclement with strong signals tightens it to street-scale
  (tens of metres)** — which is exactly this tool's workflow. The final tens of metres
  are for the live scanner, not this estimate.

## Method (chosen)

**RSSI-weighted centroid + RSSI-weighted kernel-density heatmap.** TX-power-free (uses
only relative RSSI). No off-the-shelf JS library fits: trilateration/multilateration
libs (`trilat`, `gheja/trilateration.js`, `lemmingapex`) consume *calibrated
distances* we don't have, which would feed a precise solver garbage → false
confidence. The Weighted Centroid Localization (WCL) family is the honest fit and is
~tens of lines on top of our existing geo + heat rendering.

## Data source

- Bulk fetch `GET /api/points?sender=<id>&from=&to=` **without bbox** → every reception
  of that sender in the timeframe, across all hunters. (No new endpoint; `bbox` is
  already optional server-side.)
- Per point: `{lat, lon, rssi, acc_m, rx_at, hunter_pubkey}`.
- **Live:** while Locate is active, poll every **~5 s**, recompute, redraw. Latency is
  negligible for a drive-around hunt (data is motion-gated, seconds apart). Phase 2:
  replace polling with server SSE push.

## Identity handling

- Locate any selected `sender_id`. Full pubkey (64 hex) is unique. A 1-byte hash is
  **assumed to be a single node** — within one reception region the chance of two nodes
  sharing the first byte is small in practice — **but** geographic outliers are
  auto-flagged as probable colliding-node contamination (see algorithm step 1).
- UI note for 1-byte IDs: "assumed one node · N outliers excluded".

## Algorithm — `web/locate.js` (pure functions, no DOM/Leaflet)

Input: `[{lat, lon, rssi, acc_m}]`.

1. **Outlier rejection.** Compute the RSSI-weighted geographic median; robust spread via
   MAD of each point's distance to it. Points beyond `k·MAD` (and/or an absolute
   reception-region cap) → flagged as outliers: **excluded** from the estimate, returned
   separately for greyed/dashed rendering. Removes 1-byte collisions *and* stray points
   that would bias the centroid.
2. **Weighted centroid** over inliers. Weight `wᵢ` increases with signal (normalized
   RSSI on a ~−120..−40 dBm scale, or `10^(rssi/10)`); optional strongest-N
   robustification. `p̂ = Σ wᵢ·posᵢ / Σ wᵢ`. (GPS-accuracy down-weighting via `acc_m`
   is deferred — see Phase 2.)
3. **Kernel-density heatmap.** Grid over the inlier bounding box (~60×60 cells, adaptive
   to zoom). Each inlier adds a Gaussian kernel weighted by RSSI (stronger = taller,
   narrower). Sum per cell, normalize 0..1 → existing heat tokens. This is the
   "uncertainty cloud", and it concentrates as strong-signal samples accumulate.
4. **Convergence / geometry stats.**
   - `searchRadiusM`: weighted spread (weighted RMS distance to centroid, or radius
     containing X % of weight) → **shrinks** as good, spread data accumulates.
   - `encirclement` (GDOP-like): angular coverage of inliers around the centroid
     (fraction of azimuth bins occupied). Low → one-sided sampling; surface a hint
     "drive to the other side to improve".

Output: `{centroid, heatmapCells, usedPoints, outliers, stats:{n, searchRadiusM, encirclement}}`.

## UI — `web/map.js` + `web/index.html`

- **Locate** button in the filter bar; uses the existing `sender` + `from`/`to` fields.
  Toggles the locate layer + live polling.
- Layer: observation points (colour = RSSI tokens), kernel-density heatmap (heat
  tokens), **centroid marker** in a distinct *estimated* style (not a real-node icon,
  à la meshtastic-groundcontrol's yellow/red), outliers greyed/dashed.
- Info card: `n` points, **live-shrinking search radius**, encirclement hint, identity
  note, and the honesty caveat ("within driven area · ~hundreds of m · no TX
  calibration").
- Live: poll every 5 s → recompute → redraw; the numbers visibly converge so the
  follower can steer the hunters.

## Edge cases

- `< 3` inliers → show points + "too few observations"; no centroid/heatmap.
- Stationary (all points ~same spot) → centroid + "no spread / stationary".
- All points flagged outliers / degenerate geometry → graceful message, no false fix.

## Testing

`web/locate.js` is logic → tests required (project rule). `web/` has no test harness
yet → add a minimal **vitest** setup for `web/`. Cases: outlier rejection (tight
cluster + stray), weighted centroid (known input → expected coord), heatmap
normalization (peak/sum), search-radius shrink when near points are added,
encirclement (one-sided vs surrounded), `< 3`-points edge.

## Phase 2 (YAGNI now)

- **SSE push** from the ingestor → true real-time, replaces polling.
- **Self-calibrating log-normal likelihood grid** (particle filter fits the path-loss
  exponent from the data) for a rigorous likelihood surface.
- **"Not-heard" negative evidence** (locations where the node was *not* heard bound the
  area).
- **GPS-accuracy down-weighting** — weight each point by `acc_m` (a 100 m fix should count
  less than a 5 m fix). Plumbed-but-unused for now; left out of v1 to avoid untested weight
  tuning.
- **Heatmap cost** — the kernel grid is O(rows·cols·N) haversines per poll (~4096·N every
  5 s); fine for typical N, revisit (downsample / web worker) for very busy senders.
- Shareable/persisted locate sessions.

## References (research, 2026-06-30)

- WCL & convex-hull bias: Blumenthal et al. 2007 (IEEE ISP); MDPI Sensors 2018
  (PMC5948779).
- Accuracy benchmark: Antwerp LoRaWAN ~150–400 m median (arXiv 1908.05085); calibrated
  short-range LoRa few-metre only with tuned path-loss (arXiv 1912.07801).
- Community analogs: meshmap.ro (SNR-weighted estimate), apocas/meshtastic-groundcontrol
  (estimated-position UX tiers), PortaPack Fox Hunt (RSSI-gradient steering).
- Libraries surveyed: no direct-RSSI localizer worth adopting; `geolib` for geo math;
  `ml-levenberg-marquardt` only if a calibrated path-loss model is ever introduced.
