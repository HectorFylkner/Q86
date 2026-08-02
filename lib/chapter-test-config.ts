/** Chapter-test contract, importable from client and server code alike
 *  (no database dependencies — the selection logic lives in
 *  lib/chapter-tests.ts). */

/**
 * Tiered chapter tests.
 *
 * The chapter test used to be one eight-question set spanning D2–D5 at a
 * single 75% bar. That measures the average of a chapter and hides both
 * ends of it: a student who is shaky on the basics but lucky on two hard
 * items passes, and a student who is solid on the basics and not yet
 * ready for the top band gets the same undifferentiated "not passed".
 *
 * The strongest curricula (TTP most explicitly) gate progression instead:
 * clear the easy set before the medium, the medium before the hard, and
 * the bar is *highest* where the questions are easiest. That last part is
 * the one people get backwards. Missing a foundation question is a defect
 * to repair; missing a top-band question is a normal outcome on an exam
 * where the hardest items are meant to be missed by most test-takers. So
 * the foundation bar is 5 of 6 and the two upper bars are 4 of 6.
 *
 * Bars are fractions, not counts, because bank depth per subtopic is
 * uneven (one subtopic has a single D3 item, another has no D4 at all).
 * A tier ships with however many questions the bank can actually supply
 * and scales its bar to that count, rather than refusing to run.
 */
export const CHAPTER_TIERS = ["foundation", "exam", "top_band"] as const;
export type ChapterTier = (typeof CHAPTER_TIERS)[number];

export type TierSpec = {
  label: string;
  /** One line, shown above the tier's button. */
  blurb: string;
  size: number;
  /** Pass bar as a fraction of the questions actually served. */
  bar: number;
};

export const TIER_SPEC: Record<ChapterTier, TierSpec> = {
  foundation: {
    label: "Foundation",
    blurb: "The easiest third of the chapter, at a high bar. Misses here are defects to fix.",
    size: 6,
    bar: 5 / 6,
  },
  exam: {
    label: "Exam level",
    blurb: "The middle band — where most of the section actually lives.",
    size: 6,
    bar: 4 / 6,
  },
  top_band: {
    label: "Top band",
    blurb: "The hardest third of the chapter. Two misses is a pass.",
    size: 6,
    bar: 4 / 6,
  },
};

// ── Bands: how a chapter's bank is divided between the three tiers ───────
//
// The tiers used to be defined by difficulty *windows* (foundation D2–D3,
// exam D3–D4, top band D4–D5) with a widening fallback when the window ran
// dry. Two things were wrong with that, both measured
// (`scripts/check-tiers.ts`, before-run recorded in docs/phase-log.md):
//
//   1. The windows overlap at D3 and D4, and each tier was filled
//      independently, so the *same question* was served by more than one
//      tier of the same chapter. All 24 chapters leaked; the worst pair
//      shared 5 of 6. Clearing Foundation and moving up re-showed the test
//      just passed, which is the exact opposite of a progression gate.
//   2. Where the bank is thin the fallback widened *downward as well as
//      upward*, so 9 of 24 chapters had a foundation tier reaching D4
//      while the exam tier above it started at D3. The ladder ran
//      backwards.
//
// Windows cannot express disjointness, because disjointness is a property
// of the three tiers together and a window is a property of one. So the
// tiers are now cut from one ordering instead: sort the chapter's verified
// questions by difficulty, then take three contiguous bands. Foundation is
// the easiest band, top band the hardest, exam the middle.
//
// This buys both invariants by construction and makes them provable rather
// than hoped for:
//   DISJOINT  contiguous slices of one array share no element.
//   MONOTONE  in a sorted array, every element of a lower slice is ≤ every
//             element of a higher one, so a tier can never reach past the
//             tier above it.
//
// What it costs: "Foundation" no longer promises D2–D3 in the abstract, it
// promises the easiest third of *this chapter*. Where a chapter has no easy
// items that is a bank problem, and the honest thing is to say so — the
// chapter page prints each band's true difficulty range, and unlike the old
// sampled range it is now a stable property of the chapter rather than a
// number that changed on every page load.

/**
 * How many questions each tier's band holds, for a chapter with `poolSize`
 * verified questions. The three bands tile the pool exactly.
 *
 * Above 18 (3 × 6) every tier can serve a full test, so the surplus is
 * split evenly — extra depth is what gives a retake different questions.
 * Below 18 something has to give, and it is the top band first: it is the
 * one tier that is not required for a chapter to read as passed. Each tier
 * is shrunk only to TIER_MIN_SIZE before the next one is touched.
 */
