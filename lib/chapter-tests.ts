import { and, eq, gte, inArray, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, sessions, type Question } from "./db/schema.ts";
import { selectQuestions } from "./engine.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";
import {
  createAssessmentExclusionHooks,
  scoreAssessment,
  type AssessmentAttemptFact,
} from "./assessment-reliability.ts";

/**
 * Chapter tests: the gate between reading a chapter and trusting it.
 * Eight questions from the chapter's subtopic in an easy → exam-hard
 * blend; clearing the bar marks the chapter passed on the Learn index.
 * A pass is permanent (retakes can't demote you), but the latest score
 * always shows, so a slipped retake is visible.
 *
 * Integrity rules: scores are recomputed from the attempts rows joined
 * on the session — the client summary is never trusted; a pass
 * requires the exact eight-question roster once each; and retakes exclude
 * both recent items and their sibling variants so a retake measures the
 * chapter, not the memory of Tuesday's answer template.
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
async function recentlySeenExclusions(subtopic: Subtopic): Promise<{
  questionIds: number[];
  variantFamilyIds: number[];
}> {
  const nowMs = Date.now();
  const cutoff = new Date(nowMs - RETAKE_EXCLUDE_DAYS * 86_400_000);
  const rows = await db
    .select({
      questionId: attempts.questionId,
      variantFamilyId: questions.twinOf,
      attemptedAt: attempts.createdAt,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      and(eq(questions.subtopic, subtopic), gte(attempts.createdAt, cutoff)),
    )
    .all();
  const hooks = createAssessmentExclusionHooks(
    rows.map((row) => ({
      questionId: row.questionId,
      variantFamilyId: row.variantFamilyId,
      attemptedAtMs: row.attemptedAt.getTime(),
    })),
    { nowMs, lookbackDays: RETAKE_EXCLUDE_DAYS },
  );
  return {
    questionIds: hooks.excludedQuestionIds as number[],
    variantFamilyIds: hooks.excludedVariantFamilyIds as number[],
  };
}

/** Select a full test, or report the eligible-question shortfall so the
 *  caller can say "bank too thin — N/8" instead of running a shrunken
 *  test that a pass badge would then overstate. */
export async function selectChapterTest(
  subtopic: Subtopic,
): Promise<{ questions: Question[]; eligibleShortfall: number | null }> {
  const excluded = await recentlySeenExclusions(subtopic);
  const picked: Question[] = [];
  for (const [difficulty, n] of CHAPTER_TEST_BLEND) {
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          difficultyMin: difficulty,
          difficultyMax: difficulty,
          excludeIds: [...excluded.questionIds, ...picked.map((q) => q.id)],
          excludeVariantFamilyIds: [
            ...excluded.variantFamilyIds,
            ...picked.map((q) => q.twinOf ?? q.id),
          ],
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
          excludeIds: [...excluded.questionIds, ...picked.map((q) => q.id)],
          excludeVariantFamilyIds: [
            ...excluded.variantFamilyIds,
            ...picked.map((q) => q.twinOf ?? q.id),
          ],
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
    const config = s.config as {
      chapter_test?: string;
      questionIds?: unknown;
    };
    const sub = config.chapter_test;
    if (!sub || !ALL_SUBTOPICS.includes(sub as Subtopic)) return [];
    const expectedQuestionIds =
      Array.isArray(config.questionIds) &&
      config.questionIds.every((id) => Number.isInteger(id))
        ? (config.questionIds as number[])
        : null;
    return [{ ...s, subtopic: sub as Subtopic, expectedQuestionIds }];
  });
  if (testSessions.length === 0) return {};

  // Recompute every score from the attempts rows — the client-written
  // session summary is display data, never the source of truth.
  const attemptRows = await db
    .select({
      sessionId: attempts.sessionId,
      questionId: attempts.questionId,
      selectedIndex: attempts.selectedIndex,
      correctIndex: questions.correctIndex,
      confidence: attempts.confidence,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      inArray(
        attempts.sessionId,
        testSessions.map((s) => s.id),
      ),
    )
    .all();
  const bySession = new Map<number, AssessmentAttemptFact[]>();
  for (const a of attemptRows) {
    if (a.sessionId == null) continue;
    const facts = bySession.get(a.sessionId) ?? [];
    facts.push({
      questionId: a.questionId,
      selectedIndex: a.selectedIndex,
      correctIndex: a.correctIndex,
      confidence: a.confidence,
    });
    bySession.set(a.sessionId, facts);
  }

  const out: Partial<Record<Subtopic, ChapterTestState>> = {};
  for (const s of testSessions) {
    const facts = bySession.get(s.id) ?? [];
    if (facts.length === 0) continue;
    // Old sessions did not persist their roster. They remain readable only
    // when their facts prove an exact eight-unique-item session; all new
    // sessions carry the server-selected ids in config.
    const expectedQuestionIds =
      s.expectedQuestionIds ?? [...new Set(facts.map((fact) => fact.questionId))];
    const score = scoreAssessment({
      tier: "easy",
      expectedQuestionIds,
      attempts: facts,
      completedAtMs: s.endedAt?.getTime() ?? null,
      passThresholdOverride: CHAPTER_TEST_BAR,
    });
    const at = (s.endedAt ?? s.startedAt).getTime();
    const prev = out[s.subtopic];
    // A pass requires the exact test — 6/8 clears the legacy bar, 3/4 or
    // eight rows containing a duplicate item do not exist as passes.
    const passedNow =
      expectedQuestionIds.length === CHAPTER_TEST_SIZE && score.passed;
    out[s.subtopic] = {
      passed: (prev?.passed ?? false) || passedNow,
      lastCorrect:
        prev && prev.lastAt > at ? prev.lastCorrect : score.independentCorrect,
      lastTotal:
        prev && prev.lastAt > at ? prev.lastTotal : score.answeredCount,
      lastAt: Math.max(at, prev?.lastAt ?? 0),
    };
  }
  return out;
}
