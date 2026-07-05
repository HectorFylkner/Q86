import { RUSH_RATIO, SINK_RATIO, TIME_BENCH } from "./pacing.ts";
import type { Difficulty } from "./taxonomy.ts";

/**
 * Longitudinal pacing: the per-set pacing read, re-read across weeks and
 * across section positions. Session summaries, per-attempt timing, and
 * imported official per-question rows are all stored — this module is
 * their reader.
 */
export type SectionAttempt = {
  /** 0-based position within its section. */
  pos: number;
  difficulty: Difficulty;
  timeSeconds: number;
  correct: boolean;
};

export type QuarterRead = {
  quarter: 1 | 2 | 3 | 4;
  n: number;
  accuracy: number | null;
  avgSeconds: number | null;
};

/** Quarter-bucket replay across sections: does accuracy fade or pace
 *  collapse as the section wears on? Each session's answered questions
 *  split into positional quarters. */
export function quarterReplay(sessions: SectionAttempt[][]): QuarterRead[] {
  const agg = [0, 1, 2, 3].map(() => ({
    n: 0,
    correct: 0,
    graded: 0,
    time: 0,
    timed: 0,
  }));
  for (const session of sessions) {
    const len = session.length;
    if (len < 8) continue; // too short to quarter meaningfully
    for (const a of session) {
      const q = Math.min(3, Math.floor((a.pos * 4) / len));
      agg[q].n++;
      agg[q].graded++;
      if (a.correct) agg[q].correct++;
      if (a.timeSeconds > 0) {
        agg[q].time += a.timeSeconds;
        agg[q].timed++;
      }
    }
  }
  return agg.map((a, i) => ({
    quarter: (i + 1) as 1 | 2 | 3 | 4,
    n: a.n,
    accuracy: a.graded > 0 ? a.correct / a.graded : null,
    avgSeconds: a.timed > 0 ? a.time / a.timed : null,
  }));
}

export type OfficialRow = {
  number: number;
  timeMinutes: number | null;
  result: "correct" | "incorrect" | null;
};

/** The same replay for imported official per-question rows. Rows with
 *  missing time or result stay in the bucket but out of that average. */
export function officialQuarterReplay(
  reports: OfficialRow[][],
): QuarterRead[] {
  const agg = [0, 1, 2, 3].map(() => ({
    n: 0,
    correct: 0,
    graded: 0,
    time: 0,
    timed: 0,
  }));
  for (const rows of reports) {
    const ordered = [...rows].sort((a, b) => a.number - b.number);
    const len = ordered.length;
    if (len < 8) continue;
    ordered.forEach((r, pos) => {
      const q = Math.min(3, Math.floor((pos * 4) / len));
      agg[q].n++;
      if (r.result != null) {
        agg[q].graded++;
        if (r.result === "correct") agg[q].correct++;
      }
      if (r.timeMinutes != null) {
        agg[q].time += r.timeMinutes * 60;
        agg[q].timed++;
      }
    });
  }
  return agg.map((a, i) => ({
    quarter: (i + 1) as 1 | 2 | 3 | 4,
    n: a.n,
    accuracy: a.graded > 0 ? a.correct / a.graded : null,
    avgSeconds: a.timed > 0 ? a.time / a.timed : null,
  }));
}

export type PacingWeek = {
  weekStartKey: string;
  answered: number;
  sinks: number;
  rushedWrong: number;
  /** Mean of timeSeconds / benchmark across the week's timed answers. */
  benchRatioAvg: number | null;
  /** D4–D5 answers correct within their exam benchmark. */
  d45: { withinBench: number; total: number };
};

export type TimedWeekRow = {
  dayIdx: number;
  difficulty: Difficulty;
  timeSeconds: number;
  correct: boolean;
};

/** The marking summary's pacing read, trended by week (oldest first). */
export function weeklyPacingTrend(
  rows: TimedWeekRow[],
  todayIdx: number,
  keyFromDayIndex: (index: number) => string,
  weeks = 8,
): PacingWeek[] {
  const buckets: PacingWeek[] = [];
  const ratios: number[][] = [];
  for (let back = weeks - 1; back >= 0; back--) {
    buckets.push({
      weekStartKey: keyFromDayIndex(todayIdx - back * 7 - 6),
      answered: 0,
      sinks: 0,
      rushedWrong: 0,
      benchRatioAvg: null,
      d45: { withinBench: 0, total: 0 },
    });
    ratios.push([]);
  }
  for (const r of rows) {
    const back = Math.floor((todayIdx - r.dayIdx) / 7);
    if (back < 0 || back >= weeks) continue;
    const i = weeks - 1 - back;
    const bench = TIME_BENCH[r.difficulty];
    buckets[i].answered++;
    ratios[i].push(r.timeSeconds / bench);
    if (r.timeSeconds > bench * SINK_RATIO) buckets[i].sinks++;
    if (!r.correct && r.timeSeconds < bench * RUSH_RATIO) {
      buckets[i].rushedWrong++;
    }
    if (r.difficulty >= 4) {
      buckets[i].d45.total++;
      if (r.correct && r.timeSeconds <= bench) buckets[i].d45.withinBench++;
    }
  }
  buckets.forEach((b, i) => {
    if (ratios[i].length > 0) {
      b.benchRatioAvg =
        ratios[i].reduce((s, x) => s + x, 0) / ratios[i].length;
    }
  });
  return buckets;
}

export type EditWeek = { weekStartKey: string; edits: number; net: number };

/** Review & Edit outcomes per week (oldest first). */
export function weeklyEditNet(
  edits: Array<{ dayIdx: number; fromCorrect: boolean; toCorrect: boolean }>,
  todayIdx: number,
  keyFromDayIndex: (index: number) => string,
  weeks = 8,
): EditWeek[] {
  const buckets: EditWeek[] = [];
  for (let back = weeks - 1; back >= 0; back--) {
    buckets.push({
      weekStartKey: keyFromDayIndex(todayIdx - back * 7 - 6),
      edits: 0,
      net: 0,
    });
  }
  for (const e of edits) {
    const back = Math.floor((todayIdx - e.dayIdx) / 7);
    if (back < 0 || back >= weeks) continue;
    const b = buckets[weeks - 1 - back];
    b.edits++;
    b.net += (e.toCorrect ? 1 : 0) - (e.fromCorrect ? 1 : 0);
  }
  return buckets;
}
