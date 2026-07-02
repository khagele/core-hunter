# Changelog

## [0.12.0](https://github.com/khagele/core-hunter/compare/app-v0.11.0...app-v0.12.0) (2026-07-02)


### Features

* **app,web:** resolve node names from CoreScope for full-pubkey senders ([197fc5a](https://github.com/khagele/core-hunter/commit/197fc5a399f6655c240951cea086bf56d891fcd1))
* **app:** attenuator compensation added back to plotted RSSI ([1d00b13](https://github.com/khagele/core-hunter/commit/1d00b136dbae308a0f35904548439720cc504c16))
* **app:** attenuator compensation added back to plotted RSSI ([5a6deb7](https://github.com/khagele/core-hunter/commit/5a6deb71ee45bf51272c9bd8ce295b5274ed246d)), closes [#54](https://github.com/khagele/core-hunter/issues/54)
* **app:** capture FLOOD last-hop relay (path[last]) as a directly-heard node ([f08e88a](https://github.com/khagele/core-hunter/commit/f08e88af3d6acbe170fbf51c87157a8957feeb29)), closes [#64](https://github.com/khagele/core-hunter/issues/64)
* **app:** capture FLOOD last-hop relay (path[last]) as a directly-heard repeater ([0982218](https://github.com/khagele/core-hunter/commit/098221881971a141d9e4455e29670fba1e82465e))
* **app:** controls + filter UI rework — settings to top bar, Discover FAB, ignore as a filter ([9649f50](https://github.com/khagele/core-hunter/commit/9649f50a6525cfa8df90914c262b35c5c575e372))
* **app:** filter-active indicator + filter sheet layout ([776eaf9](https://github.com/khagele/core-hunter/commit/776eaf94c727737c3ce4823f56a61857a420db13))
* **app:** hashtag-channel decoding from a config channel-name list ([#11](https://github.com/khagele/core-hunter/issues/11)) ([e9d4449](https://github.com/khagele/core-hunter/commit/e9d44499d8a4a3ee49eb778b1580ad26045e2082))
* **app:** HUD timer showing time since last packet ([6face72](https://github.com/khagele/core-hunter/commit/6face721eb117396ee3c6f866a9457993a13b2e6))
* **app:** keep screen awake during drive — Wake Lock ([#17](https://github.com/khagele/core-hunter/issues/17)) ([bb19d42](https://github.com/khagele/core-hunter/commit/bb19d429ea5ee890e73706632bc6f376cb6a088e))
* **app:** live Messages feed — decrypted channel messages + adverts ([#8](https://github.com/khagele/core-hunter/issues/8)) ([7af52b7](https://github.com/khagele/core-hunter/commit/7af52b76c0635cc11a11165133bcca746576a4c2))
* **app:** make the PWA installable (register SW, add icons + meta) ([#27](https://github.com/khagele/core-hunter/issues/27)) ([d7155df](https://github.com/khagele/core-hunter/commit/d7155dfa1a79fd3352a54921bac9584825b9b06f))
* **app:** mark the selected target active in the target list ([#108](https://github.com/khagele/core-hunter/issues/108)) ([208920a](https://github.com/khagele/core-hunter/commit/208920ac75eefb77d5175942cf2d9c7b122be972))
* **app:** move Disconnect into BLE settings, keep Connect in the HUD ([3db3fdc](https://github.com/khagele/core-hunter/commit/3db3fdc3baefb4bf101f2cdbfbbff378de2730d8))
* **app:** move settings to the top bar, Discover as a radar-icon FAB above the filter ([3f2378f](https://github.com/khagele/core-hunter/commit/3f2378f49d8fd2117d67f6d226c59d92ecb7a554)), closes [#45](https://github.com/khagele/core-hunter/issues/45)
* **app:** read companion spreading factor and show it in settings ([#52](https://github.com/khagele/core-hunter/issues/52)) ([b60ad80](https://github.com/khagele/core-hunter/commit/b60ad8055e373c37a187bd9563a785c81c5fc85a))
* **app:** rotating tips on the GPS-wait splash ([#83](https://github.com/khagele/core-hunter/issues/83)) ([b1605bf](https://github.com/khagele/core-hunter/commit/b1605bf04d5d0f0b89d04d412c0e9465c4f50af2))
* **app:** scale hex resolution with zoom (down to 3 m) ([0192d97](https://github.com/khagele/core-hunter/commit/0192d97aa90ee1293b3b04987f161d9109f87de6))
* **app:** single-hunter locate for the isolated target (pwa) ([#92](https://github.com/khagele/core-hunter/issues/92)) ([ebe93bb](https://github.com/khagele/core-hunter/commit/ebe93bb5121548042d4cd5b7afaa20a4f2043fc0))
* **app:** single-shot Discover button; remove redundant hop pill ([#14](https://github.com/khagele/core-hunter/issues/14)) ([a93d344](https://github.com/khagele/core-hunter/commit/a93d3442f17b898726bebd67e727ae5020f7f761))
* **app:** startup splash + GPS-loading indicator ([dc11dc6](https://github.com/khagele/core-hunter/commit/dc11dc668c229245f3024162028ff387f1ac6ab1))
* **app:** startup splash + GPS-loading indicator ([75fc9bf](https://github.com/khagele/core-hunter/commit/75fc9bfc470f2cc75fc52bcfd193d9285568a6da))
* **app:** target dropdown with pinned top senders ([5ba68f1](https://github.com/khagele/core-hunter/commit/5ba68f11c94dc9dfbab4b2b539ecb292bbbdf8c1))
* **app:** target dropdown with pinned top senders ([a76da15](https://github.com/khagele/core-hunter/commit/a76da1541e1de51bce7a3687f8d172a273977f67))
* **app:** treat the ignore-list as a filter (move to filter sheet, light filter FAB) ([82dc174](https://github.com/khagele/core-hunter/commit/82dc174959dda9d57da3539908a17f8a7dc09408)), closes [#48](https://github.com/khagele/core-hunter/issues/48)
* identify every zero-hop node (advert + discover) by ID + role, resolve name via API ([3728f26](https://github.com/khagele/core-hunter/commit/3728f262d84fbeab984d130e0979422326532db9)), closes [#41](https://github.com/khagele/core-hunter/issues/41)
* identify zero-hop nodes (advert + discover) by ID + role, resolve name via API ([5bc0d50](https://github.com/khagele/core-hunter/commit/5bc0d50697cbb390ccb153714aec70584ef11246))


### Bug Fixes

* **app:** active state for the Messages panel isolate-sender button ([#89](https://github.com/khagele/core-hunter/issues/89)) ([5f756e1](https://github.com/khagele/core-hunter/commit/5f756e1de0813991d65f630a9d2e81ddcb335967))
* **app:** add missing styles for the radio settings section ([f93f158](https://github.com/khagele/core-hunter/commit/f93f1588f5cc8df48d50efddcd98ba65a6d0c3cc))
* **app:** compass-mode toggle for the map recenter button (pwa) ([#88](https://github.com/khagele/core-hunter/issues/88)) ([f7cd13f](https://github.com/khagele/core-hunter/commit/f7cd13f5e637f9b47fc9b446fa3e5891cc336292))
* **app:** default Direct-only filter to off ([#90](https://github.com/khagele/core-hunter/issues/90)) ([db65239](https://github.com/khagele/core-hunter/commit/db65239226954a4d894f03e2c6b4623fa2b87daf))
* **app:** don't let MQTT connect failure abort the BLE connect ([b5a72dd](https://github.com/khagele/core-hunter/commit/b5a72dd80a702c927db1c12d715e03b331738847))
* **app:** don't let MQTT connect failure abort the BLE connect ([984afdf](https://github.com/khagele/core-hunter/commit/984afdf9d3c6d0c7729645a934c11dbe8e0ec67e))
* **app:** include last-hop repeaters in the target dropdown ([#76](https://github.com/khagele/core-hunter/issues/76)) ([92d1c2c](https://github.com/khagele/core-hunter/commit/92d1c2c644302c4923c6d66018cb4c76b1591fe1))
* **app:** keep the hex-heat grid aligned during zoom ([c1b7828](https://github.com/khagele/core-hunter/commit/c1b782839f6d3908a273007aa6c50a5b65f0a76d))
* **app:** keep the hex-heat grid aligned during zoom (rebuild on zoomend, not mid-animation) ([bd00863](https://github.com/khagele/core-hunter/commit/bd00863866185c1fd56cefecfe44ada4a8a7ab81)), closes [#44](https://github.com/khagele/core-hunter/issues/44)
* **app:** prevent Chrome auto-translate from rewriting the UI ([ae20e57](https://github.com/khagele/core-hunter/commit/ae20e57169252753d0bded964b01c5de10e769f3))
* **app:** prevent text-selection tap-to-search on row buttons (Android) ([#84](https://github.com/khagele/core-hunter/issues/84)) ([9723b2d](https://github.com/khagele/core-hunter/commit/9723b2d39a462f88e9db4a4d49e1521880ae6218))
* **app:** raise map maxZoom from 19 to 20 ([#107](https://github.com/khagele/core-hunter/issues/107)) ([475ab1b](https://github.com/khagele/core-hunter/commit/475ab1bb03462a06795515b3645411995fc1fd8b))
* **app:** swap layer-toggle FAB icon per active layer mode ([#87](https://github.com/khagele/core-hunter/issues/87)) ([a720d4c](https://github.com/khagele/core-hunter/commit/a720d4cfb869407d186b910009010093d1c86ad3))
* **app:** unify Settings connection button (connect/disconnect/retry) ([#86](https://github.com/khagele/core-hunter/issues/86)) ([9d1adbd](https://github.com/khagele/core-hunter/commit/9d1adbdb8143db9e3963cb1537217ebcd0a0b45b))


### Documentation

* dedupe release changelogs (drop merge-commit duplicates) ([#70](https://github.com/khagele/core-hunter/issues/70)) ([10d0528](https://github.com/khagele/core-hunter/commit/10d0528017a72cdc4db530dafaf157a37bb7487f))


### Styles

* **app:** themed X close button in overlay sheets ([8fe485b](https://github.com/khagele/core-hunter/commit/8fe485b3b958e08f5cbeac670c8a5846d8e0baa4))


### Miscellaneous Chores

* introduce per-component versioning with release-please ([#7](https://github.com/khagele/core-hunter/issues/7)) ([ef511db](https://github.com/khagele/core-hunter/commit/ef511dbc48c3c96102b06933a4199ed8b24d698c))
* release app 0.2.0 ([#9](https://github.com/khagele/core-hunter/issues/9)) ([ca33481](https://github.com/khagele/core-hunter/commit/ca334818c4b7d04402cdc11e6f6dcee04961c529))
* release app 0.3.0 ([#12](https://github.com/khagele/core-hunter/issues/12)) ([191046d](https://github.com/khagele/core-hunter/commit/191046d1fc819623af1dfdfa6537970e4a1f8474))
* release app 0.4.0 ([#15](https://github.com/khagele/core-hunter/issues/15)) ([6bc801d](https://github.com/khagele/core-hunter/commit/6bc801d94bf4b4ff2598db033e143a9badf946d8))
* release app 0.5.0 ([#18](https://github.com/khagele/core-hunter/issues/18)) ([99caae6](https://github.com/khagele/core-hunter/commit/99caae66323c06ffec6bb26a34c46490c2103522))
* release master ([67a1c47](https://github.com/khagele/core-hunter/commit/67a1c47ad65e15b966735b2c22c76615d02a5c8e))
* release master ([78e291c](https://github.com/khagele/core-hunter/commit/78e291ceefdea9f69b4f139b57813389c2a5ea60))
* release master ([7fe200b](https://github.com/khagele/core-hunter/commit/7fe200be41ddadab310d3fab8f713392b0a8d526))
* release master ([#105](https://github.com/khagele/core-hunter/issues/105)) ([4157766](https://github.com/khagele/core-hunter/commit/41577661448080a6d561da51db422334ba7cd2de))
* release master ([#71](https://github.com/khagele/core-hunter/issues/71)) ([24eb458](https://github.com/khagele/core-hunter/commit/24eb458faa8503406e45b30eef1f7e9b4c352139))
* release master ([#73](https://github.com/khagele/core-hunter/issues/73)) ([e35c3c7](https://github.com/khagele/core-hunter/commit/e35c3c7df73a18491658a50fcf5887cecf2db4c3))
* release master ([#77](https://github.com/khagele/core-hunter/issues/77)) ([0496c1c](https://github.com/khagele/core-hunter/commit/0496c1c38174d46aa35bec0598a4d995b7ad8e5b))

## [0.11.0](https://github.com/efiten/core-hunter/compare/app-v0.10.0...app-v0.11.0) (2026-07-01)


### Features

* **app:** single-hunter locate for the isolated target (pwa) ([#92](https://github.com/efiten/core-hunter/issues/92)) ([ebe93bb](https://github.com/efiten/core-hunter/commit/ebe93bb5121548042d4cd5b7afaa20a4f2043fc0))


### Bug Fixes

* **app:** active state for the Messages panel isolate-sender button ([#89](https://github.com/efiten/core-hunter/issues/89)) ([5f756e1](https://github.com/efiten/core-hunter/commit/5f756e1de0813991d65f630a9d2e81ddcb335967))
* **app:** compass-mode toggle for the map recenter button (pwa) ([#88](https://github.com/efiten/core-hunter/issues/88)) ([f7cd13f](https://github.com/efiten/core-hunter/commit/f7cd13f5e637f9b47fc9b446fa3e5891cc336292))
* **app:** default Direct-only filter to off ([#90](https://github.com/efiten/core-hunter/issues/90)) ([db65239](https://github.com/efiten/core-hunter/commit/db65239226954a4d894f03e2c6b4623fa2b87daf))
* **app:** prevent text-selection tap-to-search on row buttons (Android) ([#84](https://github.com/efiten/core-hunter/issues/84)) ([9723b2d](https://github.com/efiten/core-hunter/commit/9723b2d39a462f88e9db4a4d49e1521880ae6218))
* **app:** swap layer-toggle FAB icon per active layer mode ([#87](https://github.com/efiten/core-hunter/issues/87)) ([a720d4c](https://github.com/efiten/core-hunter/commit/a720d4cfb869407d186b910009010093d1c86ad3))
* **app:** unify Settings connection button (connect/disconnect/retry) ([#86](https://github.com/efiten/core-hunter/issues/86)) ([9d1adbd](https://github.com/efiten/core-hunter/commit/9d1adbdb8143db9e3963cb1537217ebcd0a0b45b))

## [0.10.0](https://github.com/efiten/core-hunter/compare/app-v0.9.0...app-v0.10.0) (2026-07-01)


### Features

* **app:** rotating tips on the GPS-wait splash ([#83](https://github.com/efiten/core-hunter/issues/83)) ([b1605bf](https://github.com/efiten/core-hunter/commit/b1605bf04d5d0f0b89d04d412c0e9465c4f50af2))


### Bug Fixes

* **app:** include last-hop repeaters in the target dropdown ([#76](https://github.com/efiten/core-hunter/issues/76)) ([92d1c2c](https://github.com/efiten/core-hunter/commit/92d1c2c644302c4923c6d66018cb4c76b1591fe1))

## [0.9.0](https://github.com/efiten/core-hunter/compare/app-v0.8.0...app-v0.9.0) (2026-07-01)


### Features

* **app:** make the PWA installable (register SW, add icons + meta) ([#27](https://github.com/efiten/core-hunter/issues/27)) ([d7155df](https://github.com/efiten/core-hunter/commit/d7155dfa1a79fd3352a54921bac9584825b9b06f))

## [0.8.0](https://github.com/efiten/core-hunter/compare/app-v0.7.0...app-v0.8.0) (2026-07-01)


### Features

* **app:** read companion spreading factor and show it in settings ([#52](https://github.com/efiten/core-hunter/issues/52)) ([b60ad80](https://github.com/efiten/core-hunter/commit/b60ad8055e373c37a187bd9563a785c81c5fc85a))


### Documentation

* dedupe release changelogs (drop merge-commit duplicates) ([#70](https://github.com/efiten/core-hunter/issues/70)) ([10d0528](https://github.com/efiten/core-hunter/commit/10d0528017a72cdc4db530dafaf157a37bb7487f))

## [0.7.0](https://github.com/efiten/core-hunter/compare/app-v0.6.0...app-v0.7.0) (2026-07-01)


### Features

* **app:** attenuator compensation added back to plotted RSSI ([5a6deb7](https://github.com/efiten/core-hunter/commit/5a6deb71ee45bf51272c9bd8ce295b5274ed246d)), closes [#54](https://github.com/efiten/core-hunter/issues/54)
* **app:** capture FLOOD last-hop relay (path[last]) as a directly-heard node ([f08e88a](https://github.com/efiten/core-hunter/commit/f08e88af3d6acbe170fbf51c87157a8957feeb29)), closes [#64](https://github.com/efiten/core-hunter/issues/64)
* **app:** move settings to the top bar, Discover as a radar-icon FAB above the filter ([3f2378f](https://github.com/efiten/core-hunter/commit/3f2378f49d8fd2117d67f6d226c59d92ecb7a554)), closes [#45](https://github.com/efiten/core-hunter/issues/45)
* **app:** startup splash + GPS-loading indicator ([75fc9bf](https://github.com/efiten/core-hunter/commit/75fc9bfc470f2cc75fc52bcfd193d9285568a6da))
* **app:** target dropdown with pinned top senders ([a76da15](https://github.com/efiten/core-hunter/commit/a76da1541e1de51bce7a3687f8d172a273977f67))
* **app:** treat the ignore-list as a filter (move to filter sheet, light filter FAB) ([82dc174](https://github.com/efiten/core-hunter/commit/82dc174959dda9d57da3539908a17f8a7dc09408)), closes [#48](https://github.com/efiten/core-hunter/issues/48)
* identify every zero-hop node (advert + discover) by ID + role, resolve name via API ([3728f26](https://github.com/efiten/core-hunter/commit/3728f262d84fbeab984d130e0979422326532db9)), closes [#41](https://github.com/efiten/core-hunter/issues/41)


### Bug Fixes

* **app:** add missing styles for the radio settings section ([f93f158](https://github.com/efiten/core-hunter/commit/f93f1588f5cc8df48d50efddcd98ba65a6d0c3cc))
* **app:** don't let MQTT connect failure abort the BLE connect ([984afdf](https://github.com/efiten/core-hunter/commit/984afdf9d3c6d0c7729645a934c11dbe8e0ec67e))
* **app:** keep the hex-heat grid aligned during zoom (rebuild on zoomend, not mid-animation) ([bd00863](https://github.com/efiten/core-hunter/commit/bd00863866185c1fd56cefecfe44ada4a8a7ab81)), closes [#44](https://github.com/efiten/core-hunter/issues/44)

## [0.6.0](https://github.com/efiten/core-hunter/compare/app-v0.5.0...app-v0.6.0) (2026-06-30)


### Features

* **app,web:** resolve node names from CoreScope for full-pubkey senders ([197fc5a](https://github.com/efiten/core-hunter/commit/197fc5a399f6655c240951cea086bf56d891fcd1))
* **app:** filter-active indicator + filter sheet layout ([776eaf9](https://github.com/efiten/core-hunter/commit/776eaf94c727737c3ce4823f56a61857a420db13))
* **app:** HUD timer showing time since last packet ([6face72](https://github.com/efiten/core-hunter/commit/6face721eb117396ee3c6f866a9457993a13b2e6))
* **app:** move Disconnect into BLE settings, keep Connect in the HUD ([3db3fdc](https://github.com/efiten/core-hunter/commit/3db3fdc3baefb4bf101f2cdbfbbff378de2730d8))
* **app:** scale hex resolution with zoom (down to 3 m) ([0192d97](https://github.com/efiten/core-hunter/commit/0192d97aa90ee1293b3b04987f161d9109f87de6))


### Bug Fixes

* **app:** prevent Chrome auto-translate from rewriting the UI ([ae20e57](https://github.com/efiten/core-hunter/commit/ae20e57169252753d0bded964b01c5de10e769f3))


### Styles

* **app:** themed X close button in overlay sheets ([8fe485b](https://github.com/efiten/core-hunter/commit/8fe485b3b958e08f5cbeac670c8a5846d8e0baa4))

## [0.5.0](https://github.com/efiten/core-hunter/compare/app-v0.4.0...app-v0.5.0) (2026-06-30)


### Features

* **app:** keep screen awake during drive — Wake Lock ([#17](https://github.com/efiten/core-hunter/issues/17)) ([bb19d42](https://github.com/efiten/core-hunter/commit/bb19d429ea5ee890e73706632bc6f376cb6a088e))

## [0.4.0](https://github.com/efiten/core-hunter/compare/app-v0.3.0...app-v0.4.0) (2026-06-30)


### Features

* **app:** single-shot Discover button; remove redundant hop pill ([#14](https://github.com/efiten/core-hunter/issues/14)) ([a93d344](https://github.com/efiten/core-hunter/commit/a93d3442f17b898726bebd67e727ae5020f7f761))

## [0.3.0](https://github.com/efiten/core-hunter/compare/app-v0.2.0...app-v0.3.0) (2026-06-29)


### Features

* **app:** hashtag-channel decoding from a config channel-name list ([#11](https://github.com/efiten/core-hunter/issues/11)) ([e9d4449](https://github.com/efiten/core-hunter/commit/e9d44499d8a4a3ee49eb778b1580ad26045e2082))

## [0.2.0](https://github.com/efiten/core-hunter/compare/app-v0.1.0...app-v0.2.0) (2026-06-29)


### Features

* **app:** live Messages feed — decrypted channel messages + adverts ([#8](https://github.com/efiten/core-hunter/issues/8)) ([7af52b7](https://github.com/efiten/core-hunter/commit/7af52b76c0635cc11a11165133bcca746576a4c2))
