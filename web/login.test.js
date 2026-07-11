import { describe, it, expect } from 'vitest'
import { loginErrorMessage } from './login.js'

describe('loginErrorMessage', () => {
  it('names wrong credentials for 401, matching the app', () => {
    expect(loginErrorMessage(401)).toBe('Wrong username or password.')
  })
  it('names a disabled account for 403, matching the app', () => {
    expect(loginErrorMessage(403)).toBe('This account is disabled.')
  })
  it('names rate-limiting for 429, matching the app', () => {
    expect(loginErrorMessage(429)).toBe('Too many attempts — wait a minute.')
  })
  it('falls back to a generic connection message for any other status (including 0 for network failure)', () => {
    expect(loginErrorMessage(500)).toBe('Login failed — check your connection.')
    expect(loginErrorMessage(0)).toBe('Login failed — check your connection.')
  })
})
