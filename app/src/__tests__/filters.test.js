import { describe, it, expect } from 'vitest'
import { makeFilter } from '../filters.js'

const rec = (o) => ({ sender_key: 'aabb', packet_type: 'channel-msg', is_direct: true,
  rx_at: '2026-06-29T10:00:00Z', ...o })
const now = Date.parse('2026-06-29T10:05:00Z')

describe('makeFilter', () => {
  it('isolates a sender by prefix (1-byte matches full key)', () => {
    const f = makeFilter({ sender: { key: 'aa', keylen: 1 }, types: null, windowMs: null, directOnly: false })
    expect(f(rec(), now)).toBe(true)
    expect(f(rec({ sender_key: 'ccdd' }), now)).toBe(false)
    expect(f(rec({ sender_key: null }), now)).toBe(false)
  })
  it('directOnly drops relayed', () => {
    const f = makeFilter({ sender: null, types: null, windowMs: null, directOnly: true })
    expect(f(rec({ is_direct: false }), now)).toBe(false)
    expect(f(rec({ is_direct: true }), now)).toBe(true)
  })
  it('time window drops stale points', () => {
    const f = makeFilter({ sender: null, types: null, windowMs: 10 * 60 * 1000, directOnly: false })
    expect(f(rec({ rx_at: '2026-06-29T09:50:00Z' }), now)).toBe(false)
    expect(f(rec({ rx_at: '2026-06-29T10:01:00Z' }), now)).toBe(true)
  })
  it('type filter keeps only selected types', () => {
    const f = makeFilter({ sender: null, types: new Set(['advert']), windowMs: null, directOnly: false })
    expect(f(rec({ packet_type: 'advert' }), now)).toBe(true)
    expect(f(rec({ packet_type: 'channel-msg' }), now)).toBe(false)
  })
  it('ignore set excludes matching sender_key (case-insensitive)', () => {
    const f = makeFilter({ ignore: new Set(['aabbccdd']), sender: null, types: null, windowMs: null, directOnly: false })
    // Uppercase key is lowercased before matching → excluded
    expect(f(rec({ sender_key: 'AABBCCDD' }), now)).toBe(false)
    // Different key → kept
    expect(f(rec({ sender_key: 'eeff0011' }), now)).toBe(true)
    // sender_key null → never excluded by ignore filter
    expect(f(rec({ sender_key: null }), now)).toBe(true)
  })
  it('null/absent ignore set ignores nothing', () => {
    const f = makeFilter({ sender: null, types: null, windowMs: null, directOnly: false })
    expect(f(rec({ sender_key: 'aabbccdd' }), now)).toBe(true)
  })
})
