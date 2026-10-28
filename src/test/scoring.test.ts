import { describe, it, expect } from 'vitest';
import { MAX_PRIZE, cumulativeAfterLevel } from '@/game/scoring';
import { LEVELS } from '@/types/game';

describe('scoring', () => {
  it('max prize is exactly 210, never 100', () => {
    expect(MAX_PRIZE).toBe(210);
    expect(MAX_PRIZE).not.toBe(100);
  });

  it('cumulative progression matches 10 -> 30 -> 60 -> 110 -> 210', () => {
    expect(LEVELS).toEqual([10, 20, 30, 50, 100]);
    expect([0, 1, 2, 3, 4].map(cumulativeAfterLevel)).toEqual([10, 30, 60, 110, 210]);
  });
});
