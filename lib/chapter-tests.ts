import { and, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, sessions, type Question } from "./db/schema.ts";
import { selectQuestions } from "./engine.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";

/**
 * Chapter tests: the gate between reading a chapter and trusting it.
 * Eight questions from the chapter's subtopic in an easy → exam-hard
 * blend; clearing the bar marks the chapter passed on the Learn index.
 * A pass is permanent (retakes can't demote you), but the latest score
 * always shows, so a slipped retake is visible.
 *
 * Integrity rules: scores are recomputed from the attempts rows joined
 * on the session — the client summary is never trusted; a pass
 * requires the full eight questions; and retakes exclude questions
 * seen in the last RETAKE_EXCLUDE_DAYS so a retake measures the
 * chapter, not the memory of Tuesday's answers.
 */
import {
  CHAPTER_TEST_BAR,
  CHAPTER_TEST_BLEND,
  CHAPTER_TEST_SIZE,
} from "./chapter-test-config.ts";

export { CHAPTER_TEST_BAR, CHAPTER_TEST_SIZE };

export const RETAKE_EXCLUDE_DAYS = 14;

/** Questions in this subtopic attempted (in any mode) recently enough
 *  that a chapter test drawing them would test recall of the item, not
 *  command of the chapter. */
async function recentlySeenIds(subtopic: Subtopic): Promise<number[]> {
  const cutoff = new Date(Date.now() - RETAKE_EXCLUDE_DAYS * 86_400_000);
  const rows = await db
    .select({ questionId: attempts.questionId })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      and(eq(questions.subtopic, subtopic), gte(attempts.createdAt, cutoff)),
    )
    .all();
  return [...new Set(rows.map((r) => r.questionId))];
}

/** Select a full test, or report the eligible-question shortfall so the
 *  caller can say "bank too thin — N/8" instead of running a shrunken
 *  test that a pass badge would then overstate. */
export async function selectChapterTest(
  subtopic: Subtopic,
): Promise<{ questions: Question[]; eligibleShortfall: number | null }> {
  const excluded = await recentlySeenIds(subtopic);
  const picked: Question[] = [];
  for (const [difficulty, n] of CHAPTER_TEST_BLEND) {
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          difficultyMin: difficulty,
          difficultyMax: difficulty,
          excludeIds: [...excluded, ...picked.map((q) => q.id)],
        },
        n,
      )),
    );
  }
  if (picked.length < CHAPTER_TEST_SIZE) {
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          excludeIds: [...excluded, ...picked.map((q) => q.id)],
        },
        CHAPTER_TEST_SIZE - picked.length,
      )),
    );
  }
  if (picked.length < CHAPTER_TEST_SIZE) {
    return {
      questions: [],
      eligibleShortfall: picked.length,
    };
  }
  return {
    questions: picked
      .slice(0, CHAPTER_TEST_SIZE)
      .sort((a, b) => a.difficulty - b.difficulty),
    eligibleShortfall: null,
  };
}

export type ChapterTestState = {
  passed: boolean;
  lastCorrect: number;
  lastTotal: number;
  lastAt: number;
};

export async function chapterTestStates(): Promise<
  Partial<Record<Subtopic, ChapterTestState>>
> {
  const rows = await db
    .select({
      id: sessions.id,
      config: sessions.config,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
    })
    .from(sessions)
    .where(and(eq(sessions.mode, "drill"), isNotNull(sessions.endedAt)))
    .all();

  const testSessions = rows.flatMap((s) => {
    const sub = (s.config as { chapter_test?: string }).chapter_test;
    if (!sub || !ALL_SUBTOPICS.includes(sub as Subtopic)) return [];
    return [{ ...s, subtopic: sub as Subtopic }];
  });
  if (testSessions.length === 0) return {};

  // Recompute every score from the attempts rows — the client-written
  // session summary is display data, never the source of truth.
  const attemptRows = await db
    .select({ sessionId: attempts.sessionId, correct: attempts.correct })
    .from(attempts)
    .where(
      inArray(
        attempts.sessionId,
        testSessions.map((s) => s.id),
      ),
    )
    .all();
  const bySession = new Map<number, { correct: number; total: number }>();
  for (const a of attemptRows) {
    if (a.sessionId == null) continue;
    const agg = bySession.get(a.sessionId) ?? { correct: 0, total: 0 };
    agg.total++;
    if (a.correct) agg.correct++;
    bySession.set(a.sessionId, agg);
  }

  const out: Partial<Record<Subtopic, ChapterTestState>> = {};
  for (const s of testSessions) {
    const score = bySession.get(s.id);
    if (!score || score.total === 0) continue;
    const at = (s.endedAt ?? s.startedAt).getTime();
    const prev = out[s.subtopic];
    // A pass requires the full test — 6/8 clears the bar, 3/4 does not
    // exist as a concept here.
    const passedNow =
      score.total >= CHAPTER_TEST_SIZE &&
      score.correct / score.total >= CHAPTER_TEST_BAR;
    out[s.subtopic] = {
      passed: (prev?.passed ?? false) || passedNow,
      lastCorrect: prev && prev.lastAt > at ? prev.lastCorrect : score.correct,
      lastTotal: prev && prev.lastAt > at ? prev.lastTotal : score.total,
      lastAt: Math.max(at, prev?.lastAt ?? 0),
    };
  }
  return out;
}
