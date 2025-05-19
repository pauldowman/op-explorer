import { describe, it, expect } from 'vitest'
import { getGameTypeName } from './config'

describe('getGameTypeName', () => {
  it('returns the correct name for known types', () => {
    expect(getGameTypeName(0)).toBe('Cannon')
    expect(getGameTypeName(254)).toBe('Fast')
  })

  it('returns UNKNOWN for unknown types', () => {
    expect(getGameTypeName(9999)).toBe('UNKNOWN')
  })
})
