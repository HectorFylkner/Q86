import { and, eq, gte, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, sessions, type Question } from "./db/schema.ts";
import { CHAPTER_TIERS, type ChapterTier } from "./chapter-test-config.ts";
import { chapterBands, chapterTestStates } from "./chapter-tests.ts";
import { listQuestions, selectQuestions } from "./engine.ts";
import { interleave } from "./interleave.ts";
import {
  REVIEW_PER_CHAPTER,
  dueChapters,
  nextChapterReviewStage,
  reviewDelayDays,
  reviewDueAt,
  reviewMovement,
  reviewShape,
  type ChapterReviewStage,
  type ChapterReviewState,
  type ReviewMovement,
} from "./cumulative-config.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";

export {
  CHAPTER_REVIEW_STAGE_DAYS,
  REVIEW_MAX_CHAPTERS,
  REVIEW_MIN_CHAPTERS,
  REVIEW_PER_CHAPTER,
  daysOverdue,
  dueChapters,
  nextChapterReviewStage,
  reviewDueAt,
  reviewMovement,
  reviewShape,
  type ChapterReviewStage,
  type ChapterReviewState,
  type ReviewMovement,
} from "./cumulative-config.ts";

/** Questions touched inside this window are not served again by a review —
 *  a "review" of something answered yesterday measures nothing. Shorter
 *  than the 21-day redo horizon so a thin chapter's pool cannot empty. */
const RECENT_DAYS = 7;

type ReviewSessionRow = {
  chapters: Subtopic[];
  bySubtopic: Record<string, { correct: number; total: number }>;
  at: number;
};

/** Completed cumulative-review sessions, oldest first. Derived from the
 *  sessions table exactly as chapter tests and diagnostics are, so this
 *  feature ships without a schema migration and cannot damage the
 *  training record. */
async function reviewHistory(): Promise<ReviewSessionRow[]> {
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

  const out: ReviewSessionRow[] = [];
  for (const row of rows) {
    const config = row.config as {
      cumulative_review?: boolean;
      chapters?: string[];
    };
    if (!config.cumulative_review) continue;
    const summary = (row.summary ?? {}) as {
      total?: number;
      bySubtopic?: Record<string, { correct: number; total: number }>;
    };
    if (!summary.total) continue;
    out.push({
      chapters: (config.chapters ?? []).filter((c) =>
        ALL_SUBTOPICS.includes(c as Subtopic),
      ) as Subtopic[],
      bySubtopic: summary.bySubtopic ?? {},
      at: (row.endedAt ?? row.startedAt).getTime(),
    });
  }
  return out.sort((a, b) => a.at - b.at);
}

/** The hardest difficulty a chapter has proved: the top of the band for
 *  the highest tier it has cleared. */
function ceilingFromBands(
  bands: Record<ChapterTier, Question[]>,
  passed: Partial<Record<ChapterTier, boolean>>,
): number {
  let ceiling = 0;
  for (const tier of CHAPTER_TIERS) {
    if (!passed[tier]) continue;
    for (const q of bands[tier]) ceiling = Math.max(ceiling, q.difficulty);
  }
  return ceiling;
}

/**
 * Every passed chapter, with the rung it sits on and when its clock last
 * reset.
 *
 * A chapter enters the rotation the moment it reads as passed — both
 * required tiers cleared — and its clock starts at the most recent
 * chapter-test activity. Each cumulative review it appears in then moves
 * it up, holds it, or resets it, and resets the clock.
 */
export async function chapterReviewStates(
  { asOf }: { asOf?: number } = {},
): Promise<ChapterReviewState[]> {
  const tests = await chapterTestStates();
  const all = await reviewHistory();
  // `asOf` replays only the reviews that had already happened at that
  // moment, which is how the *before* half of "what this review changed" is
  // obtained: the same replay, stopped one session earlier. Deriving it
  // rather than storing it keeps the feature migration-free, as W10 chose.
  const history = asOf == null ? all : all.filter((r) => r.at < asOf);

  const states: ChapterReviewState[] = [];
  for (const subtopic of ALL_SUBTOPICS) {
    const test = tests[subtopic];
    if (!test?.passed) continue;

    const passedTiers = Object.fromEntries(
      CHAPTER_TIERS.map((t) => [t, test.tiers[t]?.passed === true]),
    ) as Partial<Record<ChapterTier, boolean>>;
    const ceiling = ceilingFromBands(await chapterBands(subtopic), passedTiers);

    let stage: ChapterReviewStage = 0;
    let lastAt = test.lastAt;
    for (const session of history) {
      if (!session.chapters.includes(subtopic)) continue;
      if (session.at < lastAt) continue;
      const cell = session.bySubtopic[subtopic];
      if (!cell?.total) continue;
      stage = nextChapterReviewStage(stage, cell.correct, cell.total);
      lastAt = session.at;
    }
    states.push({ subtopic, lastAt, stage, ceiling });
  }
  return states;
}

export type ReviewPlan = {
  available: boolean;
  chapters: ChapterReviewState[];
  questions: number;
  /** Passed chapters that exist but are not yet due — the reason an empty
   *  review is empty, which is worth saying rather than showing nothing. */
  waiting: number;
};

