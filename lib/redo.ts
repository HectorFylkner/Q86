import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  questions,
  redoQueue,
  type Question,
} from "./db/schema.ts";
import { createQuestionSession } from "./question-session.ts";

/** Stage 0|1|2 → due +2d / +7d / +21d after the scheduling event. */
const STAGE_DELAY_DAYS = [2, 7, 21] as const;

/** Day-21 cold-solve gate: correct, unaided, within 2:30. */
export const COLD_SOLVE_LIMIT_SECONDS = 150;

export type StartRedoSessionResult = {
  error: string | null;
  sessionId: number | null;
  questions: Question[];
};

/** Load only active questions and create a session only when something can run. */
export async function createRedoSession(
  questionIds: number[],
): Promise<StartRedoSessionResult> {
  if (questionIds.length === 0) {
    return { error: "Nothing due to redo.", sessionId: null, questions: [] };
  }
  const uniqueQuestionIds = [...new Set(questionIds)];
  const rows = await db
    .select()
    .from(questions)
    .where(
      and(
        inArray(questions.id, uniqueQuestionIds),
        eq(questions.verified, true),
      ),
    )
    .all();
  const byId = new Map(rows.map((question) => [question.id, question]));
  const ordered = uniqueQuestionIds
    .map((id) => byId.get(id))
    .filter((question): question is Question => Boolean(question));
  if (ordered.length === 0) {
    return {
      error: "Those redo questions are no longer available.",
      sessionId: null,
      questions: [],
    };
  }
  const activeQuestionIds = ordered.map((question) => question.id);
  const created = await createQuestionSession({
    mode: "redo",
    questions: ordered,
    config: { questionIds: activeQuestionIds },
  });
  return {
    error: null,
    sessionId: created.session.id,
    questions: created.questions,
  };
}

function dueAt(stage: 0 | 1 | 2): Date {
  return new Date(Date.now() + STAGE_DELAY_DAYS[stage] * 24 * 60 * 60 * 1000);
}

/** Enqueue a miss at stage 0 (+2d). If the question is already queued
 *  (missed again outside a redo run), it resets to stage 0. */
export async function enqueueMiss(
  questionId: number,
  sourceAttemptId: number,
): Promise<void> {
  const existing = await db
    .select({ id: redoQueue.id })
    .from(redoQueue)
    .where(and(eq(redoQueue.questionId, questionId), eq(redoQueue.cleared, false)))
    .get();
  if (existing) {
    await db.update(redoQueue)
      .set({ stage: 0, dueAt: dueAt(0) })
      .where(eq(redoQueue.id, existing.id))
      .run();
    return;
  }
  await db.insert(redoQueue)
    .values({
      questionId,
      sourceAttemptId,
      stage: 0,
      dueAt: dueAt(0),
    })
    .run();
}

/**
 * Apply a redo attempt to the question's open queue item.
 *
 * Correct: stage 0 → 1 (+7d), stage 1 → 2 (+21d); stage 2 clears only via
 * the cold-solve gate (≤ 2:30), otherwise it re-enters at stage 1 (+7d).
 * Wrong at any stage: back to stage 0 (+2d).
 */
export async function applyRedoResult(
  questionId: number,
  correct: boolean,
  timeSeconds: number,
): Promise<void> {
  const item = await db
    .select()
    .from(redoQueue)
    .where(and(eq(redoQueue.questionId, questionId), eq(redoQueue.cleared, false)))
    .orderBy(asc(redoQueue.dueAt))
    .get();
  if (!item) return;

  if (!correct) {
    await db.update(redoQueue)
      .set({ stage: 0, dueAt: dueAt(0) })
      .where(eq(redoQueue.id, item.id))
      .run();
    return;
  }

  if (item.stage === 0) {
    await db.update(redoQueue)
      .set({ stage: 1, dueAt: dueAt(1) })
      .where(eq(redoQueue.id, item.id))
      .run();
  } else if (item.stage === 1) {
    await db.update(redoQueue)
      .set({ stage: 2, dueAt: dueAt(2) })
      .where(eq(redoQueue.id, item.id))
      .run();
  } else {
    if (timeSeconds <= COLD_SOLVE_LIMIT_SECONDS) {
      await db.update(redoQueue)
        .set({ cleared: true })
        .where(eq(redoQueue.id, item.id))
        .run();
    } else {
      await db.update(redoQueue)
        .set({ stage: 1, dueAt: dueAt(1) })
        .where(eq(redoQueue.id, item.id))
        .run();
    }
  }
}
