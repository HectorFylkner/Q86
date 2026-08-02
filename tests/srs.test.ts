import assert from "node:assert/strict";
import test, { describe } from "node:test";
import { NEW_CARD, nextReview, previewIntervals } from "../lib/srs.ts";

/**
 * The takeaway deck's scheduling. Intervals that drift silently would
 * change how often every card is seen without any visible symptom.
 */
describe("SRS", () => {
  test("a new card graded good starts at one day, then three", () => {
    const first = nextReview(null, "good");
    assert.equal(first.intervalDays, 1);
    assert.equal(first.reps, 1);
    const second = nextReview(first, "good");
    assert.equal(second.intervalDays, 3);
    assert.equal(second.reps, 2);
  });

  test("after the third good grade the interval multiplies by ease", () => {
    let s = nextReview(null, "good");
    s = nextReview(s, "good");
    const third = nextReview(s, "good");
    assert.equal(third.intervalDays, Math.round(3 * NEW_CARD.ease));
  });

  test("good never lowers ease", () => {
    let s = nextReview(null, "good");
    for (let i = 0; i < 10; i++) {
      const next = nextReview(s, "good");
      assert.ok(next.ease >= s.ease);
      s = next;
    }
  });

  test("forgot resets the interval, counts a lapse, and lowers ease", () => {
    let s = nextReview(null, "good");
    s = nextReview(s, "good");
    s = nextReview(s, "good");
    const lapsed = nextReview(s, "forgot");
    assert.equal(lapsed.intervalDays, 1);
    assert.equal(lapsed.reps, 0);
    assert.equal(lapsed.lapses, s.lapses + 1);
    assert.ok(lapsed.ease < s.ease);
  });

  test("ease is floored at 1.3 however often a card is forgotten", () => {
    let s = NEW_CARD;
    for (let i = 0; i < 50; i++) s = nextReview(s, "forgot");
    assert.equal(s.ease, 1.3);
  });

  test("a struggling card can never spiral into daily-forever", () => {
    // Floor the ease, then grade good: the interval must still grow.
    let s = NEW_CARD;
    for (let i = 0; i < 50; i++) s = nextReview(s, "forgot");
    let good = nextReview(s, "good");
    good = nextReview(good, "good");
    const third = nextReview(good, "good");
    assert.ok(third.intervalDays > 1, `interval stuck at ${third.intervalDays}`);
  });

  test("hard grows the interval more slowly than good", () => {
    let base = nextReview(null, "good");
    base = nextReview(base, "good");
    const hard = nextReview(base, "hard");
    const good = nextReview(base, "good");
    assert.ok(hard.intervalDays < good.intervalDays);
    assert.ok(hard.intervalDays >= 1);
    assert.ok(hard.ease < base.ease);
  });

  test("intervals never go below one day on any grade", () => {
    let s: ReturnType<typeof nextReview> | null = null;
    const grades = ["good", "hard", "forgot", "hard", "good"] as const;
    for (let round = 0; round < 8; round++) {
      for (const g of grades) {
        s = nextReview(s, g);
        assert.ok(s.intervalDays >= 1, `interval ${s.intervalDays} after ${g}`);
      }
    }
  });

  test("the preview shown on the buttons is what the grade actually does", () => {
    const state = nextReview(nextReview(null, "good"), "good");
    const preview = previewIntervals(state);
    for (const grade of ["forgot", "hard", "good"] as const) {
      assert.equal(preview[grade], nextReview(state, grade).intervalDays);
    }
  });
});
