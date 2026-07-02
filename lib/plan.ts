import {
  FUNDAMENTAL_SKILLS,
  type FundamentalSkill,
} from "./taxonomy.ts";
import type { PatternCategoryKey } from "./generators/index.ts";

/**
 * F8 — the daily plan. A pure function: no AI, no randomness, no clock
 * reads. Same inputs → same plan.
 */

export type SkillRecord = { correct: number; total: number };

export type PlanInputs = {
  /** Whole days until test_date; null when unset. */
  daysToTest: number | null;
  /** Rolling last-30-attempts accuracy per skill (platform data). */
  skillAccuracy: Record<FundamentalSkill, SkillRecord>;
  /** Baseline weakness per skill from the imported report, 0..1
   *  (1 = weakest); null when nothing imported. */
  baselineWeakness: Record<FundamentalSkill, number> | null;
  /** Manual weight overrides from settings (0..1 per skill), or null. */
  weightOverrides: Partial<Record<FundamentalSkill, number>> | null;
  /** Redo-queue items due now. */
  dueRedoCount: number;
  /** Timed-set cadence in days (settings.timed_set_cadence). */
  cadenceDays: number;
  /** Whole days since the Unix epoch, for the cadence schedule. */
  dayIndex: number;
  /** Current pattern-trainer ELO per category. */
  eloByCategory: Record<PatternCategoryKey, number>;
};

export type DailyPlan = {
  patternRounds: PatternCategoryKey[];
  drill: {
    total: number;
    bySkill: Array<{ skill: FundamentalSkill; count: number }>;
  };
  weights: Record<FundamentalSkill, number>;
  dueRedoCount: number;
  timedSetToday: boolean;
};

/** Floor 5% per skill so every skill always gets maintenance reps. */
const WEIGHT_FLOOR = 0.05;

export function computeWeights(
  inputs: Pick<
    PlanInputs,
    "skillAccuracy" | "baselineWeakness" | "weightOverrides"
  >,
): Record<FundamentalSkill, number> {
  const raw: Record<FundamentalSkill, number> = {} as Record<
    FundamentalSkill,
    number
  >;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const override = inputs.weightOverrides?.[skill];
    if (override != null && override > 0) {
      raw[skill] = override;
      continue;
    }
    const record = inputs.skillAccuracy[skill];
    // No platform data yet → neutral 0.5 weakness.
    const platformWeakness =
      record.total > 0 ? 1 - record.correct / record.total : 0.5;
    const baseline = inputs.baselineWeakness?.[skill];
    // Blend 50/50 with the imported baseline when it exists.
    raw[skill] =
      baseline != null ? 0.5 * platformWeakness + 0.5 * baseline : platformWeakness;
  }

  const sum = FUNDAMENTAL_SKILLS.reduce((s, k) => s + raw[k], 0);
  const weights: Record<FundamentalSkill, number> = {} as Record<
    FundamentalSkill,
    number
  >;
  if (sum <= 0) {
    for (const skill of FUNDAMENTAL_SKILLS) weights[skill] = 0.25;
    return weights;
  }
  for (const skill of FUNDAMENTAL_SKILLS) {
    weights[skill] = Math.max(WEIGHT_FLOOR, raw[skill] / sum);
  }
  // Renormalize after flooring.
  const floored = FUNDAMENTAL_SKILLS.reduce((s, k) => s + weights[k], 0);
  for (const skill of FUNDAMENTAL_SKILLS) weights[skill] /= floored;
  return weights;
}

/** Drill volume scales as the test approaches. */
function drillTotal(daysToTest: number | null): number {
  if (daysToTest == null) return 12;
  if (daysToTest <= 7) return 20;
  if (daysToTest <= 14) return 16;
  return 12;
}

export function computeDailyPlan(inputs: PlanInputs): DailyPlan {
  const weights = computeWeights(inputs);

  const total = drillTotal(inputs.daysToTest);
  // Largest-remainder apportionment keeps the counts summing to total.
  const exact = FUNDAMENTAL_SKILLS.map((skill) => ({
    skill,
    exact: weights[skill] * total,
  }));
  const bySkill = exact.map(({ skill, exact: e }) => ({
    skill,
    count: Math.floor(e),
    remainder: e - Math.floor(e),
  }));
  let assigned = bySkill.reduce((s, x) => s + x.count, 0);
  const byRemainder = [...bySkill].sort((a, b) => b.remainder - a.remainder);
  for (let i = 0; assigned < total; i = (i + 1) % byRemainder.length) {
    byRemainder[i].count++;
    assigned++;
  }

  // Two lowest-ELO categories get a round each.
  const patternRounds = (
    Object.entries(inputs.eloByCategory) as [PatternCategoryKey, number][]
  )
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(([key]) => key);

  return {
    patternRounds,
    drill: {
      total,
      bySkill: bySkill.map(({ skill, count }) => ({ skill, count })),
    },
    weights,
    dueRedoCount: inputs.dueRedoCount,
    timedSetToday:
      inputs.cadenceDays > 0 && inputs.dayIndex % inputs.cadenceDays === 0,
  };
}
