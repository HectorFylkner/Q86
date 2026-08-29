import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { attempts, users } from "../db/schema.ts";
import { newToken } from "../auth/tokens.ts";
import { attemptStreak, testDateFor, daysBetween } from "./activity.ts";
import { CHAPTER_TEST_BAR } from "../chapter-tests.ts";
import { sessions } from "../db/schema.ts";
import { ALL_SUBTOPICS, type Subtopic } from "../taxonomy.ts";

/**
 * The shareable progress card.
 *
 * What it contains is the whole design: totals and a streak, and nothing
 * that identifies a person. No email address, no name, no individual
 * question, no answer. Someone who finds the link learns that an account
 * has done 412 questions at 68% — which is exactly what its owner meant
 * to share and nothing more.
 *
 * The token is a random column with a unique index, not a hash of the user
 * id, so it can be rotated. Rotating it revokes every link already posted,
 * which is the only meaningful "undo" for something that has been shared.
 */

export type ProgressCard = {
  streak: number;
  attempts: number;
  correct: number;
  accuracy: number;
  /** Chapters whose test has been passed. Reading a chapter is tracked in
   *  the browser, so it is not a number the server can honestly publish;
   *  a passed test is. */
  chapters: number;
  daysToTest: number | null;
};

/**
 * Chapters with a passed test, counted across accounts.
 *
 * `chapterTestStates` needs a `ScopedDb` and therefore a session, which
 * the card renderer does not have — a visitor holding a link is not
 * signed in. This reads the same sessions with the user id bound in.
 */
async function passedChapters(userId: string): Promise<number> {
  const rows = await db
    .select({ config: sessions.config, summary: sessions.summary })
    .from(sessions)
    .where(and(eq(sessions.userId, userId), isNotNull(sessions.endedAt)))
    .all();
  const passed = new Set<Subtopic>();
  for (const row of rows) {
    const sub = (row.config as { chapter_test?: string }).chapter_test;
    if (!sub || !ALL_SUBTOPICS.includes(sub as Subtopic)) continue;
    const summary = (row.summary ?? {}) as { total?: number; correct?: number };
    if (!summary.total) continue;
    if ((summary.correct ?? 0) / summary.total >= CHAPTER_TEST_BAR) {
      passed.add(sub as Subtopic);
    }
  }
  return passed.size;
}

export async function shareCodeFor(userId: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const row = await db
      .select({ code: users.shareCode })
      .from(users)
      .where(eq(users.id, userId))
      .get();
    if (!row) throw new Error(`shareCodeFor: no account ${userId}`);
    if (row.code) return row.code;

    const claimed = await db
      .update(users)
      .set({ shareCode: newToken().slice(0, 22), updatedAt: new Date() })
      .where(and(eq(users.id, userId), isNull(users.shareCode)))
      .returning({ code: users.shareCode })
      .catch(() => null);
    if (claimed?.[0]?.code) return claimed[0].code;
  }
  throw new Error("shareCodeFor: could not allocate a code.");
}

export async function currentShareCode(
  userId: string,
): Promise<string | null> {
  const row = await db
    .select({ code: users.shareCode })
    .from(users)
    .where(eq(users.id, userId))
    .get();
  return row?.code ?? null;
}

/** Clearing the column is the revoke: every posted link stops resolving. */
export async function revokeShareCode(userId: string): Promise<void> {
  await db
    .update(users)
    .set({ shareCode: null, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}

export async function cardForCode(
  code: string,
  now: Date = new Date(),
): Promise<ProgressCard | null> {
  const cleaned = code.trim();
  if (cleaned.length === 0) return null;
  const owner = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.shareCode, cleaned))
    .get();
  if (!owner) return null;
  return cardFor(owner.id, now);
}

export async function cardFor(
  userId: string,
  now: Date = new Date(),
): Promise<ProgressCard> {
  const totals = await db
    .select({
      n: sql<number>`count(*)`,
      correct: sql<number>`sum(case when ${attempts.correct} then 1 else 0 end)`,
    })
    .from(attempts)
    .where(and(eq(attempts.userId, userId), eq(attempts.focus, "focused")))
    .get();

  const total = totals?.n ?? 0;
  const correct = totals?.correct ?? 0;
  const testDate = await testDateFor(userId);

  return {
    streak: await attemptStreak(userId, now),
    attempts: total,
    correct,
    accuracy: total > 0 ? correct / total : 0,
    chapters: await passedChapters(userId),
    daysToTest: testDate ? Math.max(0, daysBetween(now, testDate)) : null,
  };
}
