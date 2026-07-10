import {
  and,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  lte,
  sql,
} from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  eloRatings,
  questions,
  redoQueue,
  sessions,
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
          eq(questions.verified, true),
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
    .innerJoin(questions, eq(redoQueue.questionId, questions.id))
    .where(
      and(
        eq(redoQueue.cleared, false),
        lte(redoQueue.dueAt, new Date()),
        eq(questions.verified, true),
      ),
    )
    .all();
  return rows.length;
}

const DAY_MS = 86_400_000;

/** Calendar-day ordinal in the server's local timezone, stable across DST. */
function localDayOrdinal(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / DAY_MS,
  );
}

async function timedSetEvidence(): Promise<{
  daysSinceTimedSet: number | null;
  focusedAttemptCount: number;
}> {
  const [latestTimed, attemptRow] = await Promise.all([
    db
      .select({ endedAt: sessions.endedAt })
      .from(sessions)
      .where(
        and(
          inArray(sessions.mode, ["timed_set", "section_sim"]),
          isNotNull(sessions.endedAt),
          // Older session configs omit focus; focused is the product default.
          sql`coalesce(json_extract(${sessions.config}, '$.focus'), 'focused') = 'focused'`,
        ),
      )
      .orderBy(desc(sessions.endedAt))
      .limit(1)
      .get(),
    db
      .select({ n: count() })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .where(
        and(eq(attempts.focus, "focused"), eq(questions.verified, true)),
      )
      .get(),
  ]);

  const endedAt = latestTimed?.endedAt ?? null;
  return {
    daysSinceTimedSet:
      endedAt == null
        ? null
        : Math.max(
            0,
            localDayOrdinal(new Date()) - localDayOrdinal(new Date(endedAt)),
          ),
    focusedAttemptCount: attemptRow?.n ?? 0,
  };
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
  const timedEvidence = await timedSetEvidence();
  // Local-calendar day index so the cadence flips at local midnight.
  const now = new Date();
  const localDayIndex = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  return {
    daysToTest: await daysToTest(),
    skillAccuracy: await skillAccuracy(),
    baselineWeakness: await baselineWeakness(),
    weightOverrides: await weightOverrides(),
    dueRedoCount: await dueRedoCount(),
    cadenceDays:
      Number.isInteger(cadenceRaw) && cadenceRaw > 0 ? cadenceRaw : 3,
    ...timedEvidence,
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
