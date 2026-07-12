import { describe, it, expect } from 'vitest'
import { hunterOptionLabel, hunterListboxSize } from './filters.js'

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

describe('hunterListboxSize', () => {
  it('shows every option when there are few', () => {
    expect(hunterListboxSize(3)).toBe(3)
  })
  it('caps at 8 rows for a long list', () => {
    expect(hunterListboxSize(50)).toBe(8)
  })
  it('shows at least 2 rows even for a single option (still reads as a listbox)', () => {
    expect(hunterListboxSize(1)).toBe(2)
  })
  it('shows at least 2 rows for zero options', () => {
    expect(hunterListboxSize(0)).toBe(2)
  })
})
