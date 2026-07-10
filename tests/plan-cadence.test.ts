import assert from "node:assert/strict";
import test from "node:test";
import { computeDailyPlan, type PlanInputs } from "../lib/plan.ts";
import { PATTERN_CATEGORY_KEYS } from "../lib/generators/index.ts";
import { FUNDAMENTAL_SKILLS } from "../lib/taxonomy.ts";

function inputs(overrides: Partial<PlanInputs> = {}): PlanInputs {
  return {
    daysToTest: 30,
    skillAccuracy: Object.fromEntries(
      FUNDAMENTAL_SKILLS.map((skill) => [skill, { correct: 0, total: 0 }]),
    ) as PlanInputs["skillAccuracy"],
    baselineWeakness: null,
    weightOverrides: null,
    dueRedoCount: 0,
    cadenceDays: 3,
    daysSinceTimedSet: null,
    focusedAttemptCount: 0,
    dayIndex: 0,
    eloByCategory: Object.fromEntries(
      PATTERN_CATEGORY_KEYS.map((key) => [key, 1200]),
    ) as PlanInputs["eloByCategory"],
    ...overrides,
  };
}

test("first timed section waits for one section of focused evidence", () => {
  assert.equal(
    computeDailyPlan(inputs({ focusedAttemptCount: 20 })).timed.due,
    false,
  );
  assert.equal(
    computeDailyPlan(inputs({ focusedAttemptCount: 21 })).timed.due,
    true,
  );
});

test("timed cadence anchors to the latest completed section", () => {
  const plan = computeDailyPlan(
    inputs({ daysSinceTimedSet: 2, focusedAttemptCount: 60 }),
  );
  assert.deepEqual(plan.timed, {
    due: false,
    inDays: 1,
    cadenceDays: 3,
  });
});

test("speed phase tightens cadence to every other day", () => {
  const plan = computeDailyPlan(
    inputs({
      daysToTest: 14,
      cadenceDays: 7,
      daysSinceTimedSet: 2,
      focusedAttemptCount: 60,
    }),
  );
  assert.deepEqual(plan.timed, {
    due: true,
    inDays: 0,
    cadenceDays: 2,
  });
  assert.equal(plan.timedSetToday, true);
});

test("peak week never schedules full sections more often than every three days", () => {
  const plan = computeDailyPlan(
    inputs({
      daysToTest: 5,
      cadenceDays: 2,
      daysSinceTimedSet: 2,
      focusedAttemptCount: 60,
    }),
  );
  assert.deepEqual(plan.timed, {
    due: false,
    inDays: 1,
    cadenceDays: 3,
  });
});
