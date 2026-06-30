import { test, expect } from '@playwright/test'

// A small spread of synthetic receptions around (51, 4): one strong, several weak,
// all > 10 m apart (so dedupe keeps them) and < 20 km (so none are rejected).
const POINTS = [
  { lat: 51.000, lon: 4.000, rssi: -52 }, // strongest
  { lat: 51.010, lon: 4.000, rssi: -88 },
  { lat: 50.990, lon: 4.000, rssi: -90 },
  { lat: 51.000, lon: 4.012, rssi: -86 },
]

// Stub the read endpoints by default so the page's own refresh/poll never errors
// and the test asserts only what it sets up. Individual tests override as needed.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/points*', (r) => r.fulfill({ json: { points: [] } }))
  await page.route('**/api/heatmap*', (r) => r.fulfill({ json: { features: [] } }))
  await page.route('**/api/hunters*', (r) => r.fulfill({ json: { hunters: [] } }))
})

test('__locateRender draws centroid, strongest marker, heatmap and info card', async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => typeof window.__locateRender === 'function')
  await page.evaluate((pts) => window.__locateRender(pts, '4a'), POINTS)

  await expect(page.locator('.lc-centroid')).toHaveCount(1)
  await expect(page.locator('.lc-strongest')).toHaveCount(1)
  await expect(page.locator('img.leaflet-image-layer')).toHaveCount(1) // heatmap overlay
  const info = page.locator('#locate-info')
  await expect(info).toBeVisible()
  await expect(info).toContainText('search radius')
  await expect(info).toContainText('strongest -52 dBm')
  await expect(info).toContainText('1-byte ID') // senderId '4a' (< 64 chars) -> hash note
})

test('heatmap has no opaque rectangle floor (off-diagonal corner transparent)', async ({ page }) => {
  // A NE–SW diagonal line of points: the off-diagonal (NW/SE) corners of the
  // bounding box are far from every point, so their density is ~0 and must be
  // gated to fully transparent — the regression guard for the rectangle artifact.
  const DIAG = [
    { lat: 51.000, lon: 4.000, rssi: -52 },
    { lat: 51.010, lon: 4.014, rssi: -80 },
    { lat: 50.990, lon: 3.986, rssi: -82 },
  ]
  await page.goto('/')
  await page.waitForFunction(() => typeof window.__locateRender === 'function')
  await page.evaluate((pts) => window.__locateRender(pts, '4a'), DIAG)
  await expect(page.locator('img.leaflet-image-layer')).toHaveCount(1)

  const alpha = await page.evaluate(async () => {
    const img = document.querySelector('img.leaflet-image-layer')
    const im = new Image()
    await new Promise((res) => { im.onload = res; im.src = img.src })
    const cv = document.createElement('canvas')
    cv.width = im.naturalWidth; cv.height = im.naturalHeight
    const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0)
    const at = (x, y) => ctx.getImageData(x, y, 1, 1).data[3]
    return { corner: at(0, 0), center: at(cv.width >> 1, cv.height >> 1) }
  })
  expect(alpha.corner).toBe(0) // gated floor → no rectangle
  expect(alpha.center).toBeGreaterThan(0) // hotspot still drawn
})

test('Locate button fetches /api/points and renders the overlay', async ({ page }) => {
  await page.route('**/api/points*', (r) => r.fulfill({ json: { points: POINTS } }))
  await page.goto('/')
  await page.fill('#f-sender', '4a')
  await page.click('#locate-toggle')

  await expect(page.locator('.lc-centroid')).toHaveCount(1)
  await expect(page.locator('.lc-strongest')).toHaveCount(1)
  await expect(page.locator('#locate-info')).toContainText('strongest -52 dBm')
})

test('Locate with no sender shows the prompt and does not fetch', async ({ page }) => {
  await page.goto('/')
  await page.click('#locate-toggle')
  await expect(page.locator('#locate-info')).toContainText('Enter a sender ID')
})

test('Locate surfaces a fetch error instead of crashing the poll loop', async ({ page }) => {
  await page.route('**/api/points*', (r) => r.fulfill({ status: 500, body: 'boom' }))
  await page.goto('/')
  await page.fill('#f-sender', '4a')
  await page.click('#locate-toggle')
  await expect(page.locator('#locate-info')).toContainText('Could not load points')
})