/** What a cumulative review would look like right now. */
export async function reviewPlan(now = Date.now()): Promise<ReviewPlan> {
  const states = await chapterReviewStates();
  const due = dueChapters(states, now);
  const shape = reviewShape(due);
  return {
    available: shape.available,
    chapters: shape.available ? due.slice(0, shape.chapters) : due,
    questions: shape.questions,
    waiting: states.length - due.length,
  };
}

/** Ids answered in the last RECENT_DAYS, so a review does not re-serve
 *  something still warm. */
async function recentlySeen(): Promise<number[]> {
  const since = new Date(Date.now() - RECENT_DAYS * 86_400_000);
  const rows = await db
    .select({ questionId: attempts.questionId })
    .from(attempts)
    .where(gte(attempts.createdAt, since))
    .all();
  return [...new Set(rows.map((r) => r.questionId))];
}

/**
 * Build the review: `REVIEW_PER_CHAPTER` questions from each due chapter,
 * at or below the difficulty that chapter has proved, interleaved so no
 * two consecutive questions come from the same chapter.
 *
 * Drawing from the *whole* chapter up to the ceiling rather than from the
 * band of the tier it passed is deliberate. A review is not a re-run of
 * the test; the foundations are part of what may have decayed, and on a
 * chapter whose band is exactly test-sized, drawing from the band would
 * literally re-serve the test.
 */
export async function selectCumulativeReview(
  now = Date.now(),
): Promise<{ questions: Question[]; chapters: Subtopic[] }> {
  const plan = await reviewPlan(now);
  if (!plan.available) return { questions: [], chapters: [] };

  const recent = new Set(await recentlySeen());
  const taken: number[] = [];
  const groups: Question[][] = [];

  for (const chapter of plan.chapters) {
    const pool = (
      await listQuestions({
        subtopics: [chapter.subtopic],
        difficultyMax: chapter.ceiling,
      })
    ).filter((q) => !taken.includes(q.id));
    // Prefer questions that have gone cold; fall back to the whole pool
    // rather than shipping a short review.
    const cold = pool.filter((q) => !recent.has(q.id));
    const from = cold.length >= REVIEW_PER_CHAPTER ? cold : pool;
    if (from.length === 0) continue;
    const picked = await selectQuestions(
      { ids: from.map((q) => q.id) },
      Math.min(REVIEW_PER_CHAPTER, from.length),
    );
    taken.push(...picked.map((q) => q.id));
    groups.push(picked);
  }

  return {
    questions: interleave(groups),
    chapters: plan.chapters.map((c) => c.subtopic),
  };
}


/**
 * What a finished cumulative review changed, chapter by chapter.
 *
 * The mechanism has been verified end to end since W10 — each chapter's
 * spacing rung moves on its own slice of the result — but the result screen
 * showed accuracy and a subtopic table and said none of it. A spaced-
 * repetition system whose intervals are invisible is asking to be trusted on
 * nothing, and the reader has no way to learn that the schedule is
 * responding to them. This is the read model behind saying so.
 *
 * Both halves come from the same replay: the state as it stood the instant
 * before this session, and the state now. Nothing is stored, so the sentence
 * on the screen cannot drift from the schedule that is actually running.
 */
export type ChapterReviewOutcome = {
  subtopic: Subtopic;
  correct: number;
  total: number;
  stageBefore: ChapterReviewStage;
  stageAfter: ChapterReviewStage;
  movement: ReviewMovement;
  /** Days until this chapter comes back, from the rung it now sits on. */
  intervalDays: number;
  nextDueAt: number;
};

export async function reviewOutcome(
  sessionId: number,
): Promise<ChapterReviewOutcome[] | null> {
  const row = await db
    .select({
      config: sessions.config,
      summary: sessions.summary,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
    })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .get();
  if (!row) return null;

  const config = row.config as { cumulative_review?: boolean; chapters?: string[] };
  if (!config.cumulative_review) return null;

  const summary = (row.summary ?? {}) as {
    bySubtopic?: Record<string, { correct: number; total: number }>;
  };
  const at = (row.endedAt ?? row.startedAt).getTime();

  const before = new Map(
    (await chapterReviewStates({ asOf: at })).map((s) => [s.subtopic, s]),
  );
  const after = new Map(
    (await chapterReviewStates()).map((s) => [s.subtopic, s]),
  );

  const out: ChapterReviewOutcome[] = [];
  for (const raw of config.chapters ?? []) {
    const subtopic = raw as Subtopic;
    const cell = summary.bySubtopic?.[subtopic];
    const now = after.get(subtopic);
    if (!cell?.total || !now) continue;
    const was = before.get(subtopic);
    const stageBefore = was?.stage ?? 0;
    out.push({
      subtopic,
      correct: cell.correct,
      total: cell.total,
      stageBefore,
      stageAfter: now.stage,
      movement: reviewMovement(stageBefore, now.stage, cell.correct),
      intervalDays: reviewDelayDays(now.stage),
      nextDueAt: reviewDueAt(now),
    });
  }
  // Worst first: the chapter that lost ground is the one to act on, and a
  // list sorted by what happened reads as a verdict rather than a log.
  const rank: Record<ReviewMovement, number> = { reset: 0, held: 1, advanced: 2 };
  return out.sort(
    (a, b) => rank[a.movement] - rank[b.movement] || a.correct - b.correct,
  );
}
