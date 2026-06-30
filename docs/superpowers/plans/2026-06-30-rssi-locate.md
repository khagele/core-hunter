# RSSI Locate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a live "Locate" overlay to the analysis website that estimates where a selected node is, from all hunters' (lat, lon, RSSI) points, and tightens as data streams in.

**Architecture:** A pure, DOM-free math module `web/locate.js` (RSSI-weighted centroid + kernel-density heatmap + outlier rejection + convergence stats) is unit-tested with vitest. `web/map.js` adds a Locate layer that bulk-fetches `/api/points?sender=&from=&to=` (no bbox), runs `locate()`, renders points/heatmap/centroid, and re-polls every 5 s. No server changes.

**Tech Stack:** Vanilla JS ES modules, Leaflet 1.9.4, vitest (dev-only, web/).

## Global Constraints

- Client-side only — **no server/Go changes**.
- All colours via CSS variables — no hardcoded hex/rgb. Canvas pixels read `--ch-sig-*` tokens via `getComputedStyle` (reuse `map.js`'s `cssVar`).
- No per-item frontend API calls — one bulk query per poll cycle.
- `web/` stays static-deployable: the vitest harness (`web/package.json`, `web/node_modules`) is dev-only, gitignored, and never in the deploy scp set.
- Tests required for all logic (vitest).
- `web/locate.js` is pure — no DOM, no Leaflet, no `config.js` import.
- Honesty caveats must appear in the UI (within-driven-area · ~hundreds of m · no TX calibration).
- Live poll interval: **5000 ms**.
- Point shape from `/api/points`: `{lat, lon, rssi, snr, sender_id, sender_label, hunter_name, ...}`.

---

## File Structure

- Create `web/locate.js` — pure estimation math (exports: `haversineM`, `rssiWeight`, `weightedCentroid`, `rejectOutliers`, `densityGrid`, `geometryStats`, `locate`).
- Create `web/locate.test.js` — vitest unit tests.
- Create `web/package.json` — dev-only vitest harness for `web/`.
- Modify `web/index.html` — Locate button + info-card container.
- Modify `web/style.css` — info card, centroid marker, outlier point styles.
- Modify `web/map.js` — Locate layer: fetch, render, live polling.

---

### Task 1: Web test harness + core math (haversine, rssiWeight, weightedCentroid)

**Files:**
- Create: `web/package.json`
- Create: `web/locate.js`
- Test: `web/locate.test.js`

**Interfaces:**
- Produces:
  - `haversineM(a, b) -> number` — metres between `{lat,lon}` points.
  - `rssiWeight(rssi) -> number` — weight in `[0,1]`, linear −120..−40 dBm, clamped; `0` for null/NaN.
  - `weightedCentroid(points) -> {lat,lon} | null` — RSSI-weighted mean; `null` if total weight 0.

- [ ] **Step 1: Create the dev-only test harness**

Create `web/package.json`:

```json
{
  "name": "core-hunter-web",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run"
  },
  "devDependencies": {
    "vitest": "^2.1.9"
  }
}
```

- [ ] **Step 2: Install + confirm node_modules is ignored**

Run: `cd web && npm install`
Run: `cd web && git status --porcelain` — confirm `web/node_modules` does NOT appear (root `.gitignore` ignores `node_modules/`). If it appears, add `node_modules/` to `web/.gitignore`.

- [ ] **Step 3: Write the failing test**

Create `web/locate.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { haversineM, rssiWeight, weightedCentroid } from './locate.js'

describe('haversineM', () => {
  it('is ~0 for identical points', () => {
    expect(haversineM({ lat: 51, lon: 4 }, { lat: 51, lon: 4 })).toBeCloseTo(0, 5)
  })
  it('matches a known ~111.2 km per degree of latitude', () => {
    const d = haversineM({ lat: 51, lon: 4 }, { lat: 52, lon: 4 })
    expect(d).toBeGreaterThan(111000)
    expect(d).toBeLessThan(111400)
  })
})

describe('rssiWeight', () => {
  it('clamps weak to 0 and strong to 1', () => {
    expect(rssiWeight(-130)).toBe(0)
    expect(rssiWeight(-30)).toBe(1)
  })
  it('is 0.5 at the midpoint (-80 dBm)', () => {
    expect(rssiWeight(-80)).toBeCloseTo(0.5, 6)
  })
  it('returns 0 for null/NaN', () => {
    expect(rssiWeight(null)).toBe(0)
    expect(rssiWeight(NaN)).toBe(0)
  })
})

describe('weightedCentroid', () => {
  it('is the midpoint for two equal-RSSI points', () => {
    const c = weightedCentroid([
      { lat: 0, lon: 0, rssi: -80 },
      { lat: 2, lon: 4, rssi: -80 },
    ])
    expect(c.lat).toBeCloseTo(1, 6)
    expect(c.lon).toBeCloseTo(2, 6)
  })
  it('is pulled toward the stronger point', () => {
    const c = weightedCentroid([
      { lat: 0, lon: 0, rssi: -40 }, // weight 1
      { lat: 10, lon: 0, rssi: -80 }, // weight 0.5
    ])
    // (1*0 + 0.5*10)/1.5 = 3.333...
    expect(c.lat).toBeCloseTo(10 / 3, 5)
  })
  it('returns null when all weights are 0', () => {
    expect(weightedCentroid([{ lat: 1, lon: 1, rssi: -130 }])).toBeNull()
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

Run: `cd web && npx vitest run locate.test.js`
Expected: FAIL — `Failed to resolve import "./locate.js"` / functions undefined.

- [ ] **Step 5: Write minimal implementation**

Create `web/locate.js`:

```js
// Pure transmitter-location estimation from (lat, lon, rssi, acc_m) receive
// points. RSSI-weighted centroid + kernel-density heatmap; no TX-power
// calibration, no DOM/Leaflet. See docs/superpowers/specs/2026-06-30-rssi-locate-design.md.

const R_EARTH_M = 6371000
const RSSI_MIN = -120 // weak end of the weight ramp (dBm)
const RSSI_MAX = -40 // strong end of the weight ramp (dBm)

// Great-circle distance in metres between two {lat, lon}.
export function haversineM(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R_EARTH_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

// RSSI (dBm) -> weight in [0,1], linear over RSSI_MIN..RSSI_MAX, clamped.
export function rssiWeight(rssi) {
  if (rssi == null || Number.isNaN(rssi)) return 0
  const w = (rssi - RSSI_MIN) / (RSSI_MAX - RSSI_MIN)
  return Math.max(0, Math.min(1, w))
}

// RSSI-weighted centroid of [{lat,lon,rssi}]. null when total weight is 0.
export function weightedCentroid(points) {
  let sw = 0, slat = 0, slon = 0
  for (const p of points) {
    const w = rssiWeight(p.rssi)
    sw += w; slat += w * p.lat; slon += w * p.lon
  }
  if (sw === 0) return null
  return { lat: slat / sw, lon: slon / sw }
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd web && npx vitest run locate.test.js`
Expected: PASS (10 tests).

- [ ] **Step 7: Commit**

```bash
git add web/package.json web/locate.js web/locate.test.js
git commit -m "feat(web): locate.js core math + web vitest harness"
```

---

### Task 2: Outlier rejection

**Files:**
- Modify: `web/locate.js`
- Test: `web/locate.test.js`

**Interfaces:**
- Consumes: `haversineM` (Task 1).
- Produces:
  - `rejectOutliers(points, opts?) -> { inliers, outliers }` where `opts = { factor?, floorM? }`.
    Center = coordinate-wise median; a point is an outlier if its distance to the
    center exceeds `max(factor * medianDistance, floorM)` (defaults `factor=4`,
    `floorM=200`). Fewer than 3 points → all inliers.

- [ ] **Step 1: Write the failing test**

Append to `web/locate.test.js`:

```js
import { rejectOutliers } from './locate.js'

describe('rejectOutliers', () => {
  const cluster = [
    { lat: 51.0000, lon: 4.0000, rssi: -70 },
    { lat: 51.0002, lon: 4.0001, rssi: -72 },
    { lat: 51.0001, lon: 4.0003, rssi: -75 },
    { lat: 50.9999, lon: 3.9998, rssi: -73 },
  ]

  it('flags a single far stray (colliding node) and keeps the cluster', () => {
    const stray = { lat: 51.5, lon: 4.6, rssi: -95 } // ~70 km away
    const { inliers, outliers } = rejectOutliers([...cluster, stray])
    expect(outliers).toHaveLength(1)
    expect(outliers[0]).toEqual(stray)
    expect(inliers).toHaveLength(4)
  })

  it('flags nothing for a tight stationary cluster (GPS jitter only)', () => {
    const { outliers } = rejectOutliers(cluster)
    expect(outliers).toHaveLength(0)
  })

  it('returns all inliers when fewer than 3 points', () => {
    const two = cluster.slice(0, 2)
    expect(rejectOutliers(two)).toEqual({ inliers: two, outliers: [] })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run locate.test.js`
Expected: FAIL — `rejectOutliers is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `web/locate.js`:

```js
const OUTLIER_FACTOR = 4
const MIN_OUTLIER_M = 200

// Median of a numeric array (0 for empty).
function median(xs) {
  if (!xs.length) return 0
  const s = [...xs].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

// Split points into inliers/outliers. Robust center = coordinate-wise median;
// outlier if distance > max(factor * medianDistance, floorM). This catches a
// lone far stray (a colliding 1-byte node) without flagging GPS jitter in a
// tight/stationary cluster (where MAD would collapse to 0).
export function rejectOutliers(points, opts = {}) {
  const factor = opts.factor ?? OUTLIER_FACTOR
  const floorM = opts.floorM ?? MIN_OUTLIER_M
  if (points.length < 3) return { inliers: points.slice(), outliers: [] }
  const center = {
    lat: median(points.map((p) => p.lat)),
    lon: median(points.map((p) => p.lon)),
  }
  const dists = points.map((p) => haversineM(p, center))
  const threshold = Math.max(factor * median(dists), floorM)
  const inliers = []
  const outliers = []
  points.forEach((p, i) => (dists[i] > threshold ? outliers : inliers).push(p))
  return { inliers, outliers }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run locate.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/locate.js web/locate.test.js
git commit -m "feat(web): locate.js geographic outlier rejection"
```

---

### Task 3: Kernel-density heatmap grid

**Files:**
- Modify: `web/locate.js`
- Test: `web/locate.test.js`

**Interfaces:**
- Consumes: `haversineM`, `rssiWeight` (Task 1).
- Produces:
  - `densityGrid(points, opts?) -> { grid: Float32Array, rows, cols, bounds }`
    where `opts = { cols?, rows? }` (defaults 64×64), `bounds = {minLat,minLon,maxLat,maxLon}`,
    and `grid` is row-major (row 0 = `minLat`/south), normalized to `[0,1]` (peak = 1).

- [ ] **Step 1: Write the failing test**

Append to `web/locate.test.js`:

```js
import { densityGrid } from './locate.js'

describe('densityGrid', () => {
  const pts = [
    { lat: 51.000, lon: 4.000, rssi: -60 },
    { lat: 51.010, lon: 4.010, rssi: -90 },
    { lat: 50.990, lon: 3.990, rssi: -90 },
  ]

  it('returns a normalized grid of the requested size', () => {
    const { grid, rows, cols } = densityGrid(pts, { cols: 16, rows: 16 })
    expect(grid).toHaveLength(16 * 16)
    expect(Math.max(...grid)).toBeCloseTo(1, 6) // peak normalized to 1
    expect(Math.min(...grid)).toBeGreaterThanOrEqual(0)
  })

  it('peaks nearer the strongest-RSSI point', () => {
    const { grid, rows, cols, bounds } = densityGrid(pts, { cols: 16, rows: 16 })
    let best = 0, bi = 0
    grid.forEach((v, i) => { if (v > best) { best = v; bi = i } })
    const r = Math.floor(bi / cols), c = bi % cols
    const lat = bounds.minLat + ((r + 0.5) / rows) * (bounds.maxLat - bounds.minLat)
    const lon = bounds.minLon + ((c + 0.5) / cols) * (bounds.maxLon - bounds.minLon)
    // strongest point is at (51.000, 4.000); peak cell should be closer to it
    // than to the weak point at (51.010, 4.010)
    const dStrong = Math.hypot(lat - 51.0, lon - 4.0)
    const dWeak = Math.hypot(lat - 51.01, lon - 4.01)
    expect(dStrong).toBeLessThan(dWeak)
  })

  it('returns an all-zero grid for no points', () => {
    const { grid } = densityGrid([], { cols: 8, rows: 8 })
    expect(Math.max(...grid)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run locate.test.js`
Expected: FAIL — `densityGrid is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `web/locate.js`:

```js
const DEFAULT_COLS = 64
const DEFAULT_ROWS = 64

// Bounding box of points, padded by marginFrac on each side.
function boundsOf(points, marginFrac = 0.15) {
  let minLat = Infinity, minLon = Infinity, maxLat = -Infinity, maxLon = -Infinity
  for (const p of points) {
    minLat = Math.min(minLat, p.lat); maxLat = Math.max(maxLat, p.lat)
    minLon = Math.min(minLon, p.lon); maxLon = Math.max(maxLon, p.lon)
  }
  const dLat = (maxLat - minLat) || 0.001
  const dLon = (maxLon - minLon) || 0.001
  return {
    minLat: minLat - dLat * marginFrac, maxLat: maxLat + dLat * marginFrac,
    minLon: minLon - dLon * marginFrac, maxLon: maxLon + dLon * marginFrac,
  }
}

// RSSI-weighted Gaussian kernel-density grid over the points' bounds, normalized
// 0..1. Each point adds weight * exp(-d^2 / 2sigma^2); sigma tightens for strong
// points (stronger -> a sharper, more localized hot spot). Row 0 = minLat (south).
export function densityGrid(points, opts = {}) {
  const cols = opts.cols ?? DEFAULT_COLS
  const rows = opts.rows ?? DEFAULT_ROWS
  const bounds = boundsOf(points.length ? points : [{ lat: 0, lon: 0 }])
  const grid = new Float32Array(rows * cols)
  if (!points.length) return { grid, rows, cols, bounds }
  const diagM = haversineM(
    { lat: bounds.minLat, lon: bounds.minLon },
    { lat: bounds.maxLat, lon: bounds.maxLon },
  )
  const baseSigma = Math.max(diagM * 0.12, 30)
  let peak = 0
  for (let r = 0; r < rows; r++) {
    const lat = bounds.minLat + ((r + 0.5) / rows) * (bounds.maxLat - bounds.minLat)
    for (let c = 0; c < cols; c++) {
      const lon = bounds.minLon + ((c + 0.5) / cols) * (bounds.maxLon - bounds.minLon)
      let v = 0
      for (const p of points) {
        const w = rssiWeight(p.rssi)
        if (w === 0) continue
        const sigma = baseSigma * (1.1 - 0.6 * w) // strong -> tighter kernel
        const d = haversineM({ lat, lon }, p)
        v += w * Math.exp(-(d * d) / (2 * sigma * sigma))
      }
      grid[r * cols + c] = v
      if (v > peak) peak = v
    }
  }
  if (peak > 0) for (let i = 0; i < grid.length; i++) grid[i] /= peak
  return { grid, rows, cols, bounds }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run locate.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/locate.js web/locate.test.js
git commit -m "feat(web): locate.js RSSI-weighted kernel-density heatmap"
```

---

### Task 4: Convergence / geometry stats

**Files:**
- Modify: `web/locate.js`
- Test: `web/locate.test.js`

**Interfaces:**
- Consumes: `haversineM`, `rssiWeight` (Task 1).
- Produces:
  - `geometryStats(points, centroid) -> { n, searchRadiusM, encirclement }`.
    `searchRadiusM` = RSSI-weighted RMS distance to `centroid` (`null` if no centroid/points).
    `encirclement` = fraction of 8 azimuth sectors around `centroid` containing a point (`0..1`).

- [ ] **Step 1: Write the failing test**

Append to `web/locate.test.js`:

```js
import { geometryStats } from './locate.js'

describe('geometryStats', () => {
  const centroid = { lat: 51, lon: 4 }

  it('encirclement is low for one-sided sampling, high when surrounded', () => {
    const oneSide = [
      { lat: 51.01, lon: 4.00, rssi: -70 },
      { lat: 51.02, lon: 4.00, rssi: -70 },
      { lat: 51.03, lon: 4.00, rssi: -70 },
    ]
    const around = [
      { lat: 51.01, lon: 4.00, rssi: -70 },
      { lat: 50.99, lon: 4.00, rssi: -70 },
      { lat: 51.00, lon: 4.01, rssi: -70 },
      { lat: 51.00, lon: 3.99, rssi: -70 },
    ]
    expect(geometryStats(oneSide, centroid).encirclement).toBeLessThan(0.3)
    expect(geometryStats(around, centroid).encirclement).toBeGreaterThan(0.4)
  })

  it('search radius shrinks when points are closer to the centroid', () => {
    const far = [
      { lat: 51.05, lon: 4, rssi: -70 }, { lat: 50.95, lon: 4, rssi: -70 },
    ]
    const near = [
      { lat: 51.005, lon: 4, rssi: -70 }, { lat: 50.995, lon: 4, rssi: -70 },
    ]
    expect(geometryStats(near, centroid).searchRadiusM)
      .toBeLessThan(geometryStats(far, centroid).searchRadiusM)
  })

  it('returns null radius for no centroid', () => {
    expect(geometryStats([{ lat: 51, lon: 4, rssi: -70 }], null).searchRadiusM).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run locate.test.js`
Expected: FAIL — `geometryStats is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `web/locate.js`:

```js
// Convergence + geometry feedback. searchRadiusM = RSSI-weighted RMS distance to
// the centroid (shrinks as good data accumulates). encirclement = fraction of 8
// azimuth sectors around the centroid that contain a point (low = one-sided).
export function geometryStats(points, centroid) {
  if (!centroid || !points.length) {
    return { n: points.length, searchRadiusM: null, encirclement: 0 }
  }
  let sw = 0, swd2 = 0
  const sectors = new Array(8).fill(false)
  for (const p of points) {
    const w = rssiWeight(p.rssi)
    const d = haversineM(p, centroid)
    sw += w; swd2 += w * d * d
    const ang = Math.atan2(p.lon - centroid.lon, p.lat - centroid.lat) // [-pi, pi]
    const sector = (Math.floor((ang + Math.PI) / (Math.PI / 4)) % 8 + 8) % 8
    sectors[sector] = true
  }
  const searchRadiusM = sw > 0 ? Math.sqrt(swd2 / sw) : null
  const encirclement = sectors.filter(Boolean).length / 8
  return { n: points.length, searchRadiusM, encirclement }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run locate.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add web/locate.js web/locate.test.js
git commit -m "feat(web): locate.js convergence + encirclement stats"
```

---

### Task 5: `locate()` orchestrator

**Files:**
- Modify: `web/locate.js`
- Test: `web/locate.test.js`

**Interfaces:**
- Consumes: `rejectOutliers`, `weightedCentroid`, `densityGrid`, `geometryStats`.
- Produces:
  - `locate(points, opts?) -> { centroid, heatmap, inliers, outliers, stats }`.
    `centroid` and `heatmap` are `null` when `< 3` inliers; `opts` is forwarded to
    `rejectOutliers` and `densityGrid`.

- [ ] **Step 1: Write the failing test**

Append to `web/locate.test.js`:

```js
import { locate } from './locate.js'

describe('locate', () => {
  const pts = [
    { lat: 51.000, lon: 4.000, rssi: -60, acc_m: 8 },
    { lat: 51.002, lon: 4.001, rssi: -72, acc_m: 8 },
    { lat: 50.999, lon: 3.998, rssi: -75, acc_m: 8 },
    { lat: 51.001, lon: 4.003, rssi: -80, acc_m: 8 },
  ]

  it('produces a centroid, heatmap and stats for enough inliers', () => {
    const res = locate(pts)
    expect(res.centroid).toHaveProperty('lat')
    expect(res.heatmap.grid.length).toBeGreaterThan(0)
    expect(res.stats.n).toBe(4)
    expect(res.outliers).toHaveLength(0)
  })

  it('separates a far stray into outliers and excludes it from the centroid', () => {
    const stray = { lat: 52.0, lon: 5.0, rssi: -95, acc_m: 8 }
    const res = locate([...pts, stray])
    expect(res.outliers).toContainEqual(stray)
    expect(res.centroid.lat).toBeLessThan(51.5) // stray did not drag it north
  })

  it('returns null centroid/heatmap when too few inliers', () => {
    const res = locate(pts.slice(0, 2))
    expect(res.centroid).toBeNull()
    expect(res.heatmap).toBeNull()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd web && npx vitest run locate.test.js`
Expected: FAIL — `locate is not a function`.

- [ ] **Step 3: Write minimal implementation**

Add to `web/locate.js`:

```js
// Full estimate from raw receive points [{lat,lon,rssi,acc_m}]. Rejects outliers,
// then computes the weighted centroid, density heatmap and geometry stats over the
// inliers. centroid/heatmap are null when fewer than 3 inliers remain.
export function locate(points, opts = {}) {
  const { inliers, outliers } = rejectOutliers(points, opts)
  if (inliers.length < 3) {
    return {
      centroid: null, heatmap: null, inliers, outliers,
      stats: { n: inliers.length, searchRadiusM: null, encirclement: 0 },
    }
  }
  const centroid = weightedCentroid(inliers)
  const heatmap = densityGrid(inliers, opts)
  const stats = geometryStats(inliers, centroid)
  return { centroid, heatmap, inliers, outliers, stats }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd web && npx vitest run locate.test.js`
Expected: PASS (full suite green).

- [ ] **Step 5: Commit**

```bash
git add web/locate.js web/locate.test.js
git commit -m "feat(web): locate() orchestrator"
```

---

### Task 6: UI scaffolding — Locate button, info card, styles

**Files:**
- Modify: `web/index.html`
- Modify: `web/style.css`

**Interfaces:**
- Produces DOM hooks consumed by Task 7: `#locate-toggle` (button), `#locate-info` (card).

- [ ] **Step 1: Add the button + info card to `web/index.html`**

In the `<header id="bar">`, add the Locate button right after the `layer-toggle` button:

```html
      <button id="layer-toggle">points</button>
      <button id="locate-toggle">Locate</button>
```

Immediately before `<div id="map"></div>`, add the info card container:

```html
  <div id="locate-info" hidden></div>
  <div id="map"></div>
```

- [ ] **Step 2: Add styles to `web/style.css`**

Append (colours via existing CSS vars only):

```css
#locate-toggle.on { background: var(--ch-sig-warm); color: var(--ch-bg); }
#locate-info { position: fixed; right: 12px; bottom: 12px; z-index: 650; max-width: 264px;
  background: var(--ch-surface); color: var(--ch-text); border: 1px solid var(--ch-border);
  border-radius: 8px; padding: 10px 12px; font-size: 12px; line-height: 1.45; backdrop-filter: blur(8px); }
#locate-info h4 { margin: 0 0 6px; font-size: 13px; }
#locate-info .lc-warn { color: var(--ch-sig-warm); }
#locate-info .lc-muted { color: var(--ch-muted); }
.lc-centroid { width: 18px; height: 18px; border-radius: 50%; border: 2px solid var(--ch-bg);
  background: var(--ch-sig-hot); box-shadow: 0 0 0 2px var(--ch-sig-hot); }
```

- [ ] **Step 3: Verify markup renders**

Run: `cd web && python -m http.server 8099` (or any static server), open `http://localhost:8099/`.
Expected: a **Locate** button sits next to the points/hex toggle in the bar; no console errors. (The button does nothing yet — wired in Task 7. The map will fail to load `/api/*` locally; that's expected.)

- [ ] **Step 4: Commit**

```bash
git add web/index.html web/style.css
git commit -m "feat(web): Locate button + info-card scaffolding"
```

---

### Task 7: Locate layer — fetch, render, live polling

**Files:**
- Modify: `web/map.js`

**Interfaces:**
- Consumes: `locate` (Task 5); `#locate-toggle`, `#locate-info` (Task 6); existing
  `API_BASE`, `cssVar`, `rssiTier`, `tierColorVar`, `window.currentFilters`.
- Produces: `window.__locateRender(points)` — test hook that renders a supplied
  point array (lets us verify rendering without the live API).

- [ ] **Step 1: Add imports + layer + heatmap colour ramp to `web/map.js`**

After the existing `import { resolveName, ... } from './names.js'` line, add:

```js
import { locate } from './locate.js'
```

After `const hexLayer = L.layerGroup().addTo(map)`, add:

```js
const locateLayer = L.layerGroup().addTo(map)
let locateActive = false
let locateTimer = null

// Heat ramp built from the existing --ch-sig-* tokens (cold -> hot), so the
// canvas honours the CSS-variable colour rule. Returns [r,g,b].
function heatColor(v) {
  const stops = ['--ch-sig-cold', '--ch-sig-cool', '--ch-sig-mid', '--ch-sig-warm', '--ch-sig-hot']
    .map((n) => cssVar(n))
  const hex = (h) => {
    const s = h.replace('#', '').trim()
    const n = s.length === 3 ? s.split('').map((x) => x + x).join('') : s
    return [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)]
  }
  const t = Math.max(0, Math.min(1, v)) * (stops.length - 1)
  const i = Math.min(stops.length - 2, Math.floor(t))
  const f = t - i
  const a = hex(stops[i]), b = hex(stops[i + 1])
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * f))
}
```

- [ ] **Step 2: Add the heatmap overlay + render function**

Add to `web/map.js`:

```js
// Paint a normalized density grid to a canvas and return a Leaflet image overlay.
function heatmapOverlay(hm) {
  const { grid, rows, cols, bounds } = hm
  const canvas = document.createElement('canvas')
  canvas.width = cols; canvas.height = rows
  const ctx = canvas.getContext('2d')
  const img = ctx.createImageData(cols, rows)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = grid[r * cols + c]
      const y = rows - 1 - r // grid row 0 = south; canvas y=0 = top
      const idx = (y * cols + c) * 4
      const [cr, cg, cb] = heatColor(v)
      img.data[idx] = cr; img.data[idx + 1] = cg; img.data[idx + 2] = cb
      img.data[idx + 3] = Math.round(190 * v) // alpha by intensity
    }
  }
  ctx.putImageData(img, 0, 0)
  return L.imageOverlay(canvas.toDataURL(), [[bounds.minLat, bounds.minLon], [bounds.maxLat, bounds.maxLon]],
    { opacity: 0.7, interactive: false })
}

// Render a full locate result onto locateLayer + the info card.
function renderLocate(points, senderId) {
  locateLayer.clearLayers()
  const res = locate(points)
  if (res.heatmap) heatmapOverlay(res.heatmap).addTo(locateLayer)
  // observation points: inliers coloured by RSSI, outliers greyed/dashed
  for (const p of res.inliers) {
    const tier = rssiTier(p.rssi)
    L.circleMarker([p.lat, p.lon], { radius: 4, color: cssVar(tierColorVar(tier)), weight: 1,
      fillColor: cssVar(tierColorVar(tier)), fillOpacity: 0.7 }).addTo(locateLayer)
  }
  for (const p of res.outliers) {
    L.circleMarker([p.lat, p.lon], { radius: 4, color: cssVar('--ch-sig-none'), weight: 1,
      dashArray: '2,2', fillColor: cssVar('--ch-sig-none'), fillOpacity: 0.2 }).addTo(locateLayer)
  }
  if (res.centroid) {
    L.marker([res.centroid.lat, res.centroid.lon], {
      icon: L.divIcon({ className: '', html: '<div class="lc-centroid"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }),
    }).addTo(locateLayer)
  }
  updateLocateInfo(res, senderId)
}

function updateLocateInfo(res, senderId) {
  const box = document.getElementById('locate-info')
  box.hidden = false
  const s = res.stats
  if (!res.centroid) {
    box.innerHTML = `<h4>Locate</h4><div class="lc-muted">${res.inliers.length} point(s) — too few to estimate (need 3+).</div>`
    return
  }
  const isHash = !!senderId && senderId.length < 64
  const radius = s.searchRadiusM != null ? Math.round(s.searchRadiusM) + ' m' : '—'
  const enc = Math.round(s.encirclement * 100)
  const encHint = s.encirclement < 0.5 ? '<div class="lc-warn">One-sided — drive around the estimate to tighten.</div>' : ''
  const hashNote = isHash ? `<div class="lc-warn">1-byte ID — assumed one node; ${res.outliers.length} outlier(s) excluded.</div>` : ''
  box.innerHTML = `<h4>Locate</h4>`
    + `<div>${s.n} points · search radius ~${radius} · encircle ${enc}%</div>`
    + encHint + hashNote
    + `<div class="lc-muted">Estimate sits within the driven area · ~hundreds of m · no TX calibration.</div>`
}

// Test hook: render a supplied point array (no API needed).
window.__locateRender = (points, senderId = 'efef79') => renderLocate(points, senderId)
```

- [ ] **Step 3: Add the fetch + polling + toggle wiring**

Add to `web/map.js`:

```js
// Build a sender-scoped, bbox-less query for /api/points (all of this node's
// receptions across all hunters, full timeframe — not viewport-limited).
function locateQs(f) {
  const p = new URLSearchParams({ sender: f.sender })
  if (f.from) p.set('from', f.from)
  if (f.to) p.set('to', f.to)
  return p.toString()
}

async function drawLocate() {
  const f = (window.currentFilters && window.currentFilters()) || {}
  const box = document.getElementById('locate-info')
  if (!f.sender) {
    locateLayer.clearLayers()
    box.hidden = false
    box.innerHTML = '<h4>Locate</h4><div class="lc-muted">Enter a sender ID to locate.</div>'
    return
  }
  const r = await fetch(`${API_BASE}/api/points?${locateQs(f)}`)
  const d = await r.json()
  const points = (d.points || []).map((p) => ({ lat: p.lat, lon: p.lon, rssi: p.rssi, acc_m: p.acc_m }))
  renderLocate(points, f.sender)
}

const locateBtn = document.getElementById('locate-toggle')
locateBtn.addEventListener('click', () => {
  locateActive = !locateActive
  locateBtn.classList.toggle('on', locateActive)
  if (locateActive) {
    drawLocate()
    locateTimer = setInterval(drawLocate, 5000)
  } else {
    clearInterval(locateTimer); locateTimer = null
    locateLayer.clearLayers()
    document.getElementById('locate-info').hidden = true
  }
})
```

- [ ] **Step 4: Verify rendering with the test hook (no API needed)**

Run: `cd web && python -m http.server 8099`, open `http://localhost:8099/`, and in the browser console run:

```js
__locateRender([
  {lat:51.000,lon:4.000,rssi:-60,acc_m:8},
  {lat:51.003,lon:4.002,rssi:-72,acc_m:8},
  {lat:50.998,lon:3.997,rssi:-78,acc_m:8},
  {lat:51.001,lon:4.004,rssi:-83,acc_m:8},
  {lat:51.6,  lon:4.6,  rssi:-96,acc_m:8}
])
```

Expected: map shows 4 coloured observation dots near (51, 4), 1 greyed dashed outlier far NE, a hot-coloured heatmap blob, a red centroid dot, and the info card shows "5 points · search radius ~… · encircle …%", a 1-byte warning, and the caveat line. No console errors.

- [ ] **Step 5: Commit**

```bash
git add web/map.js
git commit -m "feat(web): live Locate layer — centroid, heatmap, outliers, polling"
```

---

### Task 8: Live end-to-end verification (post-deploy)

**Files:** none (verification only).

- [ ] **Step 1: Deploy the website** (per deployment memory, section B — `web/` changed):

```bash
SCP='scp -i C:/Users/efite/.ssh/claude_mcp -o ConnectTimeout=30 -o BatchMode=yes -o StrictHostKeyChecking=no -o ControlPath=none'
$SCP web/config.js web/filters.js web/index.html web/map.js web/names.js web/locate.js web/signal.js web/style.css web/version.js root@94.130.105.135:/var/www/map.on8ar.eu/
```

(Note: `web/locate.js` is now part of the served set; `web/package.json`, `web/locate.test.js`, `web/node_modules` are NOT copied.)

- [ ] **Step 2: Verify against live data**

Open `https://map.on8ar.eu/` (hard-refresh), enter a sender ID with several receptions (e.g. a full pubkey from the points), click **Locate**.
Expected: observation dots + heatmap + centroid appear; the info card shows live stats; leaving it on for a minute updates as new data arrives (search radius/encircle numbers move). For a 1-byte ID the collision note shows.

- [ ] **Step 3: Update the deployment memory**

Add `web/locate.js` to the served-set scp list in the deployment memory file (and note `web/package.json` + `web/locate.test.js` are dev-only, not served).

---

## Self-Review

**Spec coverage:**
- Goal / coordination view → Tasks 7–8 (all-hunter fetch, live polling). ✓
- Method (WCL + kernel heatmap, TX-free) → Tasks 1, 3, 5. ✓
- Data source (bbox-less sender query, 5 s poll) → Task 7 (`locateQs`, `setInterval`). ✓
- Identity (any ID, 1-byte note) → Task 7 (`updateLocateInfo` hash note). ✓
- Outlier rejection → Task 2. ✓
- Weighted centroid → Task 1. ✓
- Kernel-density heatmap → Task 3 + Task 7 canvas overlay. ✓
- Convergence radius + encirclement → Task 4 + Task 7 info card. ✓
- Honesty caveats in UI → Task 7 (`updateLocateInfo`). ✓
- Edge cases (<3, stationary) → Task 5 (null centroid) + Task 2 (no jitter flag) + Task 7 (message). ✓
- Tests / vitest in web/ → Tasks 1–5. ✓
- Phase 2 items → intentionally omitted. ✓

**Placeholder scan:** none — every step has concrete code/commands.

**Type consistency:** `locate()` returns `{centroid, heatmap, inliers, outliers, stats}`; consumed as such in Task 7. `heatmap = {grid, rows, cols, bounds}` produced in Task 3, consumed by `heatmapOverlay` in Task 7. `stats = {n, searchRadiusM, encirclement}` produced in Task 4, consumed in `updateLocateInfo`. `rejectOutliers` → `{inliers, outliers}` consistent across Tasks 2/5. `cssVar`, `rssiTier`, `tierColorVar` are existing `map.js`/`signal.js` exports. ✓
