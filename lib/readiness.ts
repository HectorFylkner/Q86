import type { WeeklyDiscipline } from "./discipline.ts";
import type { ErrorWeek } from "./forensics.ts";
import type { EditWeek, PacingWeek } from "./longitudinal.ts";

/**
 * The readiness panel: a conservative "what's still leaking points" read.
 * Official mock scores are the only calibrated anchor; everything else
 * here is a leading indicator the score can't see, compared over the
 * last four weeks vs the four before. Never a predicted score.
 */
export type LeakSeverity = "red" | "amber" | "ok";

export type Leak = {
  key: string;
  label: string;
  detail: string;
  severity: LeakSeverity;
  /** Where to go work on it; null when the fix lives on this page. */
  href: string | null;
};

export type ScorePoint = { date: string; score: number | null };

export type ReadinessData = {
  anchor: { score: number | null; date: string | null };
  series: ScorePoint[];
  leaks: Leak[];
};

function split<T>(weeks: T[]): { prev: T[]; current: T[] } {
  // Weekly arrays arrive oldest-first, normally 8 entries.
  const mid = Math.floor(weeks.length / 2);
  return { prev: weeks.slice(0, mid), current: weeks.slice(mid) };
}

const CARELESS = [
  "calculation_error",
  "misread",
  "answered_wrong_question",
] as const;

export function readinessRead(inputs: {
  series: ScorePoint[];
  disciplineWeeks: WeeklyDiscipline[];
  errorWeeks: ErrorWeek[];
  pacingWeeks: PacingWeek[];
  editWeeks: EditWeek[];
}): ReadinessData {
  const leaks: Leak[] = [];

  // Sunk costs — the section killer.
  {
    const { prev, current } = split(inputs.disciplineWeeks);
    const now = current.reduce((s, w) => s + w.sunkCosts, 0);
    const before = prev.reduce((s, w) => s + w.sunkCosts, 0);
    leaks.push({
      key: "sunk_costs",
      label: "Sunk-cost questions",
      detail:
        now === 0
          ? before === 0
            ? "None in eight weeks of timed work."
            : `Zero in the last four weeks (was ${before}). Hold the line.`
          : `${now} in the last four weeks (was ${before}). Each one is a ruined section in miniature.`,
      severity: now === 0 ? "ok" : now >= before ? "red" : "amber",
      href: "/decide",
    });
  }

  // Careless mechanisms per 100 attempts.
  {
    const { prev, current } = split(inputs.errorWeeks);
    const rate = (ws: ErrorWeek[]) => {
      const attempts = ws.reduce((s, w) => s + w.attempts, 0);
      const careless = ws.reduce(
        (s, w) => s + CARELESS.reduce((c, et) => c + w.counts[et], 0),
        0,
      );
      return attempts > 0 ? (careless / attempts) * 100 : null;
    };
    const now = rate(current);
    const before = rate(prev);
    const detail =
      now == null
        ? "No attempts in the last four weeks."
        : `${now.toFixed(1)} careless misses per 100 attempts${
            before != null ? ` (was ${before.toFixed(1)})` : ""
          }. Calculation slips, misreads, wrong-question answers.`;
    leaks.push({
      key: "careless",
      label: "Careless recurrence",
      detail,
      severity:
        now == null || now === 0
          ? "ok"
          : before != null && now >= before
            ? "red"
            : "amber",
      href: null,
    });
  }

  // Review & Edit net.
  {
    const { prev, current } = split(inputs.editWeeks);
    const now = current.reduce((s, w) => s + w.net, 0);
    const nowCount = current.reduce((s, w) => s + w.edits, 0);
    const before = prev.reduce((s, w) => s + w.net, 0);
    leaks.push({
      key: "edit_net",
      label: "Review & Edit net",
      detail:
        nowCount === 0
          ? "No edits in the last four weeks."
          : `${now >= 0 ? "+" : ""}${now} points from ${nowCount} edits in four weeks (${before >= 0 ? "+" : ""}${before} before). Edits should fix named errors, not second-guess.`,
      severity: now < 0 ? "red" : now === 0 && nowCount > 0 ? "amber" : "ok",
      href: null,
    });
  }

  // D4–D5 under the clock — the Q86-territory indicator.
  {
    const { prev, current } = split(inputs.pacingWeeks);
    const rate = (ws: PacingWeek[]) => {
      const total = ws.reduce((s, w) => s + w.d45.total, 0);
      const hit = ws.reduce((s, w) => s + w.d45.withinBench, 0);
      return total >= 6 ? { pct: (hit / total) * 100, total } : null;
    };
    const now = rate(current);
    const before = rate(prev);
    leaks.push({
      key: "d45",
      label: "D4–D5 solved on the exam clock",
      detail:
        now == null
          ? "Not enough hard timed questions in the last four weeks to read."
          : `${Math.round(now.pct)}% of ${now.total} hard timed questions solved within benchmark${
              before ? ` (was ${Math.round(before.pct)}%)` : ""
            }. This is where the last points live.`,
      severity:
        now == null
          ? "amber"
          : now.pct >= 60 && (before == null || now.pct >= before.pct - 2)
            ? "ok"
            : now.pct >= 45
              ? "amber"
              : "red",
      href: "/mastery",
    });
  }

  const anchored = inputs.series.filter((p) => p.score != null);
  const latest = anchored.at(-1) ?? null;
  return {
    anchor: {
      score: latest?.score ?? null,
      date: latest?.date ?? null,
    },
    series: inputs.series,
    leaks,
  };
}
