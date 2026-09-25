import type { MoneyValue, PreparedQuestion } from './question';

export const LEVELS: MoneyValue[] = [10, 20, 50, 100, 200];

/** Cumulative secured amount if the level at this index is answered correctly. */
export const CUMULATIVE_AT_LEVEL: number[] = (() => {
  let sum = 0;
  return LEVELS.map((v) => (sum += v));
})();

export type GamePhase =
  | 'name-entry'
  | 'category-board'
  | 'question'
  | 'reveal'
  | 'win'
  | 'loss';

export interface UsedSlot {
  category: string;
  value: MoneyValue;
  questionId: string;
}

export interface GameState {
  phase: GamePhase;
  playerName: string;
  currentLevelIndex: number; // 0..4, index into LEVELS
  securedAmount: number;
  usedSlots: UsedSlot[];
  currentCategory?: string;
  currentQuestion?: PreparedQuestion;
  selectedAnswerIndex?: 0 | 1 | 2 | 3;
  timeUp?: boolean;
  startTime?: string;
  lastAnswerCorrect?: boolean;
}

export const initialGameState = (): GameState => ({
  phase: 'name-entry',
  playerName: '',
  currentLevelIndex: 0,
  securedAmount: 0,
  usedSlots: []
});
