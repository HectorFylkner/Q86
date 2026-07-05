import { and, asc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { redoQueue } from "./db/schema.ts";
import {
  nextRedoState,
  STAGE_DELAY_DAYS,
  type RedoOutcome,
  type RedoStage,
} from "./redo-rules.ts";

export {
  COLD_SOLVE_LIMIT_SECONDS,
  nextRedoState,
  redoOutcome,
  type RedoOutcome,
} from "./redo-rules.ts";

function dueAfterDays(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
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
      .set({ stage: 0, dueAt: dueAfterDays(STAGE_DELAY_DAYS[0]) })
      .where(eq(redoQueue.id, existing.id))
      .run();
    return;
  }
  await db.insert(redoQueue)
    .values({
      questionId,
      sourceAttemptId,
      stage: 0,
      dueAt: dueAfterDays(STAGE_DELAY_DAYS[0]),
    })
    .run();
}

/**
 * Apply a redo attempt to the question's open queue item (transition
 * rules in lib/redo-rules.ts). Returns false when no open item exists —
 * the caller decides whether the result should re-enter the ladder.
 */
export async function applyRedoResult(
  questionId: number,
  outcome: RedoOutcome,
  timeSeconds: number,
): Promise<boolean> {
  const item = await db
    .select()
    .from(redoQueue)
    .where(and(eq(redoQueue.questionId, questionId), eq(redoQueue.cleared, false)))
    .orderBy(asc(redoQueue.dueAt))
    .get();
  if (!item) return false;

  const stage: RedoStage =
    item.stage === 1 || item.stage === 2 ? item.stage : 0;
  const next = nextRedoState(stage, outcome, timeSeconds);
  if (next.cleared) {
    await db.update(redoQueue)
      .set({ cleared: true })
      .where(eq(redoQueue.id, item.id))
      .run();
  } else {
    await db.update(redoQueue)
      .set({ stage: next.stage, dueAt: dueAfterDays(next.delayDays) })
      .where(eq(redoQueue.id, item.id))
      .run();
  }
  return true;
}
