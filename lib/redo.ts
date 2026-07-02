import { and, asc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { redoQueue } from "./db/schema.ts";

/** Stage 0|1|2 → due +2d / +7d / +21d after the scheduling event. */
const STAGE_DELAY_DAYS = [2, 7, 21] as const;

/** Day-21 cold-solve gate: correct, unaided, within 2:30. */
export const COLD_SOLVE_LIMIT_SECONDS = 150;

function dueAt(stage: 0 | 1 | 2): Date {
  return new Date(Date.now() + STAGE_DELAY_DAYS[stage] * 24 * 60 * 60 * 1000);
}

/** Enqueue a miss at stage 0 (+2d). If the question is already queued
 *  (missed again outside a redo run), it resets to stage 0. */
export function enqueueMiss(questionId: number, sourceAttemptId: number): void {
  const existing = db
    .select({ id: redoQueue.id })
    .from(redoQueue)
    .where(and(eq(redoQueue.questionId, questionId), eq(redoQueue.cleared, false)))
    .get();
  if (existing) {
    db.update(redoQueue)
      .set({ stage: 0, dueAt: dueAt(0) })
      .where(eq(redoQueue.id, existing.id))
      .run();
    return;
  }
  db.insert(redoQueue)
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
export function applyRedoResult(
  questionId: number,
  correct: boolean,
  timeSeconds: number,
): void {
  const item = db
    .select()
    .from(redoQueue)
    .where(and(eq(redoQueue.questionId, questionId), eq(redoQueue.cleared, false)))
    .orderBy(asc(redoQueue.dueAt))
    .get();
  if (!item) return;

  if (!correct) {
    db.update(redoQueue)
      .set({ stage: 0, dueAt: dueAt(0) })
      .where(eq(redoQueue.id, item.id))
      .run();
    return;
  }

  if (item.stage === 0) {
    db.update(redoQueue)
      .set({ stage: 1, dueAt: dueAt(1) })
      .where(eq(redoQueue.id, item.id))
      .run();
  } else if (item.stage === 1) {
    db.update(redoQueue)
      .set({ stage: 2, dueAt: dueAt(2) })
      .where(eq(redoQueue.id, item.id))
      .run();
  } else {
    if (timeSeconds <= COLD_SOLVE_LIMIT_SECONDS) {
      db.update(redoQueue)
        .set({ cleared: true })
        .where(eq(redoQueue.id, item.id))
        .run();
    } else {
      db.update(redoQueue)
        .set({ stage: 1, dueAt: dueAt(1) })
        .where(eq(redoQueue.id, item.id))
        .run();
    }
  }
}
