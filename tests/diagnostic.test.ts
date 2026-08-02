import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  DIAGNOSTIC_PER_SKILL,
  DIAGNOSTIC_SIZE,
  DIAGNOSTIC_WINDOW,
  diagnosticWeakness,
  type DiagnosticResult,
} from "../lib/diagnostic-config.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "../lib/taxonomy.ts";

function result(
  bySkill: Partial<Record<FundamentalSkill, [number, number]>>,
): DiagnosticResult {
  const full = {} as DiagnosticResult["bySkill"];
  for (const skill of FUNDAMENTAL_SKILLS) {
    const pair = bySkill[skill];
    full[skill] = pair
      ? { correct: pair[0], total: pair[1] }
      : { correct: 0, total: 0 };
  }
  const total = Object.values(full).reduce((s, r) => s + r.total, 0);
  const correct = Object.values(full).reduce((s, r) => s + r.correct, 0);
  return { takenAt: 0, total, correct, bySkill: full };
}

describe("placement diagnostic", () => {
  test("covers every fundamental skill equally", () => {
    assert.equal(DIAGNOSTIC_SIZE, DIAGNOSTIC_PER_SKILL * FUNDAMENTAL_SKILLS.length);
    assert.ok(DIAGNOSTIC_PER_SKILL >= 3, "fewer than 3 cannot separate skill from luck");
  });

  test("it samples the middle of the range first", () => {
    // A diagnostic exists to discriminate. Starting at D1 or D5 would
    // put most of the signal in items nearly everyone gets right or
    // nearly everyone gets wrong.
    assert.equal(DIAGNOSTIC_WINDOW[0], 3);
    assert.ok(!DIAGNOSTIC_WINDOW.includes(1));
  });

  test("perfect and zero scores map to the ends of the weakness scale", () => {
    const perfect = diagnosticWeakness(
      result(Object.fromEntries(FUNDAMENTAL_SKILLS.map((s) => [s, [4, 4]]))),
    );
    const zero = diagnosticWeakness(
      result(Object.fromEntries(FUNDAMENTAL_SKILLS.map((s) => [s, [0, 4]]))),
    );
    for (const skill of FUNDAMENTAL_SKILLS) {
      assert.equal(perfect[skill], 0, "all correct is no weakness");
      assert.equal(zero[skill], 1, "all wrong is maximum weakness");
    }
  });

  test("weakness rises as accuracy falls, monotonically", () => {
    const prev: number[] = [];
    for (const correct of [4, 3, 2, 1, 0]) {
      const w = diagnosticWeakness(result({ rates_ratio_percent: [correct, 4] }));
      prev.push(w.rates_ratio_percent);
    }
    for (let i = 1; i < prev.length; i++) {
      assert.ok(prev[i] > prev[i - 1], `weakness must rise: ${prev}`);
    }
  });

  test("an unmeasured skill is neutral, never assumed weak", () => {
    // The one thing a baseline must not do is invent data. A skill the
    // diagnostic never asked about gets 0.5, not 1.
    const w = diagnosticWeakness(result({ rates_ratio_percent: [0, 4] }));
    assert.equal(w.rates_ratio_percent, 1);
    for (const skill of FUNDAMENTAL_SKILLS) {
      if (skill === "rates_ratio_percent") continue;
      assert.equal(w[skill], 0.5, `${skill} was never asked about`);
    }
  });

  test("every weight is a usable probability", () => {
    const w = diagnosticWeakness(
      result({
        rates_ratio_percent: [1, 4],
        value_order_factors: [3, 4],
        equal_unequal_alg: [2, 4],
        counting_sets_series_prob_stats: [4, 4],
      }),
    );
    for (const skill of FUNDAMENTAL_SKILLS) {
      assert.ok(
        w[skill] >= 0 && w[skill] <= 1 && Number.isFinite(w[skill]),
        `${skill}: ${w[skill]}`,
      );
    }
    // And it ranks them the way the scores do.
    assert.ok(w.rates_ratio_percent > w.equal_unequal_alg);
    assert.ok(w.equal_unequal_alg > w.value_order_factors);
    assert.ok(w.value_order_factors > w.counting_sets_series_prob_stats);
  });

  test("a zero-total result does not divide by zero", () => {
    const w = diagnosticWeakness(result({}));
    for (const skill of FUNDAMENTAL_SKILLS) assert.equal(w[skill], 0.5);
  });
});
