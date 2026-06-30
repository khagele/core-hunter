// Same-origin in production (nginx serves /api). Empty base = relative.
export const API_BASE = ''

// CoreScope node-name resolver (prefix -> {name, ambiguous}). Cross-origin via
// the same CORS proxy the scanner app uses. Empty string disables name lookup.
export const RESOLVE_URL = 'https://corsproxy.on8ar.eu/cs/api/nodes/resolve'
