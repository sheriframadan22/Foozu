import type { Question } from '@/types/question';

// The "Football Pillar" bank is a separate, harder, football-only second game.
// It lives outside data/questions/ specifically so it never collides with the
// classic game's own "Football" category (same category name, different and
// non-overlapping value ladder: 10/20/30/50/100 here vs 10/20/50/100/200 there).
const modules = import.meta.glob('../../data/football-pillar/*.json', { eager: true }) as Record<
  string,
  { default: Question[] }
>;

const ALL_FOOTBALL_PILLAR_QUESTIONS: Question[] = Object.values(modules).flatMap((m) => m.default);

export function getFootballPillarQuestionsFor(value: number): Question[] {
  return ALL_FOOTBALL_PILLAR_QUESTIONS.filter((q) => q.value === value);
}

export function totalFootballPillarQuestionCount(): number {
  return ALL_FOOTBALL_PILLAR_QUESTIONS.length;
}
