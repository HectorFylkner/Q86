import assert from "node:assert/strict";
import { test } from "node:test";
import {
  pacingRead,
  RUSH_RATIO,
  SINK_RATIO,
  TIME_BENCH,
  type PacedItem,
} from "../lib/pacing.ts";

test("byDifficulty averages against the right benchmarks, sorted", () => {
  const items: PacedItem[] = [
    { index: 0, difficulty: 3, timeSeconds: 100, correct: true },
    { index: 1, difficulty: 3, timeSeconds: 150, correct: false },
    { index: 2, difficulty: 5, timeSeconds: 160, correct: true },
  ];
  const read = pacingRead(items);
  assert.deepEqual(
    read.byDifficulty.map((b) => b.difficulty),
    [3, 5],
  );
  assert.equal(read.byDifficulty[0].avgSeconds, 125);
  assert.equal(read.byDifficulty[0].benchSeconds, TIME_BENCH[3]);
  assert.equal(read.byDifficulty[0].n, 2);
});

test("sinks are >1.5× benchmark, worst ratio first", () => {
  const mild: PacedItem = {
    index: 0,
    difficulty: 2,
    timeSeconds: TIME_BENCH[2] * SINK_RATIO + 1,
    correct: true,
  };
  const severe: PacedItem = {
    index: 1,
    difficulty: 4,
    timeSeconds: TIME_BENCH[4] * 3,
    correct: false,
  };
  const fine: PacedItem = {
    index: 2,
    difficulty: 5,
    timeSeconds: TIME_BENCH[5] * SINK_RATIO,
    correct: true,
  };
  const read = pacingRead([mild, severe, fine]);
  assert.deepEqual(
    read.sinks.map((s) => s.index),
    [1, 0],
  );
});

test("rushedWrong catches only fast misses", () => {
  const fastWrong: PacedItem = {
    index: 0,
    difficulty: 3,
    timeSeconds: TIME_BENCH[3] * RUSH_RATIO - 1,
    correct: false,
  };
  const fastRight: PacedItem = {
    index: 1,
    difficulty: 3,
    timeSeconds: 30,
    correct: true,
  };
  const slowWrong: PacedItem = {
    index: 2,
    difficulty: 3,
    timeSeconds: TIME_BENCH[3],
    correct: false,
  };
  const read = pacingRead([fastWrong, fastRight, slowWrong]);
  assert.deepEqual(
    read.rushedWrong.map((r) => r.index),
    [0],
  );
});
