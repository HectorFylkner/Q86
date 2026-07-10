import { and, desc, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions } from "./db/schema.ts";
import {
  ALL_SUBTOPICS,
  SKILL_BY_SUBTOPIC,
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
export const MASTERY_BAR = 0.85;
export const MIN_ATTEMPTS = 6;
const WINDOW = 10;

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
    .where(
      and(eq(attempts.focus, "focused"), eq(questions.verified, true)),
    )
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
