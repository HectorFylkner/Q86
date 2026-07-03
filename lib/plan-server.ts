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
import { baselineWeakness, getSetting, weightOverrides } from "./settings.ts";
import { FUNDAMENTAL_SKILLS, type FundamentalSkill } from "./taxonomy.ts";

export function daysToTest(): number | null {
  const raw = getSetting("test_date");
  if (!raw) return null;
  const target = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function skillAccuracy(): Record<FundamentalSkill, SkillRecord> {
  const out = {} as Record<FundamentalSkill, SkillRecord>;
  for (const skill of FUNDAMENTAL_SKILLS) {
    const rows = db
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

export function dueRedoCount(): number {
  return db
    .select({ id: redoQueue.id })
    .from(redoQueue)
    .where(and(eq(redoQueue.cleared, false), lte(redoQueue.dueAt, new Date())))
    .all().length;
}

export function gatherPlanInputs(): PlanInputs {
  const eloRows = new Map(
    db
      .select()
      .from(eloRatings)
      .all()
      .map((r) => [r.category, r.rating]),
  );
  const eloByCategory = Object.fromEntries(
    PATTERN_CATEGORY_KEYS.map((k) => [k, eloRows.get(k) ?? ELO_START]),
  ) as Record<PatternCategoryKey, number>;

  const cadenceRaw = Number(getSetting("timed_set_cadence") ?? "3");
  // Local-calendar day index so the cadence flips at local midnight.
  const now = new Date();
  const localDayIndex = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  return {
    daysToTest: daysToTest(),
    skillAccuracy: skillAccuracy(),
    baselineWeakness: baselineWeakness(),
    weightOverrides: weightOverrides(),
    dueRedoCount: dueRedoCount(),
    cadenceDays:
      Number.isInteger(cadenceRaw) && cadenceRaw > 0 ? cadenceRaw : 3,
    dayIndex: localDayIndex,
    eloByCategory,
  };
}

export function todaysPlan(): DailyPlan {
  return computeDailyPlan(gatherPlanInputs());
}

/** Pick the concrete questions for today's weighted drill block. */
export function selectPlanDrillIds(plan: DailyPlan): number[] {
  const ids: number[] = [];
  for (const { skill, count } of plan.drill.bySkill) {
    if (count <= 0) continue;
    const picked = selectQuestions(
      { skills: [skill], excludeIds: ids },
      count,
    );
    ids.push(...picked.map((q) => q.id));
  }
  return ids;
}
