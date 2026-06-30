import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/points*', (r) => r.fulfill({ json: { points: [] } }))
  await page.route('**/api/heatmap*', (r) => r.fulfill({ json: { features: [] } }))
  await page.route('**/api/hunters*', (r) => r.fulfill({
    json: { hunters: [{ hunter_pubkey: 'abc123def456', hunter_name: 'ON8AR', count: 42 }] },
  }))
})

test('theme toggle flips data-theme, persists, and swaps the glyph', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('#theme-toggle')).toHaveText('🌙')

  await page.click('#theme-toggle')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('#theme-toggle')).toHaveText('☀️')
  expect(await page.evaluate(() => localStorage.getItem('ch-theme'))).toBe('light')
})

test('layer toggle cycles points → hex → both, and hex fetches /api/heatmap', async ({ page }) => {
  await page.goto('/')
  const btn = page.locator('#layer-toggle')
  await expect(btn).toHaveText('points')

  const heatmapReq = page.waitForRequest('**/api/heatmap*')
  await btn.click()
  await expect(btn).toHaveText('hex')
  await heatmapReq // hex mode drew the heatmap layer

  await btn.click()
  await expect(btn).toHaveText('both')
  await btn.click()
  await expect(btn).toHaveText('points')
})

test('hunter dropdown is populated from /api/hunters', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#f-hunter option')).toHaveCount(2) // "All hunters" + the fetched one
  await expect(page.locator('#f-hunter')).toContainText('ON8AR (42)')
})

test('discover sender: prefix ID is resolved to a name via the API, popup shows name · role', async ({ page }) => {
  await page.route('**/api/points*', (r) => r.fulfill({
    json: { points: [{
      lat: 51, lon: 4, rssi: -90, snr: -8,
      sender_id: '7b0e24700e0c0d3e', sender_label: '', sender_role: 'Repeater',
      hunter_name: 'X', packet_type: 'Control', rx_at: '2026-06-30T15:40:51Z',
    }] },
  }))
  await page.route('**/nodes/resolve*', (r) => r.fulfill({ json: { name: 'NEO7HI', ambiguous: false } }))

  // the website must look up the 8-byte discover prefix (not just full pubkeys)
  const resolveReq = page.waitForRequest((r) => r.url().includes('/nodes/resolve') && r.url().includes('7b0e24700e0c0d3e'))
  await page.goto('/')
  await resolveReq

  // after resolution + redraw, the marker popup shows the resolved name and role
  await expect(async () => {
    await page.locator('path.leaflet-interactive').first().click({ force: true })
    await expect(page.locator('.leaflet-popup-content')).toContainText('NEO7HI · Repeater', { timeout: 1000 })
  }).toPass()
})

test('point popup "Locate this sender" fills the filter and starts a locate', async ({ page }) => {
  const SID = 'db11db11f7808b97'
  await page.route('**/api/points*', (r) => r.fulfill({
    json: { points: [{
      lat: 51, lon: 4, rssi: -90, snr: -8, sender_id: SID, sender_label: '',
      sender_role: 'Repeater', hunter_name: 'X', packet_type: 'Control', rx_at: '2026-06-30T15:40:51Z',
    }] },
  }))
  await page.route('**/nodes/resolve*', (r) => r.fulfill({ json: { name: '', ambiguous: false } }))
  await page.goto('/')

  await expect(async () => {
    await page.locator('path.leaflet-interactive').first().click({ force: true })
    await expect(page.locator('.lc-locate')).toBeVisible({ timeout: 1000 })
  }).toPass()
  await page.locator('.lc-locate').click()

  await expect(page.locator('#f-sender')).toHaveValue(SID)
  await expect(page.locator('#locate-toggle')).toHaveClass(/on/)
  await expect(page.locator('#locate-info')).toBeVisible()
})

test('sender filter reaches the /api/points query', async ({ page }) => {
  await page.goto('/')
  const req = page.waitForRequest((r) => r.url().includes('/api/points') && r.url().includes('sender=4a'))
  await page.fill('#f-sender', '4a')
  await req // only resolves if a points request carrying sender=4a was issued
})