export function bandSizes(poolSize: number): Record<ChapterTier, number> {
  const n = Math.max(0, Math.floor(poolSize));
  const full = CHAPTER_TIERS.reduce((s, t) => s + TIER_SPEC[t].size, 0);

  if (n >= full) {
    const base = Math.floor(n / CHAPTER_TIERS.length);
    const rem = n % CHAPTER_TIERS.length;
    const sizes = Object.fromEntries(
      CHAPTER_TIERS.map((t) => [t, base]),
    ) as Record<ChapterTier, number>;
    // The remainder (0, 1 or 2) goes to the required tiers, in ladder order.
    for (let i = 0; i < rem; i++) sizes[REQUIRED_TIERS[i]]++;
    return sizes;
  }

  const sizes = Object.fromEntries(
    CHAPTER_TIERS.map((t) => [t, TIER_SPEC[t].size]),
  ) as Record<ChapterTier, number>;
  let deficit = full - n;
  // Shrink from the top of the ladder down, stopping at the minimum.
  const shrinkOrder = [...CHAPTER_TIERS].reverse();
  for (const tier of shrinkOrder) {
    if (deficit <= 0) break;
    const take = Math.min(deficit, Math.max(0, sizes[tier] - TIER_MIN_SIZE));
    sizes[tier] -= take;
    deficit -= take;
  }
  // Still short: the chapter is below 3 × TIER_MIN_SIZE, so tiers start
  // dropping out entirely rather than every tier becoming a stub.
  for (const tier of shrinkOrder) {
    if (deficit <= 0) break;
    const take = Math.min(deficit, sizes[tier]);
    sizes[tier] -= take;
    deficit -= take;
  }
  return sizes;
}

/**
 * Cut a chapter's questions into the three tier bands. Pure, and generic
 * over anything carrying an id and a difficulty, so it is tested directly
 * without a database.
 *
 * The sort is (difficulty, id) — id breaks ties so the same pool always
 * produces the same bands, and a band boundary does not wander between one
 * page load and the next.
 */
export function assignBands<T extends { id: number; difficulty: number }>(
  pool: T[],
): Record<ChapterTier, T[]> {
  const sorted = [...pool].sort(
    (a, b) => a.difficulty - b.difficulty || a.id - b.id,
  );
  const sizes = bandSizes(sorted.length);
  const out = {} as Record<ChapterTier, T[]>;
  let at = 0;
  for (const tier of CHAPTER_TIERS) {
    out[tier] = sorted.slice(at, at + sizes[tier]);
    at += sizes[tier];
  }
  return out;
}

/** The minimum a tier can ship with; below this the tier is unavailable
 *  rather than misleading. */
export const TIER_MIN_SIZE = 4;

/** Passing how many, out of how many were actually served. */
export function tierBarCount(tier: ChapterTier, served: number): number {
  return Math.ceil(served * TIER_SPEC[tier].bar);
}

export function tierPassed(
  tier: ChapterTier,
  correct: number,
  total: number,
): boolean {
  if (total <= 0) return false;
  return correct >= tierBarCount(tier, total);
}

/** The tiers that must be cleared for the chapter to read as passed.
 *  Top band is a stretch mark, not a requirement — a chapter is "known"
 *  when the foundations are solid and exam-level items land. */
export const REQUIRED_TIERS: ChapterTier[] = ["foundation", "exam"];

/** The tier a reader should attempt next: the lowest one not yet passed,
 *  or the top band once everything required is done. */
export function nextTier(
  passedTiers: Partial<Record<ChapterTier, boolean>>,
): ChapterTier {
  for (const tier of CHAPTER_TIERS) {
    if (!passedTiers[tier]) return tier;
  }
  return "top_band";
}

/** A tier is locked until the tier below it is passed. Progression is the
 *  point: attempting the top band on unproved foundations produces a
 *  score that teaches nothing. */
export function tierUnlocked(
  tier: ChapterTier,
  passedTiers: Partial<Record<ChapterTier, boolean>>,
): boolean {
  const i = CHAPTER_TIERS.indexOf(tier);
  if (i <= 0) return true;
  return passedTiers[CHAPTER_TIERS[i - 1]] === true;
}

// ── Legacy compatibility ─────────────────────────────────────────────────
// Sessions recorded before tiers existed carry `chapter_test` with no
// `chapter_tier`. That test was an eight-question D2–D5 blend at a 75%
// bar, which is at least as demanding as either required tier, so a
// legacy pass credits both. Nobody's record is demoted by this change.
export const LEGACY_CREDITS: ChapterTier[] = ["foundation", "exam"];
/** The bar those legacy sessions were actually taken under. */
export const LEGACY_BAR = 0.75;

/** @deprecated The single-test constants, still exported so older call
 *  sites keep compiling. New code should use TIER_SPEC. */
export const CHAPTER_TEST_SIZE = 6;
export const CHAPTER_TEST_BAR = 4 / 6;
