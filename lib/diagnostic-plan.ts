import { ELO_START } from "./elo.ts";
import { computeDailyPlan, type DailyPlan } from "./plan.ts";
import type { DiagnosticResult } from "./diagnostic.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";
import {
  PATTERN_CATEGORY_KEYS,
  type PatternCategoryKey,
} from "./generators/index.ts";

/**
 * The first week of the study plan, from a diagnostic and nothing else.
 *
 * This calls the product's own `computeDailyPlan` rather than sketching a
 * plausible-looking week: the plan a visitor is shown before signing up
 * has to be the plan they would actually get, or the preview is a lie.
 * The only synthesis is the shape of the inputs — a diagnostic gives
 * accuracy per skill and nothing else, so the remaining fields take their
 * empty values.
 */

export type PlanPreviewDay = {
  day: number;
  drillTotal: number;
  patternRounds: PatternCategoryKey[];
  timedSet: boolean;
  review: boolean;
};

export function previewWeek(
  result: DiagnosticResult,
  daysToTest: number | null = null,
): { days: PlanPreviewDay[]; weights: DailyPlan["weights"] } {
  const skillAccuracy = Object.fromEntries(
    FUNDAMENTAL_SKILLS.map((skill) => {
      const record = result.perSkill.find((r) => r.skill === skill);
      return [skill, { correct: record?.correct ?? 0, total: record?.total ?? 0 }];
    }),
  ) as Record<FundamentalSkill, { correct: number; total: number }>;

  const elo = Object.fromEntries(
    PATTERN_CATEGORY_KEYS.map((key: PatternCategoryKey) => [key, ELO_START]),
  ) as Record<PatternCategoryKey, number>;

  // Day 0 of the preview is "today", so the cadence lands where it would
  // for someone starting now.
  const today = Math.floor(Date.now() / 86_400_000);
  const days: PlanPreviewDay[] = [];
  let weights = {} as DailyPlan["weights"];

  for (let offset = 0; offset < 7; offset++) {
    const plan = computeDailyPlan({
      daysToTest: daysToTest === null ? null : daysToTest - offset,
      skillAccuracy,
      baselineWeakness: null,
      weightOverrides: null,
      // Nothing has been drilled yet, so nothing is due on day one; from
      // day two the previous day's misses are what review means.
      dueRedoCount: offset === 0 ? 0 : 1,
      cadenceDays: 7,
      dayIndex: today + offset,
      eloByCategory: elo,
    });
    if (offset === 0) weights = plan.weights;
    days.push({
      day: offset + 1,
      drillTotal: plan.drill.total,
      patternRounds: plan.patternRounds,
      timedSet: plan.timedSetToday,
      review: offset > 0,
    });
  }

  return { days, weights };
}
