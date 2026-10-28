import type { MoneyValue, PreparedQuestion } from './question';

/** The game's single money ladder — 5 levels, harder curve, football-only content. */
export const LEVELS: MoneyValue[] = [10, 20, 30, 50, 100];

export type GamePhase = 'name-entry' | 'level-ready' | 'question' | 'reveal' | 'win' | 'loss';

export interface GameState {
  phase: GamePhase;
  playerName: string;
  phoneNumber: string;
  age: number;
  raffleNumber: number;
  currentLevelIndex: number; // 0..4, index into LEVELS
  securedAmount: number;
  usedQuestionIds: string[]; // one pool, so a flat used-id list is enough
  currentQuestion?: PreparedQuestion;
  timeUp?: boolean;
  startTime?: string;
}

export const initialGameState = (): GameState => ({
  phase: 'name-entry',
  playerName: '',
  phoneNumber: '',
  age: 0,
  raffleNumber: 0,
  currentLevelIndex: 0,
  securedAmount: 0,
  usedQuestionIds: []
});
