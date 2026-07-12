import { describe, it, expect } from 'vitest'
import { packetTypeLabel } from './packettypes.js'

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
