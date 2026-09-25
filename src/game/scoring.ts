import { LEVELS } from '@/types/game';

/**
 * Core scoring rules for FOOZU (see PRD §41–42):
 * - securedAmount only ever grows by ADDING the value of a level the contestant
 *   answered correctly. It must never be overwritten with the current question's value.
 * - A wrong answer (or timeout) ends the game immediately; the contestant keeps
 *   whatever was already secured — the current (unanswered) level's value is never added.
 */

/** Cumulative secured amount after correctly clearing levels[0..levelIndex]. */
export function cumulativeAfterLevel(levelIndex: number): number {
  let sum = 0;
  for (let i = 0; i <= levelIndex; i++) sum += LEVELS[i];
  return sum;
}

export function addLevelValue(securedAmount: number, levelIndex: number): number {
  return securedAmount + LEVELS[levelIndex];
}

export const MAX_PRIZE = cumulativeAfterLevel(LEVELS.length - 1); // 380

export function isLastLevel(levelIndex: number): boolean {
  return levelIndex === LEVELS.length - 1;
}
