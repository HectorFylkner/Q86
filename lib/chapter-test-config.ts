/** Chapter-test contract, importable from client and server code alike
 *  (no database dependencies — the selection logic lives in
 *  lib/chapter-tests.ts). */

/** Legacy mixed-blend tests (pre-tier sessions) graded against this. */
export const CHAPTER_TEST_SIZE = 8;
export const CHAPTER_TEST_BAR = 0.75; // 6 of 8

/** Difficulty-tiered tests: pass a tier at ≥85% (6 of 7), then step up.
 *  Advisory rungs — any tier can be taken at any time. */
export const CHAPTER_TIERS = ["easy", "medium", "hard"] as const;
export type ChapterTier = (typeof CHAPTER_TIERS)[number];

export const TIER_SIZE = 7;
export const TIER_BAR = 0.85; // 6 of 7

export const TIER_BLENDS: Record<
  ChapterTier,
  Array<[difficulty: number, n: number]>
> = {
  easy: [
    [2, 3],
    [3, 4],
  ],
  medium: [
    [3, 3],
    [4, 4],
  ],
  hard: [
    [4, 4],
    [5, 3],
  ],
};

export const TIER_LABELS: Record<ChapterTier, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/** A chapter pass goes stale after this many days without re-proving. */
export const RECERT_AFTER_DAYS = 28;
/** Recent drill accuracy below this flags a passed chapter as slipping. */
export const RECERT_SLIP_BAR = 0.7;
