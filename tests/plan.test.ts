import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  computeDailyPlan,
  computeWeights,
  nextMock,
  phaseOf,
  type PlanInputs,
  type SkillRecord,
} from "../lib/plan.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "../lib/taxonomy.ts";
import { PATTERN_CATEGORY_KEYS, type PatternCategoryKey } from "../lib/generators/index.ts";

const evenAccuracy = (correct: number, total: number) =>
  Object.fromEntries(
    FUNDAMENTAL_SKILLS.map((s) => [s, { correct, total }]),
  ) as Record<FundamentalSkill, SkillRecord>;

const flatElo = Object.fromEntries(
  PATTERN_CATEGORY_KEYS.map((k) => [k, 1200]),
) as Record<PatternCategoryKey, number>;

const baseInputs = (over: Partial<PlanInputs> = {}): PlanInputs => ({
  daysToTest: 30,
  skillAccuracy: evenAccuracy(15, 30),
  baselineWeakness: null,
  weightOverrides: null,
  dueRedoCount: 0,
  cadenceDays: 3,
  dayIndex: 0,
  eloByCategory: flatElo,
  ...over,
});

/**
 * The daily plan is the thing that decides what gets practised. Its
 * weighting is the single most consequential arithmetic in the platform:
 * if it silently stops tracking weakness, training keeps happening and
 * stops working, with nothing on screen to say so.
 */
describe("plan weighting", () => {
  test("weights always sum to one", () => {
    for (const acc of [
      evenAccuracy(15, 30),
      evenAccuracy(0, 0),
      evenAccuracy(30, 30),
    ]) {
      const w = computeWeights({
        skillAccuracy: acc,
        baselineWeakness: null,
        weightOverrides: null,
      });
      const sum = FUNDAMENTAL_SKILLS.reduce((s, k) => s + w[k], 0);
      assert.ok(Math.abs(sum - 1) < 1e-9, `sum was ${sum}`);
    }
  });

  test("equal records give equal weights", () => {
    const w = computeWeights({
      skillAccuracy: evenAccuracy(15, 30),
      baselineWeakness: null,
      weightOverrides: null,
    });
    for (const skill of FUNDAMENTAL_SKILLS) {
      assert.ok(Math.abs(w[skill] - 0.25) < 1e-9);
    }
  });

  test("the weaker skill gets the larger share", () => {
    const acc = evenAccuracy(27, 30);
    acc.rates_ratio_percent = { correct: 9, total: 30 };
    const w = computeWeights({
      skillAccuracy: acc,
      baselineWeakness: null,
      weightOverrides: null,
    });
    for (const skill of FUNDAMENTAL_SKILLS) {
      if (skill === "rates_ratio_percent") continue;
      assert.ok(
        w.rates_ratio_percent > w[skill],
        `${skill} (${w[skill]}) outweighed the weak skill (${w.rates_ratio_percent})`,
      );
    }
  });

  test("no skill ever drops below the 5% maintenance floor", () => {
    // One skill perfect, the rest struggling — the perfect one must still
    // stay in rotation, or a mastered topic silently rots.
    const acc = evenAccuracy(5, 30);
    acc.value_order_factors = { correct: 30, total: 30 };
    const w = computeWeights({
      skillAccuracy: acc,
      baselineWeakness: null,
      weightOverrides: null,
    });
    for (const skill of FUNDAMENTAL_SKILLS) {
      assert.ok(w[skill] >= 0.05 - 1e-9, `${skill} fell to ${w[skill]}`);
    }
    assert.ok(Math.abs(FUNDAMENTAL_SKILLS.reduce((s, k) => s + w[k], 0) - 1) < 1e-9);
  });

  test("every skill perfect still leaves a legal distribution", () => {
    const w = computeWeights({
      skillAccuracy: evenAccuracy(30, 30),
      baselineWeakness: null,
      weightOverrides: null,
    });
    const sum = FUNDAMENTAL_SKILLS.reduce((s, k) => s + w[k], 0);
    assert.ok(Math.abs(sum - 1) < 1e-9);
    for (const skill of FUNDAMENTAL_SKILLS) assert.ok(w[skill] >= 0.05 - 1e-9);
  });

  test("no platform data at all falls back to an even split", () => {
    const w = computeWeights({
      skillAccuracy: evenAccuracy(0, 0),
      baselineWeakness: null,
      weightOverrides: null,
    });
    for (const skill of FUNDAMENTAL_SKILLS) {
      assert.ok(Math.abs(w[skill] - 0.25) < 1e-9);
    }
  });

  test("an imported baseline is blended 50/50 with platform accuracy", () => {
    const acc = evenAccuracy(15, 30); // platform weakness 0.5 everywhere
    const baseline = Object.fromEntries(
      FUNDAMENTAL_SKILLS.map((s) => [s, 0.5]),
    ) as Record<FundamentalSkill, number>;
    baseline.equal_unequal_alg = 1; // weakest on the report
    const w = computeWeights({
      skillAccuracy: acc,
      baselineWeakness: baseline,
      weightOverrides: null,
    });
    for (const skill of FUNDAMENTAL_SKILLS) {
      if (skill === "equal_unequal_alg") continue;
      assert.ok(w.equal_unequal_alg > w[skill]);
    }
  });

  test("a manual override wins over the measured record", () => {
    const acc = evenAccuracy(30, 30); // everything mastered
    const w = computeWeights({
      skillAccuracy: acc,
      baselineWeakness: null,
      weightOverrides: { probability: 1 } as never,
    });
    // The override key must be a real skill for this to mean anything.
    const w2 = computeWeights({
      skillAccuracy: acc,
      baselineWeakness: null,
      weightOverrides: { counting_sets_series_prob_stats: 1 },
    });
    assert.ok(Math.abs(FUNDAMENTAL_SKILLS.reduce((s, k) => s + w[k], 0) - 1) < 1e-9);
    for (const skill of FUNDAMENTAL_SKILLS) {
      if (skill === "counting_sets_series_prob_stats") continue;
      assert.ok(w2.counting_sets_series_prob_stats > w2[skill]);
    }
  });
});

