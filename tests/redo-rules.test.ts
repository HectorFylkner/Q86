import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COLD_SOLVE_LIMIT_SECONDS,
  nextRedoState,
  STAGE_DELAY_DAYS,
} from "../lib/redo-rules.ts";

test("wrong at any stage resets to stage 0 (+2d)", () => {
  for (const stage of [0, 1, 2] as const) {
    assert.deepEqual(nextRedoState(stage, false, 90), {
      cleared: false,
      stage: 0,
      delayDays: STAGE_DELAY_DAYS[0],
    });
  }
});

test("correct climbs 0 → 1 (+7d) and 1 → 2 (+21d)", () => {
  assert.deepEqual(nextRedoState(0, true, 90), {
    cleared: false,
    stage: 1,
    delayDays: STAGE_DELAY_DAYS[1],
  });
  assert.deepEqual(nextRedoState(1, true, 90), {
    cleared: false,
    stage: 2,
    delayDays: STAGE_DELAY_DAYS[2],
  });
});

test("stage 2 clears only through the cold-solve gate", () => {
  assert.deepEqual(nextRedoState(2, true, COLD_SOLVE_LIMIT_SECONDS), {
    cleared: true,
  });
  assert.deepEqual(nextRedoState(2, true, COLD_SOLVE_LIMIT_SECONDS + 1), {
    cleared: false,
    stage: 1,
    delayDays: STAGE_DELAY_DAYS[1],
  });
});
