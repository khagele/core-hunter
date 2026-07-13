import { API_BASE } from './config.js'
import { fetchMe } from './auth.js'

const $ = (id) => document.getElementById(id)

// Status-code parity with the app's login error handling (auth.js/app.js) so
// the same failure reads the same way on both surfaces (#174).
export function loginErrorMessage(status) {
  if (status === 401) return 'Wrong username or password.'
  if (status === 403) return 'This account is disabled.'
  if (status === 429) return 'Too many attempts — wait a minute.'
  return 'Login failed — check your connection.'
}

async function doLogin() {
  const err = $('login-error')
  err.hidden = true
  const body = {
    username: $('login-user').value,
    password: $('login-pass').value,
    remember: $('login-remember').checked,
  }
  let status
  try {
    const r = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (r.ok) return await r.json()
    status = r.status
  } catch (_) {
    status = 0
  }
  err.textContent = loginErrorMessage(status)
  err.hidden = false
  return null
}

async function doLogout() {
  await fetch(`${API_BASE}/api/auth/logout`, { method: 'POST', credentials: 'same-origin' })
}

export async function initAuthBar(onChange) {
  const btn = $('auth-btn')
  const modal = $('login-modal')
  let me = await fetchMe()
  const render = () => {
    btn.textContent = me.username ? me.username : 'Log in'
  }
  render()
  onChange(me)

  btn.addEventListener('click', async () => {
    if (me.username) {
      await doLogout()
      me = await fetchMe()
      render(); onChange(me)
    } else {
      modal.hidden = false
      $('login-user').focus()
    }
  })
  $('login-cancel').addEventListener('click', () => { modal.hidden = true })
  $('login-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const res = await doLogin()
    if (!res) return
    modal.hidden = true
    me = await fetchMe()
    render(); onChange(me)
  })
}
