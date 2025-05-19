import { describe, it, expect } from 'vitest'
import { unpackClock, parseClaimData } from './DisputeGame'
import type { Address } from 'viem'

describe('unpackClock', () => {
  it('splits duration and timestamp correctly', () => {
    const duration = 300n
    const timestamp = 123456n
    const clock = (timestamp << 64n) | duration
    expect(unpackClock(clock)).toEqual({ duration, timestamp })
  })
})

describe('parseClaimData', () => {
  it('converts raw claim tuple to structured object', () => {
    const raw = [1, '0x' + '11'.repeat(20) as Address, '0x' + '22'.repeat(20) as Address, 10n, '0x' + '33'.repeat(32) as `0x${string}`, 5n, 7n] as const
    const parsed = parseClaimData(raw, 0)
    expect(parsed).toEqual({
      index: 0,
      claimData: {
        parentIndex: 1,
        counteredBy: raw[1],
        claimant: raw[2],
        bond: 10n,
        claim: raw[4],
        position: 5n,
        clock: 7n,
      }
    })
  })
})
