import { defineConfig } from 'vitest/config'

// Scope vitest to the unit tests only. The e2e/ Playwright specs (*.spec.js) are
// run by `playwright test`, not vitest — without this, vitest globs them and
// fails on Playwright's test.beforeEach.
export default defineConfig({
  test: {
    include: ['**/*.test.js'],
    exclude: ['e2e/**', 'node_modules/**'],
  },
})