describe("daily plan", () => {
  test("the drill counts add up to the stated total, always", () => {
    for (const days of [null, 90, 40, 20, 5, 0]) {
      for (const acc of [evenAccuracy(15, 30), evenAccuracy(0, 0), evenAccuracy(2, 30)]) {
        const plan = computeDailyPlan(baseInputs({ daysToTest: days, skillAccuracy: acc }));
        const sum = plan.drill.bySkill.reduce((s, x) => s + x.count, 0);
        assert.equal(sum, plan.drill.total, `days=${days}`);
      }
    }
  });

  test("every skill appears in the breakdown, even at zero", () => {
    const plan = computeDailyPlan(baseInputs());
    assert.equal(plan.drill.bySkill.length, FUNDAMENTAL_SKILLS.length);
  });

  test("the phase arc follows days to test", () => {
    assert.equal(phaseOf(null), null);
    assert.equal(phaseOf(90), "foundations");
    assert.equal(phaseOf(46), "foundations");
    assert.equal(phaseOf(45), "accuracy");
    assert.equal(phaseOf(22), "accuracy");
    assert.equal(phaseOf(21), "speed");
    assert.equal(phaseOf(8), "speed");
    assert.equal(phaseOf(7), "peak");
    assert.equal(phaseOf(0), "peak");
  });

  test("peak week tapers volume below the speed phase", () => {
    const speed = computeDailyPlan(baseInputs({ daysToTest: 15 })).drill.total;
    const peak = computeDailyPlan(baseInputs({ daysToTest: 3 })).drill.total;
    assert.ok(peak < speed, `peak ${peak} was not below speed ${speed}`);
  });

  test("the speed phase forces timed work at least every other day", () => {
    // Even with a lazy 7-day cadence configured.
    const hits = [0, 1, 2, 3].filter(
      (dayIndex) =>
        computeDailyPlan(baseInputs({ daysToTest: 15, cadenceDays: 7, dayIndex }))
          .timedSetToday,
    );
    assert.ok(hits.length >= 2, `only ${hits.length} timed days in four`);
  });

  test("peak week backs the cadence off to no tighter than every third day", () => {
    const hits = [0, 1, 2, 3, 4, 5].filter(
      (dayIndex) =>
        computeDailyPlan(baseInputs({ daysToTest: 3, cadenceDays: 1, dayIndex }))
          .timedSetToday,
    );
    assert.equal(hits.length, 2, `expected 2 timed days in six, got ${hits.length}`);
  });

  test("pattern rounds pull the two lowest-rated categories", () => {
    const elo = { ...flatElo };
    const keys = PATTERN_CATEGORY_KEYS;
    elo[keys[3]] = 900;
    elo[keys[6]] = 950;
    const plan = computeDailyPlan(baseInputs({ eloByCategory: elo }));
    assert.deepEqual(plan.patternRounds, [keys[3], keys[6]]);
  });

  test("the plan is a pure function of its inputs", () => {
    const inputs = baseInputs({ daysToTest: 23, dayIndex: 7 });
    const a = computeDailyPlan(inputs);
    const b = computeDailyPlan(inputs);
    assert.deepEqual(a, b);
  });

  test("mock milestones are the next one still ahead", () => {
    assert.equal(nextMock(null), null);
    assert.deepEqual(nextMock(40), { inDays: 5, today: false });
    assert.deepEqual(nextMock(35), { inDays: 0, today: true });
    assert.deepEqual(nextMock(30), { inDays: 9, today: false });
    assert.deepEqual(nextMock(10), { inDays: 0, today: true });
    assert.equal(nextMock(5), null);
  });
});
