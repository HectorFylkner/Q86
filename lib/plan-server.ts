import { and, desc, eq, gte, isNotNull, lte, or } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  baselineReports,
  deckReviews,
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

// ---------------------------------------------------------------------------
// Today's completed work — a read-only view over the attempt history so the
// Today page can mark plan items done as the day progresses. Presentation
// data only: nothing here feeds computeDailyPlan.
// ---------------------------------------------------------------------------

export type TodayProgress = {
  /** Focused drill attempts logged today (weighted block plus any extra). */
  drillDone: number;
  drillCorrect: number;
  /** Redo-queue attempts logged today. */
  redosDone: number;
  /** Deck cards graded today. */
  deckFlipped: number;
  /** Pattern rounds finished today. */
  patternRounds: number;
  /** Categories with a dedicated round today (a round's own category —
   *  stray reps inside a mixed round don't count as a round played). */
  patternRoundCategories: string[];
  /** Best completed focused timed work today; full outranks mini. Casual
   *  sessions stay out, honoring the runner's "excluded from the daily
   *  plan" promise. */
  timed: {
    kind: "full" | "mini";
    correct: number | null;
    total: number | null;
  } | null;
  /** A score report was imported today. The schema doesn't distinguish
   *  mock reports from baselines, so on a mock day this is the closest
   *  honest signal of follow-through — copy should say "report imported",
   *  never "mock taken". */
  reportImported: boolean;
  /** All focused attempts today across modes, for the day-end tally. */
  attemptsToday: number;
  correctToday: number;
};

export async function gatherTodayProgress(): Promise<TodayProgress> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const attemptRows = await db
    .select({
      mode: attempts.mode,
      focus: attempts.focus,
      correct: attempts.correct,
    })
    .from(attempts)
    .where(gte(attempts.createdAt, startOfDay))
    .all();
  // Casual attempts stay out of the drill tally, mirroring the plan's own
  // inputs; redo attempts count regardless because they move the queue.
  const focused = attemptRows.filter((r) => r.focus === "focused");
  const drill = focused.filter((r) => r.mode === "drill");

  const deckFlipped = (
    await db
      .select({ questionId: deckReviews.questionId })
      .from(deckReviews)
      .where(gte(deckReviews.updatedAt, startOfDay))
      .all()
  ).length;

  // A timed section can span midnight (started 23:40, saved 00:25), so
  // fetch sessions that either started or finished today.
  const sessionRows = await db
    .select({
      mode: sessions.mode,
      config: sessions.config,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
      summary: sessions.summary,
    })
    .from(sessions)
    .where(
      or(
        gte(sessions.startedAt, startOfDay),
        and(isNotNull(sessions.endedAt), gte(sessions.endedAt, startOfDay)),
      ),
    )
    .all();

  // One session per pattern round; decision drills also log mode
  // "pattern" but carry no category.
  const patternSessions = sessionRows.filter(
    (s) =>
      s.mode === "pattern" &&
      s.startedAt.getTime() >= startOfDay.getTime() &&
      (s.config as { category?: string }).category != null,
  );
  const patternRoundCategories = [
    ...new Set(
      patternSessions.map((s) => (s.config as { category: string }).category),
    ),
  ];

  // Timed work counts when it FINISHED today, and only when focused —
  // the runner's casual toggle promises exclusion from the daily plan.
  const timedSessions = sessionRows.filter(
    (s) =>
      (s.mode === "section_sim" || s.mode === "timed_set") &&
      s.endedAt != null &&
      s.endedAt.getTime() >= startOfDay.getTime() &&
      (s.config as { focus?: string }).focus !== "casual",
  );
  const bestTimed =
    timedSessions.find((s) => s.mode === "section_sim") ??
    timedSessions[0] ??
    null;
  const timedSummary = (bestTimed?.summary ?? null) as {
    correct?: number;
    total?: number;
  } | null;

  const reportImported =
    (await db
      .select({ id: baselineReports.id })
      .from(baselineReports)
      .where(gte(baselineReports.createdAt, startOfDay))
      .limit(1)
      .get()) != null;

  return {
    drillDone: drill.length,
    drillCorrect: drill.filter((r) => r.correct).length,
    redosDone: attemptRows.filter((r) => r.mode === "redo").length,
    deckFlipped,
    patternRounds: patternSessions.length,
    patternRoundCategories,
    timed: bestTimed
      ? {
          kind: bestTimed.mode === "section_sim" ? "full" : "mini",
          correct:
            typeof timedSummary?.correct === "number"
              ? timedSummary.correct
              : null,
          total:
            typeof timedSummary?.total === "number" ? timedSummary.total : null,
        }
      : null,
    reportImported,
    attemptsToday: focused.length,
    correctToday: focused.filter((r) => r.correct).length,
  };
}

/** Pick the concrete questions for today's weighted drill block.
 *  Focused drill work already logged today comes off each skill's quota,
 *  so re-launching the block mid-day serves the remainder ("4 to go"
 *  really starts 4); once the day's total is met, a fresh full block is
 *  served for extra volume. The plan itself is untouched — this only
 *  changes which questions the launch link selects. */
export async function selectPlanDrillIds(plan: DailyPlan): Promise<number[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const doneRows = await db
    .select({ skill: questions.fundamentalSkill })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      and(
        gte(attempts.createdAt, startOfDay),
        eq(attempts.mode, "drill"),
        eq(attempts.focus, "focused"),
      ),
    )
    .all();
  const doneBySkill = new Map<string, number>();
  for (const r of doneRows) {
    doneBySkill.set(r.skill, (doneBySkill.get(r.skill) ?? 0) + 1);
  }
  const totalPlanned = plan.drill.bySkill.reduce((s, x) => s + x.count, 0);
  const totalRemaining = totalPlanned - doneRows.length;
  const useRemainder = doneRows.length > 0 && totalRemaining > 0;

  const ids: number[] = [];
  for (const { skill, count } of plan.drill.bySkill) {
    const target = useRemainder
      ? Math.max(0, count - (doneBySkill.get(skill) ?? 0))
      : count;
    if (target <= 0) continue;
    const picked = await selectQuestions(
      { skills: [skill], excludeIds: ids },
      target,
    );
    ids.push(...picked.map((q) => q.id));
  }
  // Off-plan drilling can skew per-skill counts past the block's shape;
  // cap the block so it never exceeds what the day still owes.
  return useRemainder ? ids.slice(0, totalRemaining) : ids;
}
