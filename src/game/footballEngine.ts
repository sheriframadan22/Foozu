import { FOOTBALL_LEVELS, type FootballGameState, initialFootballState } from '@/types/footballGame';
import { getFootballPillarQuestionsFor } from '@/data/footballPillarBank';
import { prepareQuestion } from './questionSelector';
import type { MoneyValue } from '@/types/question';

/**
 * Pure, side-effect-free reducers for the Football Pillar game — mirrors the rules of
 * the classic game engine (additive scoring, one attempt per question, no skipping
 * levels) but over its own 5-level ladder and single-category question pool. See
 * src/types/footballGame.ts for why this is a separate module rather than a generalized
 * version of src/game/gameEngine.ts.
 */

export function startFootballGame(playerName: string, phoneNumber = '', age = 0, raffleNumber = 0): FootballGameState {
  return {
    ...initialFootballState(),
    phase: 'level-ready',
    playerName: playerName.trim(),
    phoneNumber: phoneNumber.trim(),
    age,
    raffleNumber,
    startTime: new Date().toISOString()
  };
}

export function currentFootballValue(state: FootballGameState): MoneyValue {
  return FOOTBALL_LEVELS[state.currentLevelIndex];
}

/** Draws a random unused question for the current level and moves to the question phase. */
export function beginFootballQuestion(state: FootballGameState): FootballGameState {
  if (state.phase !== 'level-ready') return state;
  const value = currentFootballValue(state);
  const usedIds = new Set(state.usedQuestionIds);
  const pool = getFootballPillarQuestionsFor(value).filter((q) => !usedIds.has(q.id));
  if (pool.length === 0) return state; // exhausted pool guard; shouldn't happen with 50/level/session
  const raw = pool[Math.floor(Math.random() * pool.length)];
  return { ...state, phase: 'question', currentQuestion: prepareQuestion(raw), timeUp: false };
}

export function revealFootball(state: FootballGameState): FootballGameState {
  if (state.phase !== 'question') return state;
  return { ...state, phase: 'reveal' };
}

export function markFootballTimeUp(state: FootballGameState): FootballGameState {
  if (state.phase !== 'question') return state;
  return { ...state, phase: 'reveal', timeUp: true };
}

/**
 * Usher confirms CORRECT or WRONG after the reveal. Same additive-only rule as the
 * classic game: securedAmount only ever grows by the current level's value, and a wrong
 * answer ends the game immediately with whatever was already secured.
 */
export function confirmFootballOutcome(state: FootballGameState, correct: boolean): FootballGameState {
  if (state.phase !== 'reveal' || !state.currentQuestion) return state;
  const value = currentFootballValue(state);
  const usedQuestionIds = [...state.usedQuestionIds, state.currentQuestion.id];

  if (!correct) {
    return { ...state, phase: 'loss', usedQuestionIds };
  }

  const securedAmount = state.securedAmount + value;
  const isLastLevel = state.currentLevelIndex === FOOTBALL_LEVELS.length - 1;

  if (isLastLevel) {
    return { ...state, phase: 'win', usedQuestionIds, securedAmount };
  }

  return {
    ...state,
    phase: 'level-ready',
    usedQuestionIds,
    securedAmount,
    currentLevelIndex: state.currentLevelIndex + 1,
    currentQuestion: undefined
  };
}

export function resetFootballGame(): FootballGameState {
  return initialFootballState();
}
