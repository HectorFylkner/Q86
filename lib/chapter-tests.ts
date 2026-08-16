import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, sessions, type Question } from "./db/schema.ts";
import { coverageFor, type SubtopicCoverage } from "./coverage.ts";
import { selectQuestions } from "./engine.ts";
import {
  ALL_SUBTOPICS,
  type Difficulty,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * Chapter tests: the gate between reading a chapter and trusting it.
 * Eight questions from the chapter's subtopic in an easy → exam-hard
 * blend; clearing the bar marks the chapter passed on the Learn index.
 * A pass is permanent (retakes can't demote you), but the latest score
 * always shows, so a slipped retake is visible.
 *
 * Retakes prefer questions you have not seen in a previous take of *this*
 * chapter's test. The bank now carries the blend twice over for every
 * subtopic (lib/coverage.ts, enforced by `pnpm verify:coverage`), so a
 * second take is a genuinely fresh eight rather than a memory check on the
 * same stems.
 */
import {
  CHAPTER_TEST_BAR,
  CHAPTER_TEST_BLEND,
  CHAPTER_TEST_SIZE,
} from "./chapter-test-config.ts";

export { CHAPTER_TEST_BAR, CHAPTER_TEST_SIZE };

/** Question ids already answered in a previous take of this chapter test. */
export async function seenInChapterTests(
  subtopic: Subtopic,
): Promise<Set<number>> {
  const testSessions = await db
    .select({ id: sessions.id, config: sessions.config })
    .from(sessions)
    .where(eq(sessions.mode, "drill"))
    .all();
  const ids = testSessions
    .filter((s) => (s.config as { chapter_test?: string }).chapter_test === subtopic)
    .map((s) => s.id);
  if (ids.length === 0) return new Set();
  const rows = await db
    .select({ questionId: attempts.questionId })
    .from(attempts)
    .where(inArray(attempts.sessionId, ids))
    .all();
  return new Set(rows.map((r) => r.questionId));
}

export async function selectChapterTest(
  subtopic: Subtopic,
): Promise<Question[]> {
  const seen = await seenInChapterTests(subtopic);
  const picked: Question[] = [];

  for (const [difficulty, n] of CHAPTER_TEST_BLEND) {
    const taken = () => picked.map((q) => q.id);
    // First pass: only questions this chapter test has never served.
    const fresh = await selectQuestions(
      {
        subtopics: [subtopic],
        difficultyMin: difficulty,
        difficultyMax: difficulty,
        excludeIds: [...taken(), ...seen],
      },
      n,
    );
    picked.push(...fresh);
    // Second pass: the pool ran out of unseen questions at this tier, so
    // allow repeats rather than shrinking the blend. verify:coverage exists
    // to keep this branch unreachable for two takes.
    if (fresh.length < n) {
      picked.push(
        ...(await selectQuestions(
          {
            subtopics: [subtopic],
            difficultyMin: difficulty,
            difficultyMax: difficulty,
            excludeIds: taken(),
          },
          n - fresh.length,
        )),
      );
    }
  }

  // Last resort: the subtopic cannot fill its blend at all. The coverage
  // gate fails the build long before this, but a user's database can lag
  // behind the bank until `pnpm seed` runs.
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

/**
 * Live coverage of the *installed* questions. The CLI gate reads the
 * committed bank; this reads what the user's database actually holds,
 * which is what the test layer draws from — the two diverge whenever the
 * bank has moved ahead of the last `pnpm seed`.
 */
export async function installedCoverage(): Promise<
  Partial<Record<Subtopic, SubtopicCoverage>>
> {
  const rows = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
    })
    .from(questions)
    .where(
      and(eq(questions.verified, true), eq(questions.format, "problem_solving")),
    )
    .all();

  const counts: Partial<Record<Subtopic, Partial<Record<Difficulty, number>>>> =
    {};
  for (const row of rows) {
    const bucket = (counts[row.subtopic] ??= {});
    const d = row.difficulty as Difficulty;
    bucket[d] = (bucket[d] ?? 0) + 1;
  }
  return Object.fromEntries(
    ALL_SUBTOPICS.map((s) => [s, coverageFor(s, counts[s] ?? {})]),
  ) as Partial<Record<Subtopic, SubtopicCoverage>>;
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
