import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions } from "./db/schema.ts";
import { attributeError, type Attribution } from "./error-inference.ts";
import type { ErrorType, Subtopic } from "./taxonomy.ts";

/**
 * The write path for a miss diagnosis, and the query behind the suggestion.
 *
 * This lives outside `lib/actions.ts` on purpose. That file is `"use server"`
 * and imports `next/cache`, so nothing outside the Next runtime can call it —
 * which means an audit script could only ever assert *about* the write path
 * instead of driving it. `scripts/check-inference.ts` drives the functions
 * below, so its ONCE invariant is a check on the code that actually runs.
 */

export type ShownSuggestion = { errorType: ErrorType; confidence: number };

/**
 * What the platform thinks went wrong, and why it thinks so.
 *
 * An untagged miss teaches nothing: it never reaches the heatmap, never
 * shapes the plan, never names a repair. Auto-tagging on a hunch is worse — a
 * misdiagnosed miss trains the wrong repair. So this returns a *ranked*
 * suggestion with its evidence, which the runner shows for the reader to
 * confirm or override in one keystroke.
 */
export async function attributionForAttempt(
  attemptId: number,
): Promise<Attribution | null> {
  const row = await db
    .select({
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      confidence: attempts.confidence,
      selectedIndex: attempts.selectedIndex,
      correctIndex: questions.correctIndex,
      trapMap: questions.trapMap,
      difficulty: questions.difficulty,
      subtopic: questions.subtopic,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.id, attemptId))
    .get();
  if (!row || row.correct) return null;

  // Recent record in this subtopic, focused attempts only — the same window
  // the mastery ladder uses, so the two never disagree.
  const history = await db
    .select({ correct: attempts.correct })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(and(eq(questions.subtopic, row.subtopic), eq(attempts.focus, "focused")))
    .orderBy(desc(attempts.id))
    .limit(20)
    .all();

  return attributeError({
    correct: false,
    timeSeconds: row.timeSeconds,
    difficulty: row.difficulty as 1 | 2 | 3 | 4 | 5,
    confidence: row.confidence,
    selectedIndex: row.selectedIndex,
    correctIndex: row.correctIndex,
    chosenTrap: row.trapMap?.[String(row.selectedIndex)] ?? null,
    subtopicAccuracy:
      history.length > 0
        ? history.filter((h) => h.correct).length / history.length
        : null,
    subtopicAttempts: history.length,
  });
}

/**
 * Write a tag, and — the first time one is written — the suggestion it was
 * written against.
 *
 * Until this recorded the suggestion, only the final `errorType` was
 * persisted, so an override was indistinguishable from a first-time tag. Two
 * sessions deferred fitting the inference weights believing the labelled
 * examples were accumulating; they were being discarded as they were
 * produced. Every override is one labelled example — the reader saying, with
 * the question in front of them, that the platform got it wrong — and it is
 * the only data that can ever set those weights.
 *
 * The suggestion is recorded **once**. A later re-tag leaves it alone: the
 * example is what the reader was shown when they first decided, and rewriting
 * it with a suggestion recomputed weeks later against a moved subtopic
 * history would silently corrupt the record. `scripts/check-inference.ts`
 * drives that case rather than trusting this comment.
 *
 * `suggestion` is what the panel actually displayed. When a caller has none —
 * the post-mortem tags without showing the panel — one is computed here, so
 * the example is still captured.
 */
export async function recordTag(
  attemptId: number,
  patch: {
    errorType?: ErrorType | null;
    errorSubtag?: Subtopic | null;
    userNotes?: string | null;
    suggestion?: ShownSuggestion | null;
  },
): Promise<void> {
  const { suggestion, ...fields } = patch;
  const update: Record<string, unknown> = { ...fields };

  if (fields.errorType != null) {
    const existing = await db
      .select({
        suggestedErrorType: attempts.suggestedErrorType,
        taggedAt: attempts.taggedAt,
      })
      .from(attempts)
      .where(eq(attempts.id, attemptId))
      .get();

    if (existing && existing.suggestedErrorType == null) {
      const shown = suggestion ?? (await attributionForAttempt(attemptId))?.best ?? null;
      if (shown) {
        update.suggestedErrorType = shown.errorType;
        update.suggestedConfidence = shown.confidence;
      } else {
        // A miss where nothing in the timing, the confidence or the chosen
        // answer pointed anywhere. Recording a zero says "we looked and found
        // nothing", which is a different fact from "nobody looked" — and the
        // audit has to tell those apart to know whether an example was lost.
        update.suggestedConfidence = 0;
      }
    }
    if (existing && existing.taggedAt == null) update.taggedAt = new Date();
  }

  await db.update(attempts).set(update).where(eq(attempts.id, attemptId)).run();
}
