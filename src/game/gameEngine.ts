import { LEVELS, type GameState, initialGameState } from '@/types/game';
import { addLevelValue, isLastLevel } from './scoring';
import { pickQuestion, prepareQuestion } from './questionSelector';
import type { MoneyValue } from '@/types/question';

/** Pure, side-effect-free reducers for the FOOZU game. Every transition returns a new GameState. */

export function startGame(playerName: string, phoneNumber = '', age = 0, raffleNumber = 0): GameState {
  return {
    ...initialGameState(),
    phase: 'level-ready',
    playerName: playerName.trim(),
    phoneNumber: phoneNumber.trim(),
    age,
    raffleNumber,
    startTime: new Date().toISOString()
  };
}

export function currentValue(state: GameState): MoneyValue {
  return LEVELS[state.currentLevelIndex];
}

/** Draws a random unused question for the current level and moves to the question phase. */
export function beginQuestion(state: GameState): GameState {
  if (state.phase !== 'level-ready') return state;
  const value = currentValue(state);
  const raw = pickQuestion(value, state.usedQuestionIds);
  if (!raw) return state; // exhausted pool guard; shouldn't happen with 50 questions/level/session
  return { ...state, phase: 'question', currentQuestion: prepareQuestion(raw), timeUp: false };
}

export function reveal(state: GameState): GameState {
  if (state.phase !== 'question') return state;
  return { ...state, phase: 'reveal' };
}

export function markTimeUp(state: GameState): GameState {
  if (state.phase !== 'question') return state;
  return { ...state, phase: 'reveal', timeUp: true };
}

/**
 * Usher confirms CORRECT or WRONG after the reveal. This is the single place
 * securedAmount changes, and it only ever ADDS the current level's value — see scoring.ts.
 */
export function confirmOutcome(state: GameState, correct: boolean): GameState {
  if (state.phase !== 'reveal' || !state.currentQuestion) return state;
  const usedQuestionIds = [...state.usedQuestionIds, state.currentQuestion.id];

  if (!correct) {
    return { ...state, phase: 'loss', usedQuestionIds };
  }

  const securedAmount = addLevelValue(state.securedAmount, state.currentLevelIndex);

  if (isLastLevel(state.currentLevelIndex)) {
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

export function resetGame(): GameState {
  return initialGameState();
}
