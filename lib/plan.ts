import {
  FUNDAMENTAL_SKILLS,
  type FundamentalSkill,
} from "./taxonomy.ts";
import {
  computeCurriculum,
  type CurriculumPlan,
  type CurriculumRow,
} from "./curriculum.ts";
import type { PatternCategoryKey } from "./generators/index.ts";

/**
 * F8 — the daily plan. A pure function: no AI, no randomness, no clock
 * reads. Same inputs → same plan.
 */

export type SkillRecord = { correct: number; total: number };

/** Training phase from days-to-test (Manhattan-style arc). */
export type TrainingPhase = "foundations" | "accuracy" | "speed" | "peak";

export function phaseOf(daysToTest: number | null): TrainingPhase | null {
  if (daysToTest == null) return null;
  if (daysToTest > 45) return "foundations";
  if (daysToTest > 21) return "accuracy";
  if (daysToTest > 7) return "speed";
  return "peak";
}

export const PHASE_LABELS: Record<TrainingPhase, string> = {
  foundations: "Foundations",
  accuracy: "Accuracy",
  speed: "Speed",
  peak: "Peak week",
};

export const PHASE_NOTES: Record<TrainingPhase, string> = {
  foundations:
    "Build coverage: clear the next chapter, pass its test, and keep every skill in rotation.",
  accuracy:
    "Error discipline: clear the redo queue daily and post-mortem every miss.",
  speed:
    "Pacing under pressure: timed sets every other day; decisions beat perfection.",
  peak: "Taper: light mixed review, takeaway deck, sleep. No new material.",
};

/** Official-mock milestones, in days before the test. The plan surfaces
 *  the next one; scores come only from importing the official report. */
const MOCK_MILESTONES = [35, 21, 10];

export function nextMock(
  daysToTest: number | null,
): { inDays: number; today: boolean } | null {
  if (daysToTest == null || daysToTest < 0) return null;
  const upcoming = MOCK_MILESTONES.filter((m) => m <= daysToTest);
  if (upcoming.length === 0) return null;
  const m = upcoming[0];
  return { inDays: daysToTest - m, today: daysToTest === m };
}

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
  /** Local-calendar days since the latest completed focused timed set. */
  daysSinceTimedSet: number | null;
  /** Lifetime verified focused attempts; gates the first timed-set recommendation. */
  focusedAttemptCount: number;
  /** @deprecated Retained for callers that still display the old cadence. */
  dayIndex: number;
  /** Current pattern-trainer ELO per category. */
  eloByCategory: Record<PatternCategoryKey, number>;
  /** Per-chapter curriculum evidence, in canonical chapter order. */
  curriculum: CurriculumRow[];
};

export type DailyPlan = {
  phase: TrainingPhase | null;
  /** Next official-mock milestone, when a test date is set. */
  mock: { inDays: number; today: boolean } | null;
  patternRounds: PatternCategoryKey[];
  drill: {
    total: number;
    bySkill: Array<{ skill: FundamentalSkill; count: number }>;
  };
  weights: Record<FundamentalSkill, number>;
  dueRedoCount: number;
  /** Completed-session-aware timed-set schedule. */
  timed: {
    due: boolean;
    inDays: number;
    cadenceDays: number;
  };
  /** @deprecated Use `timed.due`; retained while UI callers migrate. */
  timedSetToday: boolean;
  /** Which chapter to study next, and any test-out shortcuts. */
  curriculum: CurriculumPlan;
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
    if (override != null && override >= 0) {
      // Manual override wins outright; the 5% floor still applies below.
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
    weights[skill] = raw[skill] / sum;
  }
  // Pin skills to the 5% floor, redistributing the rest proportionally so
  // the floor holds exactly after normalization. Converges in ≤ 4 passes.
  for (let pass = 0; pass < FUNDAMENTAL_SKILLS.length; pass++) {
    const pinned = FUNDAMENTAL_SKILLS.filter(
      (k) => weights[k] <= WEIGHT_FLOOR + 1e-12,
    );
    const free = FUNDAMENTAL_SKILLS.filter((k) => !pinned.includes(k));
    if (free.length === 0) {
      for (const skill of FUNDAMENTAL_SKILLS) weights[skill] = 0.25;
      return weights;
    }
    const freeBudget = 1 - WEIGHT_FLOOR * pinned.length;
    const freeSum = free.reduce((s, k) => s + weights[k], 0);
    let violated = false;
    for (const skill of pinned) weights[skill] = WEIGHT_FLOOR;
    for (const skill of free) {
      weights[skill] = (weights[skill] / freeSum) * freeBudget;
      if (weights[skill] < WEIGHT_FLOOR) violated = true;
    }
    if (!violated) break;
  }
  return weights;
}

/** Drill volume follows the phase arc: ramp through Speed, taper in
 *  Peak week (fresh volume days before the test costs more than it pays). */
function drillTotal(daysToTest: number | null): number {
  const phase = phaseOf(daysToTest);
  if (phase == null) return 12;
  if (phase === "peak") return 10;
  if (phase === "speed") return 16;
  if (phase === "accuracy") return 14;
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

  // The Speed phase forces timed work at least every other day, whatever
  // the configured cadence; Peak week backs off to every third day.
  const phase = phaseOf(inputs.daysToTest);
  const effectiveCadence =
    phase === "speed"
      ? Math.min(inputs.cadenceDays, 2)
      : phase === "peak"
        ? Math.max(inputs.cadenceDays, 3)
        : inputs.cadenceDays;

  // A learner with no timed history should first build one full section's
  // worth of focused evidence. After that, cadence is anchored to the last
  // completed focused timed set instead of an arbitrary epoch-day modulo.
  const timedDue =
    inputs.daysSinceTimedSet == null
      ? inputs.focusedAttemptCount >= 21
      : inputs.daysSinceTimedSet >= effectiveCadence;
  const timed = {
    due: timedDue,
    inDays: timedDue
      ? 0
      : inputs.daysSinceTimedSet == null
        ? effectiveCadence
        : Math.max(0, effectiveCadence - inputs.daysSinceTimedSet),
    cadenceDays: effectiveCadence,
  };

  return {
    phase,
    mock: nextMock(inputs.daysToTest),
    patternRounds,
    drill: {
      total,
      bySkill: bySkill.map(({ skill, count }) => ({ skill, count })),
    },
    weights,
    dueRedoCount: inputs.dueRedoCount,
    timed,
    timedSetToday: timed.due,
    curriculum: computeCurriculum(inputs.curriculum),
  };
}
