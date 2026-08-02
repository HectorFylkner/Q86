import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";

/** Pure half of the placement diagnostic: no database, so it is testable
 *  and importable from anywhere. lib/diagnostic.ts does the selecting. */

export const DIAGNOSTIC_PER_SKILL = 4;
export const DIAGNOSTIC_SIZE = DIAGNOSTIC_PER_SKILL * FUNDAMENTAL_SKILLS.length;

/** Middle difficulty first, widening outward only if the bank is thin.
 *  A diagnostic is trying to *discriminate*, and items nearly everyone
 *  gets right or nearly everyone gets wrong discriminate nothing. */
export const DIAGNOSTIC_WINDOW = [3, 4, 2, 5];

export type DiagnosticResult = {
  takenAt: number;
  total: number;
  correct: number;
  /** Per skill: how many right out of how many asked. */
  bySkill: Record<FundamentalSkill, { correct: number; total: number }>;
};

/**
 * The diagnostic expressed as the same 0–1 weakness weights an imported
 * score report produces, so the planner consumes it through the path it
 * already has rather than growing a second one.
 *
 * A skill with no diagnostic items is 0.5 — neutral, not weak. Guessing
 * that an unmeasured skill is weak would be the diagnostic inventing
 * data, which is the one thing a baseline must never do.
 */
export function diagnosticWeakness(
  result: DiagnosticResult,
): Record<FundamentalSkill, number> {
  const out = {} as Record<FundamentalSkill, number>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const row = result.bySkill[skill];
    out[skill] = row && row.total > 0 ? 1 - row.correct / row.total : 0.5;
  }
  return out;
}
