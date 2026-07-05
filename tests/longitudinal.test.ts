import assert from "node:assert/strict";
import { test } from "node:test";
import { keyFromDayIndex } from "../lib/local-day.ts";
import {
  officialQuarterReplay,
  quarterReplay,
  weeklyEditNet,
  weeklyPacingTrend,
  type SectionAttempt,
} from "../lib/longitudinal.ts";
import { SINK_RATIO, TIME_BENCH } from "../lib/pacing.ts";

function section(spec: Array<[correct: boolean, seconds: number]>): SectionAttempt[] {
  return spec.map(([correct, timeSeconds], pos) => ({
    pos,
    difficulty: 3,
    timeSeconds,
    correct,
  }));
}

test("quarterReplay splits a section into positional quarters", () => {
  // 8 answers: exactly 2 per quarter. First half right, second half wrong.
  const s = section([
    [true, 100],
    [true, 100],
    [true, 100],
    [true, 100],
    [false, 50],
    [false, 50],
    [false, 50],
    [false, 50],
  ]);
  const quarters = quarterReplay([s]);
  assert.equal(quarters[0].accuracy, 1);
  assert.equal(quarters[1].accuracy, 1);
  assert.equal(quarters[2].accuracy, 0);
  assert.equal(quarters[3].accuracy, 0);
  assert.equal(quarters[0].avgSeconds, 100);
  assert.equal(quarters[3].avgSeconds, 50);
});

test("quarterReplay skips sections too short to quarter", () => {
  const quarters = quarterReplay([section([[true, 100]])]);
  assert.equal(quarters[0].n, 0);
  assert.equal(quarters[0].accuracy, null);
});

test("officialQuarterReplay orders by question number and skips nulls", () => {
  const rows = Array.from({ length: 20 }, (_, i) => ({
    // Reverse order on purpose; replay must sort by number.
    number: 20 - i,
    timeMinutes: 20 - i <= 10 ? 2 : 1,
    result:
      20 - i <= 15 ? ("correct" as const) : null, // last 5 ungraded
  }));
  const quarters = officialQuarterReplay([rows]);
  assert.equal(quarters[0].avgSeconds, 120); // first-half questions: 2 min
  assert.equal(quarters[3].avgSeconds, 60);
  assert.equal(quarters[0].accuracy, 1);
  // Q4 holds numbers 16–20, all ungraded → no accuracy read.
  assert.equal(quarters[3].accuracy, null);
});

test("weeklyPacingTrend counts sinks, rushes, and D4–D5 bench hits", () => {
  const today = 20_000;
  const bench4 = TIME_BENCH[4];
  const rows = [
    // This week: one sink on D4, one clean bench hit on D4.
    {
      dayIdx: today,
      difficulty: 4 as const,
      timeSeconds: bench4 * SINK_RATIO + 5,
      correct: false,
    },
    { dayIdx: today - 1, difficulty: 4 as const, timeSeconds: bench4 - 10, correct: true },
    // Last week: one rushed-wrong on D3.
    { dayIdx: today - 7, difficulty: 3 as const, timeSeconds: 30, correct: false },
  ];
  const weeks = weeklyPacingTrend(rows, today, keyFromDayIndex, 4);
  const current = weeks[3];
  const previous = weeks[2];
  assert.equal(current.answered, 2);
  assert.equal(current.sinks, 1);
  assert.equal(current.d45.total, 2);
  assert.equal(current.d45.withinBench, 1);
  assert.equal(previous.rushedWrong, 1);
  assert.ok(current.benchRatioAvg != null && current.benchRatioAvg > 1);
});

test("weeklyEditNet sums outcomes per week", () => {
  const today = 20_000;
  const weeks = weeklyEditNet(
    [
      { dayIdx: today, fromCorrect: false, toCorrect: true }, // +1
      { dayIdx: today - 2, fromCorrect: true, toCorrect: false }, // −1
      { dayIdx: today - 3, fromCorrect: true, toCorrect: false }, // −1
      { dayIdx: today - 9, fromCorrect: false, toCorrect: true }, // +1 last week
    ],
    today,
    keyFromDayIndex,
    4,
  );
  assert.equal(weeks[3].edits, 3);
  assert.equal(weeks[3].net, -1);
  assert.equal(weeks[2].net, 1);
});
