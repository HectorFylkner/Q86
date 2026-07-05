import assert from "node:assert/strict";
import { test } from "node:test";
import {
  topMechanisms,
  weeklyErrorRates,
  type ForensicRow,
} from "../lib/forensics.ts";
import { keyFromDayIndex } from "../lib/local-day.ts";

const TODAY = 20_000;

function row(patch: Partial<ForensicRow>): ForensicRow {
  return { dayIdx: TODAY, correct: false, errorType: null, ...patch };
}

test("weeklyErrorRates buckets misses by mechanism, oldest first", () => {
  const rows = [
    row({ errorType: "calculation_error" }),
    row({ errorType: "calculation_error", dayIdx: TODAY - 3 }),
    row({ errorType: "misread", dayIdx: TODAY - 8 }),
    row({ correct: true }), // counts toward attempts, not classified
    row({ dayIdx: TODAY }), // unclassified miss
    row({ errorType: "guess", dayIdx: TODAY - 100 }), // outside window
  ];
  const weeks = weeklyErrorRates(rows, TODAY, keyFromDayIndex, 8);
  assert.equal(weeks.length, 8);
  const current = weeks[7];
  const previous = weeks[6];
  assert.equal(current.attempts, 4);
  assert.equal(current.classified, 2);
  assert.equal(current.counts.calculation_error, 2);
  assert.equal(previous.classified, 1);
  assert.equal(previous.counts.misread, 1);
  assert.equal(
    weeks.reduce((s, w) => s + w.attempts, 0),
    5,
  );
  assert.equal(current.weekStartKey, keyFromDayIndex(TODAY - 6));
});

test("topMechanisms ranks by lifetime count and drops zeros", () => {
  const rows = [
    row({ errorType: "misread" }),
    row({ errorType: "misread" }),
    row({ errorType: "answered_wrong_question" }),
    row({ errorType: "calculation_error" }),
    row({ errorType: "calculation_error" }),
    row({ errorType: "calculation_error" }),
  ];
  const weeks = weeklyErrorRates(rows, TODAY, keyFromDayIndex, 4);
  const top = topMechanisms(weeks, 2);
  assert.deepEqual(top, ["calculation_error", "misread"]);
  assert.ok(!topMechanisms(weeks).includes("time_pressure"));
});
