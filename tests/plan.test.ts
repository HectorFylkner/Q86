import { describe, expect, it } from "vitest";
import {
  phaseOf,
  nextMock,
  computeWeights,
  computeDailyPlan,
  type PlanInputs,
  type TrainingPhase,
} from "../lib/plan.ts";
import {
  FUNDAMENTAL_SKILLS,
  type FundamentalSkill,
} from "../lib/taxonomy.ts";
import {
  PATTERN_CATEGORY_KEYS,
  type PatternCategoryKey,
} from "../lib/generators/index.ts";

const [S0, S1, S2, S3] = FUNDAMENTAL_SKILLS;

function accuracy(
  per: Partial<Record<FundamentalSkill, { correct: number; total: number }>> = {},
): Record<FundamentalSkill, { correct: number; total: number }> {
  const out = {} as Record<FundamentalSkill, { correct: number; total: number }>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    out[skill] = per[skill] ?? { correct: 0, total: 0 };
  }
  return out;
}

function elo(
  per: Partial<Record<PatternCategoryKey, number>> = {},
): Record<PatternCategoryKey, number> {
  const out = {} as Record<PatternCategoryKey, number>;
  for (const key of PATTERN_CATEGORY_KEYS) out[key] = per[key] ?? 1200;
  return out;
}

function inputs(over: Partial<PlanInputs> = {}): PlanInputs {
  return {
    daysToTest: 30,
    skillAccuracy: accuracy(),
    baselineWeakness: null,
    weightOverrides: null,
    dueRedoCount: 0,
    cadenceDays: 3,
    dayIndex: 1,
    eloByCategory: elo(),
    ...over,
  };
}

function weightSum(w: Record<FundamentalSkill, number>): number {
  return FUNDAMENTAL_SKILLS.reduce((s, k) => s + w[k], 0);
}

describe("phaseOf", () => {
  it("returns null when no test date is set", () => {
    expect(phaseOf(null)).toBeNull();
  });

  it("maps each boundary to the documented phase", () => {
    const cases: Array<[number, TrainingPhase]> = [
      [200, "foundations"],
      [46, "foundations"],
      [45, "accuracy"],
      [22, "accuracy"],
      [21, "speed"],
      [8, "speed"],
      [7, "peak"],
      [1, "peak"],
      [0, "peak"],
    ];
    for (const [days, phase] of cases) {
      expect(phaseOf(days)).toBe(phase);
    }
  });
});

describe("nextMock", () => {
  it("returns null when the test date is unset or past", () => {
    expect(nextMock(null)).toBeNull();
    expect(nextMock(-1)).toBeNull();
  });

  it("surfaces the nearest milestone not yet passed", () => {
    expect(nextMock(60)).toEqual({ inDays: 25, today: false });
    expect(nextMock(36)).toEqual({ inDays: 1, today: false });
    expect(nextMock(34)).toEqual({ inDays: 13, today: false });
    expect(nextMock(20)).toEqual({ inDays: 10, today: false });
  });

  it("flags today on each milestone day", () => {
    for (const m of [35, 21, 10]) {
      expect(nextMock(m)).toEqual({ inDays: 0, today: true });
    }
  });

  it("returns null once the last milestone has passed", () => {
    expect(nextMock(9)).toBeNull();
    expect(nextMock(0)).toBeNull();
  });
});

