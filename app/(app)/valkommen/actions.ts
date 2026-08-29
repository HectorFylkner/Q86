"use server";

import { requireScoped } from "@/lib/auth/session";
import { computeDailyPlan } from "@/lib/plan";
import { daysToTest, gatherPlanInputs } from "@/lib/plan-server";
import type { PlanPreviewDay } from "@/lib/diagnostic-plan";

/**
 * The first week for an account that has just answered onboarding.
 *
 * Unlike the public diagnostic's preview, this reads the account's real
 * inputs — the test date it just stored, the cadence it just chose — and
 * runs the same planner the dashboard runs. Nothing here is a mock-up.
 */
export async function weekForAccountAction(): Promise<{
  days: PlanPreviewDay[];
  daysToTest: number | null;
}> {
  const { sdb } = await requireScoped();
  const inputs = await gatherPlanInputs(sdb);
  const left = await daysToTest(sdb);
  const today = inputs.dayIndex;

  const days: PlanPreviewDay[] = [];
  for (let offset = 0; offset < 7; offset++) {
    const plan = computeDailyPlan({
      ...inputs,
      daysToTest: left === null ? null : left - offset,
      dayIndex: today + offset,
      dueRedoCount: offset === 0 ? inputs.dueRedoCount : 1,
    });
    days.push({
      day: offset + 1,
      drillTotal: plan.drill.total,
      patternRounds: plan.patternRounds,
      timedSet: plan.timedSetToday,
      review: offset > 0 || inputs.dueRedoCount > 0,
    });
  }
  return { days, daysToTest: left };
}
