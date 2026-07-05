import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DECIDE_MIN_SAMPLE,
  DECIDE_PRIORS,
  predictCell,
  recommend,
} from "../lib/decide-rules.ts";

test("recommend thresholds: solve ≥ 0.65 > guess ≥ 0.4 > bail", () => {
  assert.equal(recommend(0.65), "solve");
  assert.equal(recommend(0.649), "guess");
  assert.equal(recommend(0.4), "guess");
  assert.equal(recommend(0.399), "bail");
});

test("predictCell uses the difficulty prior until the sample is real", () => {
  assert.deepEqual(predictCell(null, 5), {
    predicted: DECIDE_PRIORS[5],
    sample: 0,
  });
  // Below the minimum sample the prior still wins.
  assert.deepEqual(predictCell({ correct: 2, total: DECIDE_MIN_SAMPLE - 1 }, 3), {
    predicted: DECIDE_PRIORS[3],
    sample: 0,
  });
  // At the minimum sample the personal record takes over.
  assert.deepEqual(predictCell({ correct: 3, total: DECIDE_MIN_SAMPLE }, 3), {
    predicted: 3 / DECIDE_MIN_SAMPLE,
    sample: DECIDE_MIN_SAMPLE,
  });
});

test("unknown difficulty falls back to a neutral 0.5", () => {
  assert.deepEqual(predictCell(null, 1), { predicted: 0.5, sample: 0 });
});
