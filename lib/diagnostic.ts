import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { sessions, type Question } from "./db/schema.ts";
import { selectQuestions } from "./engine.ts";
import { interleave } from "./interleave.ts";
import {
  DIAGNOSTIC_PER_SKILL,
  DIAGNOSTIC_WINDOW,
  type DiagnosticResult,
} from "./diagnostic-config.ts";
import { FUNDAMENTAL_SKILLS } from "./taxonomy.ts";

export {
  DIAGNOSTIC_PER_SKILL,
  DIAGNOSTIC_SIZE,
  diagnosticWeakness,
  type DiagnosticResult,
} from "./diagnostic-config.ts";

/**
 * The placement diagnostic.
 *
 * Every serious prep course opens with one, and for the same reason:
 * until the platform knows where you stand, its plan is a guess. Khan
 * Academy's official SAT course states it outright — take a diagnostic
 * first, and the recommendations are calibrated off it. TTP places you
 * into the study plan the same way.
 *
 * Q86 had two ways to acquire that baseline and neither worked on day
 * one. Importing an official score report requires having sat the exam;
 * the weighted daily plan requires attempt history it does not yet have.
 * A new user's plan was therefore uniform across all four skills — the
 * one weighting that is certainly wrong.
 *
 * Sixteen questions, four per fundamental skill, at D3 — the middle of
 * the range, because a diagnostic is trying to *discriminate*, and items
 * everyone gets right or everyone gets wrong discriminate nothing. The
 * set is interleaved so it also measures what the exam measures: whether
 * you can pick the method when the questions arrive in no order.
 */
export async function selectDiagnostic(): Promise<Question[]> {
  const bySkill: Question[][] = [];
  const taken: number[] = [];
  for (const skill of FUNDAMENTAL_SKILLS) {
    const picked: Question[] = [];
    for (const difficulty of DIAGNOSTIC_WINDOW) {
      if (picked.length >= DIAGNOSTIC_PER_SKILL) break;
      picked.push(
        ...(await selectQuestions(
          {
            skills: [skill],
            difficultyMin: difficulty,
            difficultyMax: difficulty,
            excludeIds: [...taken, ...picked.map((q) => q.id)],
          },
          DIAGNOSTIC_PER_SKILL - picked.length,
        )),
      );
    }
    taken.push(...picked.map((q) => q.id));
    bySkill.push(picked);
  }
  return interleave(bySkill);
}

/** The most recent completed diagnostic, or null if there has never been
 *  one. Sessions carry `diagnostic: true` in their config. */
export async function latestDiagnostic(): Promise<DiagnosticResult | null> {
  const rows = await db
    .select({
      config: sessions.config,
      summary: sessions.summary,
      startedAt: sessions.startedAt,
      endedAt: sessions.endedAt,
    })
    .from(sessions)
    .where(and(eq(sessions.mode, "drill"), isNotNull(sessions.endedAt)))
    .all();

  let best: DiagnosticResult | null = null;
  for (const row of rows) {
    const config = row.config as { diagnostic?: boolean };
    if (!config.diagnostic) continue;
    const summary = (row.summary ?? {}) as {
      total?: number;
      correct?: number;
      bySkill?: Record<string, { correct: number; total: number }>;
    };
    if (!summary.total) continue;
    const takenAt = (row.endedAt ?? row.startedAt).getTime();
    if (best && best.takenAt >= takenAt) continue;
    const bySkill = {} as DiagnosticResult["bySkill"];
    for (const skill of FUNDAMENTAL_SKILLS) {
      bySkill[skill] = summary.bySkill?.[skill] ?? { correct: 0, total: 0 };
    }
    best = {
      takenAt,
      total: summary.total,
      correct: summary.correct ?? 0,
      bySkill,
    };
  }
  return best;
}
