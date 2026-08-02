import { count, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions } from "./db/schema.ts";
import {
  MASTERY_BAR,
  MASTERY_BANDS,
  MASTERY_WINDOW as WINDOW,
  MIN_ATTEMPTS,
  type MasteryCell,
  type MasteryGridRow,
} from "./mastery-config.ts";
import {
  ALL_SUBTOPICS,
  SKILL_BY_SUBTOPIC,
  SUBTOPIC_LABELS,
  type FundamentalSkill,
  type Subtopic,
} from "./taxonomy.ts";

/**
 * Mastery ladders (TTP-style structure, original implementation): every
 * subtopic is a ladder of difficulty rungs D2→D5. A rung is mastered by
 * sustained accuracy — at least MIN_ATTEMPTS focused attempts in that
 * cell with ≥ MASTERY_BAR accuracy over the most recent WINDOW. Rungs
 * are never hard-locked: the ladder tells you where to work, it does
 * not forbid working elsewhere.
 */
export {
  MASTERY_BAR,
  MIN_ATTEMPTS,
  MASTERY_WINDOW as WINDOW,
} from "./mastery-config.ts";

export type RungState = "mastered" | "working" | "untouched" | "empty";

export type Rung = {
  difficulty: number;
  state: RungState;
  correct: number;
  total: number;
  /** Verified questions available in this cell. */
  available: number;
};

export type Ladder = {
  subtopic: Subtopic;
  skill: FundamentalSkill;
  rungs: Rung[];
  /** The lowest non-mastered rung with questions — where to work next. */
  currentRung: number | null;
  mastered: boolean;
};

export async function computeLadders(): Promise<Ladder[]> {
  const rows = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      correct: attempts.correct,
      id: attempts.id,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.focus, "focused"))
    .orderBy(desc(attempts.id))
    .limit(5000)
    .all();

  const bank = await db
    .select({ subtopic: questions.subtopic, difficulty: questions.difficulty })
    .from(questions)
    .where(eq(questions.verified, true))
    .all();
  const availableByCell = new Map<string, number>();
  for (const q of bank) {
    const key = `${q.subtopic}|${q.difficulty}`;
    availableByCell.set(key, (availableByCell.get(key) ?? 0) + 1);
  }

  // Most recent WINDOW attempts per cell (rows arrive newest-first).
  const cellAttempts = new Map<string, boolean[]>();
  for (const r of rows) {
    const key = `${r.subtopic}|${r.difficulty}`;
    const list = cellAttempts.get(key) ?? [];
    if (list.length < WINDOW) {
      list.push(r.correct);
      cellAttempts.set(key, list);
    }
  }

  return ALL_SUBTOPICS.map((subtopic) => {
    const rungs: Rung[] = [2, 3, 4, 5].map((difficulty) => {
      const key = `${subtopic}|${difficulty}`;
      const available = availableByCell.get(key) ?? 0;
      const recent = cellAttempts.get(key) ?? [];
      const correct = recent.filter(Boolean).length;
      const total = recent.length;
      let state: RungState;
      if (available === 0) state = "empty";
      else if (total === 0) state = "untouched";
      else if (total >= MIN_ATTEMPTS && correct / total >= MASTERY_BAR)
        state = "mastered";
      else state = "working";
      return { difficulty, state, correct, total, available };
    });
    const next = rungs.find(
      (r) => r.state !== "mastered" && r.state !== "empty",
    );
    return {
      subtopic,
      skill: SKILL_BY_SUBTOPIC[subtopic],
      rungs,
      currentRung: next?.difficulty ?? null,
      mastered: next == null,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────

/**
 * The 24-subtopic × 4-difficulty grid.
 *
 * This used to be computed inside `gatherAnalytics` and rendered on the
 * report, which put two views of "where am I strong and weak by subtopic"
 * on two routes inside the same nav group. It lives here now, on the page
 * the nav already promises for exactly this question.
 */
export async function masteryGridRows(): Promise<MasteryGridRow[]> {
  const rows = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      correct: attempts.correct,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.focus, "focused"))
    .all();

  const bankCells = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      n: count(),
    })
    .from(questions)
    .where(eq(questions.verified, true))
    .groupBy(questions.subtopic, questions.difficulty)
    .all();
  const availableBy = new Map<string, number>();
  for (const c of bankCells) {
    availableBy.set(`${c.subtopic}|${c.difficulty}`, c.n);
  }

  return ALL_SUBTOPICS.map((subtopic) => {
    const cells: MasteryCell[] = MASTERY_BANDS.map((difficulty) => {
      const subset = rows.filter(
        (r) => r.subtopic === subtopic && r.difficulty === difficulty,
      );
      return {
        difficulty,
        correct: subset.filter((r) => r.correct).length,
        total: subset.length,
        available: availableBy.get(`${subtopic}|${difficulty}`) ?? 0,
      };
    });
    return {
      subtopic,
      skill: SKILL_BY_SUBTOPIC[subtopic],
      label: SUBTOPIC_LABELS[subtopic],
      cells,
      total: cells.reduce((s, c) => s + c.total, 0),
      correct: cells.reduce((s, c) => s + c.correct, 0),
    };
  });
}
