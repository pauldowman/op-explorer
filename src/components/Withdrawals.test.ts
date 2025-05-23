import { describe, it, expect } from 'vitest'
import { parseMessagePassedLog, MESSAGE_PASSED_EVENT } from './Withdrawals'

const sampleLog = {
  args: {
    nonce: 1n,
    sender: '0x0000000000000000000000000000000000000001',
    target: '0x0000000000000000000000000000000000000002',
    value: 3n,
    gasLimit: 4n,
    data: '0x',
    withdrawalHash: '0x1234' as const,
  },
  blockNumber: 10n,
}

describe('parseMessagePassedLog', () => {
  it('parses log into Withdrawal', () => {
    const w = parseMessagePassedLog(sampleLog as any)
    expect(w.nonce).toBe(1n)
    expect(w.sender).toBe(sampleLog.args.sender)
    expect(w.target).toBe(sampleLog.args.target)
    expect(w.value).toBe(3n)
    expect(w.gasLimit).toBe(4n)
    expect(w.data).toBe('0x')
    expect(w.withdrawalHash).toBe('0x1234')
    expect(w.blockNumber).toBe(10n)
  })
})

describe('MESSAGE_PASSED_EVENT', () => {
  it('is the MessagePassed event definition', () => {
    expect(MESSAGE_PASSED_EVENT.name).toBe('MessagePassed')
  })
})
