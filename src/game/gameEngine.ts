import { LEVELS, type GameState, initialGameState } from '@/types/game';
import { addLevelValue, isLastLevel } from './scoring';
import { pickQuestion, prepareQuestion, isSlotUsed } from './questionSelector';
import type { MoneyValue } from '@/types/question';

/** Pure, side-effect-free reducers for the FOOZU game. Every transition returns a new GameState. */

export function startGame(playerName: string, phoneNumber = '', age = 0, raffleNumber = 0): GameState {
  return {
    ...initialGameState(),
    phase: 'category-board',
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

export function canSelectCategory(state: GameState, category: string): boolean {
  if (state.phase !== 'category-board') return false;
  return !isSlotUsed(state.usedSlots, category, currentValue(state));
}

/** Contestant picks a category at the current level; draws a random unused question. */
export function selectCategory(state: GameState, category: string): GameState {
  if (!canSelectCategory(state, category)) return state;
  const value = currentValue(state);
  const raw = pickQuestion(category, value, state.usedSlots);
  if (!raw) return state; // exhausted pool guard; UI should not allow reaching this
  const prepared = prepareQuestion(raw);
  return {
    ...state,
    phase: 'question',
    currentCategory: category,
    currentQuestion: prepared,
    selectedAnswerIndex: undefined,
    timeUp: false
  };
}

/** Usher records the contestant's verbal answer (or a timeout) before revealing. */
export function recordAnswer(state: GameState, answerIndex: 0 | 1 | 2 | 3 | undefined, timeUp = false): GameState {
  if (state.phase !== 'question') return state;
  return { ...state, selectedAnswerIndex: answerIndex, timeUp };
}

export function reveal(state: GameState): GameState {
  if (state.phase !== 'question') return state;
  return { ...state, phase: 'reveal' };
}

/**
 * Usher confirms CORRECT or WRONG after the reveal. This is the single place
 * securedAmount changes, and it only ever ADDS the current level's value — see scoring.ts.
 */
export function confirmOutcome(state: GameState, correct: boolean): GameState {
  if (state.phase !== 'reveal' || !state.currentQuestion || !state.currentCategory) return state;
  const value = currentValue(state);
  const usedSlots = [...state.usedSlots, { category: state.currentCategory, value, questionId: state.currentQuestion.id }];

  if (!correct) {
    return { ...state, phase: 'loss', usedSlots, lastAnswerCorrect: false };
  }

  const securedAmount = addLevelValue(state.securedAmount, state.currentLevelIndex);

  if (isLastLevel(state.currentLevelIndex)) {
    return { ...state, phase: 'win', usedSlots, securedAmount, lastAnswerCorrect: true };
  }

  return {
    ...state,
    phase: 'category-board',
    usedSlots,
    securedAmount,
    currentLevelIndex: state.currentLevelIndex + 1,
    currentCategory: undefined,
    currentQuestion: undefined,
    selectedAnswerIndex: undefined,
    lastAnswerCorrect: true
  };
}

export function resetGame(): GameState {
  return initialGameState();
}
