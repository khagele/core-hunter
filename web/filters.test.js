import { describe, it, expect } from 'vitest'
import { hunterOptionLabel, packetTypeLabel } from './filters.js'

describe('hunterOptionLabel', () => {
  it('uses the pseudonym name for guests', () => {
    expect(hunterOptionLabel({ hunter_pubkey: 'h3', hunter_name: 'Hunter 3', count: 42 }))
      .toBe('Hunter 3 (42)')
  })
  it('falls back to a pubkey prefix when unnamed', () => {
    expect(hunterOptionLabel({ hunter_pubkey: 'abcdef0123456789', hunter_name: '', count: 5 }))
      .toBe('abcdef01 (5)')
  })
})

describe('packetTypeLabel', () => {
  it('maps a raw decoder packet_type to its friendly filter-chip label', () => {
    expect(packetTypeLabel('TextMessage')).toBe('Direct msg')
    expect(packetTypeLabel('GroupText')).toBe('Channel')
    expect(packetTypeLabel('Advert')).toBe('Advert')
  })
  it('falls back to the raw value for an unrecognised packet_type', () => {
    expect(packetTypeLabel('SomethingNew')).toBe('SomethingNew')
  })
  it('falls back to the raw value for null/undefined', () => {
    expect(packetTypeLabel(null)).toBe(null)
    expect(packetTypeLabel(undefined)).toBe(undefined)
  })
})
