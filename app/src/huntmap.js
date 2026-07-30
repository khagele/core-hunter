import { hexCellAt, hexBoundary, hexResForZoom } from './hexgrid.js'
import { rssiTier, tierColorVar, fillOpacity, effectivePlotOffset, ageFade, heatWeight, extrusionHeight, withAlpha } from './signal.js'
import { getConfig } from './config.js'
import { locate, toLocatePoints } from './locate.js'
import { nodesInView, driftPresentation, groupSenderPointsForNodes, estimateFor, circleRing } from './nodelayer.js'
import { appendTrailPoint } from './trail.js'
import { packetTypeLabel } from './filters.js'
import { layerVisibility } from './maplayers.js'
import { squareRing, pillarHalfWidthM } from './pointmarker.js'

// PROTOTYPE (#293) — on-screen diagnostics for the terrain spike, so a phone
// test yields numbers instead of impressions (no devtools on the hunting
// device). Reports live FPS, whether the map ever settles (map.loaded(), the
// exact symptom that killed the v1 terrain attempt), and cumulative tile bytes
// per host so the terrain source's cost can be read against the basemap's.
// Flag-gated and throwaway — deleted with the rest of the spike.
function startProtoHud(map, variant) {
  const box = document.createElement('div')
  box.style.cssText = 'position:fixed;left:8px;top:56px;z-index:9999;background:rgba(0,0,0,.82);' +
    'color:#0f0;font:11px/1.45 ui-monospace,monospace;padding:7px 9px;border-radius:6px;' +
    'pointer-events:none;white-space:pre;max-width:70vw'
  document.body.appendChild(box)
  let frames = 0, fps = 0, worst = 0, settledAt = null, lostAfterSettle = 0
  const t0 = performance.now()
  let last = performance.now()
  const tick = () => {
    const now = performance.now()
    const dt = now - last
    last = now
    if (dt > worst) worst = dt
    frames++
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
  setInterval(() => {
    fps = frames; frames = 0
    const loaded = map.loaded()
    if (loaded && settledAt === null) settledAt = Math.round(performance.now() - t0)
    if (!loaded && settledAt !== null) lostAfterSettle++
    let terrainKb = 0, terrainN = 0, baseKb = 0, baseN = 0
    for (const e of performance.getEntriesByType('resource')) {
      const kb = (e.transferSize || 0) / 1024
      if (/arcgisonline|elevation-tiles-prod|mapterhorn/.test(e.name)) { terrainKb += kb; terrainN++ }
      else if (/openfreemap/.test(e.name)) { baseKb += kb; baseN++ }
    }
    // Report the DEM source's LIVE maxzoom, not the requested one: MapLibre
    // only applies source options once the source loads, so this is the proof
    // the cap actually took effect. Cross-check it against the terrain tile
    // count below — a working z10 cap should show ~1-2 tiles for a screen that
    // would need ~24 uncapped.
    const demSrc = map.getSource('proto-dem')
    const dz = window.__protoDemZoom
    const terr = map.getTerrain && map.getTerrain()
    const pov = window.__protoPov
    box.textContent =
      `#293 terrain=${variant}${dz ? ` demzoom=${dz}→${demSrc ? demSrc.maxzoom : '?'}` : ''}` +
      `${terr ? ` MESH x${terr.exaggeration}` : ''}\n` +
      `${pov ? `POV eye ${pov.achievedEyeM}m${pov.capped ? ` (asked ${pov.askedM}m — PITCH CAPPED)` : ''}` +
        ` ground ${pov.groundM}m look ${pov.lookM}m\n` : ''}` +
      `${window.__protoSkyHour != null ? `sky ${window.__protoSkyHour}h\n` : ''}` +
      `fps ${fps}  worst frame ${Math.round(worst)}ms\n` +
      `settled ${settledAt === null ? 'NEVER' : settledAt + 'ms'}  lost after ${lostAfterSettle}\n` +
      `terrain ${terrainN} tiles ${Math.round(terrainKb)}kb\n` +
      `basemap ${baseN} tiles ${Math.round(baseKb)}kb`
    worst = 0
  }, 1000)
}

// PROTOTYPE (#293) — synthetic hunter data for looking at terrain with the
// signal layers on top, since an unconnected app draws an empty map and the
// whole question is how relief reads *underneath* receptions. Deterministic
// (seeded, no Math.random) so the same URL always yields the same picture and
// two screenshots can be compared. Flag-gated; deleted with the spike.
function buildMockData(centerLat, centerLon) {
  let seed = 1337
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296 }
  const hex = (n) => { let s = ''; while (s.length < n) s += Math.floor(rnd() * 16).toString(16); return s }
  const M_PER_DEG = 111320

  // Three repeaters, a few km apart, each with a full 64-hex pubkey — the node
  // layer only draws ids of kind advert_pubkey/discover_pubkey.
  const nodes = [
    { name: 'ARD-Noord', dLat: 0.030, dLon: 0.020 },
    { name: 'ARD-Zuid', dLat: -0.025, dLon: 0.038 },
    { name: 'ARD-West', dLat: 0.008, dLon: -0.045 },
  ].map((n) => ({
    pubkey: hex(64), name: n.name,
    lat: centerLat + n.dLat, lon: centerLon + n.dLon,
  }))

  // A drive route that tours past each repeater rather than wandering at
  // random. This is what makes the mock useful: a pure random walk almost never
  // passes close to a node, so every sample lands in one weak tier and the
  // colour ramp never appears. Touring gives hot at closest approach and cold
  // between nodes — the gradient the map exists to show.
  const waypoints = [
    { lat: centerLat - 0.022, lon: centerLon - 0.034 },
    { lat: nodes[2].lat + 0.002, lon: nodes[2].lon + 0.001 },   // ARD-West
    { lat: nodes[0].lat - 0.001, lon: nodes[0].lon - 0.002 },   // ARD-Noord
    { lat: nodes[1].lat + 0.001, lon: nodes[1].lon + 0.002 },   // ARD-Zuid
    { lat: centerLat + 0.018, lon: centerLon + 0.030 },
  ]
  const records = []
  const now = Date.now()
  const perLeg = 65
  let lat = waypoints[0].lat, lon = waypoints[0].lon
  for (let i = 0; i < (waypoints.length - 1) * perLeg; i++) {
    const leg = Math.floor(i / perLeg)
    const t = (i % perLeg) / perLeg
    const a = waypoints[leg], b = waypoints[leg + 1]
    // Jitter keeps it from being a drawn straight line while still arriving.
    lat = a.lat + (b.lat - a.lat) * t + (rnd() - 0.5) * 0.0016
    lon = a.lon + (b.lon - a.lon) * t + (rnd() - 0.5) * 0.0022
    // Each sample hears whichever repeater is nearest, at a strength that falls
    // off with distance — a plausible log-distance path loss plus noise, so the
    // heat map reads hot near a node and cold at the fringe instead of random.
    let best = null, bestD = Infinity
    for (const n of nodes) {
      const dy = (n.lat - lat) * M_PER_DEG
      const dx = (n.lon - lon) * M_PER_DEG * Math.cos((lat * Math.PI) / 180)
      const d = Math.sqrt(dx * dx + dy * dy)
      if (d < bestD) { bestD = d; best = n }
    }
    // Log-distance path loss with an exponent near 3, which is what mixed
    // terrain actually gives — and, unlike a gentler curve, it spans the whole
    // tier ramp: hot within ~200 m, warm by ~500 m, mid around 2 km, cold past
    // ~5 km. A model that leaves every sample above -80 paints the entire track
    // in one colour and demonstrates nothing.
    const dM = Math.max(10, bestD)
    const rssi = Math.max(-125, Math.min(-35, Math.round(-30 - 30 * Math.log10(dM / 10) + (rnd() - 0.5) * 7)))
    records.push({
      id: 'mock-' + i,
      lat, lon, rssi,
      snr: Math.round((10 - 12 * Math.log10(dM / 100) + (rnd() - 0.5) * 4) * 10) / 10,
      rx_at: now - (260 - i) * 4000,        // ~17 min of driving, newest last
      sender_id: best.pubkey, sender_kind: 'advert_pubkey', sender_label: best.name,
      sender_role: 'Repeater', hops: 0, is_direct: true,
    })
  }
  return { nodes, records }
}

