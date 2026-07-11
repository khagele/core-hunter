import { describe, it, expect } from 'vitest'
import { resolveState, snapshotToQuery, persistableState } from './urlstate.js'

describe('resolveState', () => {
  const keys = ['theme', 'mode', 'sender']

  it('takes the URL value when present (a shared link wins over the stored value)', () => {
    const stored = { theme: 'dark', mode: 'points' }
    const url = new URLSearchParams('theme=light&mode=hex')
    expect(resolveState(keys, stored, url)).toEqual({ theme: 'light', mode: 'hex' })
  })

  it('falls back to the stored value when the URL omits the key', () => {
    const stored = { theme: 'light', sender: 'ab12' }
    const url = new URLSearchParams('mode=both')
    expect(resolveState(keys, stored, url)).toEqual({ theme: 'light', mode: 'both', sender: 'ab12' })
  })

  it('omits keys absent from both sources', () => {
    expect(resolveState(keys, {}, new URLSearchParams(''))).toEqual({})
  })

  it('drops empty-string values from either source', () => {
    const stored = { sender: '' }
    const url = new URLSearchParams('theme=')
    expect(resolveState(keys, stored, url)).toEqual({})
  })

  it('lets an empty URL value fall through to a non-empty stored value', () => {
    const stored = { theme: 'light' }
    const url = new URLSearchParams('theme=')
    expect(resolveState(keys, stored, url)).toEqual({ theme: 'light' })
  })

  it('ignores the stored value for a urlOnly key when the URL omits it (#217)', () => {
    const stored = { theme: 'light', sender: 'ab12' }
    const url = new URLSearchParams('')
    expect(resolveState(keys, stored, url, ['sender'])).toEqual({ theme: 'light' })
  })

  it('still takes the URL value for a urlOnly key when present (#217)', () => {
    const stored = { sender: 'ab12' }
    const url = new URLSearchParams('sender=cd34')
    expect(resolveState(keys, stored, url, ['sender'])).toEqual({ sender: 'cd34' })
  })
})

describe('snapshotToQuery', () => {
  it('serializes a state object to a query string', () => {
    expect(snapshotToQuery({ theme: 'light', z: '14' })).toBe('theme=light&z=14')
  })

  it('drops null/undefined/empty values', () => {
    expect(snapshotToQuery({ theme: 'light', sender: '', mode: null, z: undefined })).toBe('theme=light')
  })

  it('is empty for an empty snapshot', () => {
    expect(snapshotToQuery({})).toBe('')
  })

  it('url-encodes values (e.g. ISO timestamps with colons)', () => {
    expect(snapshotToQuery({ from: '2026-07-02T00:00' })).toBe('from=2026-07-02T00%3A00')
  })
})

describe('persistableState', () => {
  it('drops urlOnly keys, keeping everything else (#217)', () => {
    expect(persistableState({ theme: 'light', from: '2026-07-11T00:00', to: '2026-07-11T23:59' }, ['from', 'to']))
      .toEqual({ theme: 'light' })
  })

  it('is a no-op when no keys are urlOnly', () => {
    expect(persistableState({ theme: 'light', mode: 'hex' }, [])).toEqual({ theme: 'light', mode: 'hex' })
  })
})
