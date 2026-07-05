import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MASTERY_BAR,
  MIN_ATTEMPTS,
  rungState,
  solidCorrect,
  type CellAttempt,
} from "../lib/mastery-rules.ts";

const solid = (n: number): CellAttempt[] =>
  Array.from({ length: n }, () => ({ correct: true, confidence: "lock" }));
const lucky = (n: number): CellAttempt[] =>
  Array.from({ length: n }, () => ({ correct: true, confidence: "guess" }));
const wrong = (n: number): CellAttempt[] =>
  Array.from({ length: n }, () => ({ correct: false, confidence: "lean" }));

test("solidCorrect excludes guessed corrects", () => {
  assert.equal(solidCorrect({ correct: true, confidence: "lock" }), true);
  assert.equal(solidCorrect({ correct: true }), true);
  assert.equal(solidCorrect({ correct: true, confidence: "guess" }), false);
  assert.equal(solidCorrect({ correct: false, confidence: "lock" }), false);
});

test("no bank questions → empty, regardless of history", () => {
  assert.equal(rungState(solid(10), 0), "empty");
});

test("no attempts → untouched", () => {
  assert.equal(rungState([], 8), "untouched");
});

test("mastery needs both the sample size and the bar", () => {
  // Perfect but under MIN_ATTEMPTS: still working.
  assert.equal(rungState(solid(MIN_ATTEMPTS - 1), 8), "working");
  // At sample size and at the bar: mastered.
  assert.equal(rungState(solid(MIN_ATTEMPTS), 8), "mastered");
  // 5/6 = 0.833 < 0.85: working.
  assert.equal(rungState([...solid(5), ...wrong(1)], 8), "working");
  // 9/10 = 0.9 ≥ bar: mastered.
  assert.equal(rungState([...solid(9), ...wrong(1)], 8), "mastered");
  assert.ok(9 / 10 >= MASTERY_BAR);
});

test("lucky guesses never climb a ladder", () => {
  // 10/10 'correct' — but two were guesses: 8/10 < 0.85, still working.
  assert.equal(rungState([...solid(8), ...lucky(2)], 8), "working");
  // All guesses: no mastery whatsoever.
  assert.equal(rungState(lucky(10), 8), "working");
});
