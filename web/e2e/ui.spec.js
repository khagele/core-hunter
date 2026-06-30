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

test('sender filter reaches the /api/points query', async ({ page }) => {
  await page.goto('/')
  const req = page.waitForRequest((r) => r.url().includes('/api/points') && r.url().includes('sender=4a'))
  await page.fill('#f-sender', '4a')
  await req // only resolves if a points request carrying sender=4a was issued
})
