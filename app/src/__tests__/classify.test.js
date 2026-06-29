import { describe, it, expect } from 'vitest'
import { classifyReception } from '../meshpacket.js'

const mk = (payloadType, decoded, pathLength = 0) => ({ payloadType, pathLength, payload: { decoded } })

describe('classifyReception', () => {
  it('advert → pubkey sender + name label', () => {
    const c = classifyReception(mk(4, { publicKey: 'AB'.repeat(32), appData: { name: 'Repeater-1' } }))
    expect(c.packetType).toBe('Advert')
    expect(c.isDirect).toBe(true)
    expect(c.sender).toEqual({ kind: 'advert_pubkey', id: 'ab'.repeat(32), label: 'Repeater-1' })
  })
  it('direct message → direct_hash sender from sourceHash', () => {
    const c = classifyReception(mk(1, { sourceHash: '4A' }))
    expect(c.packetType).toBe('Response')
    expect(c.sender).toEqual({ kind: 'direct_hash', id: '4a', label: '4a' })
  })
  it('group text decrypted → channel_name sender + text + channel', () => {
    const c = classifyReception(
      mk(5, { channelHash: '8b', decrypted: { sender: 'Spammer', message: 'buy now' } }),
      (h) => (h === '8b' ? 'public' : null),
    )
    expect(c.packetType).toBe('GroupText')
    expect(c.channel).toBe('public')
    expect(c.sender).toEqual({ kind: 'channel_name', id: 'Spammer', label: 'Spammer' })
    expect(c.text).toBe('buy now')
  })
  it('group text without key → no sender, no text', () => {
    const c = classifyReception(mk(5, { channelHash: 'ff' }))
    expect(c.sender).toEqual({ kind: null, id: null, label: null })
    expect(c.text).toBeNull()
  })
  it('hops from pathLength; relayed not direct', () => {
    const c = classifyReception(mk(1, { sourceHash: 'aa' }, 3))
    expect(c.hops).toBe(3); expect(c.isDirect).toBe(false)
  })
})
