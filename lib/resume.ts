import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, sessions } from "./db/schema.ts";
import type { SessionMode } from "./taxonomy.ts";

/**
 * The interrupted session.
 *
 * A run that ends by closing the tab leaves its session row with no
 * `ended_at`. The attempts already logged are safe, but before this the
 * platform had no way back in: the user had to remember what they were
 * doing, navigate there by hand, and start over — re-answering questions
 * they had already answered.
 *
 * This finds the most recent unfinished run and works out exactly what is
 * left of it, so returning is one tap and resumes rather than restarts.
 *
 * Timed sections are deliberately excluded. A section simulation with a
 * wall clock cannot be paused and resumed without destroying the thing it
 * simulates; offering to "resume" one would be a lie about what the
 * platform can give back.
 */

const RESUMABLE: SessionMode[] = ["drill", "redo"];

/** How long an unfinished run stays offered before it is just history. */
const STALE_AFTER_HOURS = 36;

export type ResumableSession = {
  sessionId: number;
  mode: SessionMode;
  startedAt: Date;
  answered: number;
  /** Question ids from the session's config that were never answered. */
  remainingIds: number[];
  /** Subtopic labels present in what is left, for the card's summary. */
  remainingCount: number;
};

export async function findResumable(): Promise<ResumableSession | null> {
  const open = await db
    .select()
    .from(sessions)
    .where(isNull(sessions.endedAt))
    .orderBy(desc(sessions.id))
    .limit(20)
    .all();

  const cutoff = Date.now() - STALE_AFTER_HOURS * 60 * 60 * 1000;

  for (const session of open) {
    if (!RESUMABLE.includes(session.mode)) continue;
    if (new Date(session.startedAt).getTime() < cutoff) continue;

    const config = session.config as { questionIds?: unknown };
    const ids = Array.isArray(config?.questionIds)
      ? config.questionIds.filter(
          (n): n is number => typeof n === "number" && Number.isInteger(n),
        )
      : [];
    if (ids.length === 0) continue;

    const done = await db
      .select({ questionId: attempts.questionId })
      .from(attempts)
      .where(eq(attempts.sessionId, session.id))
      .all();
    const answered = new Set(done.map((d) => d.questionId));
    const remainingIds = ids.filter((id) => !answered.has(id));

    // Nothing left means the run finished but never wrote its end time.
    if (remainingIds.length === 0 || answered.size === 0) continue;

    return {
      sessionId: session.id,
      mode: session.mode,
      startedAt: new Date(session.startedAt),
      answered: answered.size,
      remainingIds,
      remainingCount: remainingIds.length,
    };
  }
  return null;
}

/**
 * Today's work as one ordered list of question ids: everything the redo
 * queue says is due, then the weighted drill block, with no repeats.
 *
 * The plan already decides what the day contains; before this the user
 * had to launch each block from its own card. One list means one tap.
 */
export async function todaysQueueThenDrill(
  planDrillIds: number[],
): Promise<{ dueIds: number[]; ids: number[] }> {
  const dueRows = await db
    .select({ questionId: sql<number>`redo_queue.question_id` })
    .from(sql`redo_queue`)
    .where(
      sql`redo_queue.cleared = 0 and redo_queue.due_at <= ${Date.now()}`,
    )
    .all();
  const dueIds = [...new Set(dueRows.map((r) => r.questionId))];

  const verified = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.verified, true)))
    .all();
  const live = new Set(verified.map((q) => q.id));

  const seen = new Set<number>();
  const ids: number[] = [];
  for (const id of [...dueIds, ...planDrillIds]) {
    if (!live.has(id) || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return { dueIds: dueIds.filter((id) => live.has(id)), ids };
}
