import { and, asc, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, baselineReports, edits, questions } from "./db/schema.ts";
import { dayIndex, keyFromDayIndex } from "./local-day.ts";
import {
  officialQuarterReplay,
  quarterReplay,
  weeklyEditNet,
  weeklyPacingTrend,
  type EditWeek,
  type OfficialRow,
  type PacingWeek,
  type QuarterRead,
  type SectionAttempt,
} from "./longitudinal.ts";
import { clampDifficulty } from "./ramp.ts";
import type { ScorePoint } from "./readiness.ts";

export type LongitudinalData = {
  /** Positional quarters across in-app 21-question section sims. */
  quarters: QuarterRead[];
  simCount: number;
  /** The same replay from imported official per-question rows. */
  officialQuarters: QuarterRead[];
  officialRowReports: number;
  pacingWeeks: PacingWeek[];
  editWeeks: EditWeek[];
  /** Quant scaled score per imported report, oldest first. */
  scoreSeries: ScorePoint[];
  reportCount: number;
};

export async function gatherLongitudinal(
  tz: string,
): Promise<LongitudinalData> {
  const todayIdx = dayIndex(new Date(), tz);

  const timedRows = await db
    .select({
      sessionId: attempts.sessionId,
      mode: attempts.mode,
      createdAt: attempts.createdAt,
      timeSeconds: attempts.timeSeconds,
      correct: attempts.correct,
      difficulty: questions.difficulty,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      and(
        eq(attempts.focus, "focused"),
        inArray(attempts.mode, ["timed_set", "section_sim"]),
      ),
    )
    .orderBy(asc(attempts.id))
    .all();

  // Section replay: full sims only — quartering a 7-question mini is noise.
  const bySession = new Map<number, SectionAttempt[]>();
  for (const r of timedRows) {
    if (r.mode !== "section_sim" || r.sessionId == null) continue;
    const list = bySession.get(r.sessionId) ?? [];
    list.push({
      pos: list.length,
      difficulty: clampDifficulty(r.difficulty),
      timeSeconds: r.timeSeconds,
      correct: r.correct,
    });
    bySession.set(r.sessionId, list);
  }

  const editRows = await db
    .select({
      createdAt: edits.createdAt,
      fromCorrect: edits.fromCorrect,
      toCorrect: edits.toCorrect,
    })
    .from(edits)
    .all();

  const reports = await db
    .select()
    .from(baselineReports)
    .where(isNotNull(baselineReports.createdAt))
    .orderBy(asc(baselineReports.createdAt))
    .all();
  const officialRowSets: OfficialRow[][] = [];
  const scoreSeries: ScorePoint[] = reports.map((r) => {
    const parsed = r.parsed as {
      test_date?: string | null;
      sections?: Array<{ section: string; scaled_score: number | null }>;
      per_question_rows?: Array<{
        number: number;
        time_minutes: number | null;
        result: "correct" | "incorrect" | null;
      }>;
    };
    const rows = parsed.per_question_rows ?? [];
    if (rows.length >= 8) {
      officialRowSets.push(
        rows.map((x) => ({
          number: x.number,
          timeMinutes: x.time_minutes,
          result: x.result,
        })),
      );
    }
    return {
      date:
        parsed.test_date ??
        keyFromDayIndex(dayIndex(r.createdAt, tz)),
      score:
        parsed.sections?.find((s) => s.section === "quant")?.scaled_score ??
        null,
    };
  });

  return {
    quarters: quarterReplay([...bySession.values()]),
    simCount: [...bySession.values()].filter((s) => s.length >= 8).length,
    officialQuarters: officialQuarterReplay(officialRowSets),
    officialRowReports: officialRowSets.length,
    pacingWeeks: weeklyPacingTrend(
      timedRows.map((r) => ({
        dayIdx: dayIndex(r.createdAt, tz),
        difficulty: clampDifficulty(r.difficulty),
        timeSeconds: r.timeSeconds,
        correct: r.correct,
      })),
      todayIdx,
      keyFromDayIndex,
    ),
    editWeeks: weeklyEditNet(
      editRows.map((e) => ({
        dayIdx: dayIndex(e.createdAt, tz),
        fromCorrect: e.fromCorrect,
        toCorrect: e.toCorrect,
      })),
      todayIdx,
      keyFromDayIndex,
    ),
    scoreSeries,
    reportCount: reports.length,
  };
}