// PROTOTYPE (#293/#333) — sky, driven by time of day. At high pitch a large
// part of the viewport is above the horizon, and with no sky MapLibre draws
// nothing there, which reads as a broken/empty map. Time-of-day rather than a
// fixed colour because this app is used at dusk and after dark as often as in
// daylight, and a bright blue sky at 23:00 would be worse than none.
const SKY_STOPS = [
  { h: 0, sky: '#05070f', horizon: '#0a1020', fog: '#0a1020' },   // night
  { h: 5.5, sky: '#141d38', horizon: '#3b3350', fog: '#2a2740' },   // astronomical dawn
  { h: 7, sky: '#3f6ea8', horizon: '#e8a06a', fog: '#c9a58a' },   // sunrise
  { h: 10, sky: '#4a86c8', horizon: '#bcd6ea', fog: '#c5d8e8' },   // morning
  { h: 14, sky: '#4287d0', horizon: '#c3daf0', fog: '#cbdcec' },   // day
  { h: 18, sky: '#4a7fb5', horizon: '#e6b183', fog: '#d3b295' },   // golden hour
  { h: 20, sky: '#2a3a63', horizon: '#c2704f', fog: '#7a5a5a' },   // sunset
  { h: 21.5, sky: '#101a33', horizon: '#3a3352', fog: '#241f38' }, // dusk
  { h: 24, sky: '#05070f', horizon: '#0a1020', fog: '#0a1020' },   // night again
]
const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const rgbToHex = (c) => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
const mixHex = (a, b, t) => {
  const [ar, ag, ab] = hexToRgb(a), [br, bg, bb] = hexToRgb(b)
  return rgbToHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t])
}
// skyForHour interpolates between stops so the transition is continuous rather
// than snapping between four hardcoded looks.
function skyForHour(hour) {
  const h = ((hour % 24) + 24) % 24
  let a = SKY_STOPS[0], b = SKY_STOPS[SKY_STOPS.length - 1]
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    if (h >= SKY_STOPS[i].h && h <= SKY_STOPS[i + 1].h) { a = SKY_STOPS[i]; b = SKY_STOPS[i + 1]; break }
  }
  const span = b.h - a.h
  const t = span > 0 ? (h - a.h) / span : 0
  return {
    'sky-color': mixHex(a.sky, b.sky, t),
    'horizon-color': mixHex(a.horizon, b.horizon, t),
    'fog-color': mixHex(a.fog, b.fog, t),
    'sky-horizon-blend': 0.6,
    'horizon-fog-blend': 0.5,
    'fog-ground-blend': 0.1,
  }
}

