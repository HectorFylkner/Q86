import { and, eq } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, type Question } from "./db/schema.ts";

/**
 * Decision drills (pacing triage): 45 seconds to look at a question and
 * commit — solve, educated guess, or bail — without solving it. The
 * verdict compares your call against what your own record says about
 * questions like it. The skill being trained is the one that saves
 * ruined sections: knowing which battles to fight.
 */
export type DecideRecommendation = "solve" | "guess" | "bail";

export type DecideItem = {
  question: Question;
  /** Predicted accuracy for you on this cell, 0..1. */
  predicted: number;
  /** How many personal attempts back the prediction. */
  sample: number;
  recommendation: DecideRecommendation;
};

/** Difficulty priors used until you have personal data in a cell. */
const PRIORS: Record<number, number> = { 2: 0.85, 3: 0.7, 4: 0.55, 5: 0.4 };

export function recommend(p: number): DecideRecommendation {
  if (p >= 0.65) return "solve";
  if (p >= 0.4) return "guess";
  return "bail";
}

export async function buildDecideRound(size = 8): Promise<DecideItem[]> {
  const pool = await db
    .select()
    .from(questions)
    .where(
      and(eq(questions.verified, true), eq(questions.format, "problem_solving")),
    )
    .all();

  const history = await db
    .select({
      questionId: attempts.questionId,
      correct: attempts.correct,
    })
    .from(attempts)
    .where(eq(attempts.focus, "focused"))
    .all();
  const byQuestion = new Map(pool.map((q) => [q.id, q]));
  const cellStats = new Map<string, { correct: number; total: number }>();
  for (const a of history) {
    const q = byQuestion.get(a.questionId);
    if (!q) continue;
    const key = `${q.subtopic}|${q.difficulty}`;
    const s = cellStats.get(key) ?? { correct: 0, total: 0 };
    s.total++;
    if (a.correct) s.correct++;
    cellStats.set(key, s);
  }

  // Decisions matter most where solving is expensive: weight hard tiers.
  const weighted = pool.map((q) => ({
    q,
    weight: q.difficulty >= 4 ? 3 : q.difficulty === 3 ? 2 : 1,
  }));
  const picked: Question[] = [];
  while (picked.length < size && weighted.length > 0) {
    const total = weighted.reduce((s, w) => s + w.weight, 0);
    let r = Math.random() * total;
    let idx = weighted.length - 1;
    for (let i = 0; i < weighted.length; i++) {
      r -= weighted[i].weight;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(weighted[idx].q);
    weighted.splice(idx, 1);
  }

  return picked.map((question) => {
    const key = `${question.subtopic}|${question.difficulty}`;
    const s = cellStats.get(key);
    const usePersonal = s != null && s.total >= 4;
    const predicted = usePersonal
      ? s.correct / s.total
      : (PRIORS[question.difficulty] ?? 0.5);
    return {
      question,
      predicted,
      sample: usePersonal ? s.total : 0,
      recommendation: recommend(predicted),
    };
  });
}
