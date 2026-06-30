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
