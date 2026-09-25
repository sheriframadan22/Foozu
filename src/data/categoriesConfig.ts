import raw from '../../data/categories.json';
import type { CategoriesConfig } from '@/types/question';

export const categoriesConfig = raw as CategoriesConfig;
export const CATEGORIES = categoriesConfig.categories;
export const VALUES = categoriesConfig.values;
export const QUESTIONS_PER_SLOT = categoriesConfig.questionsPerSlot;

export function categoryByName(name_en: string) {
  return CATEGORIES.find((c) => c.name_en === name_en);
}
