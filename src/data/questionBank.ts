import type { Question } from '@/types/question';

// One pillar, one pool: all questions blend Egyptian football, international
// football, football history, guess-the-player and football knowledge within each
// money level. Adding more later is just adding objects to these files — no code
// changes required.
const modules = import.meta.glob('../../data/football-pillar/*.json', { eager: true }) as Record<
  string,
  { default: Question[] }
>;

const ALL_QUESTIONS: Question[] = Object.values(modules).flatMap((m) => m.default);

export function getAllQuestions(): Question[] {
  return ALL_QUESTIONS;
}

export function getQuestionsFor(value: number): Question[] {
  return ALL_QUESTIONS.filter((q) => q.value === value);
}

export function totalQuestionCount(): number {
  return ALL_QUESTIONS.length;
}
