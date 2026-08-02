/** Cumulative-review contract. Pure — no database, no clock of its own —
 *  so the schedule can be tested directly. The queries live in
 *  lib/cumulative.ts. */

import type { Subtopic } from "./taxonomy.ts";

/**
 * Cumulative interleaved review.
 *
 * WHY. Q86 could prove you knew a chapter and then never ask again. The
 * chapter test is a gate, and a gate measures the moment you walk through
 * it — nothing in the platform re-opened a chapter three weeks later to
 * find out whether it was still there. Every serious curriculum does:
 * TTP's cumulative reviews sit between chapters for exactly this reason.
 *
 * The evidence is the same evidence behind `lib/interleave.ts`, and it is
 * unusually strong. Students taught in blocked order scored **42%** on a
 * delayed test at thirty days; students taught the identical material
 * interleaved scored **74%**. A cumulative review is that finding applied
 * at the scale of the curriculum rather than the scale of one session: it
 * mixes chapters you have already passed, so the question "which method
 * is this?" has to be retrieved rather than supplied by context.
 *
 * WHAT IS REUSED. Nothing here is new theory. The spacing is the
 * platform's existing +2d/+7d/+21d ladder (`lib/redo.ts`), applied at
 * chapter grain instead of question grain; the ordering is
 * `interleave()`; the difficulty ceiling comes from the W8 tier bands.
 * A test asserts the ladder is literally the same array of days, so the
 * two cannot drift apart.
 */

/** Stage 0|1|2 → the chapter comes back in 2 / 7 / 21 days. Identical to
 *  `STAGE_DELAY_DAYS` in lib/redo.ts, which a test enforces — a chapter
 *  and a question should not be spaced on two different schedules. */
export const CHAPTER_REVIEW_STAGE_DAYS = [2, 7, 21] as const;

export type ChapterReviewStage = 0 | 1 | 2;

/** Questions drawn from each due chapter. Two is deliberate: the review
 *  has to stay short enough to sit *before* a new chapter rather than
 *  replace it, and its job is to detect decay, not to re-teach. */
export const REVIEW_PER_CHAPTER = 2;

/** Below this the set is too small to interleave — one chapter's worth of
 *  questions in a row is blocked practice with extra steps. */
export const REVIEW_MIN_CHAPTERS = 2;

/** Above this the review stops being short. The most overdue chapters
 *  win; the rest keep waiting, which is what overdue means. */
export const REVIEW_MAX_CHAPTERS = 5;

export type ChapterReviewState = {
  subtopic: Subtopic;
  /** When this chapter was last proved or last reviewed (ms epoch). */
  lastAt: number;
  stage: ChapterReviewStage;
  /** The hardest difficulty this chapter has proved, which is the ceiling
   *  for its review questions. Reviewing above the tier you cleared
   *  measures something you never claimed. */
  ceiling: number;
};

export function reviewDelayDays(stage: ChapterReviewStage): number {
  return CHAPTER_REVIEW_STAGE_DAYS[stage];
}

export function reviewDueAt(state: ChapterReviewState): number {
  return state.lastAt + reviewDelayDays(state.stage) * 24 * 60 * 60 * 1000;
}

/**
 * Where a chapter lands after its slice of a review.
 *
 * Gentler than the redo ladder, and the difference is deliberate. A redo
 * item is scheduled *because it was missed*, so a second miss is strong
 * evidence and resetting to stage 0 is right. A cumulative review asks
 * about material already proved at the exam tier, where a single slip
 * across two questions is as likely to be noise as decay. So:
 *
 *   all correct  → up a rung (the spacing was survivable, stretch it)
 *   some correct → hold this rung (repeat the same interval, no penalty)
 *   none correct → back to stage 0 (+2d — this chapter has actually gone)
 *
 * A chapter never skips a rung, which is the same one-at-a-time rule the
 * tier ladder uses.
 */
export function nextChapterReviewStage(
  stage: ChapterReviewStage,
  correct: number,
  total: number,
): ChapterReviewStage {
  if (total <= 0) return stage;
  if (correct === total) return Math.min(stage + 1, 2) as ChapterReviewStage;
  if (correct === 0) return 0;
  return stage;
}

/**
 * The chapters a review should draw from, most overdue first.
 *
 * Sorting by *how long* a chapter has been due rather than by its due
 * date means a chapter three weeks past a 2-day interval outranks one an
 * hour past a 21-day interval — which is the ordering that matters when
 * only five slots exist.
 */
export function dueChapters(
  states: ChapterReviewState[],
  now: number,
): ChapterReviewState[] {
  return states
    .filter((s) => now >= reviewDueAt(s))
    .sort(
      (a, b) =>
        now - reviewDueAt(b) - (now - reviewDueAt(a)) ||
        a.subtopic.localeCompare(b.subtopic),
    )
    .slice(0, REVIEW_MAX_CHAPTERS);
}

/** Whether a review is worth offering at all, and how long it would be. */
export function reviewShape(due: ChapterReviewState[]): {
  available: boolean;
  chapters: number;
  questions: number;
} {
  const chapters = Math.min(due.length, REVIEW_MAX_CHAPTERS);
  return {
    available: chapters >= REVIEW_MIN_CHAPTERS,
    chapters,
    questions: chapters * REVIEW_PER_CHAPTER,
  };
}

/** Whole days a chapter is overdue, for the "3 days overdue" read on the
 *  Learn index. Floors at 0 so a chapter due this second is not "-0". */
export function daysOverdue(state: ChapterReviewState, now: number): number {
  return Math.max(0, Math.floor((now - reviewDueAt(state)) / 86_400_000));
}
