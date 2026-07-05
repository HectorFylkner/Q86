import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { sessions, type Question } from "./db/schema.ts";
import { selectQuestions } from "./engine.ts";
import { ALL_SUBTOPICS, type Subtopic } from "./taxonomy.ts";

/**
 * Chapter tests: the gate between reading a chapter and trusting it.
 * Eight questions from the chapter's subtopic in an easy → exam-hard
 * blend; clearing the bar marks the chapter passed on the Learn index.
 * A pass is permanent (retakes can't demote you), but the latest score
 * always shows, so a slipped retake is visible.
 */
import {
  CHAPTER_TEST_BAR,
  CHAPTER_TEST_BLEND,
  CHAPTER_TEST_SIZE,
} from "./chapter-test-config.ts";

export { CHAPTER_TEST_BAR, CHAPTER_TEST_SIZE };

export async function selectChapterTest(
  subtopic: Subtopic,
): Promise<Question[]> {
  const picked: Question[] = [];
  for (const [difficulty, n] of CHAPTER_TEST_BLEND) {
    picked.push(
      ...(await selectQuestions(
        {
          subtopics: [subtopic],
          difficultyMin: difficulty,
          difficultyMax: difficulty,
          excludeIds: picked.map((q) => q.id),
        },
        n,
      )),
    );
  }
  if (picked.length < CHAPTER_TEST_SIZE) {
    picked.push(
      ...(await selectQuestions(
        { subtopics: [subtopic], excludeIds: picked.map((q) => q.id) },
        CHAPTER_TEST_SIZE - picked.length,
      )),
    );
  }
  return picked
    .slice(0, CHAPTER_TEST_SIZE)
    .sort((a, b) => a.difficulty - b.difficulty);
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
      config: sessions.config,
      summary: sessions.summary,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
    })
    .from(sessions)
    .where(and(eq(sessions.mode, "drill"), isNotNull(sessions.endedAt)))
    .all();

  const out: Partial<Record<Subtopic, ChapterTestState>> = {};
  for (const s of rows) {
    const sub = (s.config as { chapter_test?: string }).chapter_test;
    if (!sub || !ALL_SUBTOPICS.includes(sub as Subtopic)) continue;
    const summary = (s.summary ?? {}) as { total?: number; correct?: number };
    if (!summary.total) continue;
    const correct = summary.correct ?? 0;
    const at = (s.endedAt ?? s.startedAt).getTime();
    const prev = out[sub as Subtopic];
    const passedNow = correct / summary.total >= CHAPTER_TEST_BAR;
    out[sub as Subtopic] = {
      passed: (prev?.passed ?? false) || passedNow,
      lastCorrect: prev && prev.lastAt > at ? prev.lastCorrect : correct,
      lastTotal: prev && prev.lastAt > at ? prev.lastTotal : summary.total,
      lastAt: Math.max(at, prev?.lastAt ?? 0),
    };
  }
  return out;
}
