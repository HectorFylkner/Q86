import assert from "node:assert/strict";
import { test } from "node:test";
import {
  COLD_SOLVE_LIMIT_SECONDS,
  nextRedoState,
  redoOutcome,
  STAGE_DELAY_DAYS,
} from "../lib/redo-rules.ts";

test("redoOutcome: a guessed correct is luck, not evidence", () => {
  assert.equal(redoOutcome(false, "lock"), "wrong");
  assert.equal(redoOutcome(true, "guess"), "lucky");
  assert.equal(redoOutcome(true, "lean"), "solid");
  assert.equal(redoOutcome(true, "lock"), "solid");
  assert.equal(redoOutcome(true, null), "solid");
});

test("wrong at any stage resets to stage 0 (+2d)", () => {
  for (const stage of [0, 1, 2] as const) {
    assert.deepEqual(nextRedoState(stage, "wrong", 90), {
      cleared: false,
      stage: 0,
      delayDays: STAGE_DELAY_DAYS[0],
    });
  }
});

test("lucky holds the stage and re-checks in +2d", () => {
  for (const stage of [0, 1, 2] as const) {
    assert.deepEqual(nextRedoState(stage, "lucky", 60), {
      cleared: false,
      stage,
      delayDays: STAGE_DELAY_DAYS[0],
    });
  }
  // Even a fast lucky guess never clears the cold-solve gate.
  assert.deepEqual(nextRedoState(2, "lucky", 30), {
    cleared: false,
    stage: 2,
    delayDays: STAGE_DELAY_DAYS[0],
  });
});

test("solid climbs 0 → 1 (+7d) and 1 → 2 (+21d)", () => {
  assert.deepEqual(nextRedoState(0, "solid", 90), {
    cleared: false,
    stage: 1,
    delayDays: STAGE_DELAY_DAYS[1],
  });
  assert.deepEqual(nextRedoState(1, "solid", 90), {
    cleared: false,
    stage: 2,
    delayDays: STAGE_DELAY_DAYS[2],
  });
});

test("stage 2 clears only through the cold-solve gate", () => {
  assert.deepEqual(nextRedoState(2, "solid", COLD_SOLVE_LIMIT_SECONDS), {
    cleared: true,
  });
  assert.deepEqual(nextRedoState(2, "solid", COLD_SOLVE_LIMIT_SECONDS + 1), {
    cleared: false,
    stage: 1,
    delayDays: STAGE_DELAY_DAYS[1],
  });
});
