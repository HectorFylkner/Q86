/**
 * Decision-triage rules, database-free (round assembly lives in
 * lib/decide.ts). The verdict compares a 45-second call against what the
 * student's own record says about questions like it.
 */
export type DecideRecommendation = "solve" | "guess" | "bail";

/** Difficulty priors used until you have personal data in a cell. */
export const DECIDE_PRIORS: Record<number, number> = {
  2: 0.85,
  3: 0.7,
  4: 0.55,
  5: 0.4,
};

/** Personal data starts overriding the prior at this cell sample size. */
export const DECIDE_MIN_SAMPLE = 4;

export function recommend(p: number): DecideRecommendation {
  if (p >= 0.65) return "solve";
  if (p >= 0.4) return "guess";
  return "bail";
}

/** Predicted accuracy for one subtopic × difficulty cell: personal record
 *  once the sample is large enough, difficulty prior until then. */
export function predictCell(
  stats: { correct: number; total: number } | null,
  difficulty: number,
): { predicted: number; sample: number } {
  const usePersonal = stats != null && stats.total >= DECIDE_MIN_SAMPLE;
  return {
    predicted: usePersonal
      ? stats.correct / stats.total
      : (DECIDE_PRIORS[difficulty] ?? 0.5),
    sample: usePersonal ? stats.total : 0,
  };
}
