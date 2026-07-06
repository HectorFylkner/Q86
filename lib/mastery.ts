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
 * cell with ≥ MASTERY_BAR accuracy over the most recent WINDOW — at
 * exam pace, and mastery decays: it must answer both "still true?" and
 * "fast enough?".
 *
 *   - stale: the accuracy bar is met but the newest attempt is over
 *     STALE_DAYS old — a short confirmation set re-proves it.
 *   - slow: accurate but the median time misses the per-difficulty pace
 *     bar — a timed rung drill is the fix. At the Q86 level the binding
 *     constraint is pacing on D4/D5, so accurate-but-slow must be
 *     visible, not hidden inside "mastered".
 *
 * Rungs are never hard-locked: the ladder tells you where to work, it
 * does not forbid working elsewhere.
 */
export const MASTERY_BAR = 0.85;
export const MIN_ATTEMPTS = 6;
const WINDOW = 10;
export const STALE_DAYS = 21;

/** Median-time bars per rung. The exam gives 45 min for 21 questions
 *  (~128s each); harder questions earn more room because easier ones
 *  bank time. 2:00 at D3 scaling to 2:45 at D5. */
export const PACE_BAR_SECONDS: Record<number, number> = {
  2: 100,
  3: 120,
  4: 145,
  5: 165,
};

export type RungState =
  | "mastered"
  | "stale"
  | "slow"
  | "working"
  | "untouched"
  | "empty";

export type Rung = {
  difficulty: number;
  state: RungState;
  correct: number;
  total: number;
  /** Verified questions available in this cell. */
  available: number;
  /** Median seconds over the window; null with no attempts. */
  medianSeconds: number | null;
  /** Whole days since the newest attempt in this cell; null if none. */
  daysSinceLast: number | null;
};

export type Ladder = {
  subtopic: Subtopic;
  skill: FundamentalSkill;
  rungs: Rung[];
  /** The lowest non-mastered rung with questions — where to work next. */
  currentRung: number | null;
  mastered: boolean;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export async function computeLadders(): Promise<Ladder[]> {
  const rows = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      correct: attempts.correct,
      timeSeconds: attempts.timeSeconds,
      createdAt: attempts.createdAt,
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
  type CellAttempt = { correct: boolean; timeSeconds: number };
  const cellAttempts = new Map<string, CellAttempt[]>();
  const cellNewest = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.subtopic}|${r.difficulty}`;
    if (!cellNewest.has(key)) cellNewest.set(key, r.createdAt.getTime());
    const list = cellAttempts.get(key) ?? [];
    if (list.length < WINDOW) {
      list.push({ correct: r.correct, timeSeconds: r.timeSeconds });
      cellAttempts.set(key, list);
    }
  }

  const now = Date.now();
  return ALL_SUBTOPICS.map((subtopic) => {
    const rungs: Rung[] = [2, 3, 4, 5].map((difficulty) => {
      const key = `${subtopic}|${difficulty}`;
      const available = availableByCell.get(key) ?? 0;
      const recent = cellAttempts.get(key) ?? [];
      const correct = recent.filter((a) => a.correct).length;
      const total = recent.length;
      const medianSeconds = median(recent.map((a) => a.timeSeconds));
      const newest = cellNewest.get(key);
      const daysSinceLast =
        newest != null ? Math.floor((now - newest) / 86_400_000) : null;
      let state: RungState;
      if (available === 0) state = "empty";
      else if (total === 0) state = "untouched";
      else if (total >= MIN_ATTEMPTS && correct / total >= MASTERY_BAR) {
        if (daysSinceLast != null && daysSinceLast > STALE_DAYS) {
          state = "stale";
        } else if (
          medianSeconds != null &&
          medianSeconds > PACE_BAR_SECONDS[difficulty]
        ) {
          state = "slow";
        } else {
          state = "mastered";
        }
      } else state = "working";
      return {
        difficulty,
        state,
        correct,
        total,
        available,
        medianSeconds,
        daysSinceLast,
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
