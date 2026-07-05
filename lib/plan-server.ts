import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  eloRatings,
  questions,
  redoQueue,
} from "./db/schema.ts";
import { ELO_START } from "./elo.ts";
import { selectQuestions } from "./engine.ts";
import {
  PATTERN_CATEGORY_KEYS,
  type PatternCategoryKey,
} from "./generators/index.ts";
import {
  computeDailyPlan,
  type DailyPlan,
  type PlanInputs,
  type SkillRecord,
} from "./plan.ts";
import { dayIndex, dayIndexFromKey } from "./local-day.ts";
import {
  appTimeZone,
  baselineWeakness,
  getSetting,
  weightOverrides,
} from "./settings.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";

export async function daysToTest(): Promise<number | null> {
  const raw = await getSetting("test_date");
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const tz = await appTimeZone();
  return dayIndexFromKey(raw) - dayIndex(new Date(), tz);
}

async function skillAccuracy(): Promise<Record<FundamentalSkill, SkillRecord>> {
  const out = {} as Record<FundamentalSkill, SkillRecord>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const rows = await db
      .select({ correct: attempts.correct, confidence: attempts.confidence })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(
        and(
          eq(questions.fundamentalSkill, skill),
          eq(attempts.focus, "focused"),
        ),
      )
      .orderBy(desc(attempts.id))
      .limit(30)
      .all();
    out[skill] = {
      // Guessed corrects don't count — they'd deflate the skill's
      // weakness and starve it of drill volume it still needs.
      correct: rows.filter((r) => r.correct && r.confidence !== "guess")
        .length,
      total: rows.length,
    };
  }
  return out;
}

export async function dueRedoCount(): Promise<number> {
  const rows = await db
    .select({ id: redoQueue.id })
    .from(redoQueue)
    .where(and(eq(redoQueue.cleared, false), lte(redoQueue.dueAt, new Date())))
    .all();
  return rows.length;
}

export async function gatherPlanInputs(): Promise<PlanInputs> {
  const eloRows = new Map(
    (await db.select().from(eloRatings).all()).map((r) => [
      r.category,
      r.rating,
    ]),
  );
  const eloByCategory = Object.fromEntries(
    PATTERN_CATEGORY_KEYS.map((k) => [k, eloRows.get(k) ?? ELO_START]),
  ) as Record<PatternCategoryKey, number>;

  const cadenceRaw = Number((await getSetting("timed_set_cadence")) ?? "3");
  // Local-calendar day index (user timezone) so the cadence flips at the
  // user's midnight, not the server's.
  const localDayIndex = dayIndex(new Date(), await appTimeZone());
  return {
    daysToTest: await daysToTest(),
    skillAccuracy: await skillAccuracy(),
    baselineWeakness: await baselineWeakness(),
    weightOverrides: await weightOverrides(),
    dueRedoCount: await dueRedoCount(),
    cadenceDays:
      Number.isInteger(cadenceRaw) && cadenceRaw > 0 ? cadenceRaw : 3,
    dayIndex: localDayIndex,
    eloByCategory,
  };
}

export async function todaysPlan(): Promise<DailyPlan> {
  return computeDailyPlan(await gatherPlanInputs());
}

/** Pick the concrete questions for today's weighted drill block. */
export async function selectPlanDrillIds(plan: DailyPlan): Promise<number[]> {
  const ids: number[] = [];
  for (const { skill, count } of plan.drill.bySkill) {
    if (count <= 0) continue;
    const picked = await selectQuestions(
      { skills: [skill], excludeIds: ids },
      count,
    );
    ids.push(...picked.map((q) => q.id));
  }
  return ids;
}