describe("computeWeights", () => {
  it("sums to 1 across varied inputs", () => {
    const configs = [
      inputs(),
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 2, total: 10 },
          [S1]: { correct: 9, total: 10 },
          [S2]: { correct: 30, total: 30 },
        }),
      }),
      inputs({
        skillAccuracy: accuracy({ [S0]: { correct: 5, total: 10 } }),
        baselineWeakness: { [S0]: 1, [S1]: 0, [S2]: 0.3, [S3]: 0.7 } as Record<
          FundamentalSkill,
          number
        >,
      }),
      inputs({ weightOverrides: { [S0]: 0.9, [S1]: 0 } }),
    ];
    for (const c of configs) {
      expect(weightSum(computeWeights(c))).toBeCloseTo(1, 10);
    }
  });

  it("keeps every skill at or above the 5% floor", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 10, total: 10 },
          [S1]: { correct: 10, total: 10 },
          [S2]: { correct: 10, total: 10 },
          [S3]: { correct: 0, total: 10 },
        }),
      }),
    );
    for (const skill of FUNDAMENTAL_SKILLS) {
      expect(w[skill]).toBeGreaterThanOrEqual(0.05 - 1e-12);
    }
    expect(w[S0]).toBeCloseTo(0.05, 10);
    expect(w[S3]).toBeCloseTo(0.85, 10);
    expect(weightSum(w)).toBeCloseTo(1, 10);
  });

  it("pins a single perfect skill to exactly the floor", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 20, total: 20 },
          [S1]: { correct: 5, total: 10 },
          [S2]: { correct: 5, total: 10 },
          [S3]: { correct: 5, total: 10 },
        }),
      }),
    );
    expect(w[S0]).toBeCloseTo(0.05, 10);
    for (const skill of [S1, S2, S3]) {
      expect(w[skill]).toBeCloseTo(0.95 / 3, 10);
    }
  });

  it("ranks weaker skills higher", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 2, total: 10 },
          [S1]: { correct: 5, total: 10 },
          [S2]: { correct: 8, total: 10 },
          [S3]: { correct: 9, total: 10 },
        }),
      }),
    );
    expect(w[S0]).toBeGreaterThan(w[S1]);
    expect(w[S1]).toBeGreaterThan(w[S2]);
    expect(w[S2]).toBeGreaterThan(w[S3]);
  });

  it("defaults to uniform weights with no data and no report", () => {
    const w = computeWeights(inputs());
    for (const skill of FUNDAMENTAL_SKILLS) {
      expect(w[skill]).toBeCloseTo(0.25, 10);
    }
  });

  it("is proportional to platform weakness without a report", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 6, total: 10 },
          [S1]: { correct: 8, total: 10 },
          [S3]: { correct: 5, total: 10 },
        }),
      }),
    );
    // Weaknesses: 0.4, 0.2, 0.5 (no data), 0.5 — sum 1.6.
    expect(w[S0]).toBeCloseTo(0.4 / 1.6, 10);
    expect(w[S1]).toBeCloseTo(0.2 / 1.6, 10);
    expect(w[S2]).toBeCloseTo(0.5 / 1.6, 10);
    expect(w[S3]).toBeCloseTo(0.5 / 1.6, 10);
  });

  it("blends platform weakness 50/50 with the imported baseline", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 6, total: 10 },
          [S1]: { correct: 8, total: 10 },
          [S3]: { correct: 5, total: 10 },
        }),
        baselineWeakness: { [S0]: 1, [S1]: 0, [S2]: 0.5, [S3]: 0.5 } as Record<
          FundamentalSkill,
          number
        >,
      }),
    );
    // Blended: 0.7, 0.1, 0.5, 0.5 — sum 1.8.
    expect(w[S0]).toBeCloseTo(0.7 / 1.8, 10);
    expect(w[S1]).toBeCloseTo(0.1 / 1.8, 10);
    expect(w[S2]).toBeCloseTo(0.5 / 1.8, 10);
    expect(w[S3]).toBeCloseTo(0.5 / 1.8, 10);
  });

  it("lets the baseline differentiate skills when platform data is flat", () => {
    const w = computeWeights(
      inputs({
        baselineWeakness: { [S0]: 0.9, [S1]: 0.1, [S2]: 0.5, [S3]: 0.5 } as Record<
          FundamentalSkill,
          number
        >,
      }),
    );
    expect(w[S0]).toBeGreaterThan(w[S2]);
    expect(w[S2]).toBeGreaterThan(w[S1]);
  });

  it("lets a manual override win over platform data, floor intact", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({
          [S0]: { correct: 10, total: 10 },
          [S1]: { correct: 5, total: 10 },
        }),
        weightOverrides: { [S0]: 0.85, [S1]: 0 },
      }),
    );
    // Raw: 0.85 (override), 0 (override), 0.5, 0.5 — the zero gets floored.
    expect(w[S0]).toBeGreaterThan(w[S2]);
    expect(w[S1]).toBeCloseTo(0.05, 10);
    expect(weightSum(w)).toBeCloseTo(1, 10);
  });

  it("ignores negative overrides", () => {
    const w = computeWeights(
      inputs({
        skillAccuracy: accuracy({ [S0]: { correct: 3, total: 10 } }),
        weightOverrides: { [S0]: -1 },
      }),
    );
    // Falls back to platform weakness: 0.7, 0.5, 0.5, 0.5 — sum 2.2.
    expect(w[S0]).toBeCloseTo(0.7 / 2.2, 10);
  });

  it("falls back to uniform when everything is overridden to zero", () => {
    const w = computeWeights(
      inputs({
        weightOverrides: { [S0]: 0, [S1]: 0, [S2]: 0, [S3]: 0 },
      }),
    );
    for (const skill of FUNDAMENTAL_SKILLS) {
      expect(w[skill]).toBe(0.25);
    }
  });
});

