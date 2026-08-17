# Changelog

## [1.0.0](https://github.com/khagele/core-hunter/compare/server-v1.1.1...server-v1.0.0) (2026-08-17)


### Features

* analysis website — multi-hunter map at map.on8ar.eu ([#19](https://github.com/khagele/core-hunter/issues/19)) ([42465fb](https://github.com/khagele/core-hunter/commit/42465fb4226677439b5a86d420cb990847b6334d))
* CoreScope mobile-observer points as two optional map layers (adverts/relays) ([32e8481](https://github.com/khagele/core-hunter/commit/32e84819374bae2c4c49f80d0369df7833774de0))
* CoreScope mobile-observer points as two optional map layers (adverts/relays) ([aa411fd](https://github.com/khagele/core-hunter/commit/aa411fdab14d4124d2474f93fa59874bc76f7836)), closes [#60](https://github.com/khagele/core-hunter/issues/60)
* identify every zero-hop node (advert + discover) by ID + role, resolve name via API ([3728f26](https://github.com/khagele/core-hunter/commit/3728f262d84fbeab984d130e0979422326532db9)), closes [#41](https://github.com/khagele/core-hunter/issues/41)
* identify zero-hop nodes (advert + discover) by ID + role, resolve name via API ([5bc0d50](https://github.com/khagele/core-hunter/commit/5bc0d50697cbb390ccb153714aec70584ef11246))
* lift the 5000-point cap — paged points fetch (map 25k, Locate all) ([#160](https://github.com/khagele/core-hunter/issues/160)) ([0a1413b](https://github.com/khagele/core-hunter/commit/0a1413b5a027de4417ca31a576b0c1e01f3efa7a))
* Locate merges CoreScope sightings + focus-mode hides other points ([903a46f](https://github.com/khagele/core-hunter/commit/903a46f1799ea971a6548b8b45ada84d162ef979))
* Locate merges CoreScope sightings + focus-mode hides other points ([ad36014](https://github.com/khagele/core-hunter/commit/ad360145d820d6fea0f98c1b53bb18143d871c9e)), closes [#62](https://github.com/khagele/core-hunter/issues/62)
* **server,web:** expose server version via /api/version and show it on the site ([c4cde9d](https://github.com/khagele/core-hunter/commit/c4cde9d3e55dc9f193eb0c0df62497e5b34b187c))
* **server:** user management, roles, and guest data degradation (v1.0) ([a3a9c8a](https://github.com/khagele/core-hunter/commit/a3a9c8a05d9f09e99d23655b213dd91f0459670e))
* web filter parity with the app (packet-type + direct-only via hops) ([#170](https://github.com/khagele/core-hunter/issues/170)) ([3ce0640](https://github.com/khagele/core-hunter/commit/3ce0640def61afe4fb0331c2ab2e5dfb6a3ffaec))
* **web,server:** browsable multi-select target-list picker ([#223](https://github.com/khagele/core-hunter/issues/223)) ([#288](https://github.com/khagele/core-hunter/issues/288)) ([184712b](https://github.com/khagele/core-hunter/commit/184712b101aa84a3aaf0b5adb2898c56f1daacef))


### Bug Fixes

* **server:** emit hex coverage coordinates in GeoJSON [lon,lat] order ([e55514b](https://github.com/khagele/core-hunter/commit/e55514b29e73178aba57db2a9702a636bfe27125))
* **server:** store an unknown gps accuracy as NULL and reject a positionless payload ([#349](https://github.com/khagele/core-hunter/issues/349)) ([3232b90](https://github.com/khagele/core-hunter/commit/3232b90725380626b955f49b025f9086dacfde5c))


### Documentation

* dedupe release changelogs (drop merge-commit duplicates) ([#70](https://github.com/khagele/core-hunter/issues/70)) ([10d0528](https://github.com/khagele/core-hunter/commit/10d0528017a72cdc4db530dafaf157a37bb7487f))


### Build System

* **server:** build image with golang:1.26-alpine (go.mod requires go 1.25) ([e3d081b](https://github.com/khagele/core-hunter/commit/e3d081b301802f3f63f215262b2ccfff201569e4))


### Miscellaneous Chores

* introduce per-component versioning with release-please ([#7](https://github.com/khagele/core-hunter/issues/7)) ([ef511db](https://github.com/khagele/core-hunter/commit/ef511dbc48c3c96102b06933a4199ed8b24d698c))
* release master ([2f15176](https://github.com/khagele/core-hunter/commit/2f151765533fcddb061b0b5c288f62f1eb287f51))
* release master ([68d62e0](https://github.com/khagele/core-hunter/commit/68d62e0d8c2709bf7ba1a36f7d3521f3a6397ca5))
* release master ([67a1c47](https://github.com/khagele/core-hunter/commit/67a1c47ad65e15b966735b2c22c76615d02a5c8e))
* release master ([78e291c](https://github.com/khagele/core-hunter/commit/78e291ceefdea9f69b4f139b57813389c2a5ea60))
* release master ([8c49e65](https://github.com/khagele/core-hunter/commit/8c49e65a6ee5bb2682d476df259bb55234f25d79))
* release master ([6feda9f](https://github.com/khagele/core-hunter/commit/6feda9fe51b2bfa5b22a1bf6b94b0e2a26a145ff))
* release master ([#109](https://github.com/khagele/core-hunter/issues/109)) ([1c06593](https://github.com/khagele/core-hunter/commit/1c06593b601453a3734ca99bb09487d1506dd725))
* release master ([#172](https://github.com/khagele/core-hunter/issues/172)) ([2071ec1](https://github.com/khagele/core-hunter/commit/2071ec116b54cddc5e06cddf850761d157e2ceb0))
* release master ([#294](https://github.com/khagele/core-hunter/issues/294)) ([8000d31](https://github.com/khagele/core-hunter/commit/8000d31c57708f9d90bad328a54bfa5237c248df))
* release master ([#348](https://github.com/khagele/core-hunter/issues/348)) ([30ba551](https://github.com/khagele/core-hunter/commit/30ba551af9a54a24078b78afd12ff08c1f2812d3))
* release master ([#71](https://github.com/khagele/core-hunter/issues/71)) ([24eb458](https://github.com/khagele/core-hunter/commit/24eb458faa8503406e45b30eef1f7e9b4c352139))
* release server 0.2.0 ([#20](https://github.com/khagele/core-hunter/issues/20)) ([d85c160](https://github.com/khagele/core-hunter/commit/d85c160a6f1284ead236606c5cfbccf20ab83328))

## [1.1.1](https://github.com/efiten/core-hunter/compare/server-v1.1.0...server-v1.1.1) (2026-08-15)


### Bug Fixes

* **server:** store an unknown gps accuracy as NULL and reject a positionless payload ([#349](https://github.com/efiten/core-hunter/issues/349)) ([3232b90](https://github.com/efiten/core-hunter/commit/3232b90725380626b955f49b025f9086dacfde5c))

## [1.1.0](https://github.com/efiten/core-hunter/compare/server-v1.0.1...server-v1.1.0) (2026-07-27)


### Features

* **web,server:** browsable multi-select target-list picker ([#223](https://github.com/efiten/core-hunter/issues/223)) ([#288](https://github.com/efiten/core-hunter/issues/288)) ([184712b](https://github.com/efiten/core-hunter/commit/184712b101aa84a3aaf0b5adb2898c56f1daacef))

## [1.0.1](https://github.com/efiten/core-hunter/compare/server-v1.0.0...server-v1.0.1) (2026-07-04)


### Build System

* **server:** build image with golang:1.26-alpine (go.mod requires go 1.25) ([e3d081b](https://github.com/efiten/core-hunter/commit/e3d081b301802f3f63f215262b2ccfff201569e4))

## [1.0.0](https://github.com/efiten/core-hunter/compare/server-v0.6.0...server-v1.0.0) (2026-07-04)


### Features

* **server:** user management, roles, and guest data degradation (v1.0) ([a3a9c8a](https://github.com/efiten/core-hunter/commit/a3a9c8a05d9f09e99d23655b213dd91f0459670e))

## [0.6.0](https://github.com/efiten/core-hunter/compare/server-v0.5.0...server-v0.6.0) (2026-07-03)


### Features

* web filter parity with the app (packet-type + direct-only via hops) ([#170](https://github.com/efiten/core-hunter/issues/170)) ([3ce0640](https://github.com/efiten/core-hunter/commit/3ce0640def61afe4fb0331c2ab2e5dfb6a3ffaec))

## [0.5.0](https://github.com/efiten/core-hunter/compare/server-v0.4.1...server-v0.5.0) (2026-07-02)


### Features

* lift the 5000-point cap — paged points fetch (map 25k, Locate all) ([#160](https://github.com/efiten/core-hunter/issues/160)) ([0a1413b](https://github.com/efiten/core-hunter/commit/0a1413b5a027de4417ca31a576b0c1e01f3efa7a))

## [0.4.1](https://github.com/efiten/core-hunter/compare/server-v0.4.0...server-v0.4.1) (2026-07-01)


### Documentation

* dedupe release changelogs (drop merge-commit duplicates) ([#70](https://github.com/efiten/core-hunter/issues/70)) ([10d0528](https://github.com/efiten/core-hunter/commit/10d0528017a72cdc4db530dafaf157a37bb7487f))

## [0.4.0](https://github.com/efiten/core-hunter/compare/server-v0.3.0...server-v0.4.0) (2026-07-01)


### Features

* CoreScope mobile-observer points as two optional map layers (adverts/relays) ([aa411fd](https://github.com/efiten/core-hunter/commit/aa411fdab14d4124d2474f93fa59874bc76f7836)), closes [#60](https://github.com/efiten/core-hunter/issues/60)
* identify every zero-hop node (advert + discover) by ID + role, resolve name via API ([3728f26](https://github.com/efiten/core-hunter/commit/3728f262d84fbeab984d130e0979422326532db9)), closes [#41](https://github.com/efiten/core-hunter/issues/41)
* Locate merges CoreScope sightings + focus-mode hides other points ([ad36014](https://github.com/efiten/core-hunter/commit/ad360145d820d6fea0f98c1b53bb18143d871c9e)), closes [#62](https://github.com/efiten/core-hunter/issues/62)

## [0.3.0](https://github.com/efiten/core-hunter/compare/server-v0.2.0...server-v0.3.0) (2026-06-30)


### Features

* **server,web:** expose server version via /api/version and show it on the site ([c4cde9d](https://github.com/efiten/core-hunter/commit/c4cde9d3e55dc9f193eb0c0df62497e5b34b187c))


### Bug Fixes

* **server:** emit hex coverage coordinates in GeoJSON [lon,lat] order ([e55514b](https://github.com/efiten/core-hunter/commit/e55514b29e73178aba57db2a9702a636bfe27125))

## [0.2.0](https://github.com/efiten/core-hunter/compare/server-v0.1.0...server-v0.2.0) (2026-06-30)


### Features

* analysis website — multi-hunter map at map.on8ar.eu ([#19](https://github.com/efiten/core-hunter/issues/19)) ([42465fb](https://github.com/efiten/core-hunter/commit/42465fb4226677439b5a86d420cb990847b6334d))
