import { desc, eq } from "drizzle-orm";
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
 * subtopic is a ladder of difficulty rungs D2→D5. Rung rules live in
 * lib/mastery-rules.ts. Rungs are never hard-locked: the ladder tells
 * you where to work, it does not forbid working elsewhere.
 */
import {
  MASTERY_WINDOW,
  rungState,
  type RungState,
} from "./mastery-rules.ts";
import { clampDifficulty, rampStage, type RampStage } from "./ramp.ts";

export { MASTERY_BAR, MIN_ATTEMPTS, type RungState } from "./mastery-rules.ts";

export type Rung = {
  difficulty: number;
  state: RungState;
  correct: number;
  total: number;
  /** Verified questions available in this cell. */
  available: number;
  /** Timed-transfer ramp stage for this cell (lib/ramp.ts). */
  pace: RampStage;
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
      timeSeconds: attempts.timeSeconds,
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

  // Most recent MASTERY_WINDOW attempts per cell (rows arrive newest-first).
  const cellAttempts = new Map<
    string,
    Array<{ correct: boolean; timeSeconds: number }>
  >();
  for (const r of rows) {
    const key = `${r.subtopic}|${r.difficulty}`;
    const list = cellAttempts.get(key) ?? [];
    if (list.length < MASTERY_WINDOW) {
      list.push({ correct: r.correct, timeSeconds: r.timeSeconds });
      cellAttempts.set(key, list);
    }
  }

  return ALL_SUBTOPICS.map((subtopic) => {
    const rungs: Rung[] = [2, 3, 4, 5].map((difficulty) => {
      const key = `${subtopic}|${difficulty}`;
      const available = availableByCell.get(key) ?? 0;
      const recent = cellAttempts.get(key) ?? [];
      const correct = recent.filter((a) => a.correct).length;
      const total = recent.length;
      return {
        difficulty,
        state: rungState(
          recent.map((a) => a.correct),
          available,
        ),
        correct,
        total,
        available,
        pace: rampStage(recent, clampDifficulty(difficulty)),
      };
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
