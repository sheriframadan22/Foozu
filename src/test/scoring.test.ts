import { describe, it, expect } from 'vitest';
import { MAX_PRIZE, valueAtLevel } from '@/game/scoring';
import { LEVELS } from '@/types/game';

describe('scoring', () => {
  it('max prize is exactly 100 — the top level\'s own value, not a cumulative sum', () => {
    expect(MAX_PRIZE).toBe(100);
    expect(MAX_PRIZE).not.toBe(210);
  });

  it('the prize at each level is just that level\'s value (not cumulative)', () => {
    expect(LEVELS).toEqual([10, 20, 30, 50, 100]);
    expect([0, 1, 2, 3, 4].map(valueAtLevel)).toEqual([10, 20, 30, 50, 100]);
  });
});
