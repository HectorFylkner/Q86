import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { SOLUTION_STRATEGIES } from "../lib/solution-strategy.ts";
import {
  STRATEGY_MIN_ATTEMPTS,
  median,
  summarizeStrategies,
  type StrategyAttempt,
} from "../lib/strategy-math.ts";

const BANK = Object.fromEntries(
  SOLUTION_STRATEGIES.map((s) => [s, 10]),
) as Record<(typeof SOLUTION_STRATEGIES)[number], number>;

function attempts(
  strategy: (typeof SOLUTION_STRATEGIES)[number],
  seconds: number[],
  correct = true,
): StrategyAttempt[] {
  return seconds.map((s) => ({ strategy, correct, seconds: s }));
}

describe("technique panel maths", () => {
  test("median handles both parities", () => {
    assert.equal(median([3, 1, 2]), 2);
    assert.equal(median([4, 1, 3, 2]), 2.5);
    assert.equal(median([]), 0);
  });

  test("a strategy below the attempt floor reports null, not zero", () => {
    const report = summarizeStrategies(
      attempts("backsolve", [60, 70]),
      BANK,
    );
    const row = report.rows.find((r) => r.strategy === "backsolve")!;
    assert.equal(row.attempts, 2);
    assert.equal(row.accuracy, null, "2 attempts cannot support a percentage");
    assert.equal(row.medianSeconds, null);
    assert.equal(report.baselineSeconds, null, "no structural attempts");
  });

  test("no baseline means nothing can be called unreached", () => {
    // Slow backsolving, but nothing to compare it against.
    const report = summarizeStrategies(
      attempts("backsolve", [200, 210, 220, 230, 240]),
      BANK,
    );
    assert.equal(report.baselineSeconds, null);
    assert.deepEqual(report.unreached, []);
  });

  test("a shortcut slower than the user's own grind is unreached", () => {
    const report = summarizeStrategies(
      [
        ...attempts("structural", [100, 100, 100, 100, 100]),
        ...attempts("backsolve", [150, 150, 150, 150, 150]),
        ...attempts("pick_numbers", [60, 60, 60, 60, 60]),
      ],
      BANK,
    );
    assert.equal(report.baselineSeconds, 100);
    assert.deepEqual(
      report.unreached,
      ["backsolve"],
      "only the technique that saved nothing",
    );
  });

  test("structural is never listed as unreached, however slow it is", () => {
    const report = summarizeStrategies(
      attempts("structural", [300, 300, 300, 300, 300]),
      BANK,
    );
    assert.ok(!report.unreached.includes("structural"));
  });

  test("a tie counts as unreached — a shortcut that saves nothing was not taken", () => {
    const report = summarizeStrategies(
      [
        ...attempts("structural", [120, 120, 120, 120, 120]),
        ...attempts("estimate", [120, 120, 120, 120, 120]),
      ],
      BANK,
    );
    assert.deepEqual(report.unreached, ["estimate"]);
  });

  test("zero-second attempts count for accuracy but not for the median", () => {
    const report = summarizeStrategies(
      [
        ...attempts("structural", [0, 0, 0, 0, 0]),
        ...attempts("backsolve", [10, 20, 30, 40, 50]),
      ],
      BANK,
    );
    const structural = report.rows.find((r) => r.strategy === "structural")!;
    assert.equal(structural.attempts, 5);
    assert.equal(structural.accuracy, 1, "the attempts still happened");
    assert.equal(
      structural.medianSeconds,
      null,
      "but they cannot contribute a time",
    );
    assert.equal(report.baselineSeconds, null);
  });

  test("accuracy is the plain ratio once the floor is cleared", () => {
    const report = summarizeStrategies(
      [
        ...attempts("pattern", [60, 60, 60], true),
        ...attempts("pattern", [60, 60], false),
      ],
      BANK,
    );
    const row = report.rows.find((r) => r.strategy === "pattern")!;
    assert.equal(row.attempts, STRATEGY_MIN_ATTEMPTS);
    assert.equal(row.correct, 3);
    assert.equal(row.accuracy, 0.6);
  });

  test("every strategy gets a row, in a stable order, even with no data", () => {
    const report = summarizeStrategies([], BANK);
    assert.deepEqual(
      report.rows.map((r) => r.strategy),
      [...SOLUTION_STRATEGIES],
    );
    assert.equal(report.totalAttempts, 0);
    for (const row of report.rows) {
      assert.equal(row.attempts, 0);
      assert.equal(row.bankItems, 10, "bank counts are independent of attempts");
    }
  });

  test("attempts on a strategy outside the list are ignored, not crashed on", () => {
    const report = summarizeStrategies(
      [
        { strategy: "nonsense" as never, correct: true, seconds: 10 },
        ...attempts("structural", [100, 100, 100, 100, 100]),
      ],
      BANK,
    );
    assert.equal(report.baselineSeconds, 100);
  });
});
