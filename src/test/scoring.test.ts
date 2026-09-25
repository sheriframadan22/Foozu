import { describe, it, expect } from 'vitest';
import { MAX_PRIZE, cumulativeAfterLevel } from '@/game/scoring';
import { LEVELS } from '@/types/game';

describe('scoring', () => {
  it('max prize is exactly 380, never 200', () => {
    expect(MAX_PRIZE).toBe(380);
    expect(MAX_PRIZE).not.toBe(200);
  });

  it('cumulative progression matches 10 -> 30 -> 80 -> 180 -> 380', () => {
    expect(LEVELS).toEqual([10, 20, 50, 100, 200]);
    expect([0, 1, 2, 3, 4].map(cumulativeAfterLevel)).toEqual([10, 30, 80, 180, 380]);
  });
});
