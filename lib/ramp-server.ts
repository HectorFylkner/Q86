import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions } from "./db/schema.ts";
import {
  budgetFor,
  clampDifficulty,
  RAMP_WINDOW,
  type RampAttempt,
  type RampBudget,
} from "./ramp.ts";

/** Per-question ramp budgets for a drill's question list, from the last
 *  RAMP_WINDOW focused attempts in each subtopic × difficulty cell. */
export async function rampBudgets(
  qs: Array<{ id: number; subtopic: string; difficulty: number }>,
): Promise<Record<number, RampBudget>> {
  if (qs.length === 0) return {};
  const subs = [...new Set(qs.map((q) => q.subtopic))];
  const rows = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      and(
        eq(attempts.focus, "focused"),
        inArray(questions.subtopic, subs as never[]),
      ),
    )
    .orderBy(desc(attempts.id))
    .limit(4000)
    .all();

  const cells = new Map<string, RampAttempt[]>();
  for (const r of rows) {
    const key = `${r.subtopic}|${r.difficulty}`;
    const list = cells.get(key) ?? [];
    if (list.length < RAMP_WINDOW) {
      list.push({ correct: r.correct, timeSeconds: r.timeSeconds });
      cells.set(key, list);
    }
  }

  const out: Record<number, RampBudget> = {};
  for (const q of qs) {
    out[q.id] = budgetFor(
      cells.get(`${q.subtopic}|${q.difficulty}`) ?? [],
      clampDifficulty(q.difficulty),
    );
  }
  return out;
}
