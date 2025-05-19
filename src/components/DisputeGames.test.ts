import { describe, it, expect } from 'vitest'
import { parseDisputeGameMetadata } from './DisputeGames'
import type { Address } from 'viem'

describe('parseDisputeGameMetadata', () => {
  it('extracts address and type', () => {
    const addr = '0x' + 'aa'.repeat(20)
    const type = 0x1234
    const metadata = '0x' + type.toString(16).padStart(8, '0') + addr.slice(2)
    expect(parseDisputeGameMetadata(metadata as `0x${string}`)).toEqual({ address: addr as Address, type })
  })
})
