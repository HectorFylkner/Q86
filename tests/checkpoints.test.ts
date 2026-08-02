import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  CHECKPOINT_BAND_SECONDS,
  FULL_CHECKPOINT_QUESTIONS,
  MINI_CHECKPOINT_QUESTIONS,
  checkpointFor,
  paceVerdict,
  sectionCheckpoints,
} from "../lib/pacing.ts";

const FULL = sectionCheckpoints(45 * 60, 21, FULL_CHECKPOINT_QUESTIONS);

/**
 * The old checkpoints were Q7·30:00 and Q14·15:00 — round numbers that
 * are not even pacing. Entering question 7 leaves 32:09 on an even split,
 * so a student who hit 30:00 exactly was two minutes behind and being
 * told they were on time. These tests pin the derivation, not the
 * numbers, so the same mistake cannot be reintroduced by hand.
 */
describe("section pacing checkpoints", () => {
  test("targets match an even split of the section clock", () => {
    for (const cp of FULL) {
      const exact = 45 * 60 - (cp.question - 1) * ((45 * 60) / 21);
      assert.ok(
        Math.abs(cp.remainingTarget - exact) <= 30,
        `Q${cp.question}: target ${cp.remainingTarget}s vs even pacing ${exact.toFixed(1)}s`,
      );
    }
  });

  test("the full section reads 36 / 28 / 17 / 9 minutes", () => {
    assert.deepEqual(
      FULL.map((cp) => cp.remainingTarget / 60),
      [36, 28, 17, 9],
    );
    assert.deepEqual(
      FULL.map((cp) => cp.label),
      ["Q5 · 36:00", "Q9 · 28:00", "Q14 · 17:00", "Q18 · 9:00"],
    );
  });

  test("rounding to the minute never exceeds a third of the band", () => {
    // If it could, rounding alone might flip an on-pace verdict.
    for (const cp of FULL) {
      const exact = 45 * 60 - (cp.question - 1) * ((45 * 60) / 21);
      assert.ok(Math.abs(cp.remainingTarget - exact) <= CHECKPOINT_BAND_SECONDS / 3);
    }
  });

  test("targets fall as the section runs and stay inside the clock", () => {
    for (let i = 1; i < FULL.length; i++) {
      assert.ok(
        FULL[i].remainingTarget < FULL[i - 1].remainingTarget,
        "a later checkpoint must leave less time",
      );
    }
    assert.ok(FULL[0].remainingTarget < 45 * 60);
    assert.ok(FULL[FULL.length - 1].remainingTarget > 0);
  });

  test("the mini set gets its own derived targets", () => {
    const mini = sectionCheckpoints(15 * 60, 7, MINI_CHECKPOINT_QUESTIONS);
    assert.deepEqual(
      mini.map((cp) => cp.question),
      [3, 5],
    );
    for (const cp of mini) {
      const exact = 15 * 60 - (cp.question - 1) * ((15 * 60) / 7);
      assert.ok(Math.abs(cp.remainingTarget - exact) <= 30);
    }
  });

  test("a checkpoint past the end of the section is dropped", () => {
    const short = sectionCheckpoints(15 * 60, 7, [3, 5, 14, 18]);
    assert.deepEqual(
      short.map((cp) => cp.question),
      [3, 5],
    );
  });

  test("inside the band is on pace, in both directions", () => {
    const cp = FULL[0]; // Q5 · 36:00
    assert.equal(paceVerdict(36 * 60, cp), "on_pace");
    assert.equal(paceVerdict(36 * 60 + CHECKPOINT_BAND_SECONDS, cp), "on_pace");
    assert.equal(paceVerdict(36 * 60 - CHECKPOINT_BAND_SECONDS, cp), "on_pace");
  });

  test("the band is exclusive at its edges, so a verdict is never a tie", () => {
    const cp = FULL[0];
    assert.equal(paceVerdict(36 * 60 + CHECKPOINT_BAND_SECONDS + 1, cp), "ahead");
    assert.equal(paceVerdict(36 * 60 - CHECKPOINT_BAND_SECONDS - 1, cp), "behind");
  });

  test("more time remaining is ahead, less is behind — never inverted", () => {
    const cp = FULL[2]; // Q14 · 17:00
    assert.equal(paceVerdict(25 * 60, cp), "ahead");
    assert.equal(paceVerdict(9 * 60, cp), "behind");
    assert.equal(paceVerdict(0, cp), "behind");
  });

  test("checkpointFor returns the most recent one, and null before the first", () => {
    assert.equal(checkpointFor(1, FULL), null);
    assert.equal(checkpointFor(4, FULL), null);
    assert.equal(checkpointFor(5, FULL)?.question, 5);
    assert.equal(checkpointFor(8, FULL)?.question, 5);
    assert.equal(checkpointFor(9, FULL)?.question, 9);
    assert.equal(checkpointFor(21, FULL)?.question, 18);
  });

  test("checkpoints are memorable — four on the full section, two on the mini", () => {
    // The teaching claim is that four numbers is the whole system. If this
    // grows, the chapter and the runner have drifted apart.
    assert.equal(FULL.length, 4);
    assert.equal(
      sectionCheckpoints(15 * 60, 7, MINI_CHECKPOINT_QUESTIONS).length,
      2,
    );
  });
});
