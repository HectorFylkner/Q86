import assert from "node:assert/strict";
import { test } from "node:test";
import {
  sunkCosts,
  triageWins,
  verdictFor,
  weeklyDiscipline,
  type DisciplineItem,
} from "../lib/discipline.ts";
import { keyFromDayIndex } from "../lib/local-day.ts";
import { SINK_RATIO, TIME_BENCH } from "../lib/pacing.ts";

let nextId = 1;
function item(patch: Partial<DisciplineItem>): DisciplineItem {
  const difficulty = patch.difficulty ?? 5;
  return {
    attemptId: nextId++,
    questionId: 100 + nextId,
    dayIdx: 20_000,
    subtopic: "probability",
    difficulty,
    timeSeconds: 100,
    correct: false,
    verdict: verdictFor({ correct: 3, total: 8 }, difficulty, null),
    ...patch,
  };
}

test("verdictFor: weak cell → bail, strong cell → solve", () => {
  const weak = verdictFor({ correct: 3, total: 8 }, 5, null);
  assert.equal(weak.recommendation, "bail"); // 37.5%
  assert.equal(weak.sample, 8);
  const strong = verdictFor({ correct: 9, total: 10 }, 5, "bail");
  assert.equal(strong.recommendation, "solve");
  assert.equal(strong.yourCall, "bail");
  // No record → difficulty prior (D5 = 0.40 → guess boundary).
  const prior = verdictFor(null, 5, null);
  assert.equal(prior.sample, 0);
  assert.equal(prior.recommendation, "guess");
});

test("sunkCosts: only bail/guess cells past 1.5× benchmark, worst first", () => {
  const bench5 = TIME_BENCH[5];
  const violation = item({ timeSeconds: bench5 * SINK_RATIO + 40 });
  const worse = item({ timeSeconds: bench5 * 3 });
  const withinBudget = item({ timeSeconds: bench5 });
  // Strong cell: staying long is a judged fight, not a sunk cost.
  const strongCell = item({
    timeSeconds: bench5 * 3,
    verdict: verdictFor({ correct: 9, total: 10 }, 5, null),
  });
  const out = sunkCosts([violation, worse, withinBudget, strongCell]);
  assert.deepEqual(
    out.map((v) => v.attemptId),
    [worse.attemptId, violation.attemptId],
  );
  assert.equal(Math.round(out[1].overBySeconds), 40);
});

test("triageWins: kept to benchmark on a guess-or-bail cell", () => {
  const win = item({ timeSeconds: TIME_BENCH[5] - 10 });
  const slow = item({ timeSeconds: TIME_BENCH[5] + 10 });
  const strongCell = item({
    timeSeconds: 60,
    verdict: verdictFor({ correct: 9, total: 10 }, 5, null),
  });
  const wins = triageWins([win, slow, strongCell]);
  assert.deepEqual(
    wins.map((w) => w.attemptId),
    [win.attemptId],
  );
});

test("weeklyDiscipline buckets by local day index, oldest first", () => {
  const today = 20_000;
  const thisWeek = item({
    dayIdx: today - 1,
    timeSeconds: TIME_BENCH[5] * 2,
  });
  const lastWeek = item({ dayIdx: today - 8, timeSeconds: 100 });
  const ancient = item({ dayIdx: today - 100, timeSeconds: 100 });
  const weekly = weeklyDiscipline(
    [thisWeek, lastWeek, ancient],
    [{ dayIdx: today - 8, total: 8, aligned: 6 }],
    today,
    keyFromDayIndex,
    8,
  );
  assert.equal(weekly.length, 8);
  const current = weekly[7];
  const previous = weekly[6];
  assert.equal(current.timedAnswered, 1);
  assert.equal(current.sunkCosts, 1);
  assert.ok(current.secondsDonated > 0);
  assert.equal(previous.timedAnswered, 1);
  assert.equal(previous.sunkCosts, 0);
  assert.equal(previous.decideCalls, 8);
  assert.equal(previous.decideAligned, 6);
  // The 100-day-old item falls outside all buckets.
  assert.equal(
    weekly.reduce((s, w) => s + w.timedAnswered, 0),
    2,
  );
  assert.equal(current.weekStartKey, keyFromDayIndex(today - 6));
});
