/**
 * SM-2-lite scheduling for the takeaway deck. Three grades keep reviews
 * fast: "forgot" resets the card (interval 1d, ease down), "hard" grows
 * the interval slowly and nudges ease down, "good" follows the classic
 * 1d → 3d → interval×ease ladder. Ease is floored at 1.3 so a struggling
 * card can never spiral into daily-forever.
 */

export const REVIEW_GRADES = ["forgot", "hard", "good"] as const;
export type ReviewGrade = (typeof REVIEW_GRADES)[number];

export type ReviewState = {
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
};

export const NEW_CARD: ReviewState = {
  ease: 2.5,
  intervalDays: 0,
  reps: 0,
  lapses: 0,
};

export function nextReview(
  state: ReviewState | null,
  grade: ReviewGrade,
): ReviewState {
  const s = state ?? NEW_CARD;
  if (grade === "forgot") {
    return {
      ease: Math.max(1.3, s.ease - 0.2),
      intervalDays: 1,
      reps: 0,
      lapses: s.lapses + 1,
    };
  }
  if (grade === "hard") {
    return {
      ease: Math.max(1.3, s.ease - 0.05),
      intervalDays: Math.max(1, Math.round(s.intervalDays * 1.2)),
      reps: s.reps + 1,
      lapses: s.lapses,
    };
  }
  return {
    ease: s.ease,
    intervalDays:
      s.reps === 0 ? 1 : s.reps === 1 ? 3 : Math.round(s.intervalDays * s.ease),
    reps: s.reps + 1,
    lapses: s.lapses,
  };
}

/** The would-be interval per grade, for showing "1d / 2d / 8d" on the
 *  grade buttons before the user commits. */
export function previewIntervals(
  state: ReviewState | null,
): Record<ReviewGrade, number> {
  return {
    forgot: nextReview(state, "forgot").intervalDays,
    hard: nextReview(state, "hard").intervalDays,
    good: nextReview(state, "good").intervalDays,
  };
}
