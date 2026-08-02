import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  CHAPTER_TIERS,
  LEGACY_BAR,
  LEGACY_CREDITS,
  REQUIRED_TIERS,
  TIER_MIN_SIZE,
  TIER_SPEC,
  nextTier,
  tierBarCount,
  tierPassed,
  tierUnlocked,
  type ChapterTier,
} from "../lib/chapter-test-config.ts";

const none: Partial<Record<ChapterTier, boolean>> = {};

describe("tiered chapter tests", () => {
  test("the bar is highest where the questions are easiest", () => {
    // The point people get backwards. Missing a foundation question is a
    // defect to repair; missing a top-band question is a normal outcome.
    assert.ok(TIER_SPEC.foundation.bar > TIER_SPEC.exam.bar);
    assert.ok(TIER_SPEC.foundation.bar > TIER_SPEC.top_band.bar);
  });

  test("tiers step upward in difficulty and never overlap fully", () => {
    for (let i = 1; i < CHAPTER_TIERS.length; i++) {
      const lower = TIER_SPEC[CHAPTER_TIERS[i - 1]].window;
      const upper = TIER_SPEC[CHAPTER_TIERS[i]].window;
      assert.ok(
        Math.max(...upper) > Math.max(...lower),
        `${CHAPTER_TIERS[i]} must reach higher than ${CHAPTER_TIERS[i - 1]}`,
      );
    }
  });

  test("the bar scales with what was actually served", () => {
    assert.equal(tierBarCount("foundation", 6), 5);
    assert.equal(tierBarCount("foundation", 4), 4); // ceil(4 * 5/6)
    assert.equal(tierBarCount("exam", 6), 4);
    assert.equal(tierBarCount("top_band", 4), 3); // ceil(4 * 2/3)
  });

  test("a bar never exceeds the questions served or falls to zero", () => {
    for (const tier of CHAPTER_TIERS) {
      for (let served = TIER_MIN_SIZE; served <= 12; served++) {
        const bar = tierBarCount(tier, served);
        assert.ok(bar >= 1 && bar <= served, `${tier} at ${served}: bar ${bar}`);
      }
    }
  });

  test("a perfect score passes every tier; an empty run passes none", () => {
    for (const tier of CHAPTER_TIERS) {
      assert.equal(tierPassed(tier, 6, 6), true);
      assert.equal(tierPassed(tier, 0, 0), false, "no division by zero");
      assert.equal(tierPassed(tier, 0, 6), false);
    }
  });

  test("5 of 6 passes the foundation, 4 of 6 does not", () => {
    assert.equal(tierPassed("foundation", 5, 6), true);
    assert.equal(tierPassed("foundation", 4, 6), false);
    assert.equal(tierPassed("exam", 4, 6), true);
    assert.equal(tierPassed("top_band", 4, 6), true);
    assert.equal(tierPassed("top_band", 3, 6), false);
  });

  test("only the first tier is open before anything is passed", () => {
    assert.equal(tierUnlocked("foundation", none), true);
    assert.equal(tierUnlocked("exam", none), false);
    assert.equal(tierUnlocked("top_band", none), false);
  });

  test("each pass unlocks exactly the next rung, never two", () => {
    const afterFoundation = { foundation: true };
    assert.equal(tierUnlocked("exam", afterFoundation), true);
    assert.equal(tierUnlocked("top_band", afterFoundation), false);
    const afterExam = { foundation: true, exam: true };
    assert.equal(tierUnlocked("top_band", afterExam), true);
  });

  test("a skipped tier does not unlock the one above it", () => {
    // Passing the exam tier without the foundation should not be
    // reachable, but if a record ever shows it, the ladder must not
    // silently open the top band on an unproved base.
    assert.equal(tierUnlocked("exam", { exam: true }), false);
  });

  test("nextTier walks up the ladder and stops at the top", () => {
    assert.equal(nextTier(none), "foundation");
    assert.equal(nextTier({ foundation: true }), "exam");
    assert.equal(nextTier({ foundation: true, exam: true }), "top_band");
    assert.equal(
      nextTier({ foundation: true, exam: true, top_band: true }),
      "top_band",
    );
  });

  test("the chapter passes on the required tiers, not the top band", () => {
    assert.deepEqual(REQUIRED_TIERS, ["foundation", "exam"]);
    assert.ok(!REQUIRED_TIERS.includes("top_band"));
  });

  test("a legacy pass credits every required tier, so nobody is demoted", () => {
    // The old test was 8 questions, D2-D5, at a 75% bar. Re-judging a
    // 6/8 legacy pass against the foundation bar would need 7/8 and
    // would silently un-pass chapters the user already cleared.
    assert.ok(6 / 8 >= LEGACY_BAR);
    assert.equal(tierPassed("foundation", 6, 8), false, "why re-judging is wrong");
    for (const tier of REQUIRED_TIERS) {
      assert.ok(
        LEGACY_CREDITS.includes(tier),
        `${tier} must be credited by a legacy pass`,
      );
    }
  });

  test("every tier has a label and a blurb that says what it is for", () => {
    for (const tier of CHAPTER_TIERS) {
      assert.ok(TIER_SPEC[tier].label.length > 0);
      assert.ok(TIER_SPEC[tier].blurb.length > 20, `${tier} needs a real blurb`);
      assert.ok(TIER_SPEC[tier].size >= TIER_MIN_SIZE);
    }
  });
});
