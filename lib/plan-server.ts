import { and, desc, eq, lte } from "drizzle-orm";
import { db } from "./db/index.ts";
import {
  attempts,
  eloRatings,
  questions,
  redoQueue,
} from "./db/schema.ts";
import { chapterTestStates } from "./chapter-tests.ts";
import type { CurriculumRow } from "./curriculum.ts";
import { ELO_START } from "./elo.ts";
import { selectQuestions } from "./engine.ts";
import {
  PATTERN_CATEGORY_KEYS,
  type PatternCategoryKey,
} from "./generators/index.ts";
import { checklistDone, lessonProgressBySubtopic } from "./lesson-progress.ts";
import { computeLadders } from "./mastery.ts";
import {
  computeDailyPlan,
  type DailyPlan,
  type PlanInputs,
  type SkillRecord,
} from "./plan.ts";
import { baselineWeakness, getSetting, weightOverrides } from "./settings.ts";
import {
  FUNDAMENTAL_SKILLS,
  SUBTOPICS_BY_SKILL,
  type FundamentalSkill,
  type Subtopic,
} from "./taxonomy.ts";

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

/** Most recent focused attempts considered per subtopic when judging
 *  chapter-level weakness. */
const CURRICULUM_WINDOW = 20;

/** Content-gap heat decays: only misses this recent still push their
 *  chapter up the curriculum. */
const GAP_RECENCY_DAYS = 14;

/** Per-chapter evidence for the curriculum sequencer, in canonical
 *  chapter order (skill groups as on the Learn index). Shared by the
 *  daily plan and the Learn index so both see the same ordering. */
export async function gatherCurriculumRows(): Promise<CurriculumRow[]> {
  const progress = await lessonProgressBySubtopic();
  const tests = await chapterTestStates();
  const ladders = new Map(
    (await computeLadders()).map((l) => [l.subtopic, l]),
  );
  const baseline = await baselineWeakness();

  const recent = await db
    .select({
      subtopic: questions.subtopic,
      correct: attempts.correct,
      errorType: attempts.errorType,
      errorSubtag: attempts.errorSubtag,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(eq(attempts.focus, "focused"))
    .orderBy(desc(attempts.id))
    .limit(5000)
    .all();
  const windows = new Map<Subtopic, boolean[]>();
  const flaggedGaps = new Map<Subtopic, number>();
  const gapCutoff = Date.now() - GAP_RECENCY_DAYS * 86_400_000;
  for (const r of recent) {
    const list = windows.get(r.subtopic) ?? [];
    if (list.length < CURRICULUM_WINDOW) {
      list.push(r.correct);
      windows.set(r.subtopic, list);
    }
    // A miss points at a chapter either through a coach/user
    // cross-attribution (error_subtag names the concept that actually
    // failed) or a content_gap tag on the question's own subtopic.
    if (!r.correct && r.createdAt.getTime() >= gapCutoff) {
      const target =
        r.errorSubtag ??
        (r.errorType === "content_gap" ? r.subtopic : null);
      if (target != null) {
        flaggedGaps.set(target, (flaggedGaps.get(target) ?? 0) + 1);
      }
    }
  }

  const rows: CurriculumRow[] = [];
  for (const skill of FUNDAMENTAL_SKILLS) {
    for (const subtopic of SUBTOPICS_BY_SKILL[skill]) {
      const p = progress.get(subtopic);
      const window = windows.get(subtopic) ?? [];
      const ladder = ladders.get(subtopic);
      const rungs = ladder?.rungs.filter((r) => r.state !== "empty") ?? [];
      const unmastered = rungs.filter((r) => r.state !== "mastered").length;
      rows.push({
        subtopic,
        read: p?.readAt != null,
        checklistDone: checklistDone(p),
        testPassed: tests[subtopic]?.passed ?? false,
        attempts: window.length,
        correct: window.filter(Boolean).length,
        ladderGap: rungs.length > 0 ? unmastered / rungs.length : 1,
        baselineWeakness: baseline?.[skill] ?? null,
        flaggedGaps: flaggedGaps.get(subtopic) ?? 0,
      });
    }
  }
  return rows;
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
    curriculum: await gatherCurriculumRows(),
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
