# Decision — map migrated to MapLibre GL on an OpenFreeMap vector basemap (#147)

2026-07-06. The mobile hunter map moved from Leaflet + `leaflet-rotate` to
**MapLibre GL**, phase 1 (2D parity). Rationale and the two externally-visible
consequences worth recording:

## Why
- **Native rotation + pitch** replaces the `leaflet-rotate` 0.2.8 plugin — and
  removes the renderer-transform zoom-drift monkeypatch we carried for it
  (#167/#168).
- A **vector** basemap is required for the phase-2 3D mode (buildings + terrain);
  raster tiles have no geometry. Doing it now avoids a later re-do.

## Basemap host (privacy / dependency note)
The vector basemap is **OpenFreeMap** (`tiles.openfreemap.org`) — key-free,
styles `dark` / `positron`. Like the previous CARTO raster basemap
(`basemaps.cartocdn.com`), every pan/zoom sends the hunter's current **viewport
bounds** to this third-party host (style JSON, vector tiles, glyphs). This is a
**host swap**, not a new class of egress, but it is a new external dependency and
OpenFreeMap offers **no uptime or privacy guarantee**. Noted here for the
privacy-conscious posture; swapping to a self-hosted or paid tile host later is a
config change (the two style URLs in `huntmap.js`).

## Overlays must survive basemap loss (field robustness)
A direction-finding tool is used on poor connectivity. The signal overlays
(points, hex, trail, here-marker, highlight, locate) must **not** be gated on the
third-party basemap: if the OpenFreeMap style never loads (offline / host down /
cold PWA cache), `huntmap.js` falls back to a bare background style after a short
timeout and mounts the overlays on it, so the signal layer stays visible — the
same graceful degradation Leaflet had when a raster tile 404'd.
