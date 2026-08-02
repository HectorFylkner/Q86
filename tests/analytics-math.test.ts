import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  accuracyPct,
  bucketByTime,
  calibration,
  calibrationError,
  masteryLevel,
  median,
  needsWork,
  windowAccuracy,
  type TimeBucketEdge,
} from "../lib/analytics-math.ts";
import { MASTERY_BAR, MIN_ATTEMPTS } from "../lib/mastery-config.ts";

const EDGES: TimeBucketEdge[] = [
  { from: 0, to: 45, label: "< 0:45" },
  { from: 45, to: 90, label: "0:45–1:30" },
  { from: 90, to: 128, label: "1:30–2:08" },
  { from: 128, to: null, label: "2:08+" },
];

describe("analytics aggregation", () => {
  test("time buckets are half-open, so nothing is double counted", () => {
    const rows = [
      { timeSeconds: 0, correct: true },
      { timeSeconds: 44.9, correct: false },
      { timeSeconds: 45, correct: true },
      { timeSeconds: 89.9, correct: true },
      { timeSeconds: 90, correct: false },
      { timeSeconds: 128, correct: true },
      { timeSeconds: 6000, correct: false },
    ];
    const buckets = bucketByTime(rows, EDGES);
    assert.deepEqual(
      buckets.map((b) => b.total),
      [2, 2, 1, 2],
    );
    assert.equal(
      buckets.reduce((s, b) => s + b.total, 0),
      rows.length,
      "every attempt must land in exactly one bucket",
    );
  });

  test("an empty bucket reports zero total and no accuracy", () => {
    const buckets = bucketByTime([{ timeSeconds: 200, correct: true }], EDGES);
    assert.equal(buckets[0].total, 0);
    assert.equal(accuracyPct(buckets[0].correct, buckets[0].total), null);
  });

  test("accuracy of an empty sample is null, never zero", () => {
    assert.equal(accuracyPct(0, 0), null);
    assert.equal(accuracyPct(0, 5), 0);
    assert.equal(accuracyPct(1, 3), 33);
    assert.equal(accuracyPct(2, 3), 67);
    assert.equal(accuracyPct(5, 5), 100);
  });

  test("median averages the middle pair on an even sample", () => {
    assert.equal(median([]), null);
    assert.equal(median([7]), 7);
    assert.equal(median([1, 3]), 2);
    assert.equal(median([5, 1, 9, 3]), 4);
    assert.equal(median([9, 1, 5]), 5);
  });

  test("mastery levels follow the bands and reserve zero for untouched", () => {
    assert.equal(masteryLevel({ correct: 0, total: 0 }, MASTERY_BAR), 0);
    assert.equal(masteryLevel({ correct: 0, total: 10 }, MASTERY_BAR), 1);
    assert.equal(masteryLevel({ correct: 6, total: 10 }, MASTERY_BAR), 2);
    assert.equal(masteryLevel({ correct: 8, total: 10 }, MASTERY_BAR), 3);
    assert.equal(masteryLevel({ correct: 9, total: 10 }, MASTERY_BAR), 4);
    assert.equal(masteryLevel({ correct: 10, total: 10 }, MASTERY_BAR), 4);
  });

  test("a cell only needs work once there is enough evidence", () => {
    // One miss out of one is 0% — but it is not a diagnosis.
    assert.equal(needsWork({ correct: 0, total: 1 }, MASTERY_BAR, MIN_ATTEMPTS), false);
    assert.equal(
      needsWork({ correct: 3, total: MIN_ATTEMPTS }, MASTERY_BAR, MIN_ATTEMPTS),
      true,
    );
    assert.equal(
      needsWork({ correct: MIN_ATTEMPTS, total: MIN_ATTEMPTS }, MASTERY_BAR, MIN_ATTEMPTS),
      false,
    );
  });

  test("a trailing window is open at the start and closed at the end", () => {
    const end = 10 * 86_400_000;
    const rows = [
      { at: end - 7 * 86_400_000, correct: false }, // exactly one window back: out
      { at: end - 7 * 86_400_000 + 1, correct: true }, // just inside
      { at: end, correct: true }, // exactly at the end: in
      { at: end + 1, correct: false }, // future: out
    ];
    assert.equal(windowAccuracy(rows, end, 7), 100);
  });

  test("an empty window is null so a chart can show a gap, not a zero", () => {
    assert.equal(windowAccuracy([], Date.now(), 7), null);
  });

  test("calibration reports the gap in the overconfident direction", () => {
    const expected = { guess: 20, lean: 70, lock: 95 };
    const rows = [
      // Locked in five, got three: 60% against a 95% claim.
      ...Array.from({ length: 3 }, () => ({ confidence: "lock" as const, correct: true })),
      ...Array.from({ length: 2 }, () => ({ confidence: "lock" as const, correct: false })),
      // Leaned on two, got both: 100% against a 70% claim (underconfident).
      ...Array.from({ length: 2 }, () => ({ confidence: "lean" as const, correct: true })),
    ];
    const out = calibration(rows, expected, ["guess", "lean", "lock"] as const);
    const lock = out.find((r) => r.bucket === "lock")!;
    const lean = out.find((r) => r.bucket === "lean")!;
    const guess = out.find((r) => r.bucket === "guess")!;
    assert.equal(lock.actual, 60);
    assert.equal(lock.gap, 35, "overconfidence must be positive");
    assert.equal(lean.gap, -30, "underconfidence must be negative");
    assert.equal(guess.actual, null);
    assert.equal(guess.gap, null);
  });

  test("the overall calibration error weights buckets by attempt count", () => {
    const rows = [
      { bucket: "a", expected: 100, actual: 90, total: 100, gap: 10 },
      { bucket: "b", expected: 100, actual: 50, total: 1, gap: 50 },
      { bucket: "c", expected: 100, actual: null, total: 0, gap: null },
    ];
    const err = calibrationError(rows)!;
    // Weighted: (10*100 + 50*1) / 101 ≈ 10.4 — the 50-point miss on one
    // attempt must not dominate.
    assert.ok(Math.abs(err - 1050 / 101) < 1e-9, `got ${err}`);
    assert.ok(err < 11, "a one-attempt bucket dominated the weighted mean");
    assert.equal(calibrationError([]), null);
  });
});