// Map layer — MapLibre GL (#147). Migrated from Leaflet + leaflet-rotate: native
// rotation/pitch replaces the plugin (and its zoom-drift patch, #167/#168), and
// a vector basemap (OpenFreeMap) unlocks 3D buildings in the follow-up
// 3D phase. The createHuntMap(...) API is unchanged so app.js stays as-is.

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// OpenFreeMap hosted vector styles (key-free); both use the "openmaptiles"
// vector source. --ch-basemap ('dark'|'light') is the app's theme hint.
const STYLES = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
}
const EMPTY = { type: 'FeatureCollection', features: [] }
const fc = (features) => ({ type: 'FeatureCollection', features })
// Bare background-only style — loads with no network, so the signal overlays
// can mount on it when the hosted basemap style is unreachable (see below).
const bareStyle = (bg) => ({ version: 8, sources: {}, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': bg } }] })

// 3D mode (#147 phase 2): the FAB just tilts the camera and swaps the flat hex
// layer for its fill-extrusion twin — same 'hex' source, height added per
// feature (extrusionHeight). Buildings reuse the OpenFreeMap style's own
// "openmaptiles"/"building" source, already fetched for the 2D basemap, so 3D
// adds no new data request. (Terrain was dropped — see docs/2026-07-11-3d-mode.md:
// its AWS DEM tiles kept the map in a perpetual load loop and froze weaker GPUs.)
const PITCH_3D = 60
// Ceiling for the two-finger tilt gesture (#333). MapLibre's own default
// maxPitch is 60 — the same value the FAB eases to — so without this the
// gesture bottomed out exactly where the FAB left off and the camera could
// never look along the ground. 85 is MapLibre's hard maximum (86+ throws
// "maxPitch must be less than or equal to 85"); 90 is not offered because a
// camera level with the horizon projects to infinity.
// PITCH_3D deliberately stays 60: the FAB is the introduction to 3D, and the
// gesture is what takes you the rest of the way.
const MAX_PITCH = 85
// Points-in-3D (#250): a small standing "pillar" per reception, same tier
// height/colour as hex-3d's bars, so it reads clearly in the tilted view
// instead of disappearing under the hex/building geometry (a flat circle
// layer can't be raised — MapLibre circles always sit on the ground plane).
const POINT_PILLAR_HALF_WIDTH_M = 3
const POINT_PILLAR_MIN_PX = 4   // never let the footprint go sub-pixel (#250)

export function createHuntMap(containerId) {
  const stub = { setPosition() {}, centerOn() {}, recenter() {}, onFollowChange() {}, onLocate() {}, setLocateVisible() {}, render() {}, setLayerMode() {}, set3D() {}, applyBasemap() {}, focusReception() {}, setAttenuator() {}, setTimeWindow() {}, setBearing() {}, onGestureRotate() {}, setHighlight() {}, onMarkerFocus() {}, setNodePositions() {}, setNodeLayerVisible() {}, destroy() {} }
  // Degrade to a no-op map (never throw during app init) when MapLibre's CDN
  // script failed, or when WebGL is unavailable — GPU blocklist, an older
  // device, or a lost context — since `new maplibregl.Map` throws synchronously
  // in that case (Leaflet's raster map had no WebGL dependency).
  if (typeof maplibregl === 'undefined') return stub
  const cfg = getConfig()
  const calibrationOffset = (cfg && cfg.rssiCalibrationOffset) || 0
  // Plot offset = calibration + attenuator added back (display-only, per tick).
  let attenuatorDb = 0
  let timeWindowMs = null
  const currentOffset = () => effectivePlotOffset(calibrationOffset, attenuatorDb)
  const styleFor = () => STYLES[cssVar('--ch-basemap') || 'dark'] || STYLES.dark

  // PROTOTYPE (#293/#333): start already tilted, and optionally somewhere else.
  // Needed because setTerrain makes easeTo({pitch}) a no-op, so with the mesh
  // variant on, the FAB cannot tilt you — the camera has to start at the angle
  // being evaluated. `?pitch=85&at=50.25,5.80` also saves hunting for hills by
  // hand: the default centre is flat Belgium, where terrain shows nothing.
  const protoParams = new URLSearchParams(location.search)
  const protoPitch = Math.min(MAX_PITCH, Number(protoParams.get('pitch')) || 0)
  const protoAt = (protoParams.get('at') || '').split(',').map(Number)
  const protoCenter = protoAt.length === 2 && protoAt.every(Number.isFinite)
    ? [protoAt[1], protoAt[0]]   // ?at= is lat,lon (map order is lon,lat)
    : [4, 51]
  // `?mock=1` — built from the start centre so the synthetic track sits where
  // the camera actually is, not in flat Belgium.
  const mockData = protoParams.get('mock')
    ? buildMockData(protoCenter[1], protoCenter[0])
    : null

  let map
  try {
    map = new maplibregl.Map({
      container: containerId, style: styleFor(), center: protoCenter, zoom: 14,
      pitch: protoPitch,
      // pitchWithRotate governs the MOUSE path only (ctrl/right-drag); touch
      // pitch is a separate handler that already defaults on. Left false, a
      // desktop browser has no tilt gesture whatsoever — which is why raising
      // maxPitch alone changed nothing here, even though the phone could
      // already tilt. Enabling it is the part that genuinely reverses
      // docs/2026-07-11-3d-mode.md's "not a free-tilt 3D explorer".
      attributionControl: false, dragRotate: true, pitchWithRotate: true, maxPitch: MAX_PITCH,
    })
  } catch (e) { return stub }
  map.addControl(new maplibregl.AttributionControl({ compact: true }))

  let mode = 'both', lastRecords = [], lastSelected = null, onLocateCb = null, locateVisible = true
  let highlightId = null, onMarkerFocusCb = null, rotateCb = null, mode3D = false
  // Node-position layer (#197): registry nodes with a self-advertised position,
  // drawn against our own estimate. Off until the FAB turns it on.
  // Mock mode turns the repeater layer on up front — it is the layer being
  // demonstrated, and leaving it off would just show an empty map (#293).
  let nodePositions = mockData ? mockData.nodes : [], nodeLayerOn = !!mockData, nodeMarkers = []
  let nodePosSig = null   // signature guard: skip the rebuild when nothing changed, so a tapped popup survives the tick
  const ACQUIRE_ZOOM = 18
  let follow = true, lastPos = null, onFollow = null, acquired = false
  let trail = [], settingBearing = false, locateMarkers = []

  // Follow releases when the user drags; native bearing gesture reports back via
  // onGestureRotate (guarded so our own setBearing calls don't count as user input).
  map.on('dragstart', () => { if (follow && lastPos) { follow = false; if (onFollow) onFollow(false) } })
  map.on('rotate', () => { if (rotateCb && !settingBearing) rotateCb(map.getBearing()) })
  // Hex resolution depends on zoom — rebuild once the zoom settles.
  map.on('zoomend', () => draw())

  // ---- feature builders (GeoJSON sources are updated via setData) ----
  function buildPointsFC(records, nowMs) {
    const feats = []
    for (const r of records) {
      if (r.lat == null || r.lon == null) continue
      const tier = rssiTier(r.rssi, currentOffset())
      const fade = ageFade(r.rx_at, nowMs, timeWindowMs)   // age-fade within the window (#149)
      feats.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [r.lon, r.lat] },
        properties: { id: String(r.id), color: cssVar(tierColorVar(tier)), op: fade, fop: fillOpacity(tier) * fade } })
    }
    return fc(feats)
  }
  // 3D twin of buildPointsFC (#250): a small square footprint per reception,
  // extruded to the same tier height as hex-3d's bars (extrusionHeight), so
  // hotter/closer receptions stand taller — same colour/height language as the
  // hex bars, just narrower, so points still read distinctly from hex cells.
  // fill-extrusion-opacity is layer-wide (MapLibre has no data-driven opacity
  // for it, same limitation noted on hex-3d), but fill-extrusion-color IS
  // per-feature — so tier opacity and age-fade ride in the colour's alpha
  // instead of being dropped (#302).
  function buildPoints3DFC(records, nowMs) {
    const feats = []
    for (const r of records) {
      if (r.lat == null || r.lon == null) continue
      const tier = rssiTier(r.rssi, currentOffset())
      const fade = ageFade(r.rx_at, nowMs, timeWindowMs)
      const ring = squareRing(r.lat, r.lon, pillarHalfWidthM(r.lat, map.getZoom(), POINT_PILLAR_HALF_WIDTH_M, POINT_PILLAR_MIN_PX))
      // Alpha rides in the colour, not in fill-extrusion-opacity, which is a
      // single layer-wide number (#302). Same tier opacity x age-fade the flat
      // layer applies, so "still transmitting" still reads differently from
      // "was here ten minutes ago" in 3D.
      feats.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] },
        properties: { id: String(r.id),
          color: withAlpha(cssVar(tierColorVar(tier)), fillOpacity(tier) * fade),
          height: extrusionHeight(r.rssi, currentOffset()) } })
    }
    return fc(feats)
  }
  function buildHexFC(records) {
    const cells = new Map()
    const res = hexResForZoom(map.getZoom())   // finer cells the more you zoom in
    for (const r of records) {
      if (r.lat == null || r.lon == null) continue
      const id = hexCellAt(r.lat, r.lon, res)
      const cur = cells.get(id)
      if (!cur || (r.rssi ?? -999) > (cur.best ?? -999)) cells.set(id, { best: r.rssi })
    }
    const feats = []
    for (const [id, c] of cells) {
      const ring = hexBoundary(id); if (!ring) continue // [lat,lon] closed ring → [lon,lat]
      const tier = rssiTier(c.best, currentOffset())
      // height is only read by the 3D fill-extrusion twin (hex-3d); the flat
      // 'hex' layer ignores it. Same source for both, per the decision log.
      feats.push({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring.map(([la, lo]) => [lo, la])] },
        properties: { color: cssVar(tierColorVar(tier)), op: fillOpacity(tier), height: extrusionHeight(c.best, currentOffset()) } })
    }
    return fc(feats)
  }
  function buildHighlightFC() {
    if (highlightId == null) return EMPTY
    const r = lastRecords.find((x) => String(x.id) === String(highlightId))
    if (!r || r.lat == null || r.lon == null) return EMPTY
    return fc([{ type: 'Feature', geometry: { type: 'Point', coordinates: [r.lon, r.lat] }, properties: {} }])
  }
  function buildHereFC() {
    if (!lastPos) return EMPTY
    return fc([{ type: 'Feature', geometry: { type: 'Point', coordinates: [lastPos[1], lastPos[0]] }, properties: {} }])
  }
  function buildTrailFC() {
    if (trail.length < 2) return EMPTY
    return fc([{ type: 'Feature', geometry: { type: 'LineString', coordinates: trail.map(([la, lo]) => [lo, la]) }, properties: {} }])
  }
  function buildLocateHeatFC(records) {
    return fc(toLocatePoints(records).map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      properties: { w: heatWeight(p.rssi) } })))
  }

  // ---- overlays: added on every style load (initial + theme switch) ----
  // overlaysReady flips true once the signal layers are mounted; the fallback
  // timer (armStyleFallback) uses it so a stuck basemap style can't leave the
  // map blank — the overlays must not be gated on a third-party basemap.
  let overlaysReady = false, styleTimer = null
  function armStyleFallback() {
    clearTimeout(styleTimer)
    styleTimer = setTimeout(() => {
      // Hosted style never mounted the overlays (offline / host down / cold PWA
      // cache) → drop to a bare background style and mount them there, so the
      // signal points/hex/trail/here survive basemap loss (a Leaflet raster 404
      // used to leave every overlay intact).
      if (!overlaysReady) { map.setStyle(bareStyle(cssVar('--ch-bg'))); mountBare() }
    }, 12000)
  }
  // PROTOTYPE (#293) — throwaway, flag-gated, not shipped. `?terrain=hillshade`
  // adds a pre-rendered shaded-relief RASTER overlay; `?terrain=dem` adds a
  // MapLibre hillshade layer computed from terrarium DEM tiles. Neither calls
  // setTerrain(), which is what froze the map in the v1 attempt
  // (docs/2026-07-11-3d-mode.md) — no mesh displacement, so no load loop and no
  // easeTo({pitch}) no-op. Here to measure the two against each other.
  const terrainProto = new URLSearchParams(location.search).get('terrain')
  if (terrainProto) { window.__protoMap = map; startProtoHud(map, terrainProto) }
  // `?hour=` forces a time of day so dusk/night can be checked without waiting
  // for the clock; otherwise it follows the device.
  const skyHourParam = protoParams.get('hour')
  function applyProtoSky() {
    if (!terrainProto || typeof map.setSky !== 'function') return
    const hour = skyHourParam !== null && skyHourParam !== ''
      ? Number(skyHourParam)
      : new Date().getHours() + new Date().getMinutes() / 60
    if (!Number.isFinite(hour)) return
    map.setSky(skyForHour(hour))
    window.__protoSkyHour = Math.round(hour * 10) / 10
  }
  // Live knob for scrubbing through the day: __setHour(20.5)
  window.__setHour = (h) => { map.setSky(skyForHour(h)); window.__protoSkyHour = h; return h }
  function addTerrainPrototype() {
    if (!terrainProto || map.getLayer('proto-terrain')) return
    // Sits directly above the basemap and below every signal overlay, so it can
    // never occlude receptions.
    const beforeId = map.getLayer('trail') ? 'trail' : undefined
    if (terrainProto === 'hillshade') {
      if (!map.getSource('proto-hillshade')) {
        map.addSource('proto-hillshade', { type: 'raster', tileSize: 256, maxzoom: 16,
          tiles: ['https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}'],
          attribution: 'Hillshade: Esri, USGS' })
      }
      map.addLayer({ id: 'proto-terrain', type: 'raster', source: 'proto-hillshade',
        paint: { 'raster-opacity': 0.45 } }, beforeId)
    } else if (terrainProto === 'dem' || terrainProto === 'lowpoly') {
      // `demzoom` caps the DEM source's maxzoom. This is the "low poly" knob:
      // terrain mesh density follows tile resolution, so a cap means both a
      // coarser mesh AND far fewer requests — MapLibre overzooms one parent
      // tile instead of fetching the children (a z9 tile covers 32x the ground
      // of a z14 one). For RF work the useful signal is the big landform that
      // blocks a path, not metre-scale detail, so coarse is arguably correct
      // rather than a compromise. Default 10 for lowpoly, 15 for the full-fat
      // `dem` comparison.
      const demZoom = Number(new URLSearchParams(location.search).get('demzoom'))
        || (terrainProto === 'lowpoly' ? 10 : 15)
      if (!map.getSource('proto-dem')) {
        map.addSource('proto-dem', { type: 'raster-dem', tileSize: 256, maxzoom: demZoom, encoding: 'terrarium',
          tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
          attribution: 'DEM: Mapzen/AWS' })
      }
      // `?exag=` scales the relief. Belgian/Dutch terrain is genuinely shallow
      // — a few hundred metres across many kilometres — so at 1:1 it barely
      // reads on screen even where the hills are real. Exaggeration is a
      // display choice, not a data one, but note it does misrepresent slope:
      // useful for *seeing* which way the ground rises, misleading if read as
      // literal gradient. Shading is scaled alongside the mesh so the two agree.
      const exag = Number(new URLSearchParams(location.search).get('exag'))
      const terrainExag = exag > 0 ? exag : 3
      map.addLayer({ id: 'proto-terrain', type: 'hillshade', source: 'proto-dem',
        paint: { 'hillshade-exaggeration': Math.min(1, 0.35 * terrainExag) } }, beforeId)
      // lowpoly additionally enables real mesh displacement — the thing v1 did
      // and that froze it. The bet under test: with the DEM capped this coarse,
      // the mesh is cheap enough to survive. NB setTerrain makes
      // easeTo({pitch}) a no-op, so the 3D FAB's tilt animation won't work
      // while this variant is on (documented in the v1 post-mortem).
      if (terrainProto === 'lowpoly') {
        map.setTerrain({ source: 'proto-dem', exaggeration: terrainExag })
      }
      // Live knob, so the value can be dialled in from the console without a
      // reload: __setExag(6).
      window.__setExag = (v) => {
        map.setTerrain({ source: 'proto-dem', exaggeration: v })
        map.setPaintProperty('proto-terrain', 'hillshade-exaggeration', Math.min(1, 0.35 * v))
        return v
      }
      window.__protoDemZoom = demZoom
      window.__protoExag = terrainExag

      // `?pov=<metres>` — stand the camera ON the terrain at eye height instead
      // of approximating with zoom+pitch. This is the view that actually answers
      // the RF question: from where I am standing, does a ridge sit between me
      // and the node? A tilted bird's-eye cannot answer that, because it never
      // puts the eye below the ridgeline.
      //
      // Requires the free camera: zoom/pitch cannot express "1.5 m above the
      // ground" — altitude there is a function of zoom, and the terrain height
      // under the camera is only known once the DEM has loaded. Note the
      // elevation returned is the EXAGGERATED one (setTerrain scales it), so at
      // exag 3 a 1.5 m eye height sits on 3x-tall hills — internally consistent
      // for line-of-sight *within* the exaggerated world, but not real geometry.
      // MapLibre has no free-camera API (it forked from Mapbox GL JS 1.13,
      // before that landed), so the camera cannot be placed by position +
      // altitude directly. calculateCameraOptionsFromTo is the supported
      // equivalent: give it a from-point with altitude and a to-point, and it
      // returns the center/zoom/pitch/bearing that puts the eye there.
      const povM = Number(new URLSearchParams(location.search).get('pov')) || 1.5
      const povLookM = Number(new URLSearchParams(location.search).get('look')) || 3000
      if (terrainProto === 'lowpoly') {
        const applyPov = () => {
          const from = map.getCenter()
          const ground = map.queryTerrainElevation(from)
          // Before the DEM lands this reads a flat 0, which would place the eye
          // 1.5 m above sea level and bury it inside the hills once the real
          // terrain arrives. Wait for a non-zero reading rather than a non-null.
          if (!ground) return false
          // Aim at a point `look` metres ahead along the current bearing. Its
          // own ground height matters: targeting sea level would tip the camera
          // downward into the hillside instead of along it.
          const bearing = map.getBearing()
          const rad = (bearing * Math.PI) / 180
          const dLat = (povLookM * Math.cos(rad)) / 111320
          const dLon = (povLookM * Math.sin(rad)) / (111320 * Math.cos((from.lat * Math.PI) / 180))
          const to = { lng: from.lng + dLon, lat: from.lat + dLat }
          const toGround = map.queryTerrainElevation(to) || ground
          const opts = map.calculateCameraOptionsFromTo(from, ground + povM, to, toGround)
          map.jumpTo(opts)
          // The requested eye height is NOT necessarily what you get, and the
          // gap is geometric rather than a bug: eye height, look distance and
          // pitch are one relation, h = d / tan(pitch). MapLibre caps pitch at
          // 85, i.e. tan = 11.4, so looking 3 km ahead forces an eye ~262 m up;
          // a true 1.5 m eye could only look ~17 m ahead. Report what was
          // actually achieved, since a view claiming "1.5 m" while sitting a
          // quarter-kilometre up would quietly invalidate any line-of-sight
          // read made from it.
          const achievedPitch = map.getPitch()
          const achievedEyeM = povLookM / Math.tan((achievedPitch * Math.PI) / 180)
          window.__protoPov = {
            askedM: povM, groundM: Math.round(ground), lookM: povLookM,
            pitch: Math.round(achievedPitch),
            achievedEyeM: Math.round(achievedEyeM),
            capped: achievedEyeM > povM * 1.5,
          }
          return true
        }
        window.__applyPov = applyPov

        // One button that swaps state rather than an enter/exit pair: tap to
        // drop to eye height, tap again to return to exactly the camera you
        // left. Deliberately NOT in the right-hand FAB stack — that runs
        // 112..382px and the code there records 408px as already off-screen in
        // landscape on a car-mounted phone, so a 7th slot would be unreachable
        // (the crowding #258 exists to fix). Bottom-left is free.
        const fab = document.createElement('button')
        fab.type = 'button'
        fab.id = 'proto-pov-fab'
        fab.setAttribute('aria-label', 'Eye-height view')
        fab.textContent = '👁'
        fab.style.cssText = 'position:fixed;left:14px;bottom:calc(env(safe-area-inset-bottom, 18px) + 112px);' +
          'width:46px;height:46px;border-radius:50%;border:none;background:var(--ch-surface);' +
          '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:var(--ch-text);' +
          'font-size:20px;z-index:500;cursor:pointer;display:flex;align-items:center;' +
          'justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.3)'
        document.body.appendChild(fab)
        let povOn = false, restoreCam = null
        const ACCENT_RING = '0 4px 14px rgba(0,0,0,.3), 0 0 0 2px var(--ch-accent)'
        fab.addEventListener('click', () => {
          if (povOn) {
            if (restoreCam) map.jumpTo(restoreCam)
            povOn = false
            window.__protoPov = null
            fab.style.boxShadow = '0 4px 14px rgba(0,0,0,.3)'
            fab.style.color = 'var(--ch-text)'
            return
          }
          restoreCam = { center: map.getCenter(), zoom: map.getZoom(),
            pitch: map.getPitch(), bearing: map.getBearing() }
          if (!applyPov()) {
            // No elevation yet — say so instead of silently doing nothing,
            // since the camera not moving is indistinguishable from a dead button.
            fab.style.color = 'var(--ch-accent-2)'
            setTimeout(() => { if (!povOn) fab.style.color = 'var(--ch-text)' }, 1200)
            return
          }
          povOn = true
          fab.style.boxShadow = ACCENT_RING
          fab.style.color = 'var(--ch-accent)'
        })

        // ?pov= still auto-enters, so the URL form keeps working.
        if (new URLSearchParams(location.search).get('pov')) {
          let tries = 0
          const povTimer = setInterval(() => {
            if (applyPov() || ++tries > 60) {
              clearInterval(povTimer)
              if (window.__protoPov) { povOn = true; fab.style.boxShadow = ACCENT_RING; fab.style.color = 'var(--ch-accent)' }
            }
          }, 250)
        }
      }
    }
  }

  function addOverlays() {
    clearTimeout(styleTimer); overlaysReady = true
    for (const id of ['trail', 'hex', 'locate', 'points', 'points-3d', 'highlight', 'here', 'nodedrift', 'nodecircle']) {
      if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data: EMPTY })
    }
    // One decision for all four signal layers (#266) — see maplayers.js. Both
    // this block and set3D() read it, so a style reload and a FAB tap can no
    // longer disagree about what is on screen.
    const vis = layerVisibility({ mode, mode3D })
    const shown = (id) => (vis[id] ? 'visible' : 'none')
    if (!map.getLayer('trail')) map.addLayer({ id: 'trail', type: 'line', source: 'trail',
      paint: { 'line-color': cssVar('--ch-muted'), 'line-width': 3, 'line-opacity': 0.5 } })
    if (!map.getLayer('hex')) map.addLayer({ id: 'hex', type: 'fill', source: 'hex',
      layout: { visibility: shown('hex') },
      paint: { 'fill-color': ['get', 'color'], 'fill-opacity': ['get', 'op'] } })
    // 3D twin of 'hex': same source, extruded to 'height' (RSSI/SNR tier, #147).
    // fill-extrusion-opacity doesn't support data-driven expressions (unlike
    // fill-opacity on the flat layer), so it's a flat constant here — the tier
    // is still visible via colour + height.
    if (!map.getLayer('hex-3d')) map.addLayer({ id: 'hex-3d', type: 'fill-extrusion', source: 'hex',
      layout: { visibility: shown('hex-3d') },
      paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'height'],
        'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.85 } })
    // Buildings reuse the hosted style's own vector source (already fetched for
    // the 2D basemap) — only present on the hosted OpenFreeMap style, not the
    // bare fallback, hence the source guard.
    if (map.getSource('openmaptiles') && !map.getLayer('buildings-3d')) {
      // minzoom 13, not 14: OpenFreeMap's TileJSON declares the `building`
      // vector layer as minzoom 13, so 14 was one level stricter than the data
      // required and buildings vanished a zoom earlier than they had to. 13 is
      // the floor — there is genuinely no building geometry below it, so going
      // lower would only add empty queries. Matters most at high pitch, where
      // the far half of the view sits below the current zoom.
      map.addLayer({ id: 'buildings-3d', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'building', minzoom: 13,
        layout: { visibility: mode3D ? 'visible' : 'none' },
        paint: { 'fill-extrusion-color': cssVar('--ch-building'),
          'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 3],
          'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0], 'fill-extrusion-opacity': 0.75 } })
    }
    if (!map.getLayer('locate-heat')) map.addLayer({ id: 'locate-heat', type: 'heatmap', source: 'locate',
      layout: { visibility: locateVisible ? 'visible' : 'none' },
      paint: { 'heatmap-weight': ['get', 'w'], 'heatmap-intensity': 1, 'heatmap-radius': 32, 'heatmap-opacity': 0.7,
        'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0,0,0,0)', 0.2, cssVar('--ch-sig-mid'), 0.6, cssVar('--ch-sig-warm'), 1, cssVar('--ch-sig-hot')] } })
    if (!map.getLayer('points')) map.addLayer({ id: 'points', type: 'circle', source: 'points',
      layout: { visibility: shown('points') },
      paint: { 'circle-radius': 8, 'circle-color': ['get', 'color'], 'circle-opacity': ['get', 'fop'],
        'circle-stroke-color': ['get', 'color'], 'circle-stroke-width': 1, 'circle-stroke-opacity': ['get', 'op'] } })
    // 3D twin of 'points' (#250): a fill-extrusion pillar per reception, same
    // tier colour/height as hex-3d — reads clearly at pitch instead of a flat
    // circle disappearing under the hex bars/buildings. Separate source (its
    // Polygon footprints can't double as the flat layer's Point geometry, the
    // way hex/hex-3d share one source), same constant-opacity limitation.
    if (!map.getLayer('points-3d')) map.addLayer({ id: 'points-3d', type: 'fill-extrusion', source: 'points-3d',
      layout: { visibility: shown('points-3d') },
      paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'height'],
        // 1, not 0.9: the per-feature alpha in fill-extrusion-color carries
        // tier opacity and age-fade, and a layer-wide value would multiply on
        // top of it (#302).
        'fill-extrusion-base': 0, 'fill-extrusion-opacity': 1 } })
    if (!map.getLayer('highlight')) map.addLayer({ id: 'highlight', type: 'circle', source: 'highlight',
      paint: { 'circle-radius': 11, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': cssVar('--ch-accent'), 'circle-stroke-width': 3 } })
    if (!map.getLayer('here')) map.addLayer({ id: 'here', type: 'circle', source: 'here',
      paint: { 'circle-radius': 6, 'circle-color': 'rgba(0,0,0,0)', 'circle-stroke-color': cssVar('--ch-accent'), 'circle-stroke-width': 2 } })
    // Node-position layer (#197), added last so it sits above the hex heat —
    // it is an explicit opt-in overlay, and a connector buried under a hot hex
    // cell defeats the point of drawing it. The connector is solid; the circle
    // is dashed for a trusted search radius and dotted for the drift fallback,
    // so the two read differently without needing a label.
    if (!map.getLayer('nodedrift')) map.addLayer({ id: 'nodedrift', type: 'line', source: 'nodedrift',
      layout: { visibility: nodeLayerOn ? 'visible' : 'none' },
      paint: { 'line-color': ['get', 'color'], 'line-width': 1.5, 'line-opacity': 0.9 } })
    // Two layers over one source, split by dash pattern: line-dasharray is not
    // a data-driven property in MapLibre (a `case` expression there fails style
    // validation and the layer never mounts), so each pattern needs its own
    // layer with a constant value and a filter.
    if (!map.getLayer('nodecircle-search')) map.addLayer({ id: 'nodecircle-search', type: 'line', source: 'nodecircle',
      filter: ['==', ['get', 'style'], 'search'],
      layout: { visibility: nodeLayerOn ? 'visible' : 'none' },
      paint: { 'line-color': ['get', 'color'], 'line-width': 1.2, 'line-opacity': 0.8, 'line-dasharray': [4, 4] } })
    if (!map.getLayer('nodecircle-drift')) map.addLayer({ id: 'nodecircle-drift', type: 'line', source: 'nodecircle',
      filter: ['==', ['get', 'style'], 'drift'],
      layout: { visibility: nodeLayerOn ? 'visible' : 'none' },
      paint: { 'line-color': ['get', 'color'], 'line-width': 1.2, 'line-opacity': 0.8, 'line-dasharray': [1, 3] } })
    addTerrainPrototype()  // PROTOTYPE (#293) — no-op unless ?terrain= is set
    applyProtoSky()        // sky must be re-applied after a style swap too
    draw()
  }
  // Initial style: 'load' fires once when the first style is ready. A theme
  // switch (setStyle) does NOT re-fire 'load'/'style.load' — only 'styledata' —
  // so applyBasemap re-adds the overlays via afterStyle once the new style
  // finishes. addOverlays is idempotent (guards on existing source/layer).
  // afterStyle runs cb once a HOSTED (network) style finishes loading after
  // setStyle. 'idle' fires only after the new style + tiles settle, so it avoids
  // the race where isStyleLoaded() is briefly true for the OLD style.
  function afterStyle(cb) { map.once('idle', cb) }
  // mountBare adds the overlays onto the inline bare fallback style. An inline
  // style applies SYNCHRONOUSLY and emits no styledata/idle/style.load event
  // (and the map never reaches 'idle' when it got here stuck mid-load), so poll
  // isStyleLoaded() — which is immediately true — rather than waiting on a hook.
  function mountBare() { if (map.isStyleLoaded()) addOverlays(); else setTimeout(mountBare, 100) }
  map.on('load', addOverlays)
  armStyleFallback()   // safety net if the initial hosted style never loads

  // Point tap → open popup + roll the receptions-log playhead (#130). Registered
  // once; fires only while the 'points'/'points-3d' layer exists. Bound to
  // both layers (#250) — whichever one is visible for the current 2D/3D mode
  // is the one that can actually receive the click.
  function onPointClick(e) {
    const f = e.features && e.features[0]; if (!f) return
    const r = lastRecords.find((x) => String(x.id) === String(f.properties.id)); if (!r) return
    if (onMarkerFocusCb) onMarkerFocusCb(r)
    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '260px' })
      .setLngLat([r.lon, r.lat]).setHTML(popupHtml(r, lastSelected)).addTo(map)
    wireIsolate(popup, r); wireIgnore(popup, r)
  }
  for (const layerId of ['points', 'points-3d']) {
    map.on('click', layerId, onPointClick)
    map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = '' })
  }

  // MapLibre latches onto its 400×300 zero-size fallback when the map is built
  // before #map has laid out — a backgrounded tab, a PWA cold start, or (here)
  // creation after `await loadConfig()` in DOMContentLoaded. Its own resize
  // tracking doesn't reliably clear that initial latch, so the map renders in a
  // corner (or blank), and any later camera move — notably the 3D toggle's
  // pitch easeTo — just repaints at the wrong size. Reconcile the canvas to
  // its container whenever they disagree; cheap enough to run each render tick.
  function syncSize() {
    const c = map.getContainer(), cv = map.getCanvas()
    if (c.clientWidth && c.clientHeight &&
        (Math.abs(cv.clientWidth - c.clientWidth) > 1 || Math.abs(cv.clientHeight - c.clientHeight) > 1)) {
      map.resize()
    }
  }

  function draw() {
    syncSize()
    if (!map.getSource('points')) return   // style not ready yet
    const records = lastRecords, nowMs = Date.now()
    // Build only what a visible layer will read (#266). Previously all three
    // were rebuilt and re-uploaded every 1 Hz tick regardless of mode, so one
    // of the two point collections was always tessellated and shipped to the
    // GPU for a layer set to visibility:none. hex and hex-3d share one source,
    // so it is built when either is on.
    const vis = layerVisibility({ mode, mode3D })
    map.getSource('hex').setData(vis.hex || vis['hex-3d'] ? buildHexFC(records) : EMPTY)
    map.getSource('points').setData(vis.points ? buildPointsFC(records, nowMs) : EMPTY)
    map.getSource('points-3d').setData(vis['points-3d'] ? buildPoints3DFC(records, nowMs) : EMPTY)
    map.getSource('trail').setData(buildTrailFC())
    map.getSource('highlight').setData(buildHighlightFC())
    map.getSource('here').setData(buildHereFC())
    drawLocate(records)
    drawNodeLayer(records)
  }

  // ---- node-position layer (#197) ----
  // Colour encodes only what the rules decide, never a judgement about which
  // position is "right": the advertised one is operator-self-reported and can
  // be stale, so a gap is drift, not error.
  function driftColor(p) {
    if (p.kind === 'tight') return cssVar('--ch-accent')
    if (p.kind === 'drifted' && p.outsideCircle) return cssVar('--ch-accent-2')
    return cssVar('--ch-muted')
  }

  // The name rides alongside the ▲ rather than only inside the popup: this
  // layer is opt-in, so the map can afford the labels while it is on. The
  // label is absolutely positioned so it never shifts the glyph off the
  // coordinate the marker is anchored to.
  function nodeMarkerEl(cls, glyph, label) {
    const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    const el = document.createElement('div')
    const name = label ? `<span class="np-label">${esc(label)}</span>` : ''
    el.innerHTML = `<div class="${cls}">${glyph}${name}</div>`
    return el
  }

  // A Marker built from a custom element does not toggle its popup on tap by
  // itself, so wire the click explicitly.
  function addNodeMarker(cls, glyph, lngLat, popup, label) {
    const el = nodeMarkerEl(cls, glyph, label)
    const marker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).setPopup(popup).addTo(map)
    el.addEventListener('click', (e) => { e.stopPropagation(); marker.togglePopup() })
    nodeMarkers.push(marker)
  }

  // Recomputed per tick: the visible node set follows the viewport, and each
  // node's estimate follows whatever receptions are currently plotted.
  // Signature guards (like web/map.js) prevent popup flicker on every 1Hz render.
  function drawNodeLayer(records) {
    if (!map.getSource('nodedrift')) return
    if (!nodeLayerOn) {
      map.getSource('nodedrift').setData(EMPTY)
      map.getSource('nodecircle').setData(EMPTY)
      nodeMarkers.forEach((m) => m.remove()); nodeMarkers = []
      return
    }

    const b = map.getBounds()
    const bounds = { minLat: b.getSouth(), maxLat: b.getNorth(), minLon: b.getWest(), maxLon: b.getEast() }
    const draw = []

    // Registry nodes in view: advertised position, plus our estimate when we
    // have heard them enough to produce one. Match sender_id (from receptions)
    // against node pubkey: exact match for advert_pubkey, prefix match for
    // discover_pubkey, no match for relay/direct_hash/channel_name (#197/#272).
    // One pass over the records for the whole in-view set, not one pass per
    // node: this also lets an id that matches two nodes be refused outright
    // rather than attributed to both (#295).
    const inView = nodesInView(nodePositions, bounds)
    const byNode = groupSenderPointsForNodes(records, inView)
    for (const n of inView) {
      const pts = byNode.get(String(n.pubkey).toLowerCase()) || []
      const est = pts.length ? estimateFor(pts) : null
      const p = driftPresentation({ advertised: n, estimate: est })
      if (p.kind === 'none') continue
      draw.push({ n, est, p })
    }

    // Compute signature of what would be drawn — if unchanged, skip rebuild to preserve open popups
    const sig = draw.map((d) => [d.n.pubkey, d.n.lat, d.n.lon, d.p.kind, Math.round(d.p.driftM ?? -1),
      Math.round(d.p.circle ? d.p.circle.radiusM : -1),
      d.est ? `${d.est.centroid.lat.toFixed(5)},${d.est.centroid.lon.toFixed(5)}` : ''].join(':')).join('|')
    if (sig === nodePosSig) return   // nothing changed — leave the layer (and any open popup) alone
    nodePosSig = sig

    const lines = [], circles = []
    nodeMarkers.forEach((m) => m.remove()); nodeMarkers = []

    for (const { n, est, p } of draw) {
      const color = driftColor(p)
      // Only the ▲ is labelled — the ● belongs to the same node, so naming
      // both would just double the text for one target.
      addNodeMarker('np-advert', '▲', [n.lon, n.lat], nodePopup(n, p, est), n.name || n.pubkey)
      if (!est || !est.centroid) continue
      addNodeMarker('np-estimate', '', [est.centroid.lon, est.centroid.lat], nodePopup(n, p, est))
      lines.push({ type: 'Feature', properties: { color },
        geometry: { type: 'LineString', coordinates: [[n.lon, n.lat], [est.centroid.lon, est.centroid.lat]] } })
      if (p.circle) {
        const ring = circleRing(est.centroid, p.circle.radiusM)
        if (ring.length) circles.push({ type: 'Feature', properties: { color, style: p.circle.kind },
          geometry: { type: 'LineString', coordinates: ring } })
      }
    }
    map.getSource('nodedrift').setData(fc(lines))
    map.getSource('nodecircle').setData(fc(circles))
  }

  function nodePopup(n, p, est) {
    const esc = (s) => String(s ?? '—').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    const markers = p.kind === 'advertised-only' ? '▲ advertised' : '▲ advertised · ● estimated'
    // "no estimate" is not the same as "not heard" (#272). An advert or a
    // discover reply names the node outright, so those receptions join to it
    // and produce an estimate. A relayed packet measures the LAST HOP that
    // re-broadcast to us — a valid measurement of that repeater, but carried on
    // a 2-byte path prefix, which cannot be pinned to one registry node. So a
    // node heard only that way has plenty of receptions and still no estimate
    // here, and claiming it was never heard would be wrong.
    const drift = p.driftM != null
      ? `<br>drift ${Math.round(p.driftM)} m · ${est ? est.n : 0} points`
      : '<br>no estimate — no reception identifies this node directly'
    // The circle only claims accuracy when the sampling geometry earned it;
    // say which of the two is being drawn so the map is self-explaining.
    const circle = p.circle
      ? `<br><span class="np-muted">${p.circle.kind === 'search'
          ? `search radius ~${Math.round(p.circle.radiusM)} m`
          : 'one-sided — radius not trusted'}</span>`
      : ''
    return new maplibregl.Popup({ closeButton: true, closeOnClick: true, maxWidth: '260px' })
      .setHTML(`<div class="ch-popup">${esc(n.name || n.pubkey)}<br>`
        + `<span class="np-muted">${markers}</span>${drift}${circle}`
        + `<br><span class="np-muted np-caveat">Advertised position is self-reported by the operator and may be stale.</span></div>`)
  }

  // Locate: RSSI-weighted centroid + density heatmap over the plotted set (same
  // pure algorithm as web/map.js — see locate.js). The estimate always computes
  // so the readout is instant; visibility only hides the rendered overlay.
  function drawLocate(records) {
    const points = toLocatePoints(records)
    const res = points.length ? locate(points) : null
    if (map.getSource('locate')) map.getSource('locate').setData(locateVisible && res ? buildLocateHeatFC(records) : EMPTY)
    locateMarkers.forEach((m) => m.remove()); locateMarkers = []
    if (!locateVisible || !res) { if (onLocateCb) onLocateCb(null); return }
    if (res.centroid) {
      const el = document.createElement('div'); el.innerHTML = '<div class="lc-centroid"></div>'
      locateMarkers.push(new maplibregl.Marker({ element: el }).setLngLat([res.centroid.lon, res.centroid.lat]).addTo(map))
    }
    if (res.strongest) {
      const el = document.createElement('div'); el.innerHTML = '<div class="lc-strongest">★</div>'
      locateMarkers.push(new maplibregl.Marker({ element: el }).setLngLat([res.strongest.lon, res.strongest.lat]).addTo(map))
    }
    if (onLocateCb) onLocateCb(res)
  }

  // ---- public API (unchanged from the Leaflet version) ----
  // PROTOTYPE (#293): `?mock=1` substitutes synthetic receptions/nodes whenever
  // the real feed is empty — an unconnected app renders nothing, and terrain is
  // only worth judging with signal drawn over it. Real data always wins, so
  // this cannot mask a live session.
  function render(records, selectedIds) {
    lastRecords = (mockData && !(records && records.length)) ? mockData.records : (records || [])
    lastSelected = selectedIds || null
    draw()
  }
  function onLocate(cb) { onLocateCb = cb }
  function setLocateVisible(v) {
    locateVisible = !!v
    if (map.getLayer('locate-heat')) map.setLayoutProperty('locate-heat', 'visibility', locateVisible ? 'visible' : 'none')
    draw()
  }
  function setHighlight(id) { highlightId = id == null ? null : id; if (map.getSource('highlight')) map.getSource('highlight').setData(buildHighlightFC()) }
  function onMarkerFocus(cb) { onMarkerFocusCb = cb }
  function setPosition(lat, lon) {
    lastPos = [lat, lon]
    const next = appendTrailPoint(trail, lat, lon)
    if (next !== trail) { trail = next; if (map.getSource('trail')) map.getSource('trail').setData(buildTrailFC()) }
    if (map.getSource('here')) map.getSource('here').setData(buildHereFC())
    // jumpTo is an instant, non-animated camera set — calling it while the
    // user has an active gesture (e.g. pinch-zoom) in progress interrupts
    // MapLibre's own interaction handler and cancels the gesture (#236: this
    // is why pinch-to-zoom didn't work while compass mode was following). A
    // GPS fix landing mid-pinch now just skips this recenter; the next fix
    // (or the user releasing the gesture) catches up.
    if (follow && !map.isZooming() && !map.isMoving()) {
      map.jumpTo({ center: [lon, lat], zoom: acquired ? map.getZoom() : ACQUIRE_ZOOM })
      acquired = true
    }
  }
  function centerOn(lat, lon) { map.easeTo({ center: [lon, lat], duration: 400 }) }
  function recenter() { if (!lastPos) return; follow = true; map.jumpTo({ center: [lastPos[1], lastPos[0]] }); if (onFollow) onFollow(true) }
  function onFollowChange(cb) { onFollow = cb }
  function setBearing(deg) { settingBearing = true; try { map.setBearing(deg) } finally { settingBearing = false } }
  function onGestureRotate(cb) { rotateCb = cb }
  // Applies the current layer decision to the live style. Both the layer-mode
  // switch and the 3D toggle need it: in 3D the mode decides whether hex is
  // drawn flat (under the pillars) or extruded (#266).
  function applyLayerVisibility() {
    const vis = layerVisibility({ mode, mode3D })
    for (const id of ['hex', 'hex-3d', 'points', 'points-3d']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', vis[id] ? 'visible' : 'none')
    }
  }
  function setLayerMode(m) { mode = m; applyLayerVisibility(); draw() }
  // Node-position layer (#197): the registry set is fetched once by app.js and
  // handed over whole; bounds filtering happens here per tick.
  function setNodePositions(nodes) {
    const real = Array.isArray(nodes) ? nodes : []
    nodePositions = (mockData && !real.length) ? mockData.nodes : real
    draw()
  }
  function setNodeLayerVisible(v) {
    nodeLayerOn = !!v
    for (const id of ['nodedrift', 'nodecircle-search', 'nodecircle-drift']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', nodeLayerOn ? 'visible' : 'none')
    }
    draw()
  }
  // set3D(v) — the 2D/3D FAB: tilts the camera, swaps the flat hex/points
  // layers for their extruded twins, and shows 3D buildings (#147 phase 2,
  // points added in #250).
  function set3D(v) {
    mode3D = !!v
    map.easeTo({ pitch: mode3D ? PITCH_3D : 0, duration: 500 })
    applyLayerVisibility()
    // draw() as well, like setLayerMode: the hidden collection's source is left
    // at EMPTY (that is the point of the per-tick build guard), so revealing it
    // without repopulating shows nothing until the next 1 Hz tick.
    draw()
    if (map.getLayer('buildings-3d')) map.setLayoutProperty('buildings-3d', 'visibility', mode3D ? 'visible' : 'none')
  }
  function setAttenuator(db) { attenuatorDb = Number(db) || 0; draw() }
  function setTimeWindow(ms) { timeWindowMs = ms == null ? null : Number(ms) || null }
  function applyBasemap() { overlaysReady = false; map.setStyle(styleFor()); afterStyle(addOverlays); armStyleFallback() }   // re-add overlays after the style swap (+ fallback if it fails)
  function focusReception(rec) {
    if (!rec || rec.lat == null || rec.lon == null) return
    centerOn(rec.lat, rec.lon)
    const popup = new maplibregl.Popup({ closeButton: true, maxWidth: '260px' })
      .setLngLat([rec.lon, rec.lat]).setHTML(popupHtml(rec, lastSelected)).addTo(map)
    wireIsolate(popup, rec); wireIgnore(popup, rec)
  }
  function destroy() { map.remove() }
  return { setPosition, centerOn, recenter, onFollowChange, onLocate, setLocateVisible, render, setLayerMode, set3D, applyBasemap, focusReception, setAttenuator, setTimeWindow, setBearing, onGestureRotate, setHighlight, onMarkerFocus, setNodePositions, setNodeLayerVisible, destroy }
}

