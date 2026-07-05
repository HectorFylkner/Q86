import assert from "node:assert/strict";
import { test } from "node:test";
import { NEW_CARD, nextReview, previewIntervals } from "../lib/srs.ts";

test("good follows the 1d → 3d → interval×ease ladder", () => {
  const first = nextReview(null, "good");
  assert.equal(first.intervalDays, 1);
  assert.equal(first.reps, 1);
  const second = nextReview(first, "good");
  assert.equal(second.intervalDays, 3);
  const third = nextReview(second, "good");
  assert.equal(third.intervalDays, Math.round(3 * 2.5));
});

test("forgot resets the card and counts a lapse", () => {
  const mature = { ease: 2.5, intervalDays: 20, reps: 5, lapses: 0 };
  const after = nextReview(mature, "forgot");
  assert.equal(after.intervalDays, 1);
  assert.equal(after.reps, 0);
  assert.equal(after.lapses, 1);
  assert.ok(Math.abs(after.ease - 2.3) < 1e-9);
});

test("ease never drops below the 1.3 floor", () => {
  let state = { ease: 1.35, intervalDays: 1, reps: 0, lapses: 0 };
  state = nextReview(state, "forgot");
  assert.equal(state.ease, 1.3);
  state = nextReview(state, "forgot");
  assert.equal(state.ease, 1.3);
});

test("hard grows the interval slowly, never below 1 day", () => {
  const flat = nextReview({ ease: 2.5, intervalDays: 0, reps: 1, lapses: 0 }, "hard");
  assert.equal(flat.intervalDays, 1);
  const grown = nextReview({ ease: 2.5, intervalDays: 10, reps: 3, lapses: 0 }, "hard");
  assert.equal(grown.intervalDays, 12);
  assert.ok(Math.abs(grown.ease - 2.45) < 1e-9);
});

test("previewIntervals matches what each grade would schedule", () => {
  const state = { ease: 2.0, intervalDays: 10, reps: 4, lapses: 1 };
  const preview = previewIntervals(state);
  assert.equal(preview.forgot, nextReview(state, "forgot").intervalDays);
  assert.equal(preview.hard, nextReview(state, "hard").intervalDays);
  assert.equal(preview.good, nextReview(state, "good").intervalDays);
  assert.deepEqual(previewIntervals(null), { forgot: 1, hard: 1, good: 1 });
  // NEW_CARD is the null-state default the deck relies on.
  assert.equal(nextReview(null, "good").reps, NEW_CARD.reps + 1);
});
