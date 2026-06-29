import { describe, it, expect } from 'vitest'
import { normalizeConfig } from '../config.js'

const BASE = { mqttUrl: 'mqtt://test' }

describe('normalizeConfig — resolvers array', () => {
  it('keeps a valid resolvers array, filtering entries without a string url', () => {
    const raw = {
      ...BASE,
      resolvers: [
        { label: 'BE', sf: 8, url: 'https://be.example.com/resolve' },
        { label: 'NL', sf: 7, url: 'https://nl.example.com/resolve' },
        { sf: 8 }, // no url — should be filtered out
        { url: 42 }, // url not a string — filtered
      ],
    }
    const c = normalizeConfig(raw)
    expect(c.resolvers).toHaveLength(2)
    expect(c.resolvers[0]).toEqual({ label: 'BE', sf: 8, url: 'https://be.example.com/resolve' })
    expect(c.resolvers[1]).toEqual({ label: 'NL', sf: 7, url: 'https://nl.example.com/resolve' })
  })

  it('back-compat: synthesizes a one-element resolvers from resolveUrl when no resolvers array', () => {
    const raw = { ...BASE, resolveUrl: 'https://legacy.example.com/resolve' }
    const c = normalizeConfig(raw)
    expect(c.resolvers).toHaveLength(1)
    expect(c.resolvers[0]).toEqual({ url: 'https://legacy.example.com/resolve' })
    // resolveUrl is still present on config
    expect(c.resolveUrl).toBe('https://legacy.example.com/resolve')
  })

  it('yields resolvers:[] when neither resolvers nor resolveUrl is present', () => {
    const c = normalizeConfig(BASE)
    expect(c.resolvers).toEqual([])
  })

  it('yields resolvers:[] when resolvers is present but all entries lack a string url', () => {
    const raw = { ...BASE, resolvers: [{ sf: 8 }, { label: 'X' }] }
    const c = normalizeConfig(raw)
    expect(c.resolvers).toEqual([])
  })
})
