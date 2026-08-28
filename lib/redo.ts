import { and, asc, eq } from "drizzle-orm";
import type { ScopedDb } from "./db/scoped.ts";
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
export async function enqueueMiss(
  sdb: ScopedDb,
  questionId: number,
  sourceAttemptId: number,
): Promise<void> {
  const existing = await sdb.row(
    redoQueue,
    and(eq(redoQueue.questionId, questionId), eq(redoQueue.cleared, false)),
  );
  if (existing) {
    await sdb.update(
      redoQueue,
      { stage: 0, dueAt: dueAt(0) },
      eq(redoQueue.id, existing.id),
    );
    return;
  }
  await sdb.add(redoQueue, {
    questionId,
    sourceAttemptId,
    stage: 0,
    dueAt: dueAt(0),
  });
}

/**
 * Apply a redo attempt to the question's open queue item.
 *
 * Correct: stage 0 → 1 (+7d), stage 1 → 2 (+21d); stage 2 clears only via
 * the cold-solve gate (≤ 2:30), otherwise it re-enters at stage 1 (+7d).
 * Wrong at any stage: back to stage 0 (+2d).
 */
export async function applyRedoResult(
  sdb: ScopedDb,
  questionId: number,
  correct: boolean,
  timeSeconds: number,
): Promise<void> {
  const open = await sdb.q
    .select()
    .from(redoQueue)
    .where(
      sdb.own(
        redoQueue,
        and(
          eq(redoQueue.questionId, questionId),
          eq(redoQueue.cleared, false),
        ),
      ),
    )
    .orderBy(asc(redoQueue.dueAt))
    .limit(1)
    .all();
  const item = open[0];
  if (!item) return;

  const at = (patch: Parameters<typeof sdb.update>[1]) =>
    sdb.update(redoQueue, patch, eq(redoQueue.id, item.id));

  if (!correct) {
    await at({ stage: 0, dueAt: dueAt(0) });
    return;
  }

  if (item.stage === 0) {
    await at({ stage: 1, dueAt: dueAt(1) });
  } else if (item.stage === 1) {
    await at({ stage: 2, dueAt: dueAt(2) });
  } else if (timeSeconds <= COLD_SOLVE_LIMIT_SECONDS) {
    await at({ cleared: true });
  } else {
    await at({ stage: 1, dueAt: dueAt(1) });
  }
}
