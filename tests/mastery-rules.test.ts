import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MASTERY_BAR,
  MIN_ATTEMPTS,
  rungState,
} from "../lib/mastery-rules.ts";

const runs = (correct: number, wrong: number) => [
  ...Array<boolean>(correct).fill(true),
  ...Array<boolean>(wrong).fill(false),
];

test("no bank questions → empty, regardless of history", () => {
  assert.equal(rungState(runs(10, 0), 0), "empty");
});

test("no attempts → untouched", () => {
  assert.equal(rungState([], 8), "untouched");
});

test("mastery needs both the sample size and the bar", () => {
  // Perfect but under MIN_ATTEMPTS: still working.
  assert.equal(rungState(runs(MIN_ATTEMPTS - 1, 0), 8), "working");
  // At sample size and at the bar: mastered.
  assert.equal(rungState(runs(MIN_ATTEMPTS, 0), 8), "mastered");
  // 5/6 = 0.833 < 0.85: working.
  assert.equal(rungState(runs(5, 1), 8), "working");
  // 9/10 = 0.9 ≥ bar: mastered.
  assert.equal(rungState(runs(9, 1), 8), "mastered");
  assert.ok(9 / 10 >= MASTERY_BAR);
});
