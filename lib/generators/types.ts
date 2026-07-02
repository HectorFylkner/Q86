/**
 * Pattern-trainer item. Deterministic: the answer is computed by code,
 * never by a model — instant, free, and always correct.
 */
export type PatternItem = {
  /** Markdown with KaTeX math. */
  prompt: string;
  /** Canonical answer as a string ("37.5", "Yes", "Even"…). */
  answer: string;
  /** Item ELO rating, 1000–1600, mapped from generator difficulty. */
  difficultyRating: number;
  /** Present → tap-to-answer options; absent → typed numeric answer. */
  options?: string[];
};

export type PatternGenerator = (rng: () => number) => PatternItem;
