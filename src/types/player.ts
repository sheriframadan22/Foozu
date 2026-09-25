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
  prize: number;
  startTime: string; // ISO
  endTime: string; // ISO
  durationSeconds: number;
  highestLevel: number; // highest money value reached (attempted)
  result: GameResult;
  selections: CategorySelection[];
}
