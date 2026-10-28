import { LEVELS } from '@/types/game';

/**
 * Core scoring rule for FOOZU (by explicit request — NOT cumulative):
 * - The prize equals the value of the LAST level the contestant answered correctly,
 *   not the sum of every level cleared so far. Answering a level correctly simply
 *   sets securedAmount to that level's value (overwriting the previous level's value).
 * - A wrong answer (or timeout) ends the game immediately; the contestant keeps
 *   whatever was already secured from their last correct answer — the current
 *   (unanswered) level's value is never awarded.
 *
 * Example: correct at 10 EGP, correct at 20 EGP, wrong at 30 EGP -> prize is 20 EGP
 * (the value of the last question answered correctly), not 10+20=30.
 */

export function valueAtLevel(levelIndex: number): number {
  return LEVELS[levelIndex];
}

/** Sets the secured prize to this level's value (overwrites, does not add). */
export function setLevelValue(levelIndex: number): number {
  return LEVELS[levelIndex];
}

export const MAX_PRIZE = valueAtLevel(LEVELS.length - 1); // 100 — the top level's own value, not a cumulative sum

export function isLastLevel(levelIndex: number): boolean {
  return levelIndex === LEVELS.length - 1;
}
