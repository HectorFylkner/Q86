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
import { diagnosticWeakness, latestDiagnostic } from "./diagnostic.ts";
import { interleave } from "./interleave.ts";
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
import { baselineWeakness, getSetting, weightOverrides } from "./settings.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";

export async function daysToTest(): Promise<number | null> {
  const raw = await getSetting("test_date");
  if (!raw) return null;
  const target = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

async function skillAccuracy(): Promise<Record<FundamentalSkill, SkillRecord>> {
  const out = {} as Record<FundamentalSkill, SkillRecord>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const rows = await db
      .select({ correct: attempts.correct })
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
      correct: rows.filter((r) => r.correct).length,
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
  // Local-calendar day index so the cadence flips at local midnight.
  const now = new Date();
  const localDayIndex = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  return {
    daysToTest: await daysToTest(),
    skillAccuracy: await skillAccuracy(),
    baselineWeakness: await planBaseline(),
    weightOverrides: await weightOverrides(),
    dueRedoCount: await dueRedoCount(),
    cadenceDays:
      Number.isInteger(cadenceRaw) && cadenceRaw > 0 ? cadenceRaw : 3,
    dayIndex: localDayIndex,
    eloByCategory,
  };
}

/**
 * The baseline the plan weights against.
 *
 * An imported official score report wins — it is the real exam's reading
 * of the same four skills, and nothing this platform produces beats it.
 * Failing that, the placement diagnostic. Failing both, null, and the
 * planner falls back to uniform weights as it always did.
 */
async function planBaseline(): Promise<Record<FundamentalSkill, number> | null> {
  const imported = await baselineWeakness();
  if (imported) return imported;
  const diagnostic = await latestDiagnostic();
  return diagnostic ? diagnosticWeakness(diagnostic) : null;
}

export async function todaysPlan(): Promise<DailyPlan> {
  return computeDailyPlan(await gatherPlanInputs());
}

/**
 * Pick the concrete questions for today's weighted drill block, then
 * interleave them.
 *
 * The weights decide *how many* of each skill; the round-robin decides
 * the order they arrive in. Those are separate decisions and the old
 * version conflated them — it emitted every question of one skill before
 * the next, which is blocked practice and measurably the worst order to
 * learn in. See lib/interleave.ts for the evidence.
 */
export async function selectPlanDrillIds(plan: DailyPlan): Promise<number[]> {
  const picked: number[] = [];
  const bySkill: number[][] = [];
  for (const { skill, count } of plan.drill.bySkill) {
    if (count <= 0) continue;
    const questions = await selectQuestions(
      { skills: [skill], excludeIds: picked },
      count,
    );
    const ids = questions.map((q) => q.id);
    picked.push(...ids);
    bySkill.push(ids);
  }
  return interleave(bySkill);
}
