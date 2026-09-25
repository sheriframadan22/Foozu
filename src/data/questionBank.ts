import type { Question } from '@/types/question';

// Eagerly bundle every category/value question file at build time.
// Adding more questions later is just editing/adding files under data/questions/<category>/<value>.json —
// no code changes required here.
const modules = import.meta.glob('../../data/questions/*/*.json', { eager: true }) as Record<
  string,
  { default: Question[] }
>;

const ALL_QUESTIONS: Question[] = Object.values(modules).flatMap((m) => m.default);

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}

export function getQuestionsFor(categoryName: string, value: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.category === categoryName && q.value === value);
}

export function totalQuestionCount(): number {
  return ALL_QUESTIONS.length;
}
