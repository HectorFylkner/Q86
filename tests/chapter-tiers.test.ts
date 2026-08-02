import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
  CHAPTER_TIERS,
  LEGACY_BAR,
  LEGACY_CREDITS,
  REQUIRED_TIERS,
  TIER_MIN_SIZE,
  TIER_SPEC,
  assignBands,
  bandSizes,
  nextTier,
  tierBarCount,
  tierPassed,
  tierUnlocked,
  type ChapterTier,
} from "../lib/chapter-test-config.ts";

const none: Partial<Record<ChapterTier, boolean>> = {};

/** A synthetic chapter: `counts` maps difficulty to how many items. */
function pool(counts: Record<number, number>) {
  const out: Array<{ id: number; difficulty: number }> = [];
  let id = 1;
  for (const [d, n] of Object.entries(counts)) {
    for (let i = 0; i < n; i++) out.push({ id: id++, difficulty: Number(d) });
  }
  // Deliberately shuffled: the partition must not depend on input order.
  return out.sort((a, b) => ((a.id * 7919) % 97) - ((b.id * 7919) % 97));
}

describe("tiered chapter tests", () => {
  test("the bar is highest where the questions are easiest", () => {
    // The point people get backwards. Missing a foundation question is a
    // defect to repair; missing a top-band question is a normal outcome.
    assert.ok(TIER_SPEC.foundation.bar > TIER_SPEC.exam.bar);
    assert.ok(TIER_SPEC.foundation.bar > TIER_SPEC.top_band.bar);
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

describe("tier bands — the ladder's two invariants", () => {
  test("the bands tile the pool exactly, at every size", () => {
    for (let n = 0; n <= 60; n++) {
      const sizes = bandSizes(n);
      const total = CHAPTER_TIERS.reduce((s, t) => s + sizes[t], 0);
      assert.equal(total, n, `bands must sum to the pool at n=${n}`);
      for (const t of CHAPTER_TIERS) {
        assert.ok(sizes[t] >= 0, `${t} went negative at n=${n}`);
      }
    }
  });

  test("DISJOINT — no question is served by two tiers of a chapter", () => {
    // The defect this replaced: tiers were filled independently from
    // overlapping difficulty windows, so all 24 chapters shared questions
    // between rungs and the worst pair shared 5 of 6.
    for (let n = 0; n <= 60; n++) {
      const bands = assignBands(pool({ 2: 0, 3: n }));
      const ids = CHAPTER_TIERS.flatMap((t) => bands[t].map((q) => q.id));
      assert.equal(new Set(ids).size, ids.length, `duplicate at n=${n}`);
    }
    const uneven = assignBands(pool({ 2: 2, 3: 4, 4: 6, 5: 4 }));
    const ids = CHAPTER_TIERS.flatMap((t) => uneven[t].map((q) => q.id));
    assert.equal(new Set(ids).size, 16);
  });

  test("MONOTONE — a tier never reaches past the tier above it", () => {
    // 9 of 24 chapters used to fail this: the foundation tier widened up
    // into D4 while the exam tier above it still started at D3.
    const shapes: Array<Record<number, number>> = [
      { 2: 2, 3: 4, 4: 6, 5: 4 }, // quadratics_factoring
      { 3: 4, 4: 4, 5: 8 }, // functions_sequences
      { 2: 6, 3: 6, 5: 4 }, // min_max_optimization — no D4 at all
      { 3: 1, 4: 8, 5: 10 }, // interest_profit_discount
      { 3: 9, 4: 19, 5: 4 }, // algebraic_translation
      { 4: 20 }, // degenerate: one difficulty only
    ];
    for (const shape of shapes) {
      const bands = assignBands(pool(shape));
      for (let i = 1; i < CHAPTER_TIERS.length; i++) {
        const lower = bands[CHAPTER_TIERS[i - 1]].map((q) => q.difficulty);
        const upper = bands[CHAPTER_TIERS[i]].map((q) => q.difficulty);
        if (lower.length === 0 || upper.length === 0) continue;
        assert.ok(
          Math.max(...lower) <= Math.min(...upper),
          `${JSON.stringify(shape)}: ${CHAPTER_TIERS[i - 1]} reaches D${Math.max(
            ...lower,
          )} but ${CHAPTER_TIERS[i]} starts at D${Math.min(...upper)}`,
        );
      }
    }
  });

  test("the partition does not depend on the order the pool arrives in", () => {
    const counts = { 2: 2, 3: 5, 4: 7, 5: 6 };
    const a = assignBands(pool(counts));
    const b = assignBands([...pool(counts)].reverse());
    for (const t of CHAPTER_TIERS) {
      assert.deepEqual(
        a[t].map((q) => q.id),
        b[t].map((q) => q.id),
        `${t} band moved when the input was reordered`,
      );
    }
  });

  test("a thin chapter shrinks the optional tier, not the required ones", () => {
    // 3 non-overlapping tests of 6 need 18 items. Below that something
    // must give, and it is the top band — the one tier a chapter does not
    // need to pass.
    assert.deepEqual(bandSizes(18), { foundation: 6, exam: 6, top_band: 6 });
    assert.deepEqual(bandSizes(17), { foundation: 6, exam: 6, top_band: 5 });
    assert.deepEqual(bandSizes(16), { foundation: 6, exam: 6, top_band: 4 });
    for (const t of REQUIRED_TIERS) {
      assert.equal(bandSizes(16)[t], TIER_SPEC[t].size, `${t} must stay full`);
    }
  });

  test("surplus depth is shared, so a retake of a deep chapter can differ", () => {
    assert.deepEqual(bandSizes(24), { foundation: 8, exam: 8, top_band: 8 });
    assert.deepEqual(bandSizes(32), { foundation: 11, exam: 11, top_band: 10 });
    // The remainder goes to the required tiers, in ladder order.
    assert.deepEqual(bandSizes(19), { foundation: 7, exam: 6, top_band: 6 });
  });

  test("every tier of an 18-item chapter can serve a full-size test", () => {
    const sizes = bandSizes(18);
    for (const t of CHAPTER_TIERS) {
      assert.ok(
        Math.min(TIER_SPEC[t].size, sizes[t]) === TIER_SPEC[t].size,
        `${t} cannot fill at 18`,
      );
    }
  });

  test("below three minimum-size tiers, rungs drop out rather than stub", () => {
    // A 2-question "tier" would be a score that teaches nothing, so the
    // ladder loses a rung instead of pretending to have one.
    const sizes = bandSizes(10);
    assert.ok(sizes.foundation >= TIER_MIN_SIZE);
    assert.ok(sizes.exam >= TIER_MIN_SIZE);
    assert.ok(sizes.top_band < TIER_MIN_SIZE);
    assert.equal(
      CHAPTER_TIERS.reduce((s, t) => s + sizes[t], 0),
      10,
    );
  });
});
