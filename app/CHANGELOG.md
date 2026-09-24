# Changelog

## [1.0.0](https://github.com/khagele/core-hunter/compare/app-v1.27.0...app-v1.0.0) (2026-09-24)


### Features

* **app,server:** draw SF8 nodes on the position layer too ([#430](https://github.com/khagele/core-hunter/issues/430)) ([863c3ac](https://github.com/khagele/core-hunter/commit/863c3ac7f82a2e0ebe503e8ad9f005b8cdcf7b2e)), closes [#418](https://github.com/khagele/core-hunter/issues/418)
* **app,web,landing:** the 26 August design pass ([#541](https://github.com/khagele/core-hunter/issues/541)) ([5a04962](https://github.com/khagele/core-hunter/commit/5a049624e14191a632512091754556337ab1dd8e))
* **app,web,server:** drop Sender unknown, the Unnamed chip already selects the same receptions ([#582](https://github.com/khagele/core-hunter/issues/582)) ([f297d9c](https://github.com/khagele/core-hunter/commit/f297d9c993fdf3cf273177b86b0662efcf259a2c))
* **app,web,server:** filter receptions by sender-id class ([#528](https://github.com/khagele/core-hunter/issues/528)) ([f10b1ac](https://github.com/khagele/core-hunter/commit/f10b1ace28d7dc55cc80dfc051b2ff58e983aca7))
* **app,web:** a reading layer that points at the node you heard ([#667](https://github.com/khagele/core-hunter/issues/667)) ([23c823d](https://github.com/khagele/core-hunter/commit/23c823d6b50e871c0220419248f24eba38719f1c))
* **app,web:** carry the decoder's full packet-type set in the filter chips ([#343](https://github.com/khagele/core-hunter/issues/343)) ([e924935](https://github.com/khagele/core-hunter/commit/e924935728c677241dafe369ef18508223a9c339))
* **app,web:** draw the node layer's glyphs as GL layers, not DOM markers ([#682](https://github.com/khagele/core-hunter/issues/682)) ([3928ebf](https://github.com/khagele/core-hunter/commit/3928ebf461a145964c80ca4d5ab09b7813020d63))
* **app,web:** every repeater's reach at once, in its own hue, as the third stop of Node positions ([#593](https://github.com/khagele/core-hunter/issues/593)) ([e7dded6](https://github.com/khagele/core-hunter/commit/e7dded615150ef87bb7493fd1075e8e1b410fcb7))
* **app,web:** extend the weak end of the RSSI scale below -110 dBm ([#344](https://github.com/khagele/core-hunter/issues/344)) ([29b1015](https://github.com/khagele/core-hunter/commit/29b101542f40857b99da3d299970de2f5f7b6e85))
* **app,web:** give the website an onboarding tour, and say what a hunter is ([#379](https://github.com/khagele/core-hunter/issues/379)) ([ea7bb21](https://github.com/khagele/core-hunter/commit/ea7bb21440613c15ab34728cde7dc71db71362a6)), closes [#316](https://github.com/khagele/core-hunter/issues/316) [#371](https://github.com/khagele/core-hunter/issues/371)
* **app,web:** keep the reception when the identity or the decode fails ([#478](https://github.com/khagele/core-hunter/issues/478)) ([0c2831a](https://github.com/khagele/core-hunter/commit/0c2831aa29d69be6da5e6fcb789d1977ffd93090))
* **app,web:** locate from the whole signal field, not its centre of mass ([#516](https://github.com/khagele/core-hunter/issues/516)) ([4d9a947](https://github.com/khagele/core-hunter/commit/4d9a9471418966d0e4d86a7893d5b335cb0d9e7b)), closes [#454](https://github.com/khagele/core-hunter/issues/454)
* **app,web:** make the receptions ticker readable at a glance ([#404](https://github.com/khagele/core-hunter/issues/404)) ([c48a974](https://github.com/khagele/core-hunter/commit/c48a9748c5aee14b87e13e4f0374609e45546070)), closes [#322](https://github.com/khagele/core-hunter/issues/322)
* **app,web:** make the two filter panels one panel ([#573](https://github.com/khagele/core-hunter/issues/573)) ([488b4e2](https://github.com/khagele/core-hunter/commit/488b4e2d93d6f99f0affbf41d6183018807f1069))
* **app,web:** mark the About and What's new links that leave the app ([#589](https://github.com/khagele/core-hunter/issues/589)) ([f14d205](https://github.com/khagele/core-hunter/commit/f14d205e3964432f744368a6b777b71186ac518f))
* **app,web:** one control for where nodes are, and a glyph key that lives in the popup ([#653](https://github.com/khagele/core-hunter/issues/653)) ([640d5ae](https://github.com/khagele/core-hunter/commit/640d5aea4bfc1fe2e7a3dffb848786c95232feda))
* **app,web:** resolve node names from CoreScope for full-pubkey senders ([197fc5a](https://github.com/khagele/core-hunter/commit/197fc5a399f6655c240951cea086bf56d891fcd1))
* **app,web:** show the id beside a resolved name in the receptions ticker ([#584](https://github.com/khagele/core-hunter/issues/584)) ([f397b09](https://github.com/khagele/core-hunter/commit/f397b094ddff4601855dc9697ac172311b7f131d))
* **app,web:** show what changed in a release behind a version badge ([#363](https://github.com/khagele/core-hunter/issues/363)) ([3a3dcf1](https://github.com/khagele/core-hunter/commit/3a3dcf128502790e5e1ecda0b3a3a0808a143752)), closes [#284](https://github.com/khagele/core-hunter/issues/284)
* **app,web:** write release notes for readers, not from the commit log ([#435](https://github.com/khagele/core-hunter/issues/435)) ([8b70eaa](https://github.com/khagele/core-hunter/commit/8b70eaa4653d1ca5ffb15e8a874b2e1743981ae0))
* **app:** 3D mode — 2D/3D FAB, extruded hex bars, buildings, terrain ([#147](https://github.com/khagele/core-hunter/issues/147)) ([#228](https://github.com/khagele/core-hunter/issues/228)) ([75fb92e](https://github.com/khagele/core-hunter/commit/75fb92e3134145ec01dc7801f251838ef5d6d089))
* **app:** add a time-of-day sky, so near-horizontal pitch stops reading as broken ([#401](https://github.com/khagele/core-hunter/issues/401)) ([f199dec](https://github.com/khagele/core-hunter/commit/f199dec5ba5d19203e44c7f484115923f7419a72)), closes [#397](https://github.com/khagele/core-hunter/issues/397)
* **app:** add Share my node name, off by default, sending a zero-hop advert each cycle a companion is the target ([#577](https://github.com/khagele/core-hunter/issues/577)) ([2acbdad](https://github.com/khagele/core-hunter/commit/2acbdadadca3d158b44c313d09f2701e53dfd37d))
* **app:** ask a selected companion for its telemetry each cycle, zero-hop, and keep what it answers per node ([#578](https://github.com/khagele/core-hunter/issues/578)) ([cfcc130](https://github.com/khagele/core-hunter/commit/cfcc130937dc84b0e654788a948edeaddbea4e4c))
* **app:** attenuator compensation added back to plotted RSSI ([1d00b13](https://github.com/khagele/core-hunter/commit/1d00b136dbae308a0f35904548439720cc504c16))
* **app:** attenuator compensation added back to plotted RSSI ([5a6deb7](https://github.com/khagele/core-hunter/commit/5a6deb71ee45bf51272c9bd8ce295b5274ed246d)), closes [#54](https://github.com/khagele/core-hunter/issues/54)
* **app:** auto-discover toggle with pulse feedback and repeater trace-ping ([#241](https://github.com/khagele/core-hunter/issues/241)) ([83dea99](https://github.com/khagele/core-hunter/commit/83dea99805738f4fc46cd65df9fbce8f95f80ccf))
* **app:** auto-fade the locate-info box after 2s ([#127](https://github.com/khagele/core-hunter/issues/127)) ([3f887d1](https://github.com/khagele/core-hunter/commit/3f887d1351bf5ad38018cc3a5ecf5ed72d3a36ec))
* **app:** capture FLOOD last-hop relay (path[last]) as a directly-heard node ([f08e88a](https://github.com/khagele/core-hunter/commit/f08e88af3d6acbe170fbf51c87157a8957feeb29)), closes [#64](https://github.com/khagele/core-hunter/issues/64)
* **app:** capture FLOOD last-hop relay (path[last]) as a directly-heard repeater ([0982218](https://github.com/khagele/core-hunter/commit/098221881971a141d9e4455e29670fba1e82465e))
* **app:** capture what the radio hears, not only what it can name ([#455](https://github.com/khagele/core-hunter/issues/455)) ([f7518b6](https://github.com/khagele/core-hunter/commit/f7518b6a8f658b31ee8d5459e9ebfcd2bc594677))
* **app:** companion battery, topbar consolidation and HUD sender readout ([#323](https://github.com/khagele/core-hunter/issues/323)) ([a25bf1c](https://github.com/khagele/core-hunter/commit/a25bf1c4536afee6e734e99f153f69d4d2002a48)), closes [#281](https://github.com/khagele/core-hunter/issues/281)
* **app:** compass FAB icon previews the next state, not the current one ([63f6671](https://github.com/khagele/core-hunter/commit/63f6671b37045c223b498d71cf6fece916f6a84b))
* **app:** controls + filter UI rework — settings to top bar, Discover FAB, ignore as a filter ([9649f50](https://github.com/khagele/core-hunter/commit/9649f50a6525cfa8df90914c262b35c5c575e372))
* **app:** distinct icon for the combined points+hex layer mode ([#126](https://github.com/khagele/core-hunter/issues/126)) ([07092f9](https://github.com/khagele/core-hunter/commit/07092f92d23348d4e9957873d25d970c3204069f))
* **app:** draw earlier rides as coverage and outlines, pulse the newest reception, and name the nodes in a hex cell ([#579](https://github.com/khagele/core-hunter/issues/579)) ([e348c4c](https://github.com/khagele/core-hunter/commit/e348c4cd872a9c9ef3a5b5de65af4b008d8fba7c))
* **app:** draw the hunter's own session route trail on the map ([cd8f0e3](https://github.com/khagele/core-hunter/commit/cd8f0e3eb3b7e73a4eceda9b81ef64888518c82c))
* **app:** fade reception points with age instead of hard-vanishing ([#164](https://github.com/khagele/core-hunter/issues/164)) ([cf9a62b](https://github.com/khagele/core-hunter/commit/cf9a62b3996384f0ff38acf011b5fef7e46ad54f))
* **app:** filter-active indicator + filter sheet layout ([776eaf9](https://github.com/khagele/core-hunter/commit/776eaf94c727737c3ce4823f56a61857a420db13))
* **app:** focus the existing PWA instance instead of relaunching ([#153](https://github.com/khagele/core-hunter/issues/153)) ([bba418a](https://github.com/khagele/core-hunter/commit/bba418a43c83e14a78a8370aed4094312ddabd95))
* **app:** give auto-discover a duty floor from the airtime the last cycle spent ([#581](https://github.com/khagele/core-hunter/issues/581)) ([6450c3c](https://github.com/khagele/core-hunter/commit/6450c3c8979e25b6616de910ffd4b98f94675dd9))
* **app:** give the app the map's two reception filters ([#507](https://github.com/khagele/core-hunter/issues/507)) ([a5243b0](https://github.com/khagele/core-hunter/commit/a5243b067e2fb5995b6a6b378cb1afc1a9b39875))
* **app:** give the theme three states and a memory, and end the Settings tab ([#566](https://github.com/khagele/core-hunter/issues/566)) ([e67c319](https://github.com/khagele/core-hunter/commit/e67c3193dca73ac5dd7732dc0050ef5c8774ef94))
* **app:** give the time window the map's presets ([#574](https://github.com/khagele/core-hunter/issues/574)) ([bfef541](https://github.com/khagele/core-hunter/commit/bfef541350eb79c3aa2c41ca91de0ed757400922))
* **app:** give What's new its own Settings tab, and let its dot reach the HUD ([#429](https://github.com/khagele/core-hunter/issues/429)) ([bc646c3](https://github.com/khagele/core-hunter/commit/bc646c35a36b5f72ed5e99980cac2a5e2997df72)), closes [#421](https://github.com/khagele/core-hunter/issues/421)
* **app:** GPS course as a third compass-mode heading source (driving mode) ([#245](https://github.com/khagele/core-hunter/issues/245)) ([6c09b26](https://github.com/khagele/core-hunter/commit/6c09b2617fb7824fa11b92037f867f2104f1e0e0))
* **app:** hashtag-channel decoding from a config channel-name list ([#11](https://github.com/khagele/core-hunter/issues/11)) ([e9d4449](https://github.com/khagele/core-hunter/commit/e9d44499d8a4a3ee49eb778b1580ad26045e2082))
* **app:** HUD timer showing time since last packet ([6face72](https://github.com/khagele/core-hunter/commit/6face721eb117396ee3c6f866a9457993a13b2e6))
* **app:** in-app register/login and companion linking (v1.0) ([00514a9](https://github.com/khagele/core-hunter/commit/00514a9314d6a21c7bae4ad92631483c63821396))
* **app:** keep screen awake during drive — Wake Lock ([#17](https://github.com/khagele/core-hunter/issues/17)) ([bb19d42](https://github.com/khagele/core-hunter/commit/bb19d429ea5ee890e73706632bc6f376cb6a088e))
* **app:** keep the SNR the repeater heard us at ([#489](https://github.com/khagele/core-hunter/issues/489)) ([0cd0a7c](https://github.com/khagele/core-hunter/commit/0cd0a7c4a74f1b79465c7a3f488341c75a3bd52e))
* **app:** let the HUD follow the ticker's stand, act on the shown sender, and float it over other apps ([#575](https://github.com/khagele/core-hunter/issues/575)) ([ec9c9ed](https://github.com/khagele/core-hunter/commit/ec9c9ed0b8dc7a9a6cb185d4156a3a72eb440feb))
* **app:** live Messages feed — decrypted channel messages + adverts ([#8](https://github.com/khagele/core-hunter/issues/8)) ([7af52b7](https://github.com/khagele/core-hunter/commit/7af52b76c0635cc11a11165133bcca746576a4c2))
* **app:** look ahead while the map turns with you, and give the compass button three stops ([#585](https://github.com/khagele/core-hunter/issues/585)) ([a7b0f99](https://github.com/khagele/core-hunter/commit/a7b0f99893dc66e410bbd29a00e2a8f60819afef))
* **app:** make every recorded reception audible, one instrument per type (+ sound tweaks) ([#470](https://github.com/khagele/core-hunter/issues/470)) ([6244c0f](https://github.com/khagele/core-hunter/commit/6244c0fa335ebf4d6101db063c2c67d4cf348f8c))
* **app:** make the HUD the ticker's playhead, so a name that resolves later reaches it ([#583](https://github.com/khagele/core-hunter/issues/583)) ([0205138](https://github.com/khagele/core-hunter/commit/020513899c28651c3d3a1bb6bd41487b0a0ccf57))
* **app:** make the Messages-panel ignore button a toggle ([#165](https://github.com/khagele/core-hunter/issues/165)) ([228ce93](https://github.com/khagele/core-hunter/commit/228ce93912283be5745f7920f434cae0b49b7dd4))
* **app:** make the PWA installable (register SW, add icons + meta) ([#27](https://github.com/khagele/core-hunter/issues/27)) ([d7155df](https://github.com/khagele/core-hunter/commit/d7155dfa1a79fd3352a54921bac9584825b9b06f))
* **app:** manual pause/resume for the MQTT connection ([#121](https://github.com/khagele/core-hunter/issues/121)) ([496406c](https://github.com/khagele/core-hunter/commit/496406c81766b58f725e87a146c4c40d1f57968e))
* **app:** mark individual non-default settings within the sheets ([#110](https://github.com/khagele/core-hunter/issues/110)) ([a2f1dfa](https://github.com/khagele/core-hunter/commit/a2f1dfab790889d01886439c8524dc25cee5d9de))
* **app:** mark the selected target active in the target list ([#108](https://github.com/khagele/core-hunter/issues/108)) ([208920a](https://github.com/khagele/core-hunter/commit/208920ac75eefb77d5175942cf2d9c7b122be972))
* **app:** merge layer FAB + 2D/3D FAB into one 5-state view cycle ([#314](https://github.com/khagele/core-hunter/issues/314)) ([9e48a38](https://github.com/khagele/core-hunter/commit/9e48a38d3e1611089ced882a64cba53d210eec61)), closes [#258](https://github.com/khagele/core-hunter/issues/258)
* **app:** Mesh-Hunter onboarding splash + display-name rename ([#202](https://github.com/khagele/core-hunter/issues/202)) ([c1d75c1](https://github.com/khagele/core-hunter/commit/c1d75c19ae85b32d0ded6aff687a0878864aaa9e))
* **app:** migrate the map to MapLibre GL — 2D parity ([#147](https://github.com/khagele/core-hunter/issues/147) phase 1) ([#214](https://github.com/khagele/core-hunter/issues/214)) ([cb05ab3](https://github.com/khagele/core-hunter/commit/cb05ab3dd7c929d87415037608a529516d597693))
* **app:** move Disconnect into BLE settings, keep Connect in the HUD ([3db3fdc](https://github.com/khagele/core-hunter/commit/3db3fdc3baefb4bf101f2cdbfbbff378de2730d8))
* **app:** move settings to the top bar, Discover as a radar-icon FAB above the filter ([3f2378f](https://github.com/khagele/core-hunter/commit/3f2378f49d8fd2117d67f6d226c59d92ecb7a554)), closes [#45](https://github.com/khagele/core-hunter/issues/45)
* **app:** multi-select targets + byte-prefix in the target list ([#206](https://github.com/khagele/core-hunter/issues/206)) ([742252a](https://github.com/khagele/core-hunter/commit/742252acd99f4006225c0548afc096ee2ba1f7a0))
* **app:** name a short id only when the registries of the SF agree, and mark it as a guess ([#587](https://github.com/khagele/core-hunter/issues/587)) ([1a8798a](https://github.com/khagele/core-hunter/commit/1a8798a7d7c01c582bd30cdee7719a60430e923a))
* **app:** name a trace reply after the node we pinged ([#483](https://github.com/khagele/core-hunter/issues/483)) ([04eded1](https://github.com/khagele/core-hunter/commit/04eded1708612b9462888e0d4925e0b4b5d285ef))
* **app:** name the 1-byte path hash instead of showing no sender ([#522](https://github.com/khagele/core-hunter/issues/522)) ([9ad8389](https://github.com/khagele/core-hunter/commit/9ad83896d94772c12dd0c0b1eebeae3e71864329))
* **app:** new Mesh-Hunter app icon (hex · reticle · thermal signal) ([#205](https://github.com/khagele/core-hunter/issues/205)) ([1f23045](https://github.com/khagele/core-hunter/commit/1f23045e194070fc5beaf69f94f769b8f95719c5))
* **app:** park background audio and cue both transitions ([#315](https://github.com/khagele/core-hunter/issues/315)) ([14bc526](https://github.com/khagele/core-hunter/commit/14bc5267f3c14d896e2dfff08072b58c843f8342)), closes [#260](https://github.com/khagele/core-hunter/issues/260)
* **app:** raise the tilt ceiling to 85 so the camera can look along the ground ([#399](https://github.com/khagele/core-hunter/issues/399)) ([b5d1a23](https://github.com/khagele/core-hunter/commit/b5d1a232149c0158947bc8c1533ae5760a9dc97e)), closes [#333](https://github.com/khagele/core-hunter/issues/333)
* **app:** read companion spreading factor and show it in settings ([#52](https://github.com/khagele/core-hunter/issues/52)) ([b60ad80](https://github.com/khagele/core-hunter/commit/b60ad8055e373c37a187bd9563a785c81c5fc85a))
* **app:** read the whole radio from SELF_INFO, and name the self-advert setting for what it is for ([#683](https://github.com/khagele/core-hunter/issues/683)) ([05da05b](https://github.com/khagele/core-hunter/commit/05da05b1e16d7ad1aa9d973c30e76ff43ca62bdf))
* **app:** real map rotation on device heading + two-finger rotate gesture ([#151](https://github.com/khagele/core-hunter/issues/151)) ([033033b](https://github.com/khagele/core-hunter/commit/033033bb657891a83155ae414a59556af818fe1d))
* **app:** refuse captures on a GPS fix too poor to place, and guard invalid fixes ([#345](https://github.com/khagele/core-hunter/issues/345)) ([ee8874f](https://github.com/khagele/core-hunter/commit/ee8874f296986bad66c7d7d73e6026979cca0ce5))
* **app:** remove Locate, rename its maths to geometry.js ([#540](https://github.com/khagele/core-hunter/issues/540)) ([6dd94ae](https://github.com/khagele/core-hunter/commit/6dd94ae8358ecf0d5b17904c70fccc995c0645ee))
* **app:** render points in 3D mode as raised pillar markers ([#250](https://github.com/khagele/core-hunter/issues/250)) ([#266](https://github.com/khagele/core-hunter/issues/266)) ([5d21696](https://github.com/khagele/core-hunter/commit/5d216961ace8e38b0859f8ef9c27654eb04a6207))
* **app:** replace settings-btn emoji with an inline SVG gear icon ([#113](https://github.com/khagele/core-hunter/issues/113)) ([3e4c241](https://github.com/khagele/core-hunter/commit/3e4c2414a24bbe36a6acd6fab2e5eb66460e1bb5))
* **app:** rotating tips on the GPS-wait splash ([#83](https://github.com/khagele/core-hunter/issues/83)) ([b1605bf](https://github.com/khagele/core-hunter/commit/b1605bf04d5d0f0b89d04d412c0e9465c4f50af2))
* **app:** scale hex resolution with zoom (down to 3 m) ([0192d97](https://github.com/khagele/core-hunter/commit/0192d97aa90ee1293b3b04987f161d9109f87de6))
* **app:** search the target sheet by name or id prefix ([#477](https://github.com/khagele/core-hunter/issues/477)) ([c69c57c](https://github.com/khagele/core-hunter/commit/c69c57ca329f732e7457e4ff5b293b4ca9b851c8))
* **app:** segmented progress ring for multi-state FABs ([#259](https://github.com/khagele/core-hunter/issues/259)) ([#265](https://github.com/khagele/core-hunter/issues/265)) ([fe22c49](https://github.com/khagele/core-hunter/commit/fe22c496801a5aa31792f7fcd625447f34e16253))
* **app:** settings as a full page with Settings / About tabs ([#207](https://github.com/khagele/core-hunter/issues/207)) ([76f549d](https://github.com/khagele/core-hunter/commit/76f549d7dc8036f782cc06b57831d85816244058))
* **app:** Settings reload button with deploy version check ([#162](https://github.com/khagele/core-hunter/issues/162)) ([0b4702e](https://github.com/khagele/core-hunter/commit/0b4702e3e1bf7c1991a15e81046a5f45b2682896))
* **app:** ship terrain on the AWS DEM, raised by the 3D view, with an exaggeration setting ([#586](https://github.com/khagele/core-hunter/issues/586)) ([2aad6e4](https://github.com/khagele/core-hunter/commit/2aad6e47e2963f35e1f21fab37df3ccbd79b6a15))
* **app:** show splash disclaimer + tips on every visible screen ([#123](https://github.com/khagele/core-hunter/issues/123)) ([21d8bc6](https://github.com/khagele/core-hunter/commit/21d8bc6c818f1c2634fb7a02a476e893d851c94c))
* **app:** single-hunter locate for the isolated target (pwa) ([#92](https://github.com/khagele/core-hunter/issues/92)) ([ebe93bb](https://github.com/khagele/core-hunter/commit/ebe93bb5121548042d4cd5b7afaa20a4f2043fc0))
* **app:** single-shot Discover button; remove redundant hop pill ([#14](https://github.com/khagele/core-hunter/issues/14)) ([a93d344](https://github.com/khagele/core-hunter/commit/a93d3442f17b898726bebd67e727ae5020f7f761))
* **app:** size the receptions card to what it holds, in steps ([#570](https://github.com/khagele/core-hunter/issues/570)) ([2ab97cb](https://github.com/khagele/core-hunter/commit/2ab97cb31f57605f40631a582691daba235c8b02))
* **app:** sound modes — rx/tx cues + generative ambient music ([#145](https://github.com/khagele/core-hunter/issues/145)) ([#261](https://github.com/khagele/core-hunter/issues/261)) ([c72022e](https://github.com/khagele/core-hunter/commit/c72022e3053dafd47c7d7d87694af5c05714e189))
* **app:** startup splash + GPS-loading indicator ([dc11dc6](https://github.com/khagele/core-hunter/commit/dc11dc668c229245f3024162028ff387f1ac6ab1))
* **app:** startup splash + GPS-loading indicator ([75fc9bf](https://github.com/khagele/core-hunter/commit/75fc9bfc470f2cc75fc52bcfd193d9285568a6da))
* **app:** sweep the repeaters you can hear when no target is picked ([#484](https://github.com/khagele/core-hunter/issues/484)) ([7f2eafb](https://github.com/khagele/core-hunter/commit/7f2eafb06b75af869cdca959c616e2e0eeab1b57))
* **app:** tap outside filter/settings/target sheets to close ([#111](https://github.com/khagele/core-hunter/issues/111)) ([b6dbb3f](https://github.com/khagele/core-hunter/commit/b6dbb3f5ad111706a0f204c58f3f00915c63acb6))
* **app:** target dropdown with pinned top senders ([5ba68f1](https://github.com/khagele/core-hunter/commit/5ba68f11c94dc9dfbab4b2b539ecb292bbbdf8c1))
* **app:** target dropdown with pinned top senders ([a76da15](https://github.com/khagele/core-hunter/commit/a76da1541e1de51bce7a3687f8d172a273977f67))
* **app:** toggle FAB for the single-hunter locate overlay ([#120](https://github.com/khagele/core-hunter/issues/120)) ([aa95e7d](https://github.com/khagele/core-hunter/commit/aa95e7d38ec1dd8f7f853555ac56d74891533b09))
* **app:** topbar redesign — Select-target chip, filter dropdown, locate over the filtered set ([#128](https://github.com/khagele/core-hunter/issues/128)) ([5f62978](https://github.com/khagele/core-hunter/commit/5f62978db5b71984f3a90d0a2f64673868dceec0))
* **app:** treat the ignore-list as a filter (move to filter sheet, light filter FAB) ([82dc174](https://github.com/khagele/core-hunter/commit/82dc174959dda9d57da3539908a17f8a7dc09408)), closes [#48](https://github.com/khagele/core-hunter/issues/48)
* **app:** verify advert signatures before an advert may name anything ([#362](https://github.com/khagele/core-hunter/issues/362)) ([cac64b3](https://github.com/khagele/core-hunter/commit/cac64b356a317514456bcfc6badbf6a6c13c647b))
* **app:** widen the cue ladder to twelve steps, 4.5 dB apart ([#472](https://github.com/khagele/core-hunter/issues/472)) ([ff012ba](https://github.com/khagele/core-hunter/commit/ff012baed9192f03f8d63f87372bf59e39a9b047))
* identify every zero-hop node (advert + discover) by ID + role, resolve name via API ([3728f26](https://github.com/khagele/core-hunter/commit/3728f262d84fbeab984d130e0979422326532db9)), closes [#41](https://github.com/khagele/core-hunter/issues/41)
* identify zero-hop nodes (advert + discover) by ID + role, resolve name via API ([5bc0d50](https://github.com/khagele/core-hunter/commit/5bc0d50697cbb390ccb153714aec70584ef11246))
* **landing,app,web:** link the FAQ from both About tabs, and give every question an anchor ([#580](https://github.com/khagele/core-hunter/issues/580)) ([ae1410c](https://github.com/khagele/core-hunter/commit/ae1410cc0ad12ca52738f06f8a4607da597df32d))
* **map:** select any repeater's reach, and dim the rest of the map with it ([#656](https://github.com/khagele/core-hunter/issues/656)) ([1142292](https://github.com/khagele/core-hunter/commit/114229213c1f2031ac603e1dc9452f3e74bb7482))
* node-position layer — advertised positions vs. the RSSI estimate (app + web) ([#272](https://github.com/khagele/core-hunter/issues/272)) ([0c21df5](https://github.com/khagele/core-hunter/commit/0c21df553776034c9b461678d6ca16156d99f44f))
* **server,web:** give a flood with no sender something to filter on ([#497](https://github.com/khagele/core-hunter/issues/497)) ([9362217](https://github.com/khagele/core-hunter/commit/93622172c842693b69db7496c082c40b00e0295a))
* **web,landing:** lead with mapping, and say where accounts come from ([#491](https://github.com/khagele/core-hunter/issues/491)) ([f9f326c](https://github.com/khagele/core-hunter/commit/f9f326c29ae4cf57cff0f589f30a7c82c1f1c2fa))
* **web,server:** ignore a sender from the map ([#500](https://github.com/khagele/core-hunter/issues/500)) ([1b62809](https://github.com/khagele/core-hunter/commit/1b6280983d8de66c79c836fefe1da77122b893c6))
* **web,server:** tell a hunter when their member verification comes through ([#531](https://github.com/khagele/core-hunter/issues/531)) ([54981ca](https://github.com/khagele/core-hunter/commit/54981ca8c40788c8f63c27324308e93f23bd4a1d))
* **web:** bring the app's 3D to the map: view button, bars, pillars, buildings, terrain and rotation ([#596](https://github.com/khagele/core-hunter/issues/596)) ([b0f3054](https://github.com/khagele/core-hunter/commit/b0f30542bc43393cb0b463823c6b4dc781a890e7))
* **web:** bring the map's receptions ticker onto the app's card model ([#571](https://github.com/khagele/core-hunter/issues/571)) ([7da4ca9](https://github.com/khagele/core-hunter/commit/7da4ca90057536f8ab6a9cae4531a00384b6f551))
* **web:** gate the point layer, and say what an account opens ([#513](https://github.com/khagele/core-hunter/issues/513)) ([71856f1](https://github.com/khagele/core-hunter/commit/71856f1c42027b2eeeb5a21f53537976fb5925a3))
* **web:** make the map's bar one row that names the product, at every width ([#572](https://github.com/khagele/core-hunter/issues/572)) ([efb3eeb](https://github.com/khagele/core-hunter/commit/efb3eeb96c542d7e21b73947fe2dffc2f5cbea5a))
* **web:** move the map from Leaflet to MapLibre, the app's map, at 2D parity ([#592](https://github.com/khagele/core-hunter/issues/592)) ([8def27e](https://github.com/khagele/core-hunter/commit/8def27eb97e307eef5cb83372300d494c29a49e5))
* **web:** name the picked target on the picker button ([#499](https://github.com/khagele/core-hunter/issues/499)) ([cabe596](https://github.com/khagele/core-hunter/commit/cabe5969eec5f3038ecbe3aa68d018b8af981464))
* **web:** one control above the hunter list that selects all, or clears the pick ([#678](https://github.com/khagele/core-hunter/issues/678)) ([07d0753](https://github.com/khagele/core-hunter/commit/07d07531fd0b1249f43c599c6f7e2acc65a5634c))
* **web:** one control rail on the map, and the ticker pinned on a phone ([#657](https://github.com/khagele/core-hunter/issues/657)) ([5360f70](https://github.com/khagele/core-hunter/commit/5360f70cd9d568cc2ef63eca10f96690d779b59c))
* **web:** open the map on the last 30 days, not on All time ([#512](https://github.com/khagele/core-hunter/issues/512)) ([28802ac](https://github.com/khagele/core-hunter/commit/28802ac4f5892c5d3d611e295280a01cef49d533))


### Bug Fixes

* **app,web:** let the FAB ring count the on states, so off is not a segment ([#677](https://github.com/khagele/core-hunter/issues/677)) ([4a1d3a2](https://github.com/khagele/core-hunter/commit/4a1d3a29aed7c07d8fb362e399b3a6c41610bfee))
* **app,web:** locate disclaimer, glossary, and copy parity ([#174](https://github.com/khagele/core-hunter/issues/174)) ([#227](https://github.com/khagele/core-hunter/issues/227)) ([41e1456](https://github.com/khagele/core-hunter/commit/41e1456eaf886350f534c91f7c0eb174010a4f14))
* **app,web:** make the receptions card and the map agree on what is on show ([#652](https://github.com/khagele/core-hunter/issues/652)) ([c44bcfc](https://github.com/khagele/core-hunter/commit/c44bcfc7b5814c7be444fc11e992aa1716641fb0))
* **app,web:** mount the overlays when the style is ready, not when its tiles are ([#654](https://github.com/khagele/core-hunter/issues/654)) ([4f9fef2](https://github.com/khagele/core-hunter/commit/4f9fef27f8913506fa654732819782c8314679bc))
* **app,web:** print an unnamed sender's id once in the target list ([#676](https://github.com/khagele/core-hunter/issues/676)) ([3f7d465](https://github.com/khagele/core-hunter/commit/3f7d46525854e63c01b95fc8664bcae4fa530f76))
* **app:** active state for the Messages panel isolate-sender button ([#89](https://github.com/khagele/core-hunter/issues/89)) ([5f756e1](https://github.com/khagele/core-hunter/commit/5f756e1de0813991d65f630a9d2e81ddcb335967))
* **app:** add missing styles for the radio settings section ([f93f158](https://github.com/khagele/core-hunter/commit/f93f1588f5cc8df48d50efddcd98ba65a6d0c3cc))
* **app:** bound queue reads, persist the publish watermark, add 7-day retention ([#230](https://github.com/khagele/core-hunter/issues/230)) ([#283](https://github.com/khagele/core-hunter/issues/283)) ([c1c92fc](https://github.com/khagele/core-hunter/commit/c1c92fc49f88a1a87a6c17a6885965a00180d922))
* **app:** clarify login/register submit action, keep it above the keyboard ([#239](https://github.com/khagele/core-hunter/issues/239)) ([0255490](https://github.com/khagele/core-hunter/commit/0255490ac8863903ea4bac6e17d08b863dec60f1))
* **app:** collapse coincident receptions to one 3D pillar ([#419](https://github.com/khagele/core-hunter/issues/419)) ([f973714](https://github.com/khagele/core-hunter/commit/f973714f8ff954a88e813cc19e7456088d7fd05f))
* **app:** compass-mode toggle for the map recenter button (pwa) ([#88](https://github.com/khagele/core-hunter/issues/88)) ([f7cd13f](https://github.com/khagele/core-hunter/commit/f7cd13f5e637f9b47fc9b446fa3e5891cc336292))
* **app:** correct leaflet-rotate's renderer zoom transform to stop drift ([#168](https://github.com/khagele/core-hunter/issues/168)) ([a0f6093](https://github.com/khagele/core-hunter/commit/a0f6093e6d38f98dc8fa1e4b223462c6ef947405))
* **app:** default Direct-only filter to off ([#90](https://github.com/khagele/core-hunter/issues/90)) ([db65239](https://github.com/khagele/core-hunter/commit/db65239226954a4d894f03e2c6b4623fa2b87daf))
* **app:** direct-only filter must check hops === 0, not is_direct ([#150](https://github.com/khagele/core-hunter/issues/150)) ([66301e1](https://github.com/khagele/core-hunter/commit/66301e1825c381331a4a13ec1d7bed4c005bff19))
* **app:** disable pull-to-refresh (breaks active BLE/MQTT connection) ([#133](https://github.com/khagele/core-hunter/issues/133)) ([6adb347](https://github.com/khagele/core-hunter/commit/6adb347b9b96ccaee29f7991449ff08be7e621bd))
* **app:** don't let MQTT connect failure abort the BLE connect ([b5a72dd](https://github.com/khagele/core-hunter/commit/b5a72dd80a702c927db1c12d715e03b331738847))
* **app:** don't let MQTT connect failure abort the BLE connect ([984afdf](https://github.com/khagele/core-hunter/commit/984afdf9d3c6d0c7729645a934c11dbe8e0ec67e))
* **app:** draw 3D buildings from z13, the zoom the source declares ([#400](https://github.com/khagele/core-hunter/issues/400)) ([7a727f9](https://github.com/khagele/core-hunter/commit/7a727f9aaf7a67e3a510084096643fad0d5db749)), closes [#395](https://github.com/khagele/core-hunter/issues/395)
* **app:** fold a node's prefixes into one row without an advert in the window ([#681](https://github.com/khagele/core-hunter/issues/681)) ([48734ef](https://github.com/khagele/core-hunter/commit/48734ef3a885e1ea059d46f211426d7e3d742fdd))
* **app:** guard localStorage reads so a storage-hostile context cannot blank the app ([#342](https://github.com/khagele/core-hunter/issues/342)) ([ce9d534](https://github.com/khagele/core-hunter/commit/ce9d534acd6ad081f07b3bff0073816233a5dbef))
* **app:** ignore-sender updates the map immediately ([#112](https://github.com/khagele/core-hunter/issues/112)) ([355e809](https://github.com/khagele/core-hunter/commit/355e809945b6db980198096a7b51df3ed07edfdb))
* **app:** include last-hop repeaters in the target dropdown ([#76](https://github.com/khagele/core-hunter/issues/76)) ([92d1c2c](https://github.com/khagele/core-hunter/commit/92d1c2c644302c4923c6d66018cb4c76b1591fe1))
* **app:** keep the hex-heat grid aligned during zoom ([c1b7828](https://github.com/khagele/core-hunter/commit/c1b782839f6d3908a273007aa6c50a5b65f0a76d))
* **app:** keep the hex-heat grid aligned during zoom (rebuild on zoomend, not mid-animation) ([bd00863](https://github.com/khagele/core-hunter/commit/bd00863866185c1fd56cefecfe44ada4a8a7ab81)), closes [#44](https://github.com/khagele/core-hunter/issues/44)
* **app:** keep the points of earlier rides on the map down to zoom 12 ([#670](https://github.com/khagele/core-hunter/issues/670)) ([789997d](https://github.com/khagele/core-hunter/commit/789997dbd118943e16f6768a8a35996459796978))
* **app:** let the node-position key fade, so it stops sitting on the ticker ([#444](https://github.com/khagele/core-hunter/issues/444)) ([fa58db2](https://github.com/khagele/core-hunter/commit/fa58db25955802aefa3d9fbf11ff760ea613e7e2)), closes [#413](https://github.com/khagele/core-hunter/issues/413)
* **app:** lighter help-overlay backdrop, click-outside dismiss, splash tagline, anchored tooltips ([#220](https://github.com/khagele/core-hunter/issues/220)) ([addd30a](https://github.com/khagele/core-hunter/commit/addd30aa15ff1971759abcdcc7c671f1c6ea652c)), closes [#216](https://github.com/khagele/core-hunter/issues/216)
* **app:** make the map popup and the target list agree on a selection ([#297](https://github.com/khagele/core-hunter/issues/297)) ([#326](https://github.com/khagele/core-hunter/issues/326)) ([8bde3bb](https://github.com/khagele/core-hunter/commit/8bde3bb40c8b7bb848d2c382730cbe692e8968cd))
* **app:** merge target-list rows for the same node across id prefixes ([#268](https://github.com/khagele/core-hunter/issues/268)) ([91e63c6](https://github.com/khagele/core-hunter/commit/91e63c64cbc7433e1828f31795c0ed8e83d8e166))
* **app:** move the FAB stack down toward the thumb zone ([#257](https://github.com/khagele/core-hunter/issues/257)) ([#264](https://github.com/khagele/core-hunter/issues/264)) ([852a9bd](https://github.com/khagele/core-hunter/commit/852a9bd9fb415ebb664b6d5f31c6735840c22663))
* **app:** open the float readout through fullscreen on Android, so capture goes on ([#672](https://github.com/khagele/core-hunter/issues/672)) ([425b889](https://github.com/khagele/core-hunter/commit/425b8898af1e25062ae6d8bb3a1a7a31e990c1f0))
* **app:** paint a 3D bar the tint of its own cell, and lower the style light ([#588](https://github.com/khagele/core-hunter/issues/588)) ([39172e1](https://github.com/khagele/core-hunter/commit/39172e1b4520e92b17b83480760f7f2a16a394ec))
* **app:** pan the map when a receptions-ticker row is tapped ([#392](https://github.com/khagele/core-hunter/issues/392)) ([940d03e](https://github.com/khagele/core-hunter/commit/940d03e77f9a0c39c8e3c028c81911cd019391df)), closes [#309](https://github.com/khagele/core-hunter/issues/309)
* **app:** prevent Chrome auto-translate from rewriting the UI ([ae20e57](https://github.com/khagele/core-hunter/commit/ae20e57169252753d0bded964b01c5de10e769f3))
* **app:** prevent text-selection tap-to-search on row buttons (Android) ([#84](https://github.com/khagele/core-hunter/issues/84)) ([9723b2d](https://github.com/khagele/core-hunter/commit/9723b2d39a462f88e9db4a4d49e1521880ae6218))
* **app:** raise map maxZoom from 19 to 20 ([#107](https://github.com/khagele/core-hunter/issues/107)) ([475ab1b](https://github.com/khagele/core-hunter/commit/475ab1bb03462a06795515b3645411995fc1fd8b))
* **app:** render points above the hex layer in 'both' mode ([#125](https://github.com/khagele/core-hunter/issues/125)) ([963871d](https://github.com/khagele/core-hunter/commit/963871d8147bf3fb2459ca1b55f06834a8c185b0))
* **app:** resolve relayed-advert prefixes to repeater names ([#137](https://github.com/khagele/core-hunter/issues/137)) ([6a5037a](https://github.com/khagele/core-hunter/commit/6a5037abd8bbbc52fa49db872cd8d9a37a0ff705)), closes [#136](https://github.com/khagele/core-hunter/issues/136)
* **app:** restore tier opacity and age-fade on the 3D pillars ([#302](https://github.com/khagele/core-hunter/issues/302)) ([#328](https://github.com/khagele/core-hunter/issues/328)) ([74d6a1f](https://github.com/khagele/core-hunter/commit/74d6a1f15dade491d3a198018f39ca55bf894d95))
* **app:** round the 3D pillar footprint to an octagon, sized as a radius ([#311](https://github.com/khagele/core-hunter/issues/311)) ([ad0560b](https://github.com/khagele/core-hunter/commit/ad0560b8f092bc8134fc4be5e0aa5d050498c8aa)), closes [#308](https://github.com/khagele/core-hunter/issues/308)
* **app:** say so when the node-position layer has no registry data to draw ([#355](https://github.com/khagele/core-hunter/issues/355)) ([2e2f30a](https://github.com/khagele/core-hunter/commit/2e2f30a48cba25c38b45e471694e092510b1c0cf))
* **app:** send the receptions that are waiting, radio or no radio ([#515](https://github.com/khagele/core-hunter/issues/515)) ([15f79ff](https://github.com/khagele/core-hunter/commit/15f79ff678cd7e600363c52f0f0aa4ba1ce9f8d7)), closes [#454](https://github.com/khagele/core-hunter/issues/454)
* **app:** Settings connect/disconnect button stays disabled after connecting ([#124](https://github.com/khagele/core-hunter/issues/124)) ([986a275](https://github.com/khagele/core-hunter/commit/986a275fb5760f76db1e32e62dc9e972d9a0ac40))
* **app:** ship MapLibre in the build, so the launch needs no other host ([#673](https://github.com/khagele/core-hunter/issues/673)) ([82180cc](https://github.com/khagele/core-hunter/commit/82180ccfe076447e707de122a490c66d53d0848c))
* **app:** show discover responses in the Messages panel ([#166](https://github.com/khagele/core-hunter/issues/166)) ([2e8c2c7](https://github.com/khagele/core-hunter/commit/2e8c2c707ad8078c3e817a952cca63b486c14992))
* **app:** show the node-position disclaimer as a glance, keep a permanent key ([#312](https://github.com/khagele/core-hunter/issues/312)) ([eb89280](https://github.com/khagele/core-hunter/commit/eb89280b21ca3b3785eca6ba00e30d6db8a33e49)), closes [#306](https://github.com/khagele/core-hunter/issues/306)
* **app:** stop auto-ping's discover broadcast and first trace-ping colliding ([#253](https://github.com/khagele/core-hunter/issues/253), [#254](https://github.com/khagele/core-hunter/issues/254)) ([#262](https://github.com/khagele/core-hunter/issues/262)) ([428f57c](https://github.com/khagele/core-hunter/commit/428f57c8aa0e5686c931d0ea6971ca1fae17b518))
* **app:** stop follow-mode recenter from cancelling an active pinch-zoom ([#243](https://github.com/khagele/core-hunter/issues/243)) ([d92cd28](https://github.com/khagele/core-hunter/commit/d92cd2803b67790e55b91746325ee86b374940fe))
* **app:** stop MapLibre shading the tier colour out of the 3D bars ([#446](https://github.com/khagele/core-hunter/issues/446)) ([29e73dc](https://github.com/khagele/core-hunter/commit/29e73dc69c16333df00a2537c8bd60e5c72559c8))
* **app:** stop the blank map and 3D freeze; drop terrain from 3D ([#147](https://github.com/khagele/core-hunter/issues/147)) ([#247](https://github.com/khagele/core-hunter/issues/247)) ([0bc7a25](https://github.com/khagele/core-hunter/commit/0bc7a25e678bb649901bec446ab6894f64c1f225))
* **app:** stop the FAB progress ring lighting a segment when sound is off ([#414](https://github.com/khagele/core-hunter/issues/414)) ([77e5a1f](https://github.com/khagele/core-hunter/commit/77e5a1f5a147d317e096dee4d185a59df3722eeb)), closes [#373](https://github.com/khagele/core-hunter/issues/373)
* **app:** stop the parked tone that stood in for the bed while backgrounded ([#569](https://github.com/khagele/core-hunter/issues/569)) ([0d595f8](https://github.com/khagele/core-hunter/commit/0d595f8d71882e83aa2215c7b02cbba9dae26941))
* **app:** swap layer-toggle FAB icon per active layer mode ([#87](https://github.com/khagele/core-hunter/issues/87)) ([a720d4c](https://github.com/khagele/core-hunter/commit/a720d4cfb869407d186b910009010093d1c86ad3))
* **app:** take the gate's coach marks out of #splash's stacking context ([#565](https://github.com/khagele/core-hunter/issues/565)) ([6fba59e](https://github.com/khagele/core-hunter/commit/6fba59e890971d85c6d9f269649b14183c8c23d3))
* **app:** truncate target chip with ellipsis, keep topbar controls visible ([#310](https://github.com/khagele/core-hunter/issues/310)) ([22233c9](https://github.com/khagele/core-hunter/commit/22233c994b30a640a55c3a809c1156d5b7683d39)), closes [#305](https://github.com/khagele/core-hunter/issues/305)
* **app:** two-line target rows to fix id/RSSI overlap and improve name legibility ([#219](https://github.com/khagele/core-hunter/issues/219)) ([d800486](https://github.com/khagele/core-hunter/commit/d80048641f894ac0409a295d68799c37ce194d21)), closes [#215](https://github.com/khagele/core-hunter/issues/215)
* **app:** unify Settings connection button (connect/disconnect/retry) ([#86](https://github.com/khagele/core-hunter/issues/86)) ([9d1adbd](https://github.com/khagele/core-hunter/commit/9d1adbdb8143db9e3963cb1537217ebcd0a0b45b))
* **app:** warn on a low battery when the companion does, not 260 mV later ([#443](https://github.com/khagele/core-hunter/issues/443)) ([61bd271](https://github.com/khagele/core-hunter/commit/61bd2713016fe8a5d2446cd01f7dd40d9eb758ad)), closes [#380](https://github.com/khagele/core-hunter/issues/380)
* **map:** show when a reception arrived and which ride it belongs to ([#655](https://github.com/khagele/core-hunter/issues/655)) ([7d476bd](https://github.com/khagele/core-hunter/commit/7d476bda9e309504cc7329c25c060c2d3553520a))
* refuse ambiguous prefixes and consult sender_kind on both sides ([#295](https://github.com/khagele/core-hunter/issues/295), [#296](https://github.com/khagele/core-hunter/issues/296)) ([#325](https://github.com/khagele/core-hunter/issues/325)) ([55a026f](https://github.com/khagele/core-hunter/commit/55a026fbc1bf8c213ce76d582620d596cd343f9b))
* **server,app:** stop one reception blocking every reception behind it ([#505](https://github.com/khagele/core-hunter/issues/505)) ([c49b87a](https://github.com/khagele/core-hunter/commit/c49b87accbfd047aaa1affc6dbdbbea0ab3419d2)), closes [#454](https://github.com/khagele/core-hunter/issues/454)
* **web,app:** make the map keep up with the drive ([#514](https://github.com/khagele/core-hunter/issues/514)) ([720da82](https://github.com/khagele/core-hunter/commit/720da82fb32431b36a52840a31f2677ea84c08a8)), closes [#454](https://github.com/khagele/core-hunter/issues/454)
* **web,app:** resolve the names in the target list, and mark the ids that cannot ([#526](https://github.com/khagele/core-hunter/issues/526)) ([9fe9067](https://github.com/khagele/core-hunter/commit/9fe906726cc7bca23cea3e8617983a7c25e9dc7b))
* **web,server:** say how far back the map reaches instead of "capped" ([#488](https://github.com/khagele/core-hunter/issues/488)) ([5a26e51](https://github.com/khagele/core-hunter/commit/5a26e51ce63675c6e9d703223806df6821850dad)), closes [#440](https://github.com/khagele/core-hunter/issues/440)
* **web:** fetch the hunter roster per role, so a login shows real names and a logout drops them ([#598](https://github.com/khagele/core-hunter/issues/598)) ([4b28ee9](https://github.com/khagele/core-hunter/commit/4b28ee90bf432de1e408312e6b466e86a7e4b699))
* **web:** give the picker rows their own look back from the bar ([#680](https://github.com/khagele/core-hunter/issues/680)) ([da616ff](https://github.com/khagele/core-hunter/commit/da616ffc087d3508b475835c55221d896f0e8239))
* **web:** make a node's estimate from the whole window, not from the view ([#675](https://github.com/khagele/core-hunter/issues/675)) ([9255d75](https://github.com/khagele/core-hunter/commit/9255d7590c61c603df7aeeddea0021c5553fa845))
* **web:** only load Matomo on production hosts (not localhost/CI) ([1c70a7a](https://github.com/khagele/core-hunter/commit/1c70a7a85145bc688c2e21dc27d19dd457cb8294))
* **web:** paint the active stop of the View control, and give the quick ranges their own look ([#674](https://github.com/khagele/core-hunter/issues/674)) ([b9c2eb3](https://github.com/khagele/core-hunter/commit/b9c2eb3ecc6eb1624ab4777d42a6b22495b4c768))
* **web:** paint the open filter panel over the Locate readout and the node-position notice ([#597](https://github.com/khagele/core-hunter/issues/597)) ([aa8a304](https://github.com/khagele/core-hunter/commit/aa8a30447bfa8859f1d92439b2c1c937b4848680))
* **web:** stand the map readout above the attribution, not on it ([#659](https://github.com/khagele/core-hunter/issues/659)) ([8b9d47d](https://github.com/khagele/core-hunter/commit/8b9d47df87de5194cbab64596239bc84e1fd63fb))


### Performance Improvements

* **app:** rebuild the map once per view change, not twice ([#351](https://github.com/khagele/core-hunter/issues/351)) ([f2d0546](https://github.com/khagele/core-hunter/commit/f2d0546609bb6408bc80bcc8e6a2175fbbf4cba3))
* **app:** stop rebuilding a render tick that cannot have changed ([#485](https://github.com/khagele/core-hunter/issues/485)) ([18aa6ca](https://github.com/khagele/core-hunter/commit/18aa6caaf045fff7ecfbfd61ae266070d1c6797d)), closes [#462](https://github.com/khagele/core-hunter/issues/462)


### Code Refactoring

* **web:** one watcher on #bar, and the open panels follow its growth ([#600](https://github.com/khagele/core-hunter/issues/600)) ([0cb6a51](https://github.com/khagele/core-hunter/commit/0cb6a5158f17d3d7170a0d863a1ee90a2e887303))


### Documentation

* **app,web:** write the release notes for what shipped since the backfill ([#460](https://github.com/khagele/core-hunter/issues/460)) ([ca1e31a](https://github.com/khagele/core-hunter/commit/ca1e31ae31ff1b38309f6368e5da01e68018207e))
* **app:** document required publish-only broker ACL ([#154](https://github.com/khagele/core-hunter/issues/154)) ([f80459a](https://github.com/khagele/core-hunter/commit/f80459a24cf42fa09ea502480ca3f85c8b400e4a))
* **app:** say what a lit hex cell claims after [#455](https://github.com/khagele/core-hunter/issues/455), and drop two stale claims ([#469](https://github.com/khagele/core-hunter/issues/469)) ([3040d01](https://github.com/khagele/core-hunter/commit/3040d01186b5a117486a71727841313151c60e53))
* cut the four entries [#519](https://github.com/khagele/core-hunter/issues/519) could not reach ([#534](https://github.com/khagele/core-hunter/issues/534)) ([b47786c](https://github.com/khagele/core-hunter/commit/b47786c336b6079dcc2c24ea592ff83a86f77f4b))
* cut the release notes back to a glance ([#520](https://github.com/khagele/core-hunter/issues/520)) ([dd3d895](https://github.com/khagele/core-hunter/commit/dd3d8950bb6a8f462d43e13dd2bcf4d508216f17)), closes [#519](https://github.com/khagele/core-hunter/issues/519)
* dedupe release changelogs (drop merge-commit duplicates) ([#70](https://github.com/khagele/core-hunter/issues/70)) ([10d0528](https://github.com/khagele/core-hunter/commit/10d0528017a72cdc4db530dafaf157a37bb7487f))
* make the pre-push self-review concrete, mutation-check new tests, widen §7 ([#364](https://github.com/khagele/core-hunter/issues/364)) ([e4c7051](https://github.com/khagele/core-hunter/commit/e4c7051b0f248befac8d5872e3680f672e534194)), closes [#334](https://github.com/khagele/core-hunter/issues/334)


### Continuous Integration

* add an eslint no-undef pass over app, web and nameresolver ([#303](https://github.com/khagele/core-hunter/issues/303)) ([#324](https://github.com/khagele/core-hunter/issues/324)) ([0eafdca](https://github.com/khagele/core-hunter/commit/0eafdca066e9728457d1da400c405fd4198f4f00))


### Styles

* **app:** standardize glossary and copy wording ([#174](https://github.com/khagele/core-hunter/issues/174)) ([#226](https://github.com/khagele/core-hunter/issues/226)) ([8c57469](https://github.com/khagele/core-hunter/commit/8c57469f7bc402bb8330d2a3300c28e4a919a793))
* **app:** themed X close button in overlay sheets ([8fe485b](https://github.com/khagele/core-hunter/commit/8fe485b3b958e08f5cbeac670c8a5846d8e0baa4))


### Tests

* **app,web:** guard the picker block and the shared tokens against drift, and give the web the app's palette ([#601](https://github.com/khagele/core-hunter/issues/601)) ([88fc3de](https://github.com/khagele/core-hunter/commit/88fc3deef43525d286fb40b302f4b08190c2af6d))
* **app,web:** pin densityGrid's kernel, which nothing was holding ([#442](https://github.com/khagele/core-hunter/issues/442)) ([b1807dd](https://github.com/khagele/core-hunter/commit/b1807dde1ba4b70aa9997a5e64c8f77d74a95442)), closes [#370](https://github.com/khagele/core-hunter/issues/370)
* **app:** let a test name the harmony drift's pick instead of hoping for one ([#607](https://github.com/khagele/core-hunter/issues/607)) ([14f98ee](https://github.com/khagele/core-hunter/commit/14f98ee9996b404300a5bf8a660d3ae99b563478)), closes [#606](https://github.com/khagele/core-hunter/issues/606)


### Miscellaneous Chores

* add cookieless Matomo analytics to landing/map/app ([9b06bad](https://github.com/khagele/core-hunter/commit/9b06bad91e7fa8f3ce3de16f14c4dd04b23d6e36))
* **app:** remove the Manual position (dev) debug feature ([#122](https://github.com/khagele/core-hunter/issues/122)) ([5e43aa7](https://github.com/khagele/core-hunter/commit/5e43aa753636aff6d1a1896d6a7435e5dd2644d7))
* introduce per-component versioning with release-please ([#7](https://github.com/khagele/core-hunter/issues/7)) ([ef511db](https://github.com/khagele/core-hunter/commit/ef511dbc48c3c96102b06933a4199ed8b24d698c))
* release app 0.2.0 ([#9](https://github.com/khagele/core-hunter/issues/9)) ([ca33481](https://github.com/khagele/core-hunter/commit/ca334818c4b7d04402cdc11e6f6dcee04961c529))
* release app 0.3.0 ([#12](https://github.com/khagele/core-hunter/issues/12)) ([191046d](https://github.com/khagele/core-hunter/commit/191046d1fc819623af1dfdfa6537970e4a1f8474))
* release app 0.4.0 ([#15](https://github.com/khagele/core-hunter/issues/15)) ([6bc801d](https://github.com/khagele/core-hunter/commit/6bc801d94bf4b4ff2598db033e143a9badf946d8))
* release app 0.5.0 ([#18](https://github.com/khagele/core-hunter/issues/18)) ([99caae6](https://github.com/khagele/core-hunter/commit/99caae66323c06ffec6bb26a34c46490c2103522))
* release master ([473dd91](https://github.com/khagele/core-hunter/commit/473dd91fbe22d42017fe03739ea50fc311498319))
* release master ([2f15176](https://github.com/khagele/core-hunter/commit/2f151765533fcddb061b0b5c288f62f1eb287f51))
* release master ([68d62e0](https://github.com/khagele/core-hunter/commit/68d62e0d8c2709bf7ba1a36f7d3521f3a6397ca5))
* release master ([67a1c47](https://github.com/khagele/core-hunter/commit/67a1c47ad65e15b966735b2c22c76615d02a5c8e))
* release master ([78e291c](https://github.com/khagele/core-hunter/commit/78e291ceefdea9f69b4f139b57813389c2a5ea60))
* release master ([7fe200b](https://github.com/khagele/core-hunter/commit/7fe200be41ddadab310d3fab8f713392b0a8d526))
* release master ([#105](https://github.com/khagele/core-hunter/issues/105)) ([4157766](https://github.com/khagele/core-hunter/commit/41577661448080a6d561da51db422334ba7cd2de))
* release master ([#109](https://github.com/khagele/core-hunter/issues/109)) ([1c06593](https://github.com/khagele/core-hunter/commit/1c06593b601453a3734ca99bb09487d1506dd725))
* release master ([#163](https://github.com/khagele/core-hunter/issues/163)) ([59807d3](https://github.com/khagele/core-hunter/commit/59807d35b46267ea25aa8a62fe2b4b17dee04248))
* release master ([#169](https://github.com/khagele/core-hunter/issues/169)) ([b94a907](https://github.com/khagele/core-hunter/commit/b94a907508466ed69cca5fd28bf7f040d7339037))
* release master ([#172](https://github.com/khagele/core-hunter/issues/172)) ([2071ec1](https://github.com/khagele/core-hunter/commit/2071ec116b54cddc5e06cddf850761d157e2ceb0))
* release master ([#192](https://github.com/khagele/core-hunter/issues/192)) ([a4e2426](https://github.com/khagele/core-hunter/commit/a4e2426fb1fc7901199172b5d20949b6ab9d2df2))
* release master ([#213](https://github.com/khagele/core-hunter/issues/213)) ([64283dc](https://github.com/khagele/core-hunter/commit/64283dc56a511620b493db71384156e13849fe43))
* release master ([#229](https://github.com/khagele/core-hunter/issues/229)) ([8189aff](https://github.com/khagele/core-hunter/commit/8189aff37bdd2321536c59ea7f7295543ee215a2))
* release master ([#248](https://github.com/khagele/core-hunter/issues/248)) ([62570b0](https://github.com/khagele/core-hunter/commit/62570b00061bcc9674c04bd1678100ac639d2115))
* release master ([#292](https://github.com/khagele/core-hunter/issues/292)) ([acf29f9](https://github.com/khagele/core-hunter/commit/acf29f99d72ccece441afe805b12433c5142344e))
* release master ([#294](https://github.com/khagele/core-hunter/issues/294)) ([8000d31](https://github.com/khagele/core-hunter/commit/8000d31c57708f9d90bad328a54bfa5237c248df))
* release master ([#330](https://github.com/khagele/core-hunter/issues/330)) ([eba3a73](https://github.com/khagele/core-hunter/commit/eba3a7358c0dd541448395955c6f5b074f77e7bf))
* release master ([#339](https://github.com/khagele/core-hunter/issues/339)) ([d63f65e](https://github.com/khagele/core-hunter/commit/d63f65ee23e48bf4d329f386305c6a2d6d54befb))
* release master ([#348](https://github.com/khagele/core-hunter/issues/348)) ([30ba551](https://github.com/khagele/core-hunter/commit/30ba551af9a54a24078b78afd12ff08c1f2812d3))
* release master ([#382](https://github.com/khagele/core-hunter/issues/382)) ([d1207eb](https://github.com/khagele/core-hunter/commit/d1207eb56e35e165aef4314f39b8dffbb15e21ce))
* release master ([#415](https://github.com/khagele/core-hunter/issues/415)) ([f11b77d](https://github.com/khagele/core-hunter/commit/f11b77d86abba0ea7085e8b1d490566b0e0ec743))
* release master ([#431](https://github.com/khagele/core-hunter/issues/431)) ([bb8a356](https://github.com/khagele/core-hunter/commit/bb8a3567be6af314a807e165af3744d8e002e615))
* release master ([#447](https://github.com/khagele/core-hunter/issues/447)) ([ab2a633](https://github.com/khagele/core-hunter/commit/ab2a6338acbbd68caa732bd96438a43c279f3c0a))
* release master ([#456](https://github.com/khagele/core-hunter/issues/456)) ([b0ac87d](https://github.com/khagele/core-hunter/commit/b0ac87d16c88e3833338eb728268af7a767f6330))
* release master ([#457](https://github.com/khagele/core-hunter/issues/457)) ([6849fca](https://github.com/khagele/core-hunter/commit/6849fcac514fc12f42c62b64936481567abc1b2b))
* release master ([#461](https://github.com/khagele/core-hunter/issues/461)) ([7b08991](https://github.com/khagele/core-hunter/commit/7b089917cc61f821b38f72d29e11035b966f0785))
* release master ([#486](https://github.com/khagele/core-hunter/issues/486)) ([07c8793](https://github.com/khagele/core-hunter/commit/07c879355e646d65e84308bf0305f04cf446ffce))
* release master ([#487](https://github.com/khagele/core-hunter/issues/487)) ([a2b038a](https://github.com/khagele/core-hunter/commit/a2b038a692d98a8b1426d1963d52c95fd339f458))
* release master ([#502](https://github.com/khagele/core-hunter/issues/502)) ([107cfd2](https://github.com/khagele/core-hunter/commit/107cfd2f0c06e80607c7287121ae8b6e79d3f0f8))
* release master ([#523](https://github.com/khagele/core-hunter/issues/523)) ([9acfe8b](https://github.com/khagele/core-hunter/commit/9acfe8b20c6a8cfa4bf396348e9a91fd5b12b8fc))
* release master ([#524](https://github.com/khagele/core-hunter/issues/524)) ([f7512f0](https://github.com/khagele/core-hunter/commit/f7512f0e3d36feb3e401d0edcd2b4e4a975cb1c8))
* release master ([#527](https://github.com/khagele/core-hunter/issues/527)) ([539d08d](https://github.com/khagele/core-hunter/commit/539d08da6eb832d2ac52e032d40a149947851b71))
* release master ([#529](https://github.com/khagele/core-hunter/issues/529)) ([8db7001](https://github.com/khagele/core-hunter/commit/8db7001ae83f3b371be8ff2a4b9c806af1fb9bb6))
* release master ([#532](https://github.com/khagele/core-hunter/issues/532)) ([edbace5](https://github.com/khagele/core-hunter/commit/edbace5264f2002d90c118b6adc88a0c18f7e31c))
* release master ([#533](https://github.com/khagele/core-hunter/issues/533)) ([fe0962a](https://github.com/khagele/core-hunter/commit/fe0962a3ed438206cceef57ea7fa5bf4f277ec0f))
* release master ([#537](https://github.com/khagele/core-hunter/issues/537)) ([dd78da1](https://github.com/khagele/core-hunter/commit/dd78da1a73e1a844c0f9ed573fceb50c52355b7c))
* release master ([#550](https://github.com/khagele/core-hunter/issues/550)) ([6650611](https://github.com/khagele/core-hunter/commit/66506117fea3615b3482fe36d61d0a60660c3698))
* release master ([#551](https://github.com/khagele/core-hunter/issues/551)) ([eef1ef3](https://github.com/khagele/core-hunter/commit/eef1ef386b5988ca10bdfcefffac6504044478ca))
* release master ([#559](https://github.com/khagele/core-hunter/issues/559)) ([ae9ba97](https://github.com/khagele/core-hunter/commit/ae9ba971b18db19a8207b25f58d54d02827dd799))
* release master ([#567](https://github.com/khagele/core-hunter/issues/567)) ([90c3375](https://github.com/khagele/core-hunter/commit/90c3375e06468ddb773a50a7f899399aa67496d5))
* release master ([#605](https://github.com/khagele/core-hunter/issues/605)) ([ba257c5](https://github.com/khagele/core-hunter/commit/ba257c545dbb9499a1b6f8b6f7815759cc7ceb71))
* release master ([#608](https://github.com/khagele/core-hunter/issues/608)) ([d0af383](https://github.com/khagele/core-hunter/commit/d0af383088417dd4f49d86162fce90460d19fdcd))
* release master ([#612](https://github.com/khagele/core-hunter/issues/612)) ([eaf455f](https://github.com/khagele/core-hunter/commit/eaf455f1856085a992bf31bbbae20b36c94cb1f8))
* release master ([#645](https://github.com/khagele/core-hunter/issues/645)) ([4652691](https://github.com/khagele/core-hunter/commit/46526917790b59adae25746483b243c17fb1e4d5))
* release master ([#71](https://github.com/khagele/core-hunter/issues/71)) ([24eb458](https://github.com/khagele/core-hunter/commit/24eb458faa8503406e45b30eef1f7e9b4c352139))
* release master ([#73](https://github.com/khagele/core-hunter/issues/73)) ([e35c3c7](https://github.com/khagele/core-hunter/commit/e35c3c7df73a18491658a50fcf5887cecf2db4c3))
* release master ([#77](https://github.com/khagele/core-hunter/issues/77)) ([0496c1c](https://github.com/khagele/core-hunter/commit/0496c1c38174d46aa35bec0598a4d995b7ad8e5b))

## [1.27.0](https://github.com/efiten/core-hunter/compare/app-v1.26.0...app-v1.27.0) (2026-09-17)


### Features

* **app,web:** a reading layer that points at the node you heard ([#667](https://github.com/efiten/core-hunter/issues/667)) ([23c823d](https://github.com/efiten/core-hunter/commit/23c823d6b50e871c0220419248f24eba38719f1c))
* **app,web:** one control for where nodes are, and a glyph key that lives in the popup ([#653](https://github.com/efiten/core-hunter/issues/653)) ([640d5ae](https://github.com/efiten/core-hunter/commit/640d5aea4bfc1fe2e7a3dffb848786c95232feda))
* **map:** select any repeater's reach, and dim the rest of the map with it ([#656](https://github.com/efiten/core-hunter/issues/656)) ([1142292](https://github.com/efiten/core-hunter/commit/114229213c1f2031ac603e1dc9452f3e74bb7482))
* **web:** one control rail on the map, and the ticker pinned on a phone ([#657](https://github.com/efiten/core-hunter/issues/657)) ([5360f70](https://github.com/efiten/core-hunter/commit/5360f70cd9d568cc2ef63eca10f96690d779b59c))


### Bug Fixes

* **app,web:** make the receptions card and the map agree on what is on show ([#652](https://github.com/efiten/core-hunter/issues/652)) ([c44bcfc](https://github.com/efiten/core-hunter/commit/c44bcfc7b5814c7be444fc11e992aa1716641fb0))
* **app,web:** mount the overlays when the style is ready, not when its tiles are ([#654](https://github.com/efiten/core-hunter/issues/654)) ([4f9fef2](https://github.com/efiten/core-hunter/commit/4f9fef27f8913506fa654732819782c8314679bc))
* **map:** show when a reception arrived and which ride it belongs to ([#655](https://github.com/efiten/core-hunter/issues/655)) ([7d476bd](https://github.com/efiten/core-hunter/commit/7d476bda9e309504cc7329c25c060c2d3553520a))
* **web:** stand the map readout above the attribution, not on it ([#659](https://github.com/efiten/core-hunter/issues/659)) ([8b9d47d](https://github.com/efiten/core-hunter/commit/8b9d47df87de5194cbab64596239bc84e1fd63fb))

## [1.26.0](https://github.com/efiten/core-hunter/compare/app-v1.25.1...app-v1.26.0) (2026-09-12)


### Features

* **app,web,server:** drop Sender unknown, the Unnamed chip already selects the same receptions ([#582](https://github.com/efiten/core-hunter/issues/582)) ([f297d9c](https://github.com/efiten/core-hunter/commit/f297d9c993fdf3cf273177b86b0662efcf259a2c))
* **app,web:** every repeater's reach at once, in its own hue, as the third stop of Node positions ([#593](https://github.com/efiten/core-hunter/issues/593)) ([e7dded6](https://github.com/efiten/core-hunter/commit/e7dded615150ef87bb7493fd1075e8e1b410fcb7))
* **app,web:** make the two filter panels one panel ([#573](https://github.com/efiten/core-hunter/issues/573)) ([488b4e2](https://github.com/efiten/core-hunter/commit/488b4e2d93d6f99f0affbf41d6183018807f1069))
* **app,web:** show the id beside a resolved name in the receptions ticker ([#584](https://github.com/efiten/core-hunter/issues/584)) ([f397b09](https://github.com/efiten/core-hunter/commit/f397b094ddff4601855dc9697ac172311b7f131d))
* **app:** add Share my node name, off by default, sending a zero-hop advert each cycle a companion is the target ([#577](https://github.com/efiten/core-hunter/issues/577)) ([2acbdad](https://github.com/efiten/core-hunter/commit/2acbdadadca3d158b44c313d09f2701e53dfd37d))
* **app:** ask a selected companion for its telemetry each cycle, zero-hop, and keep what it answers per node ([#578](https://github.com/efiten/core-hunter/issues/578)) ([cfcc130](https://github.com/efiten/core-hunter/commit/cfcc130937dc84b0e654788a948edeaddbea4e4c))
* **app:** draw earlier rides as coverage and outlines, pulse the newest reception, and name the nodes in a hex cell ([#579](https://github.com/efiten/core-hunter/issues/579)) ([e348c4c](https://github.com/efiten/core-hunter/commit/e348c4cd872a9c9ef3a5b5de65af4b008d8fba7c))
* **app:** let the HUD follow the ticker's stand, act on the shown sender, and float it over other apps ([#575](https://github.com/efiten/core-hunter/issues/575)) ([ec9c9ed](https://github.com/efiten/core-hunter/commit/ec9c9ed0b8dc7a9a6cb185d4156a3a72eb440feb))
* **app:** look ahead while the map turns with you, and give the compass button three stops ([#585](https://github.com/efiten/core-hunter/issues/585)) ([a7b0f99](https://github.com/efiten/core-hunter/commit/a7b0f99893dc66e410bbd29a00e2a8f60819afef))
* **app:** make the HUD the ticker's playhead, so a name that resolves later reaches it ([#583](https://github.com/efiten/core-hunter/issues/583)) ([0205138](https://github.com/efiten/core-hunter/commit/020513899c28651c3d3a1bb6bd41487b0a0ccf57))
* **app:** name a short id only when the registries of the SF agree, and mark it as a guess ([#587](https://github.com/efiten/core-hunter/issues/587)) ([1a8798a](https://github.com/efiten/core-hunter/commit/1a8798a7d7c01c582bd30cdee7719a60430e923a))
* **app:** ship terrain on the AWS DEM, raised by the 3D view, with an exaggeration setting ([#586](https://github.com/efiten/core-hunter/issues/586)) ([2aad6e4](https://github.com/efiten/core-hunter/commit/2aad6e47e2963f35e1f21fab37df3ccbd79b6a15))
* **app:** size the receptions card to what it holds, in steps ([#570](https://github.com/efiten/core-hunter/issues/570)) ([2ab97cb](https://github.com/efiten/core-hunter/commit/2ab97cb31f57605f40631a582691daba235c8b02))
* **web:** bring the app's 3D to the map: view button, bars, pillars, buildings, terrain and rotation ([#596](https://github.com/efiten/core-hunter/issues/596)) ([b0f3054](https://github.com/efiten/core-hunter/commit/b0f30542bc43393cb0b463823c6b4dc781a890e7))
* **web:** bring the map's receptions ticker onto the app's card model ([#571](https://github.com/efiten/core-hunter/issues/571)) ([7da4ca9](https://github.com/efiten/core-hunter/commit/7da4ca90057536f8ab6a9cae4531a00384b6f551))
* **web:** make the map's bar one row that names the product, at every width ([#572](https://github.com/efiten/core-hunter/issues/572)) ([efb3eeb](https://github.com/efiten/core-hunter/commit/efb3eeb96c542d7e21b73947fe2dffc2f5cbea5a))
* **web:** move the map from Leaflet to MapLibre, the app's map, at 2D parity ([#592](https://github.com/efiten/core-hunter/issues/592)) ([8def27e](https://github.com/efiten/core-hunter/commit/8def27eb97e307eef5cb83372300d494c29a49e5))


### Bug Fixes

* **app:** paint a 3D bar the tint of its own cell, and lower the style light ([#588](https://github.com/efiten/core-hunter/issues/588)) ([39172e1](https://github.com/efiten/core-hunter/commit/39172e1b4520e92b17b83480760f7f2a16a394ec))
* **web:** fetch the hunter roster per role, so a login shows real names and a logout drops them ([#598](https://github.com/efiten/core-hunter/issues/598)) ([4b28ee9](https://github.com/efiten/core-hunter/commit/4b28ee90bf432de1e408312e6b466e86a7e4b699))
* **web:** paint the open filter panel over the Locate readout and the node-position notice ([#597](https://github.com/efiten/core-hunter/issues/597)) ([aa8a304](https://github.com/efiten/core-hunter/commit/aa8a30447bfa8859f1d92439b2c1c937b4848680))


### Code Refactoring

* **web:** one watcher on #bar, and the open panels follow its growth ([#600](https://github.com/efiten/core-hunter/issues/600)) ([0cb6a51](https://github.com/efiten/core-hunter/commit/0cb6a5158f17d3d7170a0d863a1ee90a2e887303))


### Tests

* **app,web:** guard the picker block and the shared tokens against drift, and give the web the app's palette ([#601](https://github.com/efiten/core-hunter/issues/601)) ([88fc3de](https://github.com/efiten/core-hunter/commit/88fc3deef43525d286fb40b302f4b08190c2af6d))

## [1.25.1](https://github.com/efiten/core-hunter/compare/app-v1.25.0...app-v1.25.1) (2026-09-09)


### Tests

* **app:** let a test name the harmony drift's pick instead of hoping for one ([#607](https://github.com/efiten/core-hunter/issues/607)) ([14f98ee](https://github.com/efiten/core-hunter/commit/14f98ee9996b404300a5bf8a660d3ae99b563478)), closes [#606](https://github.com/efiten/core-hunter/issues/606)

## [1.25.0](https://github.com/efiten/core-hunter/compare/app-v1.24.0...app-v1.25.0) (2026-09-08)


### Features

* **app,web:** mark the About and What's new links that leave the app ([#589](https://github.com/efiten/core-hunter/issues/589)) ([f14d205](https://github.com/efiten/core-hunter/commit/f14d205e3964432f744368a6b777b71186ac518f))
* **app:** give auto-discover a duty floor from the airtime the last cycle spent ([#581](https://github.com/efiten/core-hunter/issues/581)) ([6450c3c](https://github.com/efiten/core-hunter/commit/6450c3c8979e25b6616de910ffd4b98f94675dd9))
* **app:** give the time window the map's presets ([#574](https://github.com/efiten/core-hunter/issues/574)) ([bfef541](https://github.com/efiten/core-hunter/commit/bfef541350eb79c3aa2c41ca91de0ed757400922))
* **landing,app,web:** link the FAQ from both About tabs, and give every question an anchor ([#580](https://github.com/efiten/core-hunter/issues/580)) ([ae1410c](https://github.com/efiten/core-hunter/commit/ae1410cc0ad12ca52738f06f8a4607da597df32d))


### Bug Fixes

* **app:** stop the parked tone that stood in for the bed while backgrounded ([#569](https://github.com/efiten/core-hunter/issues/569)) ([0d595f8](https://github.com/efiten/core-hunter/commit/0d595f8d71882e83aa2215c7b02cbba9dae26941))

## [1.24.0](https://github.com/efiten/core-hunter/compare/app-v1.23.0...app-v1.24.0) (2026-08-30)


### Features

* **app:** give the theme three states and a memory, and end the Settings tab ([#566](https://github.com/efiten/core-hunter/issues/566)) ([e67c319](https://github.com/efiten/core-hunter/commit/e67c3193dca73ac5dd7732dc0050ef5c8774ef94))
* **app:** keep the SNR the repeater heard us at ([#489](https://github.com/efiten/core-hunter/issues/489)) ([0cd0a7c](https://github.com/efiten/core-hunter/commit/0cd0a7c4a74f1b79465c7a3f488341c75a3bd52e))
* **app:** make every recorded reception audible, one instrument per type (+ sound tweaks) ([#470](https://github.com/efiten/core-hunter/issues/470)) ([6244c0f](https://github.com/efiten/core-hunter/commit/6244c0fa335ebf4d6101db063c2c67d4cf348f8c))
* **web:** gate the point layer, and say what an account opens ([#513](https://github.com/efiten/core-hunter/issues/513)) ([71856f1](https://github.com/efiten/core-hunter/commit/71856f1c42027b2eeeb5a21f53537976fb5925a3))


### Bug Fixes

* **app:** take the gate's coach marks out of #splash's stacking context ([#565](https://github.com/efiten/core-hunter/issues/565)) ([6fba59e](https://github.com/efiten/core-hunter/commit/6fba59e890971d85c6d9f269649b14183c8c23d3))

## [1.23.0](https://github.com/efiten/core-hunter/compare/app-v1.22.0...app-v1.23.0) (2026-08-29)


### Features

* **app,web,landing:** the 26 August design pass ([#541](https://github.com/efiten/core-hunter/issues/541)) ([5a04962](https://github.com/efiten/core-hunter/commit/5a049624e14191a632512091754556337ab1dd8e))

## [1.22.0](https://github.com/efiten/core-hunter/compare/app-v1.21.0...app-v1.22.0) (2026-08-29)


### Features

* **app:** remove Locate, rename its maths to geometry.js ([#540](https://github.com/efiten/core-hunter/issues/540)) ([6dd94ae](https://github.com/efiten/core-hunter/commit/6dd94ae8358ecf0d5b17904c70fccc995c0645ee))
* **app:** sweep the repeaters you can hear when no target is picked ([#484](https://github.com/efiten/core-hunter/issues/484)) ([7f2eafb](https://github.com/efiten/core-hunter/commit/7f2eafb06b75af869cdca959c616e2e0eeab1b57))

## [1.21.0](https://github.com/efiten/core-hunter/compare/app-v1.20.0...app-v1.21.0) (2026-08-28)


### Features

* **app:** name a trace reply after the node we pinged ([#483](https://github.com/efiten/core-hunter/issues/483)) ([04eded1](https://github.com/efiten/core-hunter/commit/04eded1708612b9462888e0d4925e0b4b5d285ef))
* **web:** name the picked target on the picker button ([#499](https://github.com/efiten/core-hunter/issues/499)) ([cabe596](https://github.com/efiten/core-hunter/commit/cabe5969eec5f3038ecbe3aa68d018b8af981464))

## [1.20.0](https://github.com/efiten/core-hunter/compare/app-v1.19.1...app-v1.20.0) (2026-08-26)


### Features

* **app:** search the target sheet by name or id prefix ([#477](https://github.com/efiten/core-hunter/issues/477)) ([c69c57c](https://github.com/efiten/core-hunter/commit/c69c57ca329f732e7457e4ff5b293b4ca9b851c8))
* **web,landing:** lead with mapping, and say where accounts come from ([#491](https://github.com/efiten/core-hunter/issues/491)) ([f9f326c](https://github.com/efiten/core-hunter/commit/f9f326c29ae4cf57cff0f589f30a7c82c1f1c2fa))
* **web,server:** ignore a sender from the map ([#500](https://github.com/efiten/core-hunter/issues/500)) ([1b62809](https://github.com/efiten/core-hunter/commit/1b6280983d8de66c79c836fefe1da77122b893c6))

## [1.19.1](https://github.com/efiten/core-hunter/compare/app-v1.19.0...app-v1.19.1) (2026-08-26)


### Documentation

* cut the four entries [#519](https://github.com/efiten/core-hunter/issues/519) could not reach ([#534](https://github.com/efiten/core-hunter/issues/534)) ([b47786c](https://github.com/efiten/core-hunter/commit/b47786c336b6079dcc2c24ea592ff83a86f77f4b))
* cut the release notes back to a glance ([#520](https://github.com/efiten/core-hunter/issues/520)) ([dd3d895](https://github.com/efiten/core-hunter/commit/dd3d8950bb6a8f462d43e13dd2bcf4d508216f17)), closes [#519](https://github.com/efiten/core-hunter/issues/519)

## [1.19.0](https://github.com/efiten/core-hunter/compare/app-v1.18.0...app-v1.19.0) (2026-08-26)


### Features

* **web,server:** tell a hunter when their member verification comes through ([#531](https://github.com/efiten/core-hunter/issues/531)) ([54981ca](https://github.com/efiten/core-hunter/commit/54981ca8c40788c8f63c27324308e93f23bd4a1d))

## [1.18.0](https://github.com/efiten/core-hunter/compare/app-v1.17.1...app-v1.18.0) (2026-08-26)


### Features

* **app,web,server:** filter receptions by sender-id class ([#528](https://github.com/efiten/core-hunter/issues/528)) ([f10b1ac](https://github.com/efiten/core-hunter/commit/f10b1ace28d7dc55cc80dfc051b2ff58e983aca7))

## [1.17.1](https://github.com/efiten/core-hunter/compare/app-v1.17.0...app-v1.17.1) (2026-08-26)


### Bug Fixes

* **web,app:** resolve the names in the target list, and mark the ids that cannot ([#526](https://github.com/efiten/core-hunter/issues/526)) ([9fe9067](https://github.com/efiten/core-hunter/commit/9fe906726cc7bca23cea3e8617983a7c25e9dc7b))
* **web,server:** say how far back the map reaches instead of "capped" ([#488](https://github.com/efiten/core-hunter/issues/488)) ([5a26e51](https://github.com/efiten/core-hunter/commit/5a26e51ce63675c6e9d703223806df6821850dad)), closes [#440](https://github.com/efiten/core-hunter/issues/440)

## [1.17.0](https://github.com/efiten/core-hunter/compare/app-v1.16.0...app-v1.17.0) (2026-08-25)


### Features

* **app,web:** keep the reception when the identity or the decode fails ([#478](https://github.com/efiten/core-hunter/issues/478)) ([0c2831a](https://github.com/efiten/core-hunter/commit/0c2831aa29d69be6da5e6fcb789d1977ffd93090))
* **app:** give the app the map's two reception filters ([#507](https://github.com/efiten/core-hunter/issues/507)) ([a5243b0](https://github.com/efiten/core-hunter/commit/a5243b067e2fb5995b6a6b378cb1afc1a9b39875))
* **web:** open the map on the last 30 days, not on All time ([#512](https://github.com/efiten/core-hunter/issues/512)) ([28802ac](https://github.com/efiten/core-hunter/commit/28802ac4f5892c5d3d611e295280a01cef49d533))

## [1.16.0](https://github.com/efiten/core-hunter/compare/app-v1.15.0...app-v1.16.0) (2026-08-25)


### Features

* **app:** name the 1-byte path hash instead of showing no sender ([#522](https://github.com/efiten/core-hunter/issues/522)) ([9ad8389](https://github.com/efiten/core-hunter/commit/9ad83896d94772c12dd0c0b1eebeae3e71864329))

## [1.15.0](https://github.com/efiten/core-hunter/compare/app-v1.14.0...app-v1.15.0) (2026-08-25)


### Features

* **app,web:** locate from the whole signal field, not its centre of mass ([#516](https://github.com/efiten/core-hunter/issues/516)) ([4d9a947](https://github.com/efiten/core-hunter/commit/4d9a9471418966d0e4d86a7893d5b335cb0d9e7b)), closes [#454](https://github.com/efiten/core-hunter/issues/454)
* **server,web:** give a flood with no sender something to filter on ([#497](https://github.com/efiten/core-hunter/issues/497)) ([9362217](https://github.com/efiten/core-hunter/commit/93622172c842693b69db7496c082c40b00e0295a))


### Bug Fixes

* **app:** send the receptions that are waiting, radio or no radio ([#515](https://github.com/efiten/core-hunter/issues/515)) ([15f79ff](https://github.com/efiten/core-hunter/commit/15f79ff678cd7e600363c52f0f0aa4ba1ce9f8d7)), closes [#454](https://github.com/efiten/core-hunter/issues/454)
* **server,app:** stop one reception blocking every reception behind it ([#505](https://github.com/efiten/core-hunter/issues/505)) ([c49b87a](https://github.com/efiten/core-hunter/commit/c49b87accbfd047aaa1affc6dbdbbea0ab3419d2)), closes [#454](https://github.com/efiten/core-hunter/issues/454)
* **web,app:** make the map keep up with the drive ([#514](https://github.com/efiten/core-hunter/issues/514)) ([720da82](https://github.com/efiten/core-hunter/commit/720da82fb32431b36a52840a31f2677ea84c08a8)), closes [#454](https://github.com/efiten/core-hunter/issues/454)

## [1.14.0](https://github.com/efiten/core-hunter/compare/app-v1.13.2...app-v1.14.0) (2026-08-24)


### Features

* **app:** widen the cue ladder to twelve steps, 4.5 dB apart ([#472](https://github.com/efiten/core-hunter/issues/472)) ([ff012ba](https://github.com/efiten/core-hunter/commit/ff012baed9192f03f8d63f87372bf59e39a9b047))


### Documentation

* **app:** say what a lit hex cell claims after [#455](https://github.com/efiten/core-hunter/issues/455), and drop two stale claims ([#469](https://github.com/efiten/core-hunter/issues/469)) ([3040d01](https://github.com/efiten/core-hunter/commit/3040d01186b5a117486a71727841313151c60e53))

## [1.13.2](https://github.com/efiten/core-hunter/compare/app-v1.13.1...app-v1.13.2) (2026-08-24)


### Performance Improvements

* **app:** stop rebuilding a render tick that cannot have changed ([#485](https://github.com/efiten/core-hunter/issues/485)) ([18aa6ca](https://github.com/efiten/core-hunter/commit/18aa6caaf045fff7ecfbfd61ae266070d1c6797d)), closes [#462](https://github.com/efiten/core-hunter/issues/462)

## [1.13.1](https://github.com/efiten/core-hunter/compare/app-v1.13.0...app-v1.13.1) (2026-08-23)


### Documentation

* **app,web:** write the release notes for what shipped since the backfill ([#460](https://github.com/efiten/core-hunter/issues/460)) ([ca1e31a](https://github.com/efiten/core-hunter/commit/ca1e31ae31ff1b38309f6368e5da01e68018207e))

## [1.13.0](https://github.com/efiten/core-hunter/compare/app-v1.12.0...app-v1.13.0) (2026-08-23)


### Features

* **app,web:** write release notes for readers, not from the commit log ([#435](https://github.com/efiten/core-hunter/issues/435)) ([8b70eaa](https://github.com/efiten/core-hunter/commit/8b70eaa4653d1ca5ffb15e8a874b2e1743981ae0))

## [1.12.0](https://github.com/efiten/core-hunter/compare/app-v1.11.1...app-v1.12.0) (2026-08-22)


### Features

* **app:** capture what the radio hears, not only what it can name ([#455](https://github.com/efiten/core-hunter/issues/455)) ([f7518b6](https://github.com/efiten/core-hunter/commit/f7518b6a8f658b31ee8d5459e9ebfcd2bc594677))
* **app:** give What's new its own Settings tab, and let its dot reach the HUD ([#429](https://github.com/efiten/core-hunter/issues/429)) ([bc646c3](https://github.com/efiten/core-hunter/commit/bc646c35a36b5f72ed5e99980cac2a5e2997df72)), closes [#421](https://github.com/efiten/core-hunter/issues/421)

## [1.11.1](https://github.com/efiten/core-hunter/compare/app-v1.11.0...app-v1.11.1) (2026-08-21)


### Bug Fixes

* **app:** collapse coincident receptions to one 3D pillar ([#419](https://github.com/efiten/core-hunter/issues/419)) ([f973714](https://github.com/efiten/core-hunter/commit/f973714f8ff954a88e813cc19e7456088d7fd05f))
* **app:** let the node-position key fade, so it stops sitting on the ticker ([#444](https://github.com/efiten/core-hunter/issues/444)) ([fa58db2](https://github.com/efiten/core-hunter/commit/fa58db25955802aefa3d9fbf11ff760ea613e7e2)), closes [#413](https://github.com/efiten/core-hunter/issues/413)
* **app:** stop MapLibre shading the tier colour out of the 3D bars ([#446](https://github.com/efiten/core-hunter/issues/446)) ([29e73dc](https://github.com/efiten/core-hunter/commit/29e73dc69c16333df00a2537c8bd60e5c72559c8))
* **app:** warn on a low battery when the companion does, not 260 mV later ([#443](https://github.com/efiten/core-hunter/issues/443)) ([61bd271](https://github.com/efiten/core-hunter/commit/61bd2713016fe8a5d2446cd01f7dd40d9eb758ad)), closes [#380](https://github.com/efiten/core-hunter/issues/380)


### Tests

* **app,web:** pin densityGrid's kernel, which nothing was holding ([#442](https://github.com/efiten/core-hunter/issues/442)) ([b1807dd](https://github.com/efiten/core-hunter/commit/b1807dde1ba4b70aa9997a5e64c8f77d74a95442)), closes [#370](https://github.com/efiten/core-hunter/issues/370)

## [1.11.0](https://github.com/efiten/core-hunter/compare/app-v1.10.0...app-v1.11.0) (2026-08-19)


### Features

* **app,server:** draw SF8 nodes on the position layer too ([#430](https://github.com/efiten/core-hunter/issues/430)) ([863c3ac](https://github.com/efiten/core-hunter/commit/863c3ac7f82a2e0ebe503e8ad9f005b8cdcf7b2e)), closes [#418](https://github.com/efiten/core-hunter/issues/418)

## [1.10.0](https://github.com/efiten/core-hunter/compare/app-v1.9.0...app-v1.10.0) (2026-08-19)


### Features

* **app,web:** give the website an onboarding tour, and say what a hunter is ([#379](https://github.com/efiten/core-hunter/issues/379)) ([ea7bb21](https://github.com/efiten/core-hunter/commit/ea7bb21440613c15ab34728cde7dc71db71362a6)), closes [#316](https://github.com/efiten/core-hunter/issues/316) [#371](https://github.com/efiten/core-hunter/issues/371)
* **app:** add a time-of-day sky, so near-horizontal pitch stops reading as broken ([#401](https://github.com/efiten/core-hunter/issues/401)) ([f199dec](https://github.com/efiten/core-hunter/commit/f199dec5ba5d19203e44c7f484115923f7419a72)), closes [#397](https://github.com/efiten/core-hunter/issues/397)
* **app:** raise the tilt ceiling to 85 so the camera can look along the ground ([#399](https://github.com/efiten/core-hunter/issues/399)) ([b5d1a23](https://github.com/efiten/core-hunter/commit/b5d1a232149c0158947bc8c1533ae5760a9dc97e)), closes [#333](https://github.com/efiten/core-hunter/issues/333)


### Bug Fixes

* **app:** stop the FAB progress ring lighting a segment when sound is off ([#414](https://github.com/efiten/core-hunter/issues/414)) ([77e5a1f](https://github.com/efiten/core-hunter/commit/77e5a1f5a147d317e096dee4d185a59df3722eeb)), closes [#373](https://github.com/efiten/core-hunter/issues/373)

## [1.9.0](https://github.com/efiten/core-hunter/compare/app-v1.8.0...app-v1.9.0) (2026-08-19)


### Features

* **app,web:** make the receptions ticker readable at a glance ([#404](https://github.com/efiten/core-hunter/issues/404)) ([c48a974](https://github.com/efiten/core-hunter/commit/c48a9748c5aee14b87e13e4f0374609e45546070)), closes [#322](https://github.com/efiten/core-hunter/issues/322)

## [1.8.0](https://github.com/efiten/core-hunter/compare/app-v1.7.0...app-v1.8.0) (2026-08-18)


### Features

* **app,web:** show what changed in a release behind a version badge ([#363](https://github.com/efiten/core-hunter/issues/363)) ([3a3dcf1](https://github.com/efiten/core-hunter/commit/3a3dcf128502790e5e1ecda0b3a3a0808a143752)), closes [#284](https://github.com/efiten/core-hunter/issues/284)


### Bug Fixes

* **app:** draw 3D buildings from z13, the zoom the source declares ([#400](https://github.com/efiten/core-hunter/issues/400)) ([7a727f9](https://github.com/efiten/core-hunter/commit/7a727f9aaf7a67e3a510084096643fad0d5db749)), closes [#395](https://github.com/efiten/core-hunter/issues/395)
* **app:** pan the map when a receptions-ticker row is tapped ([#392](https://github.com/efiten/core-hunter/issues/392)) ([940d03e](https://github.com/efiten/core-hunter/commit/940d03e77f9a0c39c8e3c028c81911cd019391df)), closes [#309](https://github.com/efiten/core-hunter/issues/309)


### Documentation

* make the pre-push self-review concrete, mutation-check new tests, widen §7 ([#364](https://github.com/efiten/core-hunter/issues/364)) ([e4c7051](https://github.com/efiten/core-hunter/commit/e4c7051b0f248befac8d5872e3680f672e534194)), closes [#334](https://github.com/efiten/core-hunter/issues/334)

## [1.7.0](https://github.com/efiten/core-hunter/compare/app-v1.6.0...app-v1.7.0) (2026-08-15)


### Features

* **app,web:** carry the decoder's full packet-type set in the filter chips ([#343](https://github.com/efiten/core-hunter/issues/343)) ([e924935](https://github.com/efiten/core-hunter/commit/e924935728c677241dafe369ef18508223a9c339))
* **app,web:** extend the weak end of the RSSI scale below -110 dBm ([#344](https://github.com/efiten/core-hunter/issues/344)) ([29b1015](https://github.com/efiten/core-hunter/commit/29b101542f40857b99da3d299970de2f5f7b6e85))
* **app:** refuse captures on a GPS fix too poor to place, and guard invalid fixes ([#345](https://github.com/efiten/core-hunter/issues/345)) ([ee8874f](https://github.com/efiten/core-hunter/commit/ee8874f296986bad66c7d7d73e6026979cca0ce5))
* **app:** verify advert signatures before an advert may name anything ([#362](https://github.com/efiten/core-hunter/issues/362)) ([cac64b3](https://github.com/efiten/core-hunter/commit/cac64b356a317514456bcfc6badbf6a6c13c647b))


### Bug Fixes

* **app:** guard localStorage reads so a storage-hostile context cannot blank the app ([#342](https://github.com/efiten/core-hunter/issues/342)) ([ce9d534](https://github.com/efiten/core-hunter/commit/ce9d534acd6ad081f07b3bff0073816233a5dbef))
* **app:** say so when the node-position layer has no registry data to draw ([#355](https://github.com/efiten/core-hunter/issues/355)) ([2e2f30a](https://github.com/efiten/core-hunter/commit/2e2f30a48cba25c38b45e471694e092510b1c0cf))


### Performance Improvements

* **app:** rebuild the map once per view change, not twice ([#351](https://github.com/efiten/core-hunter/issues/351)) ([f2d0546](https://github.com/efiten/core-hunter/commit/f2d0546609bb6408bc80bcc8e6a2175fbbf4cba3))

## [1.6.0](https://github.com/efiten/core-hunter/compare/app-v1.5.1...app-v1.6.0) (2026-08-08)


### Features

* **app:** companion battery, topbar consolidation and HUD sender readout ([#323](https://github.com/efiten/core-hunter/issues/323)) ([a25bf1c](https://github.com/efiten/core-hunter/commit/a25bf1c4536afee6e734e99f153f69d4d2002a48)), closes [#281](https://github.com/efiten/core-hunter/issues/281)
* **app:** merge layer FAB + 2D/3D FAB into one 5-state view cycle ([#314](https://github.com/efiten/core-hunter/issues/314)) ([9e48a38](https://github.com/efiten/core-hunter/commit/9e48a38d3e1611089ced882a64cba53d210eec61)), closes [#258](https://github.com/efiten/core-hunter/issues/258)
* **app:** park background audio and cue both transitions ([#315](https://github.com/efiten/core-hunter/issues/315)) ([14bc526](https://github.com/efiten/core-hunter/commit/14bc5267f3c14d896e2dfff08072b58c843f8342)), closes [#260](https://github.com/efiten/core-hunter/issues/260)


### Bug Fixes

* **app:** round the 3D pillar footprint to an octagon, sized as a radius ([#311](https://github.com/efiten/core-hunter/issues/311)) ([ad0560b](https://github.com/efiten/core-hunter/commit/ad0560b8f092bc8134fc4be5e0aa5d050498c8aa)), closes [#308](https://github.com/efiten/core-hunter/issues/308)
* **app:** show the node-position disclaimer as a glance, keep a permanent key ([#312](https://github.com/efiten/core-hunter/issues/312)) ([eb89280](https://github.com/efiten/core-hunter/commit/eb89280b21ca3b3785eca6ba00e30d6db8a33e49)), closes [#306](https://github.com/efiten/core-hunter/issues/306)
* **app:** truncate target chip with ellipsis, keep topbar controls visible ([#310](https://github.com/efiten/core-hunter/issues/310)) ([22233c9](https://github.com/efiten/core-hunter/commit/22233c994b30a640a55c3a809c1156d5b7683d39)), closes [#305](https://github.com/efiten/core-hunter/issues/305)

## [1.5.1](https://github.com/efiten/core-hunter/compare/app-v1.5.0...app-v1.5.1) (2026-07-29)


### Bug Fixes

* **app:** make the map popup and the target list agree on a selection ([#297](https://github.com/efiten/core-hunter/issues/297)) ([#326](https://github.com/efiten/core-hunter/issues/326)) ([8bde3bb](https://github.com/efiten/core-hunter/commit/8bde3bb40c8b7bb848d2c382730cbe692e8968cd))
* **app:** restore tier opacity and age-fade on the 3D pillars ([#302](https://github.com/efiten/core-hunter/issues/302)) ([#328](https://github.com/efiten/core-hunter/issues/328)) ([74d6a1f](https://github.com/efiten/core-hunter/commit/74d6a1f15dade491d3a198018f39ca55bf894d95))
* refuse ambiguous prefixes and consult sender_kind on both sides ([#295](https://github.com/efiten/core-hunter/issues/295), [#296](https://github.com/efiten/core-hunter/issues/296)) ([#325](https://github.com/efiten/core-hunter/issues/325)) ([55a026f](https://github.com/efiten/core-hunter/commit/55a026fbc1bf8c213ce76d582620d596cd343f9b))


### Continuous Integration

* add an eslint no-undef pass over app, web and nameresolver ([#303](https://github.com/efiten/core-hunter/issues/303)) ([#324](https://github.com/efiten/core-hunter/issues/324)) ([0eafdca](https://github.com/efiten/core-hunter/commit/0eafdca066e9728457d1da400c405fd4198f4f00))

## [1.5.0](https://github.com/efiten/core-hunter/compare/app-v1.4.0...app-v1.5.0) (2026-07-27)


### Features

* **app:** render points in 3D mode as raised pillar markers ([#250](https://github.com/efiten/core-hunter/issues/250)) ([#266](https://github.com/efiten/core-hunter/issues/266)) ([5d21696](https://github.com/efiten/core-hunter/commit/5d216961ace8e38b0859f8ef9c27654eb04a6207))
* **app:** sound modes — rx/tx cues + generative ambient music ([#145](https://github.com/efiten/core-hunter/issues/145)) ([#261](https://github.com/efiten/core-hunter/issues/261)) ([c72022e](https://github.com/efiten/core-hunter/commit/c72022e3053dafd47c7d7d87694af5c05714e189))
* node-position layer — advertised positions vs. the RSSI estimate (app + web) ([#272](https://github.com/efiten/core-hunter/issues/272)) ([0c21df5](https://github.com/efiten/core-hunter/commit/0c21df553776034c9b461678d6ca16156d99f44f))


### Bug Fixes

* **app:** bound queue reads, persist the publish watermark, add 7-day retention ([#230](https://github.com/efiten/core-hunter/issues/230)) ([#283](https://github.com/efiten/core-hunter/issues/283)) ([c1c92fc](https://github.com/efiten/core-hunter/commit/c1c92fc49f88a1a87a6c17a6885965a00180d922))
* **app:** merge target-list rows for the same node across id prefixes ([#268](https://github.com/efiten/core-hunter/issues/268)) ([91e63c6](https://github.com/efiten/core-hunter/commit/91e63c64cbc7433e1828f31795c0ed8e83d8e166))

## [1.4.0](https://github.com/efiten/core-hunter/compare/app-v1.3.1...app-v1.4.0) (2026-07-26)


### Features

* **app:** segmented progress ring for multi-state FABs ([#259](https://github.com/efiten/core-hunter/issues/259)) ([#265](https://github.com/efiten/core-hunter/issues/265)) ([fe22c49](https://github.com/efiten/core-hunter/commit/fe22c496801a5aa31792f7fcd625447f34e16253))


### Bug Fixes

* **app:** move the FAB stack down toward the thumb zone ([#257](https://github.com/efiten/core-hunter/issues/257)) ([#264](https://github.com/efiten/core-hunter/issues/264)) ([852a9bd](https://github.com/efiten/core-hunter/commit/852a9bd9fb415ebb664b6d5f31c6735840c22663))
* **app:** stop auto-ping's discover broadcast and first trace-ping colliding ([#253](https://github.com/efiten/core-hunter/issues/253), [#254](https://github.com/efiten/core-hunter/issues/254)) ([#262](https://github.com/efiten/core-hunter/issues/262)) ([428f57c](https://github.com/efiten/core-hunter/commit/428f57c8aa0e5686c931d0ea6971ca1fae17b518))

## [1.3.1](https://github.com/efiten/core-hunter/compare/app-v1.3.0...app-v1.3.1) (2026-07-13)


### Bug Fixes

* **app:** stop the blank map and 3D freeze; drop terrain from 3D ([#147](https://github.com/efiten/core-hunter/issues/147)) ([#247](https://github.com/efiten/core-hunter/issues/247)) ([0bc7a25](https://github.com/efiten/core-hunter/commit/0bc7a25e678bb649901bec446ab6894f64c1f225))

## [1.3.0](https://github.com/efiten/core-hunter/compare/app-v1.2.0...app-v1.3.0) (2026-07-13)


### Features

* **app:** 3D mode — 2D/3D FAB, extruded hex bars, buildings, terrain ([#147](https://github.com/efiten/core-hunter/issues/147)) ([#228](https://github.com/efiten/core-hunter/issues/228)) ([75fb92e](https://github.com/efiten/core-hunter/commit/75fb92e3134145ec01dc7801f251838ef5d6d089))
* **app:** auto-discover toggle with pulse feedback and repeater trace-ping ([#241](https://github.com/efiten/core-hunter/issues/241)) ([83dea99](https://github.com/efiten/core-hunter/commit/83dea99805738f4fc46cd65df9fbce8f95f80ccf))
* **app:** GPS course as a third compass-mode heading source (driving mode) ([#245](https://github.com/efiten/core-hunter/issues/245)) ([6c09b26](https://github.com/efiten/core-hunter/commit/6c09b2617fb7824fa11b92037f867f2104f1e0e0))


### Bug Fixes

* **app,web:** locate disclaimer, glossary, and copy parity ([#174](https://github.com/efiten/core-hunter/issues/174)) ([#227](https://github.com/efiten/core-hunter/issues/227)) ([41e1456](https://github.com/efiten/core-hunter/commit/41e1456eaf886350f534c91f7c0eb174010a4f14))
* **app:** clarify login/register submit action, keep it above the keyboard ([#239](https://github.com/efiten/core-hunter/issues/239)) ([0255490](https://github.com/efiten/core-hunter/commit/0255490ac8863903ea4bac6e17d08b863dec60f1))
* **app:** lighter help-overlay backdrop, click-outside dismiss, splash tagline, anchored tooltips ([#220](https://github.com/efiten/core-hunter/issues/220)) ([addd30a](https://github.com/efiten/core-hunter/commit/addd30aa15ff1971759abcdcc7c671f1c6ea652c)), closes [#216](https://github.com/efiten/core-hunter/issues/216)
* **app:** stop follow-mode recenter from cancelling an active pinch-zoom ([#243](https://github.com/efiten/core-hunter/issues/243)) ([d92cd28](https://github.com/efiten/core-hunter/commit/d92cd2803b67790e55b91746325ee86b374940fe))
* **app:** two-line target rows to fix id/RSSI overlap and improve name legibility ([#219](https://github.com/efiten/core-hunter/issues/219)) ([d800486](https://github.com/efiten/core-hunter/commit/d80048641f894ac0409a295d68799c37ce194d21)), closes [#215](https://github.com/efiten/core-hunter/issues/215)


### Styles

* **app:** standardize glossary and copy wording ([#174](https://github.com/efiten/core-hunter/issues/174)) ([#226](https://github.com/efiten/core-hunter/issues/226)) ([8c57469](https://github.com/efiten/core-hunter/commit/8c57469f7bc402bb8330d2a3300c28e4a919a793))

## [1.2.0](https://github.com/efiten/core-hunter/compare/app-v1.1.1...app-v1.2.0) (2026-07-11)


### Features

* **app:** Mesh-Hunter onboarding splash + display-name rename ([#202](https://github.com/efiten/core-hunter/issues/202)) ([c1d75c1](https://github.com/efiten/core-hunter/commit/c1d75c19ae85b32d0ded6aff687a0878864aaa9e))
* **app:** migrate the map to MapLibre GL — 2D parity ([#147](https://github.com/efiten/core-hunter/issues/147) phase 1) ([#214](https://github.com/efiten/core-hunter/issues/214)) ([cb05ab3](https://github.com/efiten/core-hunter/commit/cb05ab3dd7c929d87415037608a529516d597693))
* **app:** multi-select targets + byte-prefix in the target list ([#206](https://github.com/efiten/core-hunter/issues/206)) ([742252a](https://github.com/efiten/core-hunter/commit/742252acd99f4006225c0548afc096ee2ba1f7a0))
* **app:** new Mesh-Hunter app icon (hex · reticle · thermal signal) ([#205](https://github.com/efiten/core-hunter/issues/205)) ([1f23045](https://github.com/efiten/core-hunter/commit/1f23045e194070fc5beaf69f94f769b8f95719c5))
* **app:** settings as a full page with Settings / About tabs ([#207](https://github.com/efiten/core-hunter/issues/207)) ([76f549d](https://github.com/efiten/core-hunter/commit/76f549d7dc8036f782cc06b57831d85816244058))

## [1.1.1](https://github.com/efiten/core-hunter/compare/app-v1.1.0...app-v1.1.1) (2026-07-04)


### Bug Fixes

* **web:** only load Matomo on production hosts (not localhost/CI) ([1c70a7a](https://github.com/efiten/core-hunter/commit/1c70a7a85145bc688c2e21dc27d19dd457cb8294))


### Miscellaneous Chores

* add cookieless Matomo analytics to landing/map/app ([9b06bad](https://github.com/efiten/core-hunter/commit/9b06bad91e7fa8f3ce3de16f14c4dd04b23d6e36))

## [1.1.0](https://github.com/efiten/core-hunter/compare/app-v1.0.0...app-v1.1.0) (2026-07-04)


### Features

* **app:** compass FAB icon previews the next state, not the current one ([63f6671](https://github.com/efiten/core-hunter/commit/63f6671b37045c223b498d71cf6fece916f6a84b))
* **app:** draw the hunter's own session route trail on the map ([cd8f0e3](https://github.com/efiten/core-hunter/commit/cd8f0e3eb3b7e73a4eceda9b81ef64888518c82c))
* **app:** topbar redesign — Select-target chip, filter dropdown, locate over the filtered set ([#128](https://github.com/efiten/core-hunter/issues/128)) ([5f62978](https://github.com/efiten/core-hunter/commit/5f62978db5b71984f3a90d0a2f64673868dceec0))

## [1.0.0](https://github.com/efiten/core-hunter/compare/app-v0.14.1...app-v1.0.0) (2026-07-04)


### Features

* **app:** in-app register/login and companion linking (v1.0) ([00514a9](https://github.com/efiten/core-hunter/commit/00514a9314d6a21c7bae4ad92631483c63821396))

## [0.14.1](https://github.com/efiten/core-hunter/compare/app-v0.14.0...app-v0.14.1) (2026-07-03)


### Bug Fixes

* **app:** correct leaflet-rotate's renderer zoom transform to stop drift ([#168](https://github.com/efiten/core-hunter/issues/168)) ([a0f6093](https://github.com/efiten/core-hunter/commit/a0f6093e6d38f98dc8fa1e4b223462c6ef947405))

## [0.14.0](https://github.com/efiten/core-hunter/compare/app-v0.13.0...app-v0.14.0) (2026-07-02)


### Features

* **app:** fade reception points with age instead of hard-vanishing ([#164](https://github.com/efiten/core-hunter/issues/164)) ([cf9a62b](https://github.com/efiten/core-hunter/commit/cf9a62b3996384f0ff38acf011b5fef7e46ad54f))
* **app:** make the Messages-panel ignore button a toggle ([#165](https://github.com/efiten/core-hunter/issues/165)) ([228ce93](https://github.com/efiten/core-hunter/commit/228ce93912283be5745f7920f434cae0b49b7dd4))


### Bug Fixes

* **app:** show discover responses in the Messages panel ([#166](https://github.com/efiten/core-hunter/issues/166)) ([2e8c2c7](https://github.com/efiten/core-hunter/commit/2e8c2c707ad8078c3e817a952cca63b486c14992))

## [0.13.0](https://github.com/efiten/core-hunter/compare/app-v0.12.0...app-v0.13.0) (2026-07-02)


### Features

* **app:** Settings reload button with deploy version check ([#162](https://github.com/efiten/core-hunter/issues/162)) ([0b4702e](https://github.com/efiten/core-hunter/commit/0b4702e3e1bf7c1991a15e81046a5f45b2682896))

## [0.12.0](https://github.com/efiten/core-hunter/compare/app-v0.11.0...app-v0.12.0) (2026-07-02)


### Features

* **app:** auto-fade the locate-info box after 2s ([#127](https://github.com/efiten/core-hunter/issues/127)) ([3f887d1](https://github.com/efiten/core-hunter/commit/3f887d1351bf5ad38018cc3a5ecf5ed72d3a36ec))
* **app:** distinct icon for the combined points+hex layer mode ([#126](https://github.com/efiten/core-hunter/issues/126)) ([07092f9](https://github.com/efiten/core-hunter/commit/07092f92d23348d4e9957873d25d970c3204069f))
* **app:** focus the existing PWA instance instead of relaunching ([#153](https://github.com/efiten/core-hunter/issues/153)) ([bba418a](https://github.com/efiten/core-hunter/commit/bba418a43c83e14a78a8370aed4094312ddabd95))
* **app:** manual pause/resume for the MQTT connection ([#121](https://github.com/efiten/core-hunter/issues/121)) ([496406c](https://github.com/efiten/core-hunter/commit/496406c81766b58f725e87a146c4c40d1f57968e))
* **app:** mark individual non-default settings within the sheets ([#110](https://github.com/efiten/core-hunter/issues/110)) ([a2f1dfa](https://github.com/efiten/core-hunter/commit/a2f1dfab790889d01886439c8524dc25cee5d9de))
* **app:** mark the selected target active in the target list ([#108](https://github.com/efiten/core-hunter/issues/108)) ([208920a](https://github.com/efiten/core-hunter/commit/208920ac75eefb77d5175942cf2d9c7b122be972))
* **app:** real map rotation on device heading + two-finger rotate gesture ([#151](https://github.com/efiten/core-hunter/issues/151)) ([033033b](https://github.com/efiten/core-hunter/commit/033033bb657891a83155ae414a59556af818fe1d))
* **app:** replace settings-btn emoji with an inline SVG gear icon ([#113](https://github.com/efiten/core-hunter/issues/113)) ([3e4c241](https://github.com/efiten/core-hunter/commit/3e4c2414a24bbe36a6acd6fab2e5eb66460e1bb5))
* **app:** show splash disclaimer + tips on every visible screen ([#123](https://github.com/efiten/core-hunter/issues/123)) ([21d8bc6](https://github.com/efiten/core-hunter/commit/21d8bc6c818f1c2634fb7a02a476e893d851c94c))
* **app:** tap outside filter/settings/target sheets to close ([#111](https://github.com/efiten/core-hunter/issues/111)) ([b6dbb3f](https://github.com/efiten/core-hunter/commit/b6dbb3f5ad111706a0f204c58f3f00915c63acb6))
* **app:** toggle FAB for the single-hunter locate overlay ([#120](https://github.com/efiten/core-hunter/issues/120)) ([aa95e7d](https://github.com/efiten/core-hunter/commit/aa95e7d38ec1dd8f7f853555ac56d74891533b09))


### Bug Fixes

* **app:** direct-only filter must check hops === 0, not is_direct ([#150](https://github.com/efiten/core-hunter/issues/150)) ([66301e1](https://github.com/efiten/core-hunter/commit/66301e1825c381331a4a13ec1d7bed4c005bff19))
* **app:** disable pull-to-refresh (breaks active BLE/MQTT connection) ([#133](https://github.com/efiten/core-hunter/issues/133)) ([6adb347](https://github.com/efiten/core-hunter/commit/6adb347b9b96ccaee29f7991449ff08be7e621bd))
* **app:** ignore-sender updates the map immediately ([#112](https://github.com/efiten/core-hunter/issues/112)) ([355e809](https://github.com/efiten/core-hunter/commit/355e809945b6db980198096a7b51df3ed07edfdb))
* **app:** raise map maxZoom from 19 to 20 ([#107](https://github.com/efiten/core-hunter/issues/107)) ([475ab1b](https://github.com/efiten/core-hunter/commit/475ab1bb03462a06795515b3645411995fc1fd8b))
* **app:** render points above the hex layer in 'both' mode ([#125](https://github.com/efiten/core-hunter/issues/125)) ([963871d](https://github.com/efiten/core-hunter/commit/963871d8147bf3fb2459ca1b55f06834a8c185b0))
* **app:** resolve relayed-advert prefixes to repeater names ([#137](https://github.com/efiten/core-hunter/issues/137)) ([6a5037a](https://github.com/efiten/core-hunter/commit/6a5037abd8bbbc52fa49db872cd8d9a37a0ff705)), closes [#136](https://github.com/efiten/core-hunter/issues/136)
* **app:** Settings connect/disconnect button stays disabled after connecting ([#124](https://github.com/efiten/core-hunter/issues/124)) ([986a275](https://github.com/efiten/core-hunter/commit/986a275fb5760f76db1e32e62dc9e972d9a0ac40))


### Documentation

* **app:** document required publish-only broker ACL ([#154](https://github.com/efiten/core-hunter/issues/154)) ([f80459a](https://github.com/efiten/core-hunter/commit/f80459a24cf42fa09ea502480ca3f85c8b400e4a))


### Miscellaneous Chores

* **app:** remove the Manual position (dev) debug feature ([#122](https://github.com/efiten/core-hunter/issues/122)) ([5e43aa7](https://github.com/efiten/core-hunter/commit/5e43aa753636aff6d1a1896d6a7435e5dd2644d7))

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
