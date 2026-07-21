import { and, eq, isNull } from "drizzle-orm";
import { scoreAssessment } from "./assessment-reliability.ts";
import {
  CHAPTER_TEST_BAR,
  CHAPTER_TEST_SIZE,
} from "./chapter-test-config.ts";
import { db } from "./db/index.ts";
import { attempts, sessions } from "./db/schema.ts";
import { enrollLessonCards } from "./lesson-cards.ts";
import { loadQuestionSession } from "./question-session.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";

/** Close a drill only from its complete frozen roster and server attempts. */
export async function finishQuestionSession(sessionId: number): Promise<void> {
  const questionSession = await loadQuestionSession(sessionId, [
    "drill",
    "redo",
  ]);
  if (questionSession.session.endedAt != null) return;
  const rows = await db
    .select({
      questionId: attempts.questionId,
      correct: attempts.correct,
      confidence: attempts.confidence,
      timeSeconds: attempts.timeSeconds,
    })
    .from(attempts)
    .where(eq(attempts.sessionId, sessionId))
    .all();
  const actualQuestionIds = rows.map((row) => row.questionId);
  const expectedQuestionIds = [...questionSession.questionIds];
  if (
    rows.length !== expectedQuestionIds.length ||
    new Set(actualQuestionIds).size !== actualQuestionIds.length ||
    actualQuestionIds.some(
      (questionId) => !expectedQuestionIds.includes(questionId),
    )
  ) {
    throw new Error(
      `Session ${sessionId} cannot close until every roster item has exactly one persisted answer.`,
    );
  }

  const endedAt = new Date();
  const correctCount = rows.filter((row) => row.correct).length;
  const serverSummary = {
    total: rows.length,
    correct: correctCount,
    avgTimeSeconds:
      rows.length > 0
        ? rows.reduce((sum, row) => sum + row.timeSeconds, 0) / rows.length
        : 0,
    source: "server_attempt_roster_v1",
  };
  const closed = await db
    .update(sessions)
    .set({ endedAt, summary: serverSummary })
    .where(and(eq(sessions.id, sessionId), isNull(sessions.endedAt)))
    .returning({ id: sessions.id })
    .get();
  if (closed == null) return;

  // Legacy broad chapter tests remain distinct from curriculum-v3
  // certification. Even here, the complete roster and server grades—not a
  // client summary—control card enrollment.
  const chapterConfig = questionSession.session.config as
    | { chapter_test?: string }
    | undefined;
  const subtopic = chapterConfig?.chapter_test;
  if (!subtopic || !ALL_SUBTOPICS.includes(subtopic as Subtopic)) return;
  const score = scoreAssessment({
    tier: "easy",
    expectedQuestionIds,
    attempts: rows.map((row) => ({
      questionId: row.questionId,
      // This boolean was canonicalized and graded by the server while the
      // session's content-version roster was still valid.
      selectedIndex: row.correct ? 0 : 1,
      correctIndex: 0,
      confidence: row.confidence,
    })),
    completedAtMs: endedAt.getTime(),
    passThresholdOverride: CHAPTER_TEST_BAR,
  });
  if (expectedQuestionIds.length === CHAPTER_TEST_SIZE && score.passed) {
    await enrollLessonCards(subtopic as Subtopic);
  }
}
