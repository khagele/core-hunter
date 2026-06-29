import { describe, it, expect } from 'vitest'
import { orderResolvers } from '../names.js'

const R_SF8 = { label: 'BE', sf: 8, url: 'https://be.example.com/resolve' }
const R_SF7 = { label: 'NL', sf: 7, url: 'https://nl.example.com/resolve' }
const resolvers = [R_SF8, R_SF7]

describe('orderResolvers — pure ordering helper', () => {
  it('puts the matching-SF resolver first when companionSf matches one', () => {
    const ordered = orderResolvers(resolvers, 7)
    expect(ordered[0]).toBe(R_SF7)
    expect(ordered[1]).toBe(R_SF8)
  })

  it('keeps config order when companionSf is undefined (firmware-gated, unknown)', () => {
    const ordered = orderResolvers(resolvers, undefined)
    expect(ordered[0]).toBe(R_SF8)
    expect(ordered[1]).toBe(R_SF7)
  })

  it('keeps config order when companionSf has no matching resolver', () => {
    const ordered = orderResolvers(resolvers, 9)
    expect(ordered[0]).toBe(R_SF8)
    expect(ordered[1]).toBe(R_SF7)
  })

  it('preserves relative order among multiple matching-SF resolvers', () => {
    const r1 = { sf: 7, url: 'https://a.example.com/resolve' }
    const r2 = { sf: 8, url: 'https://b.example.com/resolve' }
    const r3 = { sf: 7, url: 'https://c.example.com/resolve' }
    const ordered = orderResolvers([r1, r2, r3], 7)
    expect(ordered[0]).toBe(r1)
    expect(ordered[1]).toBe(r3)
    expect(ordered[2]).toBe(r2)
  })

  it('returns a new array (does not mutate input)', () => {
    const ordered = orderResolvers(resolvers, 7)
    expect(ordered).not.toBe(resolvers)
    expect(resolvers[0]).toBe(R_SF8) // original unchanged
  })
})
