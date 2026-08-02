import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { sessions, type Question } from "./db/schema.ts";
import { selectQuestions } from "./engine.ts";
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
  tierPassed,
  type ChapterTier,
} from "./chapter-test-config.ts";

export {
  CHAPTER_TIERS,
  TIER_SPEC,
  tierBarCount,
  tierPassed,
  tierUnlocked,
  nextTier,
  type ChapterTier,
} from "./chapter-test-config.ts";

/**
 * Build one tier. Fills from the tier's own difficulty window first,
 * round-robin so the tier is not three questions of one difficulty, then
 * widens into the fallback difficulties only if the bank is too thin.
 *
 * Widening is why bars are fractions. Subtopic depth is genuinely uneven
 * — `interest_profit_discount` has a single item below D4, and
 * `min_max_optimization` has none at D4 — so a rigid blend would leave
 * some chapters with no runnable foundation tier at all. A short tier
 * that says how many it served beats a tier that refuses to run.
 */
export async function selectChapterTest(
  subtopic: Subtopic,
  tier: ChapterTier = "foundation",
): Promise<Question[]> {
  const spec = TIER_SPEC[tier];
  const picked: Question[] = [];

  const drawFrom = async (difficulty: number, want: number) => {
    if (want <= 0) return;
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          difficultyMin: difficulty,
          difficultyMax: difficulty,
          excludeIds: picked.map((q) => q.id),
        },
        want,
      )),
    );
  };

  // Even split across the window, remainder to the harder end so a tier
  // never skews easy.
  const per = Math.floor(spec.size / spec.window.length);
  for (let i = 0; i < spec.window.length; i++) {
    const extra = i >= spec.window.length - (spec.size % spec.window.length);
    await drawFrom(spec.window[i], per + (extra ? 1 : 0));
  }
  // Whatever the window could not supply, take from the window again
  // (a difficulty may have had more than its share) and then outward.
  for (const difficulty of [...spec.window, ...spec.fallback]) {
    if (picked.length >= spec.size) break;
    await drawFrom(difficulty, spec.size - picked.length);
  }

  return picked
    .slice(0, spec.size)
    .sort((a, b) => a.difficulty - b.difficulty || a.id - b.id);
}

export type TierShape = {
  available: boolean;
  size: number;
  /** The difficulties this tier actually draws, as "D3–D4" — the tier's
   *  *label* is a promise about where a chapter sits in the curriculum,
   *  and where the bank is thin the promise and the questions diverge.
   *  Two subtopics do diverge today: interest_profit_discount has one
   *  item below D4, so its foundation tier is D3–D4, and
   *  min_max_optimization has no D4 at all, so its top band is D3/D5.
   *  Printing the range is what keeps the label from lying. */
  range: string;
};

/** What a tier would actually serve for this chapter. */
export async function tierShape(
  subtopic: Subtopic,
  tier: ChapterTier,
): Promise<TierShape> {
  const picked = await selectChapterTest(subtopic, tier);
  const ds = picked.map((q) => q.difficulty);
  const lo = Math.min(...ds);
  const hi = Math.max(...ds);
  return {
    available: picked.length >= TIER_MIN_SIZE,
    size: picked.length,
    range: ds.length === 0 ? "—" : lo === hi ? `D${lo}` : `D${lo}–D${hi}`,
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
