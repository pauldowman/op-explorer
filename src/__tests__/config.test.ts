import { describe, it, expect } from 'vitest';
import { getGameTypeName } from '../config';

describe('getGameTypeName', () => {
  it('returns name for known type', () => {
    expect(getGameTypeName(0)).toBe('Cannon');
    expect(getGameTypeName(1)).toBe('Permissioned Cannon');
  });

  it('returns UNKNOWN for unknown type', () => {
    expect(getGameTypeName(999)).toBe('UNKNOWN');
  });
});
