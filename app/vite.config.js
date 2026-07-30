import { readFileSync } from 'node:fs'
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
export default {
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  // Vite 5.4+ rejects requests whose Host header it doesn't recognise (a
  // DNS-rebinding guard). Tunnels used to get the dev server onto a phone —
  // when the LAN route is blocked by AP client isolation — arrive under their
  // own hostname and are refused without this. Scoped to the tunnel providers
  // rather than `true`, which would disable the check for any host.
  server: {
    allowedHosts: ['.loca.lt', '.trycloudflare.com', '.ngrok-free.app', '.ngrok.io'],
  },
  resolve: { alias: { chalk: '/src/empty.js', commander: '/src/empty.js' } },
  // Emit /version.json (served no-cache, see nginx.conf) so a running instance
  // can spot a newer deploy and offer a reload — see update.js / the Settings
  // reload button.
  plugins: [{
    name: 'emit-version-json',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: pkg.version }) })
    },
  }],
}
