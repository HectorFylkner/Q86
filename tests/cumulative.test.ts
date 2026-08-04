import assert from "node:assert/strict";
import test, { describe } from "node:test";
import {
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
  reviewMovement,
} from "../lib/cumulative-config.ts";
import { STAGE_DELAY_DAYS } from "../lib/redo.ts";
import type { Subtopic } from "../lib/taxonomy.ts";

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 7, 2, 12, 0, 0);

function chapter(
  subtopic: string,
  daysAgo: number,
  stage: ChapterReviewStage = 0,
  ceiling = 4,
): ChapterReviewState {
  return {
    subtopic: subtopic as Subtopic,
    lastAt: NOW - daysAgo * DAY,
    stage,
    ceiling,
  };
}

describe("cumulative review — the schedule", () => {
  test("the ladder is the platform's ladder, not a second one", () => {
    // Composition, not new theory: a chapter and a question are spaced on
    // the same +2/+7/+21 rungs. If one is ever changed the other must be.
    assert.deepEqual(
      [...CHAPTER_REVIEW_STAGE_DAYS],
      [...STAGE_DELAY_DAYS],
      "chapter review and redo must share the spacing ladder",
    );
  });

  test("a chapter is not due before its interval has elapsed", () => {
    assert.equal(dueChapters([chapter("probability", 1)], NOW).length, 0);
    assert.equal(dueChapters([chapter("probability", 2)], NOW).length, 1);
    assert.equal(dueChapters([chapter("probability", 6, 1)], NOW).length, 0);
    assert.equal(dueChapters([chapter("probability", 7, 1)], NOW).length, 1);
    assert.equal(dueChapters([chapter("probability", 20, 2)], NOW).length, 0);
    assert.equal(dueChapters([chapter("probability", 21, 2)], NOW).length, 1);
  });

  test("all correct moves up one rung, never two", () => {
    assert.equal(nextChapterReviewStage(0, 2, 2), 1);
    assert.equal(nextChapterReviewStage(1, 2, 2), 2);
    assert.equal(nextChapterReviewStage(2, 2, 2), 2, "the top rung is the top");
  });

  test("a partial slice holds the rung instead of resetting it", () => {
    // Deliberately gentler than the redo ladder. A redo item is scheduled
    // *because* it was missed, so a second miss is evidence. A cumulative
    // review asks about proved material, where one slip across two
    // questions is as likely to be noise as decay.
    assert.equal(nextChapterReviewStage(2, 1, 2), 2);
    assert.equal(nextChapterReviewStage(1, 1, 2), 1);
    assert.equal(nextChapterReviewStage(1, 2, 3), 1);
  });

  test("a wiped slice drops to the shortest interval", () => {
    assert.equal(nextChapterReviewStage(2, 0, 2), 0);
    assert.equal(nextChapterReviewStage(1, 0, 2), 0);
    assert.equal(CHAPTER_REVIEW_STAGE_DAYS[0], 2, "back in two days");
  });

  test("an empty slice changes nothing", () => {
    // A chapter listed on a session that served it no questions must not
    // silently advance — that would be spacing credit for no retrieval.
    for (const stage of [0, 1, 2] as ChapterReviewStage[]) {
      assert.equal(nextChapterReviewStage(stage, 0, 0), stage);
    }
  });

  test("the most overdue chapter outranks the merely due one", () => {
    // 30 days past a 2-day interval beats an hour past a 21-day interval,
    // which is the ordering that matters when only five slots exist.
    const barely = chapter("probability", 21, 2);
    const badly = chapter("combinatorics", 32, 0);
    const order = dueChapters([barely, badly], NOW).map((c) => c.subtopic);
    assert.deepEqual(order, ["combinatorics", "probability"]);
  });

  test("only the most overdue chapters make the cut", () => {
    const many = Array.from({ length: REVIEW_MAX_CHAPTERS + 3 }, (_, i) =>
      chapter(`chapter_${i}`, 3 + i),
    );
    const due = dueChapters(many, NOW);
    assert.equal(due.length, REVIEW_MAX_CHAPTERS);
    // The oldest ones, which here are the highest-indexed.
    assert.equal(due[0].subtopic, `chapter_${many.length - 1}`);
  });

  test("ordering is stable when two chapters are equally overdue", () => {
    const a = chapter("beta", 5);
    const b = chapter("alpha", 5);
    assert.deepEqual(
      dueChapters([a, b], NOW).map((c) => c.subtopic),
      dueChapters([b, a], NOW).map((c) => c.subtopic),
    );
  });

  test("one due chapter is not a review", () => {
    // Two questions from a single chapter in a row is blocked practice
    // with extra steps — the interleaving is the point.
    const one = reviewShape([chapter("probability", 5)]);
    assert.equal(one.available, false);
    const two = reviewShape([chapter("probability", 5), chapter("series", 5)]);
    assert.equal(two.available, true);
    assert.equal(two.questions, 2 * REVIEW_PER_CHAPTER);
    assert.ok(REVIEW_MIN_CHAPTERS >= 2);
  });

  test("the review never outgrows its slot", () => {
    const many = Array.from({ length: 20 }, (_, i) => chapter(`c_${i}`, 30));
    const shape = reviewShape(dueChapters(many, NOW));
    assert.equal(shape.chapters, REVIEW_MAX_CHAPTERS);
    assert.equal(shape.questions, REVIEW_MAX_CHAPTERS * REVIEW_PER_CHAPTER);
    assert.ok(shape.questions <= 10, "a review must stay shorter than a drill");
  });

  test("overdue days never read negative", () => {
    const fresh = chapter("probability", 0);
    assert.equal(daysOverdue(fresh, NOW), 0);
    assert.equal(daysOverdue(chapter("probability", 5), NOW), 3);
  });

  test("passing a review pushes the next one further out every time", () => {
    // The property that makes this spaced repetition rather than a rota:
    // a chapter that keeps surviving is asked about less and less often.
    let state = chapter("probability", 0, 0);
    const gaps: number[] = [];
    for (let i = 0; i < 3; i++) {
      gaps.push((reviewDueAt(state) - state.lastAt) / DAY);
      state = {
        ...state,
        stage: nextChapterReviewStage(state.stage, 2, 2),
        lastAt: reviewDueAt(state),
      };
    }
    assert.deepEqual(gaps, [2, 7, 21]);
    for (let i = 1; i < gaps.length; i++) {
      assert.ok(gaps[i] > gaps[i - 1], "intervals must grow");
    }
  });
});

