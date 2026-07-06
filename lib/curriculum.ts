import type { Subtopic } from "./taxonomy.ts";

/**
 * The curriculum sequencer: one pure function from per-chapter evidence
 * to "which chapter next, and how". This is the piece that makes a
 * fixed lesson sequence structurally impossible: the next chapter is
 * always the weakest unpassed subtopic by live evidence (drill
 * accuracy, imported baseline, ladder gaps), and a chapter the
 * evidence says is already known surfaces a test-out instead of a
 * read. Advisory, never locked — this orders recommendations, it
 * forbids nothing.
 *
 * Pure: no database, no clock. Data arrives via CurriculumRow (built
 * in lib/plan-server.ts) so the same scores drive the daily plan and
 * the Learn index ordering.
 */

export type CurriculumRow = {
  subtopic: Subtopic;
  /** Chapter opened at least once (lesson_progress.read_at). */
  read: boolean;
  /** Every pre-drill checklist item ticked. */
  checklistDone: boolean;
  /** Chapter test passed (sticky). */
  testPassed: boolean;
  /** Focused drill attempts on this subtopic, most recent window. */
  attempts: number;
  correct: number;
  /** Non-mastered fraction of the subtopic's non-empty ladder rungs,
   *  0 (ladder complete) .. 1 (nothing mastered). */
  ladderGap: number;
  /** Skill-level weakness from the imported baseline report, 0..1;
   *  null when nothing has been imported. */
  baselineWeakness: number | null;
  /** Recent misses that point at this chapter as a content problem:
   *  content_gap tags on its own questions plus coach/user
   *  cross-attributions (error_subtag) filed from any question. */
  flaggedGaps: number;
};

export type CurriculumAction = "read" | "finish" | "test";

export type CurriculumPlan = {
  /** The chapter to work next, or null when every chapter is passed. */
  next: { subtopic: Subtopic; action: CurriculumAction } | null;
  /** Unpassed chapters whose drill evidence already clears the test-out
   *  bar — skip the read, go straight to the chapter test. */
  testOut: Subtopic[];
  passed: number;
  total: number;
};

/** Test-out bar: enough recent focused evidence at or above the chapter
 *  test's own pass bar (0.75) with margin. Literature-informed constants,
 *  named so they can be tuned in one place. */
export const TEST_OUT_MIN_ATTEMPTS = 8;
export const TEST_OUT_ACCURACY = 0.8;

/** A subtopic has exited first acquisition — and belongs in mixed,
 *  interleaved review instead of blocked drilling — once its chapter
 *  test is passed or it has real drill history. */
export const ACQUISITION_ATTEMPTS = 10;
export function isStudied(row: CurriculumRow): boolean {
  return row.testPassed || row.attempts >= ACQUISITION_ATTEMPTS;
}

/** The plan's drill block interleaves only when enough subtopics are
 *  past acquisition to make mixing meaningful. */
export const INTERLEAVE_MIN_STUDIED = 4;

/** Concept pairs the exam loves to blur into each other. When mixed
 *  review schedules one member and the partner is also studied, the
 *  partner is co-scheduled so the discrimination itself gets practiced
 *  — interleaving's whole advantage over blocking. Hand-authored. */
export const CONFUSABLE_PAIRS: Array<[Subtopic, Subtopic]> = [
  ["combinatorics", "probability"],
  ["rates_speed_work", "ratios_proportions"],
  ["percent_change_chains", "interest_profit_discount"],
  ["mixtures_weighted_avg", "statistics_mean_median_sd"],
  ["divisibility_gcf_lcm", "prime_factorization"],
  ["remainders_units_digits", "exponents_roots_properties"],
  ["inequalities", "abs_value_number_line_decimals"],
  ["linear_systems", "quadratics_factoring"],
  ["consecutive_evenly_spaced", "series_patterns"],
];

export function confusablePartner(subtopic: Subtopic): Subtopic | null {
  for (const [a, b] of CONFUSABLE_PAIRS) {
    if (a === subtopic) return b;
    if (b === subtopic) return a;
  }
  return null;
}

/** Shrinkage prior for drill weakness: with few attempts the estimate
 *  regresses toward neutral 0.5 instead of swinging on 2-3 questions. */
const PRIOR_WEIGHT = 6;

/** Blend weights: live drill evidence dominates; the baseline report and
 *  ladder gaps refine. */
const W_DRILL = 0.5;
const W_BASELINE = 0.25;
const W_LADDER = 0.25;

/** How hard flagged content gaps push a chapter up the queue: each
 *  recent gap adds a third of the bump, saturating at three. One
 *  content_gap tag today is enough to reorder near-ties tomorrow;
 *  three make the chapter hard to ignore. */
const GAP_BUMP = 0.15;
const GAP_SATURATION = 3;

/** Weakness 0..1(+bump) — higher means this chapter deserves attention
 *  sooner. */
export function weaknessScore(row: CurriculumRow): number {
  const drill =
    (row.attempts - row.correct + 0.5 * PRIOR_WEIGHT) /
    (row.attempts + PRIOR_WEIGHT);
  const baseline = row.baselineWeakness ?? 0.5;
  const gaps = GAP_BUMP * Math.min(1, row.flaggedGaps / GAP_SATURATION);
  return (
    W_DRILL * drill + W_BASELINE * baseline + W_LADDER * row.ladderGap + gaps
  );
}

export function qualifiesForTestOut(row: CurriculumRow): boolean {
  return (
    !row.testPassed &&
    row.attempts >= TEST_OUT_MIN_ATTEMPTS &&
    row.correct / row.attempts >= TEST_OUT_ACCURACY
  );
}

/** What to do on a chapter, given its state: prove it when the evidence
 *  or the finished checklist says the content is in place; finish an
 *  opened chapter; otherwise read it. */
export function actionFor(row: CurriculumRow): CurriculumAction {
  if (qualifiesForTestOut(row) || row.checklistDone) return "test";
  if (row.read) return "finish";
  return "read";
}

/** Rows must arrive in canonical chapter order — ties in weakness fall
 *  back to that order, so a fresh database starts at chapter 1. */
export function computeCurriculum(rows: CurriculumRow[]): CurriculumPlan {
  const testOut = rows.filter(qualifiesForTestOut).map((r) => r.subtopic);
  const unpassed = rows.filter((r) => !r.testPassed);
  let next: CurriculumPlan["next"] = null;
  if (unpassed.length > 0) {
    let best = unpassed[0];
    let bestScore = weaknessScore(best);
    for (const row of unpassed.slice(1)) {
      const score = weaknessScore(row);
      if (score > bestScore + 1e-12) {
        best = row;
        bestScore = score;
      }
    }
    next = { subtopic: best.subtopic, action: actionFor(best) };
  }
  return {
    next,
    testOut,
    passed: rows.length - unpassed.length,
    total: rows.length,
  };
}
