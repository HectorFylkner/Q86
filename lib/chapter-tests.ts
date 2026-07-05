import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, sessions, type Question } from "./db/schema.ts";
import { selectQuestions } from "./engine.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";

/**
 * Chapter tests: the gate between reading a chapter and trusting it.
 * Three difficulty tiers (easy → medium → hard), each seven questions
 * at an 85% bar; clearing a tier marks it passed on the Learn index.
 * A pass is permanent (retakes can't demote you), but passes go stale:
 * after RECERT_AFTER_DAYS, or when recent drill accuracy in the chapter
 * slips, the chapter asks to be re-certified at its highest passed tier.
 */
import {
  CHAPTER_TEST_BAR,
  CHAPTER_TEST_SIZE,
  CHAPTER_TIERS,
  RECERT_AFTER_DAYS,
  RECERT_SLIP_BAR,
  TIER_BAR,
  TIER_BLENDS,
  TIER_SIZE,
  type ChapterTier,
} from "./chapter-test-config.ts";

export {
  CHAPTER_TEST_BAR,
  CHAPTER_TEST_SIZE,
  TIER_BAR,
  TIER_SIZE,
  type ChapterTier,
};

export async function selectChapterTest(
  subtopic: Subtopic,
  tier: ChapterTier,
): Promise<Question[]> {
  const blend = TIER_BLENDS[tier];
  const tierMin = Math.min(...blend.map(([d]) => d));
  const tierMax = Math.max(...blend.map(([d]) => d));
  const picked: Question[] = [];
  for (const [difficulty, n] of blend) {
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          difficultyMin: difficulty,
          difficultyMax: difficulty,
          excludeIds: picked.map((q) => q.id),
        },
        n,
      )),
    );
  }
  // Backfill inside the tier's difficulty span first, then anywhere in
  // the chapter, so thin cells still yield a full test.
  if (picked.length < TIER_SIZE) {
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          difficultyMin: tierMin,
          difficultyMax: tierMax,
          excludeIds: picked.map((q) => q.id),
        },
        TIER_SIZE - picked.length,
      )),
    );
  }
  if (picked.length < TIER_SIZE) {
    picked.push(
      ...(await selectQuestions(
        { subtopics: [subtopic], excludeIds: picked.map((q) => q.id) },
        TIER_SIZE - picked.length,
      )),
    );
  }
  return picked
    .slice(0, TIER_SIZE)
    .sort((a, b) => a.difficulty - b.difficulty);
}

export type TierState = {
  passed: boolean;
  passedAt: number | null;
  lastCorrect: number;
  lastTotal: number;
  lastAt: number;
};

