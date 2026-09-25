import type { CompletedGame, PlayerRecord } from '@/types/player';

/**
 * V1 persistence: localStorage. Kept behind a small repository-style API so a later
 * version can swap in IndexedDB or a real backend (cloud leaderboard, multi-tablet
 * sync) without touching call sites.
 */

const GAMES_KEY = 'foozu:games:v1';
const STATS_KEY = 'foozu:question-stats:v1';
const PLAYERS_KEY = 'foozu:players:v1';
const RAFFLE_COUNTER_KEY = 'foozu:raffle-counter:v1';
const RAFFLE_WINNER_KEY = 'foozu:raffle-winner:v1';

/** Normalizes a phone number for matching (strips spaces/dashes/parens, keeps digits and a leading +). */
export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[\s\-().]/g, '');
}

/** Zero-pads a raffle number for display/announcement (e.g. 7 -> "007"). */
export function formatRaffleNumber(n: number): string {
  return String(n).padStart(3, '0');
}

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

export const playerRegistryStore = {
  getAll(): Record<string, PlayerRecord> {
    return safeParse<Record<string, PlayerRecord>>(localStorage.getItem(PLAYERS_KEY), {});
  },
  /** Returns the existing record for this phone number, if this person has played before. */
  find(phoneNumber: string): PlayerRecord | undefined {
    const key = normalizePhone(phoneNumber);
    if (!key) return undefined;
    return playerRegistryStore.getAll()[key];
  },
  /** Registers (or bumps) a phone number as having played — call this once a game actually starts. */
  register(phoneNumber: string, playerName: string, age: number, gameId?: string): void {
    const key = normalizePhone(phoneNumber);
    if (!key) return;
    const all = playerRegistryStore.getAll();
    const existing = all[key];
    all[key] = existing
      ? { ...existing, playerName, age, timesPlayed: existing.timesPlayed + 1, lastGameId: gameId }
      : { phoneNumber: key, playerName, age, firstPlayedAt: new Date().toISOString(), timesPlayed: 1, lastGameId: gameId };
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(all));
  },
  /** Records the prize won on the most recent game for this phone number (shown in the "played before" flag). */
  recordPrize(phoneNumber: string, prize: number): void {
    const key = normalizePhone(phoneNumber);
    if (!key) return;
    const all = playerRegistryStore.getAll();
    const existing = all[key];
    if (!existing) return;
    all[key] = { ...existing, lastPrize: prize };
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(all));
  },
  clearAll(): void {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify({}));
  }
};

export const raffleStore = {
  /** The next number that will be handed out, without consuming it (for display only). */
  peekNext(): number {
    return safeParse<number>(localStorage.getItem(RAFFLE_COUNTER_KEY), 0) + 1;
  },
  /** Every contestant who starts a game gets the next sequential raffle number, once. */
  next(): number {
    const n = raffleStore.peekNext();
    localStorage.setItem(RAFFLE_COUNTER_KEY, JSON.stringify(n));
    return n;
  },
  /** Starts the count over — use alongside gameStore/playerRegistryStore resets for a new event day. */
  reset(): void {
    localStorage.setItem(RAFFLE_COUNTER_KEY, JSON.stringify(0));
  },
  /** The most recently announced raffle winner, if any — survives a page reload mid-draw. */
  getWinner(): RaffleWinner | null {
    return safeParse<RaffleWinner | null>(localStorage.getItem(RAFFLE_WINNER_KEY), null);
  },
  setWinner(winner: RaffleWinner): void {
    localStorage.setItem(RAFFLE_WINNER_KEY, JSON.stringify(winner));
  },
  clearWinner(): void {
    localStorage.removeItem(RAFFLE_WINNER_KEY);
  }
};

export interface RaffleWinner {
  raffleNumber: number;
  playerName: string;
  phoneNumber: string;
  drawnAt: string;
}

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
