import { readFileSync } from 'node:fs'
const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))
export default {
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: { alias: { chalk: '/src/empty.js', commander: '/src/empty.js' } },
}
