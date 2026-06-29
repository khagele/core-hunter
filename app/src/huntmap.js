import { hexCellAt, hexBoundary } from './hexgrid.js'
import { rssiTier, tierColorVar, fillOpacity } from './signal.js'
import { getConfig } from './config.js'

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export function createHuntMap(containerId) {
  if (typeof L === 'undefined') return { setPosition() {}, render() {}, setLayerMode() {}, applyBasemap() {}, destroy() {} }
  const cfg = getConfig()
  const offset = (cfg && cfg.rssiCalibrationOffset) || 0
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
    const tier = rssiTier(rec.rssi, offset)
    const color = cssVar(tierColorVar(tier))
    return {
      radius: 7,
      color,
      weight: 1,
      fillColor: color,
      fillOpacity: fillOpacity(tier),
    }
  }

  function render(records, nowMs) {
    pointLayer.clearLayers(); hexLayer.clearLayers()
    if (mode !== 'hex') {
      for (const r of records) {
        if (r.lat == null || r.lon == null) continue
        const m = L.circleMarker([r.lat, r.lon], pointStyle(r))
        m.bindPopup(popupHtml(r))
        m.on('popupopen', (e) => { wireIsolate(e.popup, r); wireIgnore(e.popup, r) })
        m.addTo(pointLayer)
      }
    }
    if (mode !== 'points') {
      const cells = new Map()
      for (const r of records) {
        if (r.lat == null || r.lon == null) continue
        const id = hexCellAt(r.lat, r.lon, 11)
        const cur = cells.get(id)
        if (!cur || (r.rssi ?? -999) > (cur.best ?? -999)) cells.set(id, { best: r.rssi })
      }
      for (const [id, c] of cells) {
        // hexBoundary returns [lat,lon] pairs (closed ring) — directly usable by L.polygon
        const ring = hexBoundary(id); if (!ring) continue
        const tier = rssiTier(c.best, offset)
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
    + `<button class="ch-isolate" ${r.sender_key ? '' : 'disabled'}>Isolate sender</button>`
    + ` <button class="ch-ignore" ${r.sender_key ? '' : 'disabled'}>Ignore this ID</button></div>`
}
function wireIsolate(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-isolate')
  if (btn && r.sender_key) btn.onclick = () => document.dispatchEvent(
    new CustomEvent('hunt:isolate-sender', { detail: { key: r.sender_key, keylen: r.sender_keylen } }))
}
function wireIgnore(popup, r) {
  const btn = popup.getElement()?.querySelector('.ch-ignore')
  if (btn && r.sender_key) btn.onclick = () => document.dispatchEvent(
    new CustomEvent('hunt:ignore-sender', { detail: { key: r.sender_key, keylen: r.sender_keylen } }))
}