describe("computeDailyPlan", () => {
  it("follows the phase volume arc and counts sum to the total", () => {
    const cases: Array<[number | null, number]> = [
      [null, 12],
      [60, 12],
      [30, 14],
      [10, 16],
      [5, 10],
    ];
    for (const [daysToTest, total] of cases) {
      const plan = computeDailyPlan(inputs({ daysToTest }));
      expect(plan.drill.total).toBe(total);
      expect(plan.drill.bySkill.reduce((s, x) => s + x.count, 0)).toBe(total);
    }
  });

  it("covers each skill exactly once, each within one of its exact share", () => {
    const plan = computeDailyPlan(
      inputs({
        daysToTest: 10,
        skillAccuracy: accuracy({
          [S0]: { correct: 2, total: 10 },
          [S1]: { correct: 9, total: 10 },
          [S2]: { correct: 6, total: 10 },
        }),
      }),
    );
    const skills = plan.drill.bySkill.map((x) => x.skill);
    expect([...skills].sort()).toEqual([...FUNDAMENTAL_SKILLS].sort());
    for (const { skill, count } of plan.drill.bySkill) {
      expect(
        Math.abs(count - plan.weights[skill] * plan.drill.total),
      ).toBeLessThanOrEqual(1);
    }
  });

  it("apportions by largest remainder", () => {
    // Total 12 (no test date); exact shares 6, 3, 1.8, 1.2 → 6, 3, 2, 1.
    const plan = computeDailyPlan(
      inputs({
        daysToTest: null,
        weightOverrides: { [S0]: 0.5, [S1]: 0.25, [S2]: 0.15, [S3]: 0.1 },
      }),
    );
    const counts = Object.fromEntries(
      plan.drill.bySkill.map((x) => [x.skill, x.count]),
    );
    expect(counts).toEqual({ [S0]: 6, [S1]: 3, [S2]: 2, [S3]: 1 });
  });

  it("is deterministic for fixed inputs", () => {
    const make = () =>
      inputs({
        daysToTest: 25,
        skillAccuracy: accuracy({
          [S0]: { correct: 4, total: 11 },
          [S1]: { correct: 7, total: 9 },
        }),
        baselineWeakness: { [S0]: 0.8, [S1]: 0.2, [S2]: 0.6, [S3]: 0.4 } as Record<
          FundamentalSkill,
          number
        >,
        dueRedoCount: 3,
        dayIndex: 20643,
        eloByCategory: elo({ factor_counts: 1100, probability: 900 } as Partial<
          Record<PatternCategoryKey, number>
        >),
      });
    expect(computeDailyPlan(make())).toStrictEqual(computeDailyPlan(make()));
  });

  it("schedules a round for each of the two lowest-ELO pattern categories", () => {
    const plan = computeDailyPlan(
      inputs({
        eloByCategory: elo({
          must_be_true_snap: 950,
          units_digit_cycles: 800,
        } as Partial<Record<PatternCategoryKey, number>>),
      }),
    );
    expect(plan.patternRounds).toEqual(["units_digit_cycles", "must_be_true_snap"]);
  });

  it("uses the configured cadence outside speed and peak", () => {
    const base = { daysToTest: 30, cadenceDays: 3 };
    expect(computeDailyPlan(inputs({ ...base, dayIndex: 6 })).timedSetToday).toBe(true);
    expect(computeDailyPlan(inputs({ ...base, dayIndex: 7 })).timedSetToday).toBe(false);
  });

  it("forces at least every-other-day timed work in the speed phase", () => {
    const base = { daysToTest: 10, cadenceDays: 5 };
    expect(computeDailyPlan(inputs({ ...base, dayIndex: 4 })).timedSetToday).toBe(true);
    expect(computeDailyPlan(inputs({ ...base, dayIndex: 5 })).timedSetToday).toBe(false);
    // A tighter cadence than 2 is kept as-is.
    expect(
      computeDailyPlan(inputs({ daysToTest: 10, cadenceDays: 1, dayIndex: 5 }))
        .timedSetToday,
    ).toBe(true);
  });

  it("backs timed work off to every third day in peak week", () => {
    const base = { daysToTest: 5, cadenceDays: 1 };
    expect(computeDailyPlan(inputs({ ...base, dayIndex: 4 })).timedSetToday).toBe(false);
    expect(computeDailyPlan(inputs({ ...base, dayIndex: 6 })).timedSetToday).toBe(true);
  });

  it("never schedules timed work with a zero cadence outside speed", () => {
    expect(
      computeDailyPlan(inputs({ daysToTest: 30, cadenceDays: 0, dayIndex: 0 }))
        .timedSetToday,
    ).toBe(false);
  });

  it("passes through phase, mock, redo count, and weights", () => {
    const plan = computeDailyPlan(
      inputs({ daysToTest: 35, dueRedoCount: 7 }),
    );
    expect(plan.phase).toBe(phaseOf(35));
    expect(plan.mock).toEqual({ inDays: 0, today: true });
    expect(plan.dueRedoCount).toBe(7);
    expect(plan.weights).toEqual(computeWeights(inputs({ daysToTest: 35 })));

    const unset = computeDailyPlan(inputs({ daysToTest: null }));
    expect(unset.phase).toBeNull();
    expect(unset.mock).toBeNull();
  });
});
