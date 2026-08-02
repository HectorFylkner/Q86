import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { sessions, type Question } from "./db/schema.ts";
import { listQuestions, selectQuestions } from "./engine.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";

/**
 * Chapter tests: the gate between reading a chapter and trusting it.
 * Three tiers per chapter — foundation, exam level, top band — each with
 * its own bar, each locked until the one below it is passed. Clearing the
 * two required tiers marks the chapter passed on the Learn index.
 *
 * A pass is permanent (retakes can't demote you), but the latest score
 * always shows, so a slipped retake is visible.
 */
import {
  CHAPTER_TIERS,
  LEGACY_BAR,
  LEGACY_CREDITS,
  TIER_MIN_SIZE,
  TIER_SPEC,
  REQUIRED_TIERS,
  assignBands,
  tierPassed,
  type ChapterTier,
} from "./chapter-test-config.ts";

export {
  CHAPTER_TIERS,
  TIER_SPEC,
  assignBands,
  bandSizes,
  tierBarCount,
  tierPassed,
  tierUnlocked,
  nextTier,
  type ChapterTier,
} from "./chapter-test-config.ts";

/**
 * The chapter's verified questions cut into the three tier bands.
 *
 * One query per chapter, then a pure partition — the disjointness of the
 * tiers is a property of `assignBands`, not of how many times this is
 * called or in what order, which is what the previous per-tier fill got
 * wrong (each tier was filled in ignorance of the others).
 */
export async function chapterBands(
  subtopic: Subtopic,
): Promise<Record<ChapterTier, Question[]>> {
  return assignBands(await listQuestions({ subtopics: [subtopic] }));
}

/**
 * Build one tier: draw its whole band, or a full-size test from within it
 * when the band is deeper than a test.
 *
 * The band is fixed; which of its questions a given run serves is not, so
 * a retake of a deep chapter is a different test while still being drawn
 * from the same rung of the ladder. Where the band is exactly test-sized
 * (any chapter under 18 verified questions) the retake is the same six —
 * that is bank depth, not selection, and 3 non-overlapping tests of 6 need
 * 18 items to exist at all.
 */
export async function selectChapterTest(
  subtopic: Subtopic,
  tier: ChapterTier = "foundation",
): Promise<Question[]> {
  const band = (await chapterBands(subtopic))[tier];
  if (band.length === 0) return [];
  const want = Math.min(TIER_SPEC[tier].size, band.length);
  const picked = await selectQuestions({ ids: band.map((q) => q.id) }, want);
  return picked.sort((a, b) => a.difficulty - b.difficulty || a.id - b.id);
}

export type TierShape = {
  available: boolean;
  size: number;
  /** The difficulty range of this tier's *band* — the pool the test is
   *  drawn from, so it is a stable property of the chapter rather than of
   *  one draw. The tier label is a promise about where a chapter sits in
   *  the curriculum, and where the bank has no easy items the promise and
   *  the questions diverge: `interest_profit_discount` has one item below
   *  D4, so its foundation band is D3–D4. Printing the range is what keeps
   *  the label from lying. */
  range: string;
};

function rangeOf(ds: number[]): string {
  if (ds.length === 0) return "—";
  const lo = Math.min(...ds);
  const hi = Math.max(...ds);
  return lo === hi ? `D${lo}` : `D${lo}–D${hi}`;
}

/** What a tier would actually serve for this chapter. */
export async function tierShape(
  subtopic: Subtopic,
  tier: ChapterTier,
): Promise<TierShape> {
  return tierShapeFromBands((await chapterBands(subtopic))[tier], tier);
}

/** The same read, when the caller already holds the chapter's bands — the
 *  chapter page needs all three and should not re-query for each. */
export function tierShapeFromBands(
  band: Question[],
  tier: ChapterTier,
): TierShape {
  const size = Math.min(TIER_SPEC[tier].size, band.length);
  return {
    available: size >= TIER_MIN_SIZE,
    size,
    range: rangeOf(band.map((q) => q.difficulty)),
  };
}

/** Whether a tier has enough bank behind it to be worth offering. */
export async function tierAvailable(
  subtopic: Subtopic,
  tier: ChapterTier,
): Promise<boolean> {
  return (await tierShape(subtopic, tier)).available;
}

export type TierState = {
  passed: boolean;
  lastCorrect: number;
  lastTotal: number;
  lastAt: number;
};

export type ChapterTestState = {
  /** The chapter reads as passed when every required tier is cleared. */
  passed: boolean;
  tiers: Partial<Record<ChapterTier, TierState>>;
  /** Convenience for the index badges: the most recent tier attempt. */
  lastCorrect: number;
  lastTotal: number;
  lastAt: number;
};

function fold(
  prev: TierState | undefined,
  correct: number,
  total: number,
  at: number,
  passedNow: boolean,
): TierState {
  const newer = !prev || at >= prev.lastAt;
  return {
    passed: (prev?.passed ?? false) || passedNow,
    lastCorrect: newer ? correct : prev.lastCorrect,
    lastTotal: newer ? total : prev.lastTotal,
    lastAt: Math.max(at, prev?.lastAt ?? 0),
  };
}

export async function chapterTestStates(): Promise<
  Partial<Record<Subtopic, ChapterTestState>>
> {
  const rows = await db
    .select({
      config: sessions.config,
      summary: sessions.summary,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
    })
    .from(sessions)
    .where(and(eq(sessions.mode, "drill"), isNotNull(sessions.endedAt)))
    .all();

  const out: Partial<Record<Subtopic, ChapterTestState>> = {};
  for (const s of rows) {
    const config = s.config as { chapter_test?: string; chapter_tier?: string };
    const sub = config.chapter_test;
    if (!sub || !ALL_SUBTOPICS.includes(sub as Subtopic)) continue;
    const summary = (s.summary ?? {}) as { total?: number; correct?: number };
    if (!summary.total) continue;

    const correct = summary.correct ?? 0;
    const total = summary.total;
    const at = (s.endedAt ?? s.startedAt).getTime();
    const key = sub as Subtopic;
    const state: ChapterTestState = out[key] ?? {
      passed: false,
      tiers: {},
      lastCorrect: 0,
      lastTotal: 0,
      lastAt: 0,
    };

    const recorded = config.chapter_tier as ChapterTier | undefined;
    const isTiered = recorded !== undefined && CHAPTER_TIERS.includes(recorded);

    if (isTiered) {
      state.tiers[recorded] = fold(
        state.tiers[recorded],
        correct,
        total,
        at,
        tierPassed(recorded, correct, total),
      );
    } else {
      // Recorded before tiers existed: an eight-question D2–D5 blend at a
      // 75% bar. That is at least as demanding as either required tier, so
      // a legacy pass credits both — evaluated against the bar it was
      // actually taken under, never re-judged against a tier bar it was
      // never shown. Nobody's record is demoted by this change.
      const legacyPassed = correct / total >= LEGACY_BAR;
      for (const tier of LEGACY_CREDITS) {
        state.tiers[tier] = fold(
          state.tiers[tier],
          correct,
          total,
          at,
          legacyPassed,
        );
      }
    }

    if (at >= state.lastAt) {
      state.lastCorrect = correct;
      state.lastTotal = total;
      state.lastAt = at;
    }
    state.passed = REQUIRED_TIERS.every((t) => state.tiers[t]?.passed === true);
    out[key] = state;
  }
  return out;
}
