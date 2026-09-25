export type MoneyValue = 10 | 20 | 50 | 100 | 200;

export interface QuestionOption {
  en: string;
  ar: string;
}

/** Raw question exactly as authored in data/questions/<category>/<value>.json */
export interface Question {
  id: string;
  category: string;
  category_ar: string;
  value: MoneyValue;
  difficulty: 1 | 2 | 3 | 4 | 5;
  question_en: string;
  question_ar: string;
  options: QuestionOption[];
  /** Index (0-3) of the correct option. Never sent to the client UI unshuffled/exposed — see RevealAnswer flow. */
  correctAnswer: 0 | 1 | 2 | 3;
  explanation_en?: string;
  explanation_ar?: string;
  verified_as_of?: string;
}

/** A question prepared for on-screen display: options shuffled, correct index remapped. */
export interface PreparedQuestion extends Omit<Question, 'options' | 'correctAnswer'> {
  options: QuestionOption[];
  correctAnswer: 0 | 1 | 2 | 3;
}

export interface CategoryDef {
  key: string;
  prefix: string;
  name_en: string;
  name_ar: string;
  color: string;
  icon: string;
}

export interface CategoriesConfig {
  values: MoneyValue[];
  questionsPerSlot: number;
  categories: CategoryDef[];
}