/**
 * The wording on the result card turns on this classification, so it is
 * pinned beside the ladder rule rather than left to the component. The case
 * that matters is the last one: a chapter that misses everything while
 * already on the bottom rung has not been *sent* anywhere, and a card that
 * says it has is claiming a move that did not happen.
 */
describe("review movement, as the card reports it", () => {
  test("all correct reads as advanced, at every rung below the top", () => {
    for (const stage of [0, 1] as const) {
      const after = nextChapterReviewStage(stage, 2, 2);
      assert.equal(reviewMovement(stage, after, 2), "advanced");
    }
  });

  test("a partial slice holds, and is never called a reset", () => {
    for (const stage of [0, 1, 2] as const) {
      const after = nextChapterReviewStage(stage, 1, 2);
      assert.equal(after, stage);
      assert.equal(reviewMovement(stage, after, 1), "held");
    }
  });

  test("missing everything reads as a reset from any rung above the bottom", () => {
    for (const stage of [1, 2] as const) {
      const after = nextChapterReviewStage(stage, 0, 2);
      assert.equal(after, 0);
      assert.equal(reviewMovement(stage, after, 0), "reset");
      assert.notEqual(after, stage, "a reset from above the bottom must move");
    }
  });

  test("the top rung holds rather than advancing past the ladder", () => {
    const top = (CHAPTER_REVIEW_STAGE_DAYS.length - 1) as 0 | 1 | 2;
    const after = nextChapterReviewStage(top, 2, 2);
    assert.equal(after, top);
    assert.equal(reviewMovement(top, after, 2), "held");
  });

  test("a reset that lands on the rung it started from is flagged as unmoved", () => {
    const after = nextChapterReviewStage(0, 0, 2);
    assert.equal(after, 0);
    assert.equal(reviewMovement(0, after, 0), "reset");
    // The component reads `stageAfter !== stageBefore` to decide between
    // "back to the start" and "still at the start"; this is that condition.
    assert.equal(after !== 0, false);
  });
});
