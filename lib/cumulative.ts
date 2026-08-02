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
  reviewShape,
  type ChapterReviewStage,
  type ChapterReviewState,
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
  reviewShape,
  type ChapterReviewStage,
  type ChapterReviewState,
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
export async function chapterReviewStates(): Promise<ChapterReviewState[]> {
  const tests = await chapterTestStates();
  const history = await reviewHistory();

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
