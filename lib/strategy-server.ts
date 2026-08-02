import { eq, inArray } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions } from "./db/schema.ts";
import {
  SOLUTION_STRATEGIES,
  primaryStrategy,
  type SolutionStrategy,
} from "./solution-strategy.ts";
import {
  summarizeStrategies,
  type StrategyAttempt,
  type StrategyReport,
} from "./strategy-math.ts";

export {
  STRATEGY_MIN_ATTEMPTS,
  type StrategyReport,
  type StrategyRow,
} from "./strategy-math.ts";

/**
 * Server side of the technique dimension: classify the bank once, then
 * answer the two questions the classifier makes answerable.
 *
 *   1. Which items practise a given technique? (the drill deep link)
 *   2. Does this user's timing and accuracy say they ever reach for it?
 *      (the analytics panel)
 *
 * Question 2 is the one worth having. Accuracy alone hides the failure
 * mode: a student who backsolves nothing but grinds the algebra correctly
 * scores fine and runs out of clock. The tell is *time*, so the panel
 * compares median seconds on items where a shortcut existed against the
 * same user's median on items where it did not.
 */

export type StrategyIndex = Record<SolutionStrategy, number[]>;

let cached: { index: StrategyIndex; total: number } | null = null;

/** Question ids by primary strategy. Classification depends only on the
 *  bank text, so it is computed once per process. */
export async function strategyIndex(): Promise<{
  index: StrategyIndex;
  total: number;
}> {
  if (cached) return cached;
  const rows = await db
    .select({
      id: questions.id,
      fastestPathMd: questions.fastestPathMd,
    })
    .from(questions)
    .where(eq(questions.verified, true))
    .all();

  const index = Object.fromEntries(
    SOLUTION_STRATEGIES.map((s) => [s, [] as number[]]),
  ) as StrategyIndex;
  for (const row of rows) {
    index[primaryStrategy(row.fastestPathMd)].push(row.id);
  }
  cached = { index, total: rows.length };
  return cached;
}

/** Test seam — the index is memoized against a bank that only changes
 *  when the seed runs. */
export function resetStrategyIndex(): void {
  cached = null;
}

/**
 * A drill block for one technique: items whose fastest path is that
 * technique, spread across subtopics and ordered easy → hard.
 *
 * Spreading matters. The point of a technique drill is to make the
 * *recognition* automatic, and recognition is trivial when every question
 * in the set is about rates. Round-robining the subtopics forces the
 * decision "is this a backsolve?" to be made afresh each time.
 */
export async function strategyDrillIds(
  strategy: SolutionStrategy,
  size: number,
): Promise<number[]> {
  const { index } = await strategyIndex();
  const ids = index[strategy];
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      id: questions.id,
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
    })
    .from(questions)
    .where(inArray(questions.id, ids))
    .all();

  const bySubtopic = new Map<string, typeof rows>();
  for (const row of rows) {
    const bucket = bySubtopic.get(row.subtopic) ?? [];
    bucket.push(row);
    bySubtopic.set(row.subtopic, bucket);
  }
  for (const bucket of bySubtopic.values()) {
    bucket.sort((a, b) => a.difficulty - b.difficulty || a.id - b.id);
  }

  const queues = [...bySubtopic.values()];
  const picked: typeof rows = [];
  let round = 0;
  while (picked.length < size) {
    const before = picked.length;
    for (const queue of queues) {
      if (picked.length >= size) break;
      const next = queue[round];
      if (next) picked.push(next);
    }
    if (picked.length === before) break; // every queue exhausted
    round += 1;
  }

  return picked
    .sort((a, b) => a.difficulty - b.difficulty || a.id - b.id)
    .map((q) => q.id);
}

export async function strategyReport(): Promise<StrategyReport> {
  const { index } = await strategyIndex();
  const byQuestion = new Map<number, SolutionStrategy>();
  const bankItems = {} as Record<SolutionStrategy, number>;
  for (const strategy of SOLUTION_STRATEGIES) {
    bankItems[strategy] = index[strategy].length;
    for (const id of index[strategy]) byQuestion.set(id, strategy);
  }

  const rows = await db
    .select({
      questionId: attempts.questionId,
      correct: attempts.correct,
      seconds: attempts.timeSeconds,
    })
    .from(attempts)
    .all();

  const classified: StrategyAttempt[] = [];
  for (const row of rows) {
    const strategy = byQuestion.get(row.questionId);
    if (!strategy) continue;
    classified.push({
      strategy,
      correct: row.correct,
      seconds: row.seconds,
    });
  }

  return summarizeStrategies(classified, bankItems);
}
