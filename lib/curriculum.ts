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

/** Shrinkage prior for drill weakness: with few attempts the estimate
 *  regresses toward neutral 0.5 instead of swinging on 2-3 questions. */
const PRIOR_WEIGHT = 6;

/** Blend weights: live drill evidence dominates; the baseline report and
 *  ladder gaps refine. */
const W_DRILL = 0.5;
const W_BASELINE = 0.25;
const W_LADDER = 0.25;

/** Weakness 0..1 — higher means this chapter deserves attention sooner. */
export function weaknessScore(row: CurriculumRow): number {
  const drill =
    (row.attempts - row.correct + 0.5 * PRIOR_WEIGHT) /
    (row.attempts + PRIOR_WEIGHT);
  const baseline = row.baselineWeakness ?? 0.5;
  return W_DRILL * drill + W_BASELINE * baseline + W_LADDER * row.ladderGap;
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
