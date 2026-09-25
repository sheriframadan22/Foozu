import type { Question, PreparedQuestion, MoneyValue } from '@/types/question';
import { getQuestionsFor } from '@/data/questionBank';
import type { UsedSlot } from '@/types/game';

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
 * Pick a random, not-yet-used question for a category/value in this session.
 * Returns undefined if every question in that slot has been used already (should not
 * happen with 50 questions/slot in a single game, but guarded regardless).
 */
export function pickQuestion(
  categoryName: string,
  value: MoneyValue,
  usedSlots: UsedSlot[]
): Question | undefined {
  const usedIds = new Set(usedSlots.map((s) => s.questionId));
  const pool = getQuestionsFor(categoryName, value).filter((q) => !usedIds.has(q.id));
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function isSlotUsed(usedSlots: UsedSlot[], category: string, value: number): boolean {
  return usedSlots.some((s) => s.category === category && s.value === value);
}
