import { describe, it, expect } from 'vitest'
import { parseEIP1559Params, formatGasLimitPerBlock, formatGasLimitPerSecond, formatGasTargetPerBlock, formatGasTargetPerSecond } from './L2Info'


describe('parseEIP1559Params', () => {
  it('parses valid data correctly', () => {
    const hex = '0x00' + '000003e8' + '0000000a'
    const result = parseEIP1559Params(hex)
    expect(result).toEqual({ version: 0, denominator: 1000, elasticity: 10, isValid: true })
  })

  it('flags invalid data', () => {
    const hex = '0x01020304'
    const result = parseEIP1559Params(hex)
    expect(result.isValid).toBe(false)
  })
})

describe('gas limit helpers', () => {
  const gasLimit = 50_000_000n
  const params = { version: 0, denominator: 1, elasticity: 2, isValid: true }
  const info = { block_time: 2 }

  it('formats gasLimitPerBlock', () => {
    expect(formatGasLimitPerBlock(gasLimit)).toBe('50')
  })

  it('formats gasLimitPerSecond', () => {
    expect(formatGasLimitPerSecond(gasLimit, info)).toBe('25')
  })

  it('formats gasTargetPerBlock', () => {
    expect(formatGasTargetPerBlock(gasLimit, params)).toBe('25')
  })

  it('formats gasTargetPerSecond', () => {
    expect(formatGasTargetPerSecond(gasLimit, params, info)).toBe('12')
  })
})
