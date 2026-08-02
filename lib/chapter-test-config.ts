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
  /** Difficulties preferred for this tier, in fill order. */
  window: number[];
  /** Difficulties to widen into when the window runs dry, in order. */
  fallback: number[];
  size: number;
  /** Pass bar as a fraction of the questions actually served. */
  bar: number;
};

export const TIER_SPEC: Record<ChapterTier, TierSpec> = {
  foundation: {
    label: "Foundation",
    blurb: "The mechanics, at a high bar. Misses here are defects to fix.",
    window: [2, 3],
    fallback: [4, 5],
    size: 6,
    bar: 5 / 6,
  },
  exam: {
    label: "Exam level",
    blurb: "Where most of the section actually lives.",
    window: [3, 4],
    fallback: [5, 2],
    size: 6,
    bar: 4 / 6,
  },
  top_band: {
    label: "Top band",
    blurb: "The hardest items in the chapter. Two misses is a pass.",
    window: [4, 5],
    fallback: [3, 2],
    size: 6,
    bar: 4 / 6,
  },
};

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
