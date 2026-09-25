export type GameResult = 'win' | 'loss';

export interface CategorySelection {
  category: string;
  value: number;
  correct: boolean;
  questionId: string;
}

export interface CompletedGame {
  id: string;
  playerName: string;
  phoneNumber: string;
  age: number;
  raffleNumber: number;
  prize: number;
  startTime: string; // ISO
  endTime: string; // ISO
  durationSeconds: number;
  highestLevel: number; // highest money value reached (attempted)
  result: GameResult;
  selections: CategorySelection[];
}

/**
 * One row per unique phone number that has ever started a game — the "played before"
 * registry. Separate from CompletedGame history because it needs to flag someone the
 * moment they enter their phone number, before their game has finished (or even if a
 * previous attempt was abandoned).
 */
export interface PlayerRecord {
  phoneNumber: string;
  playerName: string;
  age: number;
  firstPlayedAt: string; // ISO
  timesPlayed: number;
  lastGameId?: string;
  lastPrize?: number;
}
