import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  RUSH_RATIO,
  SINK_RATIO,
  TIME_BENCH,
  pacingRead,
  type PacedItem,
} from "../lib/pacing.ts";
import { DIFFICULTIES, type Difficulty } from "../lib/taxonomy.ts";

const item = (
  index: number,
  difficulty: Difficulty,
  timeSeconds: number,
  correct: boolean,
): PacedItem => ({ index, difficulty, timeSeconds, correct });

/**
 * Pacing decides which questions the post-mortem calls time sinks and
 * which it calls rushed. Getting the boundary wrong sends the user to
 * repair the opposite habit from the one costing them points.
 */
describe("pacing", () => {
  test("benchmarks rise monotonically with difficulty", () => {
    for (let i = 1; i < DIFFICULTIES.length; i++) {
      const lower = TIME_BENCH[DIFFICULTIES[i - 1]];
      const higher = TIME_BENCH[DIFFICULTIES[i]];
      assert.ok(higher > lower, `D${DIFFICULTIES[i]} did not exceed D${DIFFICULTIES[i - 1]}`);
    }
  });

  test("the benchmark set straddles the ~128s section average", () => {
    const values = DIFFICULTIES.map((d) => TIME_BENCH[d]);
    assert.ok(Math.min(...values) < 128);
    assert.ok(Math.max(...values) > 128);
  });

  test("a sink is strictly over the ratio, not at it", () => {
    const bench = TIME_BENCH[3];
    const atBoundary = pacingRead([item(0, 3, bench * SINK_RATIO, true)]);
    assert.equal(atBoundary.sinks.length, 0, "the boundary itself must not count");
    const over = pacingRead([item(0, 3, bench * SINK_RATIO + 0.01, true)]);
    assert.equal(over.sinks.length, 1);
  });

  test("rushed counts only wrong answers, however fast a right one was", () => {
    const bench = TIME_BENCH[4];
    const fast = bench * RUSH_RATIO - 1;
    const read = pacingRead([
      item(0, 4, fast, true), // fast and right: a legitimate shortcut
      item(1, 4, fast, false), // fast and wrong: rushed
    ]);
    assert.equal(read.rushedWrong.length, 1);
    assert.equal(read.rushedWrong[0].index, 1);
  });

  test("sinks are ranked by overspend relative to their own benchmark", () => {
    // An 'absolutely slower' D5 can be a smaller failure than a D2 that
    // ran four times its budget; the ranking must use the ratio.
    const read = pacingRead([
      item(0, 5, TIME_BENCH[5] * 2, false),
      item(1, 2, TIME_BENCH[2] * 4, false),
    ]);
    assert.deepEqual(
      read.sinks.map((s) => s.index),
      [1, 0],
    );
  });

  test("per-difficulty averages use only that difficulty's items", () => {
    const read = pacingRead([
      item(0, 3, 100, true),
      item(1, 3, 200, true),
      item(2, 5, 60, true),
    ]);
    const d3 = read.byDifficulty.find((r) => r.difficulty === 3);
    const d5 = read.byDifficulty.find((r) => r.difficulty === 5);
    assert.equal(d3?.n, 2);
    assert.equal(d3?.avgSeconds, 150);
    assert.equal(d3?.benchSeconds, TIME_BENCH[3]);
    assert.equal(d5?.n, 1);
    assert.equal(d5?.avgSeconds, 60);
  });

  test("difficulties are reported in ascending order and only if seen", () => {
    const read = pacingRead([item(0, 5, 60, true), item(1, 2, 60, true)]);
    assert.deepEqual(
      read.byDifficulty.map((r) => r.difficulty),
      [2, 5],
    );
  });

  test("an empty set yields empty reads rather than throwing", () => {
    const read = pacingRead([]);
    assert.deepEqual(read.byDifficulty, []);
    assert.deepEqual(read.sinks, []);
    assert.deepEqual(read.rushedWrong, []);
  });

  test("an item cannot be both rushed and a sink", () => {
    const all: PacedItem[] = [];
    let i = 0;
    for (const d of DIFFICULTIES) {
      for (const t of [1, 30, 60, 120, 200, 400]) {
        all.push(item(i++, d, t, i % 2 === 0));
      }
    }
    const read = pacingRead(all);
    const sinkIndexes = new Set(read.sinks.map((s) => s.index));
    for (const r of read.rushedWrong) {
      assert.ok(!sinkIndexes.has(r.index), `item ${r.index} was classified as both`);
    }
  });
});
