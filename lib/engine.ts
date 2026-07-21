import { and, count, eq, gte, inArray, lte, type SQL } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, type Question } from "./db/schema.ts";
import type {
  ContentDomain,
  Context,
  FundamentalSkill,
  QuestionFormat,
  Subtopic,
} from "./taxonomy.ts";

export type QuestionFilter = {
  skills?: FundamentalSkill[];
  subtopics?: Subtopic[];
  formats?: QuestionFormat[];
  contexts?: Context[];
  domains?: ContentDomain[];
  difficultyMin?: number;
  difficultyMax?: number;
  excludeIds?: number[];
  /** Canonical item-family ids (question.twinOf ?? question.id) to omit. */
  excludeVariantFamilyIds?: number[];
};

function whereFromFilter(filter: QuestionFilter): SQL | undefined {
  const conds: SQL[] = [eq(questions.verified, true)];
  if (filter.skills?.length)
    conds.push(inArray(questions.fundamentalSkill, filter.skills));
  if (filter.subtopics?.length)
    conds.push(inArray(questions.subtopic, filter.subtopics));
  if (filter.formats?.length)
    conds.push(inArray(questions.format, filter.formats));
  if (filter.contexts?.length)
    conds.push(inArray(questions.context, filter.contexts));
  if (filter.domains?.length)
    conds.push(inArray(questions.contentDomain, filter.domains));
  if (filter.difficultyMin != null)
    conds.push(gte(questions.difficulty, filter.difficultyMin));
  if (filter.difficultyMax != null)
    conds.push(lte(questions.difficulty, filter.difficultyMax));
  return and(...conds);
}

export async function countQuestions(filter: QuestionFilter): Promise<number> {
  const row = await db
    .select({ n: count() })
    .from(questions)
    .where(whereFromFilter(filter))
    .get();
  return row?.n ?? 0;
}

/**
 * Weighted-random selection without repeats. `verified = true` is a hard
 * gate. Questions already answered correctly twice or more are
 * deprioritized (weight 0.15 vs 1).
 */
export async function selectQuestions(
  filter: QuestionFilter,
  count: number,
): Promise<Question[]> {
  const excluded = new Set(filter.excludeIds ?? []);
  const excludedFamilies = new Set(filter.excludeVariantFamilyIds ?? []);
  const candidates = (
    await db.select().from(questions).where(whereFromFilter(filter)).all()
  ).filter(
    (q) =>
      !excluded.has(q.id) && !excludedFamilies.has(q.twinOf ?? q.id),
  );
  if (candidates.length === 0) return [];

  const correctRows = await db
    .select({ questionId: attempts.questionId })
    .from(attempts)
    .where(
      and(
        eq(attempts.correct, true),
        inArray(
          attempts.questionId,
          candidates.map((q) => q.id),
        ),
      ),
    )
    .all();
  const correctCount = new Map<number, number>();
  for (const row of correctRows) {
    correctCount.set(row.questionId, (correctCount.get(row.questionId) ?? 0) + 1);
  }

  const pool = candidates.map((q) => ({
    q,
    weight: (correctCount.get(q.id) ?? 0) >= 2 ? 0.15 : 1,
  }));

  const picked: Question[] = [];
  while (picked.length < count && pool.length > 0) {
    const total = pool.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    let idx = pool.length - 1;
    for (let i = 0; i < pool.length; i++) {
      r -= pool[i].weight;
      if (r <= 0) {
        idx = i;
        break;
      }
    }
    picked.push(pool[idx].q);
    pool.splice(idx, 1);
  }
  return picked;
}

/**
 * Composition for a timed set: full section (21) uses a fixed exam-like
 * blend across all four skills; mini (7) proportionally. Shortfalls in one
 * skill are backfilled from the whole pool.
 */
export async function selectTimedSet(
  total: 21 | 7,
  singleSkill?: FundamentalSkill,
): Promise<Question[]> {
  // Faithful to the current GMAT Quant section: Problem Solving only. Data
  // Sufficiency lives in the Data Insights section on the real exam, so
  // DS questions train through drills, never inside a section sim.
  const formats: QuestionFormat[] = ["problem_solving"];
  if (singleSkill) {
    return selectQuestions({ skills: [singleSkill], formats }, total);
  }
  const blend: Array<[FundamentalSkill, number]> =
    total === 21
      ? [
          ["value_order_factors", 6],
          ["equal_unequal_alg", 6],
          ["rates_ratio_percent", 5],
          ["counting_sets_series_prob_stats", 4],
        ]
      : [
          ["value_order_factors", 2],
          ["equal_unequal_alg", 2],
          ["rates_ratio_percent", 2],
          ["counting_sets_series_prob_stats", 1],
        ];

  const picked: Question[] = [];
  for (const [skill, n] of blend) {
    picked.push(
      ...(await selectQuestions(
        { skills: [skill], formats, excludeIds: picked.map((q) => q.id) },
        n,
      )),
    );
  }
  if (picked.length < total) {
    picked.push(
      ...(await selectQuestions(
        { formats, excludeIds: picked.map((q) => q.id) },
        total - picked.length,
      )),
    );
  }
  // Shuffle so skills are interleaved.
  for (let i = picked.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }
  return picked;
}
