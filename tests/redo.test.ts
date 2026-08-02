import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  COLD_SOLVE_LIMIT_SECONDS,
  STAGE_DELAY_DAYS,
  nextRedoState,
  type RedoStage,
} from "../lib/redo.ts";

/**
 * The spaced redo ladder. This schedule is load-bearing: a silent change
 * to it corrupts months of spacing with no visible symptom, so the exact
 * +2d / +7d / +21d shape and the day-21 cold-solve gate are pinned here.
 */
describe("redo ladder", () => {
  test("the schedule is +2d, +7d, +21d", () => {
    assert.deepEqual([...STAGE_DELAY_DAYS], [2, 7, 21]);
  });

  test("a correct answer climbs one rung at a time", () => {
    assert.deepEqual(nextRedoState(0, true, 60), {
      kind: "reschedule",
      stage: 1,
      inDays: 7,
    });
    assert.deepEqual(nextRedoState(1, true, 60), {
      kind: "reschedule",
      stage: 2,
      inDays: 21,
    });
  });

  test("a miss at any stage resets to the bottom", () => {
    for (const stage of [0, 1, 2] as RedoStage[]) {
      assert.deepEqual(nextRedoState(stage, false, 30), {
        kind: "reschedule",
        stage: 0,
        inDays: 2,
      });
    }
  });

  test("stage 2 clears only when correct AND inside the cold-solve limit", () => {
    assert.deepEqual(nextRedoState(2, true, COLD_SOLVE_LIMIT_SECONDS), {
      kind: "cleared",
    });
    assert.deepEqual(nextRedoState(2, true, COLD_SOLVE_LIMIT_SECONDS - 1), {
      kind: "cleared",
    });
  });

  test("right but slow at stage 2 falls back to +7d rather than clearing", () => {
    // This is the whole point of the gate: knowing it is not the same as
    // being able to do it in exam time.
    assert.deepEqual(nextRedoState(2, true, COLD_SOLVE_LIMIT_SECONDS + 1), {
      kind: "reschedule",
      stage: 1,
      inDays: 7,
    });
  });

  test("nothing clears without passing through all three stages", () => {
    let stage: RedoStage = 0;
    const seen: RedoStage[] = [0];
    for (let i = 0; i < 2; i++) {
      const next = nextRedoState(stage, true, 60);
      assert.equal(next.kind, "reschedule");
      if (next.kind !== "reschedule") return;
      stage = next.stage;
      seen.push(stage);
    }
    assert.deepEqual(seen, [0, 1, 2]);
    assert.equal(nextRedoState(stage, true, 60).kind, "cleared");
  });

  test("the fastest possible clearance is 30 days after the miss", () => {
    // +2d, then +7d, then +21d, with no misses anywhere.
    let days = 0;
    let stage: RedoStage = 0;
    days += STAGE_DELAY_DAYS[0];
    for (let i = 0; i < 3; i++) {
      const next = nextRedoState(stage, true, 60);
      if (next.kind === "cleared") break;
      stage = next.stage;
      days += next.inDays;
    }
    assert.equal(days, 30);
  });
});
