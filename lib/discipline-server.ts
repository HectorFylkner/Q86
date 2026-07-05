import { and, desc, eq, inArray, isNull, ne, or } from "drizzle-orm";
import { db } from "./db/index.ts";
import { attempts, questions, sessions } from "./db/schema.ts";
import type { DecideRecommendation } from "./decide-rules.ts";
import {
  sunkCosts,
  triageWins,
  verdictFor,
  weeklyDiscipline,
  type DecideRound,
  type DisciplineItem,
  type SunkCost,
  type TriageVerdict,
  type WeeklyDiscipline,
} from "./discipline.ts";
import { dayIndex, keyFromDayIndex } from "./local-day.ts";
import { clampDifficulty } from "./ramp.ts";
import { appTimeZone } from "./settings.ts";
import type { Subtopic } from "./taxonomy.ts";

type CellStats = Map<string, { correct: number; total: number }>;

/** Personal accuracy per subtopic × difficulty cell over all focused
 *  attempts (optionally excluding one session's rows, so a section's
 *  own results don't feed the verdicts shown for it). */
async function cellStats(excludeSessionId?: number): Promise<CellStats> {
  const rows = await db
    .select({
      subtopic: questions.subtopic,
      difficulty: questions.difficulty,
      correct: attempts.correct,
    })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(
      excludeSessionId == null
        ? eq(attempts.focus, "focused")
        : and(
            eq(attempts.focus, "focused"),
            or(
              isNull(attempts.sessionId),
              ne(attempts.sessionId, excludeSessionId),
            ),
          ),
    )
    .all();
  const out: CellStats = new Map();
  for (const r of rows) {
    const key = `${r.subtopic}|${r.difficulty}`;
    const s = out.get(key) ?? { correct: 0, total: 0 };
    s.total++;
    if (r.correct) s.correct++;
    out.set(key, s);
  }
  return out;
}

/** Most recent explicit /decide call per cell, plus round aggregates. */
async function decideHistory(tz: string): Promise<{
  callByCell: Map<string, DecideRecommendation>;
  rounds: DecideRound[];
}> {
  const decisionSessions = (
    await db.select().from(sessions).where(eq(sessions.mode, "pattern")).all()
  )
    .filter(
      (s) =>
        (s.summary as { kind?: string } | null)?.kind === "decision" &&
        s.endedAt != null,
    )
    .sort((a, b) => a.id - b.id);

  const rounds: DecideRound[] = [];
  const callByQuestion = new Map<number, DecideRecommendation>();
  for (const s of decisionSessions) {
    const summary = s.summary as {
      total?: number;
      aligned?: number;
      calls?: Array<{ questionId: number; call: string }>;
    };
    rounds.push({
      dayIdx: dayIndex(s.endedAt ?? s.startedAt, tz),
      total: summary.total ?? 0,
      aligned: summary.aligned ?? 0,
    });
    for (const c of summary.calls ?? []) {
      if (c.call === "solve" || c.call === "guess" || c.call === "bail") {
        callByQuestion.set(c.questionId, c.call);
      }
    }
  }

  const callByCell = new Map<string, DecideRecommendation>();
  if (callByQuestion.size > 0) {
    const qRows = await db
      .select({
        id: questions.id,
        subtopic: questions.subtopic,
        difficulty: questions.difficulty,
      })
      .from(questions)
      .where(inArray(questions.id, [...callByQuestion.keys()]))
      .all();
    // Sessions were walked oldest → newest, so later calls win.
    for (const q of qRows) {
      const call = callByQuestion.get(q.id);
      if (call) callByCell.set(`${q.subtopic}|${q.difficulty}`, call);
    }
  }
  return { callByCell, rounds };
}

export type DisciplineData = {
  timedAnswered: number;
  sunkCount: number;
  /** Worst violations, capped for display. */
  worst: SunkCost[];
  minutesDonated: number;
  wins: number;
  weekly: WeeklyDiscipline[];
  decideCalls: number;
  decideAligned: number;
};

/** The full triage-discipline read for analytics. */
export async function gatherDiscipline(): Promise<DisciplineData> {
  const tz = await appTimeZone();
  const todayIdx = dayIndex(new Date(), tz);

  const timedRows = await db
    .select({
      attemptId: attempts.id,
      questionId: attempts.questionId,
      createdAt: attempts.createdAt,
      timeSeconds: attempts.timeSeconds,
      correct: attempts.correct,
      subtopic: questions.subtopic,
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
    .orderBy(desc(attempts.id))
    .limit(2000)
    .all();

  const [stats, decide] = await Promise.all([cellStats(), decideHistory(tz)]);

  const items: DisciplineItem[] = timedRows.map((r) => {
    const cell = `${r.subtopic}|${r.difficulty}`;
    return {
      attemptId: r.attemptId,
      questionId: r.questionId,
      dayIdx: dayIndex(r.createdAt, tz),
      subtopic: r.subtopic,
      difficulty: clampDifficulty(r.difficulty),
      timeSeconds: r.timeSeconds,
      correct: r.correct,
      verdict: verdictFor(
        stats.get(cell) ?? null,
        clampDifficulty(r.difficulty),
        decide.callByCell.get(cell) ?? null,
      ),
    };
  });

  const violations = sunkCosts(items);
  return {
    timedAnswered: items.length,
    sunkCount: violations.length,
    worst: violations.slice(0, 10),
    minutesDonated: Math.round(
      violations.reduce((s, v) => s + v.overBySeconds, 0) / 60,
    ),
    wins: triageWins(items).length,
    weekly: weeklyDiscipline(items, decide.rounds, todayIdx, keyFromDayIndex),
    decideCalls: decide.rounds.reduce((s, r) => s + r.total, 0),
    decideAligned: decide.rounds.reduce((s, r) => s + r.aligned, 0),
  };
}

/** Verdicts for one just-saved timed session's questions, excluding that
 *  session's own attempts from the record they're judged against. */
export async function triageVerdicts(
  qs: Array<{ id: number; subtopic: Subtopic; difficulty: number }>,
  excludeSessionId: number,
): Promise<Record<number, TriageVerdict>> {
  if (qs.length === 0) return {};
  const [stats, decide] = await Promise.all([
    cellStats(excludeSessionId),
    decideHistory(await appTimeZone()),
  ]);
  const out: Record<number, TriageVerdict> = {};
  for (const q of qs) {
    const cell = `${q.subtopic}|${q.difficulty}`;
    out[q.id] = verdictFor(
      stats.get(cell) ?? null,
      clampDifficulty(q.difficulty),
      decide.callByCell.get(cell) ?? null,
    );
  }
  return out;
}
