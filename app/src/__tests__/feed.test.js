import { describe, it, expect } from 'vitest'
import { feedItems, relTime, senderList, topSenders } from '../feed.js'

const rec = (o) => ({ sender_kind: 'channel_name', sender_id: 'Spammer', rx_at: '2026-06-29T10:00:00Z', ...o })

describe('feedItems', () => {
  it('keeps only channel_name + advert_pubkey kinds', () => {
    const out = feedItems([
      rec({ sender_kind: 'channel_name', sender_id: 'A' }),
      rec({ sender_kind: 'advert_pubkey', sender_id: 'B' }),
      rec({ sender_kind: 'direct_hash', sender_id: 'C' }),
      rec({ sender_kind: null, sender_id: null }),
    ], {})
    expect(out.map((r) => r.sender_id)).toEqual(['A', 'B'])
  })
  it('drops ignored sender ids (case-insensitive)', () => {
    const out = feedItems([rec({ sender_id: 'AA' }), rec({ sender_id: 'bb' })], { ignore: new Set(['aa']) })
    expect(out.map((r) => r.sender_id)).toEqual(['bb'])
  })
  it('sorts newest-first and respects limit', () => {
    const out = feedItems([
      rec({ sender_id: 'old', rx_at: '2026-06-29T10:00:00Z' }),
      rec({ sender_id: 'new', rx_at: '2026-06-29T10:05:00Z' }),
      rec({ sender_id: 'mid', rx_at: '2026-06-29T10:02:00Z' }),
    ], { limit: 2 })
    expect(out.map((r) => r.sender_id)).toEqual(['new', 'mid'])
  })
})

describe('senderList', () => {
  it('keeps only channel_name + advert_pubkey kinds', () => {
    const out = senderList([
      rec({ sender_kind: 'channel_name', sender_id: 'A' }),
      rec({ sender_kind: 'advert_pubkey', sender_id: 'B' }),
      rec({ sender_kind: 'direct_hash', sender_id: 'C' }),
      rec({ sender_kind: null, sender_id: null }),
    ], {})
    expect(out.map((r) => r.sender_id)).toEqual(['A', 'B'])
  })
  it('drops ignored sender ids (case-insensitive)', () => {
    const out = senderList([rec({ sender_id: 'AA' }), rec({ sender_id: 'bb' })], { ignore: new Set(['aa']) })
    expect(out.map((r) => r.sender_id)).toEqual(['bb'])
  })
  it('dedupes per sender, keeping the most recent reception', () => {
    const out = senderList([
      rec({ sender_id: 'A', rssi: -90, rx_at: '2026-06-29T10:00:00Z' }),
      rec({ sender_id: 'A', rssi: -60, rx_at: '2026-06-29T10:05:00Z' }),
    ], {})
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ rssi: -60, rx_at: '2026-06-29T10:05:00Z' })
  })
  it('sorts by resolved label (falling back to sender_id), case-insensitively', () => {
    const out = senderList([
      rec({ sender_id: 'charlie' }),
      rec({ sender_id: 'bravo', sender_label: 'Alpha' }),
      rec({ sender_id: 'delta', sender_label: 'bravo-label' }),
    ], {})
    expect(out.map((r) => r.sender_id)).toEqual(['bravo', 'delta', 'charlie'])
  })
  it('respects limit for lazy-loaded batches, without affecting the sort order', () => {
    const out = senderList([
      rec({ sender_id: 'alpha' }),
      rec({ sender_id: 'bravo' }),
      rec({ sender_id: 'charlie' }),
    ], { limit: 2 })
    expect(out.map((r) => r.sender_id)).toEqual(['alpha', 'bravo'])
  })
})

describe('topSenders', () => {
  const now = Date.parse('2026-06-29T10:05:00Z')

  it('ranks by combined recency+RSSI score (rssi - ageSeconds/30) and respects count', () => {
    const out = topSenders([
      rec({ sender_id: 'fresh-weak', rssi: -90, rx_at: '2026-06-29T10:05:00Z' }),   // score -90
      rec({ sender_id: 'strong-stale', rssi: -60, rx_at: '2026-06-29T10:00:00Z' }), // age 300s -> -60-10=-70
      rec({ sender_id: 'strong-fresh', rssi: -60, rx_at: '2026-06-29T10:05:00Z' }), // score -60
      rec({ sender_id: 'mid', rssi: -75, rx_at: '2026-06-29T10:04:30Z' }),          // age 30s -> -75-1=-76
    ], { count: 3, nowMs: now })
    expect(out.map((r) => r.sender_id)).toEqual(['strong-fresh', 'strong-stale', 'mid'])
  })
  it('dedupes per sender and drops ignored ids like senderList', () => {
    const out = topSenders([
      rec({ sender_id: 'A', rssi: -90, rx_at: '2026-06-29T10:00:00Z' }),
      rec({ sender_id: 'A', rssi: -60, rx_at: '2026-06-29T10:05:00Z' }),
      rec({ sender_id: 'B', rssi: -50, rx_at: '2026-06-29T10:05:00Z' }),
    ], { ignore: new Set(['b']), count: 3, nowMs: now })
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ sender_id: 'A', rssi: -60 })
  })
})

describe('relTime', () => {
  const now = Date.parse('2026-06-29T10:05:00Z')
  it('formats s/m/h', () => {
    expect(relTime('2026-06-29T10:04:30Z', now)).toBe('30s')
    expect(relTime('2026-06-29T10:02:00Z', now)).toBe('3m')
    expect(relTime('2026-06-29T08:05:00Z', now)).toBe('2h')
  })
  it('returns — for missing or unparseable rxAt', () => {
    expect(relTime(null, now)).toBe('—')
    expect(relTime(undefined, now)).toBe('—')
    expect(relTime('not-a-date', now)).toBe('—')
  })
})
