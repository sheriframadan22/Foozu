import type { MoneyValue, PreparedQuestion } from '@/types/question';

/**
 * The "Football Pillar" is a second, standalone game: one single category (Football),
 * blending Egyptian football / international football / football history / guess-the-
 * player / football knowledge within each of its own 5 money levels, at a noticeably
 * harder curve than the classic game. It reuses the activation's shared storage
 * (gameStore, playerRegistryStore, raffleStore) so the leaderboard, the "one play per
 * phone number" rule, and the raffle pool stay unified across both games — a contestant
 * plays ONE game (either one), not one of each.
 */
export const FOOTBALL_LEVELS: MoneyValue[] = [10, 20, 30, 50, 100];

export const FOOTBALL_MAX_PRIZE = FOOTBALL_LEVELS.reduce((a, b) => a + b, 0); // 210

export type FootballGamePhase = 'name-entry' | 'level-ready' | 'question' | 'reveal' | 'win' | 'loss';

export interface FootballGameState {
  phase: FootballGamePhase;
  playerName: string;
  phoneNumber: string;
  age: number;
  raffleNumber: number;
  currentLevelIndex: number; // 0..4, index into FOOTBALL_LEVELS
  securedAmount: number;
  usedQuestionIds: string[]; // only one category, so a flat used-id list is enough
  currentQuestion?: PreparedQuestion;
  timeUp?: boolean;
  startTime?: string;
}

export const initialFootballState = (): FootballGameState => ({
  phase: 'name-entry',
  playerName: '',
  phoneNumber: '',
  age: 0,
  raffleNumber: 0,
  currentLevelIndex: 0,
  securedAmount: 0,
  usedQuestionIds: []
});