function popupHtml(r, selectedIds) {
  const esc = (s) => String(s ?? '—').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  // Glossary (#174): 'sender' is the general term for a heard device, 'repeater'
  // for one known to be relaying (not originating) traffic. `relay` here is the
  // internal sender_kind value (meshpacket.js) -- only its display label changed.
  const kindLabel = { channel_name: 'name', advert_pubkey: 'sender', discover_pubkey: 'sender', relay: 'repeater' }[r.sender_kind] || 'sender'
  const senderLine = r.sender_id ? `${kindLabel} ${esc(r.sender_label || r.sender_id)}` : 'sender — (none)'
  const chanLine = r.channel_name ? `<br>channel ${esc(r.channel_name)}` : ''
  const textLine = r._text ? `<br>"${esc(r._text)}"` : ''
  const key = r.sender_id ? String(r.sender_id).toLowerCase() : null
  const sole = !!(key && selectedIds && selectedIds.size === 1 && selectedIds.has(key))
  const isolateBtn = sole
    ? `<button class="ch-isolate active" disabled>Isolated ✓</button>`
    : `<button class="ch-isolate" ${r.sender_id ? '' : 'disabled'}>Isolate sender</button>`
  return `<div class="ch-popup">RSSI ${esc(r.rssi)} · SNR ${esc(r.snr)}<br>`
    + `${esc(packetTypeLabel(r.packet_type))}<br>`
    + senderLine + chanLine + textLine + '<br>'
    + isolateBtn
    + ` <button class="ch-ignore" ${r.sender_id ? '' : 'disabled'}>Ignore this ID</button></div>`
}
function wireIsolate(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-isolate')
  if (!btn || !r.sender_id || btn.disabled) return
  btn.onclick = () => {
    document.dispatchEvent(new CustomEvent('hunt:isolate-sender', { detail: { id: r.sender_id, label: r.sender_label } }))
    btn.textContent = 'Isolated ✓'; btn.disabled = true; btn.classList.add('active')
  }
}
function wireIgnore(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-ignore')
  if (btn && r.sender_id) btn.onclick = () => document.dispatchEvent(new CustomEvent('hunt:ignore-sender', { detail: { id: r.sender_id } }))
}
