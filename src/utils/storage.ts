import type { CompletedGame } from '@/types/player';

/**
 * V1 persistence: localStorage. Kept behind a small repository-style API so a later
 * version can swap in IndexedDB or a real backend (cloud leaderboard, multi-tablet
 * sync) without touching call sites.
 */

const GAMES_KEY = 'foozu:games:v1';
const STATS_KEY = 'foozu:question-stats:v1';

export interface QuestionStat {
  questionId: string;
  category: string;
  value: number;
  timesShown: number;
  timesCorrect: number;
  timesWrong: number;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const gameStore = {
  getAll(): CompletedGame[] {
    return safeParse<CompletedGame[]>(localStorage.getItem(GAMES_KEY), []);
  },
  add(game: CompletedGame): void {
    const all = gameStore.getAll();
    all.push(game);
    localStorage.setItem(GAMES_KEY, JSON.stringify(all));
  },
  clearAll(): void {
    localStorage.setItem(GAMES_KEY, JSON.stringify([]));
  },
  /** Leaderboard order: prize descending, ties broken by earlier completion time. */
  leaderboard(): CompletedGame[] {
    return [...gameStore.getAll()].sort((a, b) => {
      if (b.prize !== a.prize) return b.prize - a.prize;
      return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
    });
  }
};

export const questionStatsStore = {
  getAll(): Record<string, QuestionStat> {
    return safeParse<Record<string, QuestionStat>>(localStorage.getItem(STATS_KEY), {});
  },
  record(questionId: string, category: string, value: number, correct: boolean): void {
    const all = questionStatsStore.getAll();
    const existing = all[questionId] ?? { questionId, category, value, timesShown: 0, timesCorrect: 0, timesWrong: 0 };
    existing.timesShown += 1;
    if (correct) existing.timesCorrect += 1;
    else existing.timesWrong += 1;
    all[questionId] = existing;
    localStorage.setItem(STATS_KEY, JSON.stringify(all));
  },
  clearAll(): void {
    localStorage.setItem(STATS_KEY, JSON.stringify({}));
  }
};
