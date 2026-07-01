# Changelog

## [0.4.0](https://github.com/efiten/core-hunter/compare/web-v0.3.0...web-v0.4.0) (2026-07-01)


### Features

* CoreScope mobile-observer points as two optional map layers (adverts/relays) ([32e8481](https://github.com/efiten/core-hunter/commit/32e84819374bae2c4c49f80d0369df7833774de0))
* CoreScope mobile-observer points as two optional map layers (adverts/relays) ([aa411fd](https://github.com/efiten/core-hunter/commit/aa411fdab14d4124d2474f93fa59874bc76f7836)), closes [#60](https://github.com/efiten/core-hunter/issues/60)
* identify every zero-hop node (advert + discover) by ID + role, resolve name via API ([3728f26](https://github.com/efiten/core-hunter/commit/3728f262d84fbeab984d130e0979422326532db9)), closes [#41](https://github.com/efiten/core-hunter/issues/41)
* identify zero-hop nodes (advert + discover) by ID + role, resolve name via API ([5bc0d50](https://github.com/efiten/core-hunter/commit/5bc0d50697cbb390ccb153714aec70584ef11246))
* Locate merges CoreScope sightings + focus-mode hides other points ([903a46f](https://github.com/efiten/core-hunter/commit/903a46f1799ea971a6548b8b45ada84d162ef979))
* Locate merges CoreScope sightings + focus-mode hides other points ([ad36014](https://github.com/efiten/core-hunter/commit/ad360145d820d6fea0f98c1b53bb18143d871c9e)), closes [#62](https://github.com/efiten/core-hunter/issues/62)
* **web:** live Locate layer — centroid, heatmap, outliers, polling ([bed8936](https://github.com/efiten/core-hunter/commit/bed89367e9410853ec0c37adc329a087e9ec4675))
* **web:** live Locate overlay — RSSI-based transmitter localization ([bfd694f](https://github.com/efiten/core-hunter/commit/bfd694f208b53949fe3baa9aed6b9a876c3bb04c))
* **web:** Locate — show strongest-reception marker alongside centroid ([03139db](https://github.com/efiten/core-hunter/commit/03139db5624b0a7f72a2177abe762135bc088495))
* **web:** Locate button + info-card scaffolding ([7f0cffa](https://github.com/efiten/core-hunter/commit/7f0cffabfb5fd57cf42c20aa745ce70f24b775e5))
* **web:** locate.js convergence + encirclement stats ([02f2ed9](https://github.com/efiten/core-hunter/commit/02f2ed9e05d798d638baacf6377407f801d2ecbe))
* **web:** locate.js core math + web vitest harness ([c80df52](https://github.com/efiten/core-hunter/commit/c80df52fcd4f64711e92d86217757cb6a3318027))
* **web:** locate.js geographic outlier rejection ([2718b19](https://github.com/efiten/core-hunter/commit/2718b19789fc45a974691ef40326ba08075bc59a))
* **web:** locate.js RSSI-weighted kernel-density heatmap ([e9b7a79](https://github.com/efiten/core-hunter/commit/e9b7a7991a658ad74068181b0657ca8a6465308a))
* **web:** locate() orchestrator ([0f5fb3f](https://github.com/efiten/core-hunter/commit/0f5fb3fedd6fdc810ceab7ab72f7474e7b2db86c))
* **web:** point popup — sender ID + 'Locate this sender' button ([5d29b73](https://github.com/efiten/core-hunter/commit/5d29b73ee6e01ba0f086ae559c36e7449791433a))
* **web:** point popup shows sender ID + a 'Locate this sender' button ([62d3de7](https://github.com/efiten/core-hunter/commit/62d3de76e23c25086108caa1eb75c9e31698324f)), closes [#58](https://github.com/efiten/core-hunter/issues/58)


### Bug Fixes

* **web:** address final-review findings on Locate ([375deeb](https://github.com/efiten/core-hunter/commit/375deebbebe4889f3b728c07431065ec4e3a1464))
* **web:** fade heatmap border to transparent (complete the rectangle fix) ([dde697d](https://github.com/efiten/core-hunter/commit/dde697d3bac446e243b4367257a6403decb7805b))
* **web:** heatmap rectangle artifact + e2e for filter bar & toggles ([a1c0971](https://github.com/efiten/core-hunter/commit/a1c097130450f067843dffee3bcb935effe8e2e9))
* **web:** Locate — dedupe stationary clusters (10m) + 20km outlier floor ([76005b1](https://github.com/efiten/core-hunter/commit/76005b1b6004be309ebf3fd327c2d1fe873230d6)), closes [#33](https://github.com/efiten/core-hunter/issues/33)
* **web:** Locate — dedupe stationary clusters, 20km outlier floor, strongest-reception marker ([050c92b](https://github.com/efiten/core-hunter/commit/050c92b4b7e0768c3395181c743a5360cd668138))
* **web:** Locate — linear-power RSSI weighting with -55 dBm cap ([68ebe3e](https://github.com/efiten/core-hunter/commit/68ebe3eb3531f089f83e996acca22e9cd957b447))
* **web:** Locate — linear-power RSSI weighting with -55 dBm cap ([d0e7382](https://github.com/efiten/core-hunter/commit/d0e7382bd2f44eedbe8c7dc9b18ff1b67d1ee818))
* **web:** pad density grid by 3-sigma so the heatmap border is transparent ([f92d614](https://github.com/efiten/core-hunter/commit/f92d61424487d68f2e85936dc2985cedd89bd437)), closes [#39](https://github.com/efiten/core-hunter/issues/39)
* **web:** remove heatmap rectangle artifact + e2e for filter bar & toggles ([6f2fe5e](https://github.com/efiten/core-hunter/commit/6f2fe5eae83eba95bb062cae94d8607f50b6fabc)), closes [#37](https://github.com/efiten/core-hunter/issues/37)


### Tests

* **web:** Playwright E2E harness + Locate overlay suite (run web in CI) ([11f7df8](https://github.com/efiten/core-hunter/commit/11f7df8644b7d9e0741957042f1386b879824796))
* **web:** Playwright E2E harness + Locate suite; run web in CI ([205cd47](https://github.com/efiten/core-hunter/commit/205cd478f74de2bbf25f16cf2367cec8b373618b)), closes [#35](https://github.com/efiten/core-hunter/issues/35)
* **web:** scope vitest to *.test.js so it ignores the Playwright e2e specs ([e7d0617](https://github.com/efiten/core-hunter/commit/e7d0617c897a7d95d84c3d59464137f91d7500e8))


### Miscellaneous Chores

* **web:** gitignore dev-only vitest harness artifacts ([d866ec2](https://github.com/efiten/core-hunter/commit/d866ec2b3435b711fe48ad92c144cccdaa14aa70))

## [0.3.0](https://github.com/efiten/core-hunter/compare/web-v0.2.0...web-v0.3.0) (2026-06-30)


### Features

* **app,web:** resolve node names from CoreScope for full-pubkey senders ([197fc5a](https://github.com/efiten/core-hunter/commit/197fc5a399f6655c240951cea086bf56d891fcd1))

## [0.2.0](https://github.com/efiten/core-hunter/compare/web-v0.1.0...web-v0.2.0) (2026-06-30)


### Features

* analysis website — multi-hunter map at map.on8ar.eu ([#19](https://github.com/efiten/core-hunter/issues/19)) ([42465fb](https://github.com/efiten/core-hunter/commit/42465fb4226677439b5a86d420cb990847b6334d))
* **server,web:** expose server version via /api/version and show it on the site ([c4cde9d](https://github.com/efiten/core-hunter/commit/c4cde9d3e55dc9f193eb0c0df62497e5b34b187c))
* **web:** add light/dark theme toggle ([58f5bfe](https://github.com/efiten/core-hunter/commit/58f5bfe69881797921c8c39d4956c950a7cd9d3b))
* **web:** version the analysis site as its own release-please component ([be038ed](https://github.com/efiten/core-hunter/commit/be038ed374c90be311736ca78f95353427b7d008))


### Bug Fixes

* **web:** default timeframe to today and open native picker on click ([1de7bc3](https://github.com/efiten/core-hunter/commit/1de7bc33af66a1f2551652cf30b87932fd91636b))
