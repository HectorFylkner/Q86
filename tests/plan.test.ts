import assert from "node:assert/strict";
import { test } from "node:test";
import { PATTERN_CATEGORY_KEYS } from "../lib/generators/index.ts";
import type { PatternCategoryKey } from "../lib/generators/index.ts";
import {
  computeDailyPlan,
  computeWeights,
  effectiveCadence,
  nextMock,
  phaseOf,
  type PlanInputs,
  type SkillRecord,
} from "../lib/plan.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "../lib/taxonomy.ts";

function skillRecords(
  overrides: Partial<Record<FundamentalSkill, SkillRecord>> = {},
): Record<FundamentalSkill, SkillRecord> {
  const out = {} as Record<FundamentalSkill, SkillRecord>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    out[skill] = overrides[skill] ?? { correct: 0, total: 0 };
  }
  return out;
}

function eloRecord(
  overrides: Partial<Record<PatternCategoryKey, number>> = {},
): Record<PatternCategoryKey, number> {
  const out = {} as Record<PatternCategoryKey, number>;
  for (const key of PATTERN_CATEGORY_KEYS) out[key] = overrides[key] ?? 1200;
  return out;
}

function baseInputs(patch: Partial<PlanInputs> = {}): PlanInputs {
  return {
    daysToTest: null,
    skillAccuracy: skillRecords(),
    baselineWeakness: null,
    weightOverrides: null,
    dueRedoCount: 0,
    cadenceDays: 3,
    dayIndex: 1,
    eloByCategory: eloRecord(),
    ...patch,
  };
}

test("phaseOf boundaries", () => {
  assert.equal(phaseOf(null), null);
  assert.equal(phaseOf(60), "foundations");
  assert.equal(phaseOf(46), "foundations");
  assert.equal(phaseOf(45), "accuracy");
  assert.equal(phaseOf(22), "accuracy");
  assert.equal(phaseOf(21), "speed");
  assert.equal(phaseOf(8), "speed");
  assert.equal(phaseOf(7), "peak");
  assert.equal(phaseOf(0), "peak");
});

test("nextMock surfaces the first milestone at or below days-to-test", () => {
  assert.equal(nextMock(null), null);
  assert.equal(nextMock(-1), null);
  assert.deepEqual(nextMock(40), { inDays: 5, today: false });
  assert.deepEqual(nextMock(35), { inDays: 0, today: true });
  assert.deepEqual(nextMock(20), { inDays: 10, today: false });
  assert.equal(nextMock(5), null);
});

test("computeWeights: no data anywhere → equal quarters", () => {
  const weights = computeWeights({
    skillAccuracy: skillRecords(),
    baselineWeakness: null,
    weightOverrides: null,
  });
  for (const skill of FUNDAMENTAL_SKILLS) {
    assert.ok(Math.abs(weights[skill] - 0.25) < 1e-9);
  }
});

test("computeWeights: a perfect skill pins to the 5% floor, sum stays 1", () => {
  const weights = computeWeights({
    skillAccuracy: skillRecords({
      value_order_factors: { correct: 30, total: 30 },
    }),
    baselineWeakness: null,
    weightOverrides: null,
  });
  assert.ok(Math.abs(weights.value_order_factors - 0.05) < 1e-9);
  const sum = FUNDAMENTAL_SKILLS.reduce((s, k) => s + weights[k], 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  for (const skill of FUNDAMENTAL_SKILLS) {
    assert.ok(weights[skill] >= 0.05 - 1e-9);
  }
});

test("computeWeights: manual override wins over platform data", () => {
  const weights = computeWeights({
    skillAccuracy: skillRecords({
      // A terrible record would normally dominate the weights…
      equal_unequal_alg: { correct: 0, total: 30 },
    }),
    baselineWeakness: null,
    weightOverrides: { equal_unequal_alg: 0 },
  });
  // …but the explicit 0 override pins algebra to the floor.
  assert.ok(Math.abs(weights.equal_unequal_alg - 0.05) < 1e-9);
});

test("computeWeights blends baseline 50/50 with platform weakness", () => {
  const noBaseline = computeWeights({
    skillAccuracy: skillRecords({
      rates_ratio_percent: { correct: 10, total: 20 }, // weakness 0.5
    }),
    baselineWeakness: null,
    weightOverrides: null,
  });
  const withBaseline = computeWeights({
    skillAccuracy: skillRecords({
      rates_ratio_percent: { correct: 10, total: 20 },
    }),
    baselineWeakness: {
      rates_ratio_percent: 1, // weakest possible in the report
      value_order_factors: 0.5,
      equal_unequal_alg: 0.5,
      counting_sets_series_prob_stats: 0.5,
    },
    weightOverrides: null,
  });
  assert.ok(
    withBaseline.rates_ratio_percent > noBaseline.rates_ratio_percent,
  );
});

test("computeDailyPlan: drill counts sum to the phase total", () => {
  for (const [daysToTest, expected] of [
    [null, 12],
    [60, 12],
    [30, 14],
    [10, 16],
    [3, 10],
  ] as const) {
    const plan = computeDailyPlan(baseInputs({ daysToTest }));
    assert.equal(plan.drill.total, expected);
    const sum = plan.drill.bySkill.reduce((s, x) => s + x.count, 0);
    assert.equal(sum, expected);
  }
});

test("computeDailyPlan: pattern rounds pick the two lowest-ELO categories", () => {
  const [a, b, c] = PATTERN_CATEGORY_KEYS;
  const plan = computeDailyPlan(
    baseInputs({ eloByCategory: eloRecord({ [a]: 900, [b]: 1500, [c]: 1000 }) }),
  );
  assert.deepEqual(plan.patternRounds, [a, c]);
});

test("effectiveCadence: speed forces ≤2, peak forces ≥3", () => {
  assert.equal(effectiveCadence("speed", 7), 2);
  assert.equal(effectiveCadence("speed", 1), 1);
  assert.equal(effectiveCadence("peak", 1), 3);
  assert.equal(effectiveCadence("peak", 7), 7);
  assert.equal(effectiveCadence("accuracy", 4), 4);
  assert.equal(effectiveCadence(null, 3), 3);
});

test("computeDailyPlan: timed-set day flips on the effective cadence", () => {
  const onDay = computeDailyPlan(baseInputs({ dayIndex: 6, cadenceDays: 3 }));
  assert.equal(onDay.timedSetToday, true);
  const offDay = computeDailyPlan(baseInputs({ dayIndex: 7, cadenceDays: 3 }));
  assert.equal(offDay.timedSetToday, false);
  // Speed phase: cadence 7 tightens to every other day.
  const speed = computeDailyPlan(
    baseInputs({ daysToTest: 10, cadenceDays: 7, dayIndex: 4 }),
  );
  assert.equal(speed.effectiveCadenceDays, 2);
  assert.equal(speed.timedSetToday, true);
});