export type ChapterTestState = {
  /** Any tier (or a legacy mixed test) passed. */
  passed: boolean;
  lastCorrect: number;
  lastTotal: number;
  lastAt: number;
  tiers: Partial<Record<ChapterTier, TierState>>;
  highest: ChapterTier | null;
  /** The tier the next take should target: first unpassed, or the
   *  highest passed one when the ladder is complete (re-certification). */
  next: ChapterTier;
  latestPassAt: number | null;
};

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
    const config = s.config as {
      chapter_test?: string;
      chapter_tier?: string;
    };
    const sub = config.chapter_test;
    if (!sub || !ALL_SUBTOPICS.includes(sub as Subtopic)) continue;
    const summary = (s.summary ?? {}) as { total?: number; correct?: number };
    if (!summary.total) continue;
    const correct = summary.correct ?? 0;
    const at = (s.endedAt ?? s.startedAt).getTime();
    // Legacy mixed-blend sessions carry no tier: they count as easy,
    // graded against the old 75% bar they were taken under.
    const tier: ChapterTier = CHAPTER_TIERS.includes(
      config.chapter_tier as ChapterTier,
    )
      ? (config.chapter_tier as ChapterTier)
      : "easy";
    const bar = config.chapter_tier ? TIER_BAR : CHAPTER_TEST_BAR;
    const passedNow = correct / summary.total >= bar;

    const state: ChapterTestState = out[sub as Subtopic] ?? {
      passed: false,
      lastCorrect: 0,
      lastTotal: 0,
      lastAt: 0,
      tiers: {},
      highest: null,
      next: "easy",
      latestPassAt: null,
    };
    const prevTier = state.tiers[tier];
    state.tiers[tier] = {
      passed: (prevTier?.passed ?? false) || passedNow,
      passedAt: passedNow
        ? Math.max(at, prevTier?.passedAt ?? 0)
        : (prevTier?.passedAt ?? null),
      lastCorrect: prevTier && prevTier.lastAt > at ? prevTier.lastCorrect : correct,
      lastTotal:
        prevTier && prevTier.lastAt > at
          ? prevTier.lastTotal
          : summary.total,
      lastAt: Math.max(at, prevTier?.lastAt ?? 0),
    };
    state.passed = state.passed || passedNow;
    if (at >= state.lastAt) {
      state.lastAt = at;
      state.lastCorrect = correct;
      state.lastTotal = summary.total;
    }
    out[sub as Subtopic] = state;
  }

  for (const state of Object.values(out)) {
    if (!state) continue;
    const passedTiers = CHAPTER_TIERS.filter((t) => state.tiers[t]?.passed);
    state.highest = passedTiers.at(-1) ?? null;
    state.next =
      CHAPTER_TIERS.find((t) => !state.tiers[t]?.passed) ??
      state.highest ??
      "easy";
    const stamps = passedTiers
      .map((t) => state.tiers[t]?.passedAt)
      .filter((x): x is number => x != null && x > 0);
    state.latestPassAt = stamps.length > 0 ? Math.max(...stamps) : null;
  }
  return out;
}

export type RecertReason = "stale" | "slipping";

/** Why a passed chapter should be re-proved, if at all. Pure. */
export function recertReason(
  state: Pick<ChapterTestState, "passed" | "latestPassAt">,
  recentAccuracy: { correct: number; total: number } | null,
  nowMs: number,
): RecertReason | null {
  if (!state.passed) return null;
  if (
    recentAccuracy != null &&
    recentAccuracy.total >= 6 &&
    recentAccuracy.correct / recentAccuracy.total < RECERT_SLIP_BAR
  ) {
    return "slipping";
  }
  if (
    state.latestPassAt != null &&
    nowMs - state.latestPassAt > RECERT_AFTER_DAYS * 86_400_000
  ) {
    return "stale";
  }
  return null;
}

export type ChapterRecert = {
  subtopic: Subtopic;
  reason: RecertReason;
  tier: ChapterTier;
};

/** Passed chapters that have gone stale or started slipping in recent
 *  drills — surfaced on the Learn index and the daily plan. */
export async function chapterRecerts(): Promise<ChapterRecert[]> {
  const states = await chapterTestStates();
  const recent = await db
    .select({ subtopic: questions.subtopic, correct: attempts.correct })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.focus, "focused"))
    .orderBy(desc(attempts.id))
    .limit(4000)
    .all();
  const bySubtopic = new Map<string, { correct: number; total: number }>();
  for (const r of recent) {
    const s = bySubtopic.get(r.subtopic) ?? { correct: 0, total: 0 };
    if (s.total < 10) {
      s.total++;
      if (r.correct) s.correct++;
      bySubtopic.set(r.subtopic, s);
    }
  }
  const now = Date.now();
  const out: ChapterRecert[] = [];
  for (const subtopic of ALL_SUBTOPICS) {
    const state = states[subtopic];
    if (!state) continue;
    const reason = recertReason(
      state,
      bySubtopic.get(subtopic) ?? null,
      now,
    );
    if (reason) {
      out.push({ subtopic, reason, tier: state.highest ?? "easy" });
    }
  }
  return out;
}
