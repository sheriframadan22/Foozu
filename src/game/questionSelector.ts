import type { Question, PreparedQuestion } from '@/types/question';
import { getQuestionsFor } from '@/data/questionBank';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Turn a raw question (with a plain correctAnswer index) into a display-ready one with shuffled options. */
export function prepareQuestion(q: Question): PreparedQuestion {
  const order = shuffle([0, 1, 2, 3]);
  const options = order.map((i) => q.options[i]);
  const correctAnswer = order.indexOf(q.correctAnswer) as 0 | 1 | 2 | 3;
  return { ...q, options, correctAnswer };
}

/**
 * Pick a random, not-yet-used question for the given value in this session.
 * Returns undefined if every question at that level has been used already (should not
 * happen with 50 questions/level in a single game, but guarded regardless).
 */
export function pickQuestion(value: number, usedQuestionIds: string[]): Question | undefined {
  const usedIds = new Set(usedQuestionIds);
  const pool = getQuestionsFor(value).filter((q) => !usedIds.has(q.id));
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}
