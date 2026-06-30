// Minimal service worker — its only job is to satisfy the PWA install criteria
// (a registered service worker with a fetch handler). It deliberately does NOT
// cache: all captured data is persisted in IndexedDB before any MQTT publish, so
// offline resilience lives in the app, not here. The empty fetch handler lets
// every request go straight to the network.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
