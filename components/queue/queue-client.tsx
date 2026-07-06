"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { QuestionRunner } from "@/components/drill/question-runner";
import { ResultStroke } from "@/components/drill/result-stroke";
import { startRedoSession } from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import {
  CONFIDENCE_LABELS,
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  FUNDAMENTAL_SKILLS,
  SKILL_LABELS,
  SKILL_SHORT_LABELS,
  SUBTOPIC_LABELS,
  type Confidence,
  type Context,
  type ErrorType,
  type FundamentalSkill,
  type QuestionFormat,
  type SessionMode,
  type Subtopic,
} from "@/lib/taxonomy";
import { cn, formatSeconds } from "@/lib/utils";

export type DueRow = {
  id: number;
  questionId: number;
  stage: number;
  dueAt: Date;
  skill: FundamentalSkill;
  subtopic: Subtopic;
  difficulty: number;
};

export type LogRow = {
  id: number;
  createdAt: Date;
  mode: SessionMode;
  correct: boolean;
  timeSeconds: number;
  confidence: Confidence;
  errorType: ErrorType | null;
  errorSubtag: Subtopic | null;
  userNotes: string | null;
  skill: FundamentalSkill;
  subtopic: Subtopic;
  difficulty: number;
  format: QuestionFormat;
  context: Context;
};

const STAGE_LABELS: Record<number, string> = {
  0: "stage 0 · +2d",
  1: "stage 1 · +7d",
  2: "stage 2 · +21d cold-solve",
};

export function QueueClient({
  due,
  upcoming,
  log,
  autoStart,
}: {
  due: DueRow[];
  upcoming: DueRow[];
  log: LogRow[];
  autoStart: boolean;
}) {
  const router = useRouter();
  const [runner, setRunner] = useState<{
    sessionId: number;
    questions: Question[];
  } | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoStartedRef = useRef(false);

  const [skillFilter, setSkillFilter] = useState<FundamentalSkill | "all">(
    "all",
  );
  const [errorFilter, setErrorFilter] = useState<ErrorType | "all">("all");
  const [resultFilter, setResultFilter] = useState<"all" | "wrong" | "correct">(
    "all",
  );

  async function startRedo(questionIds: number[]) {
    setStarting(true);
    setError(null);
    try {
      const res = await startRedoSession(questionIds);
      if (res.error != null || res.sessionId == null) {
        setError(res.error ?? "Could not start the redo run.");
      } else {
        setRunner({ sessionId: res.sessionId, questions: res.questions });
      }
    } catch {
      setError("Could not start the redo run — the server did not respond.");
    } finally {
      setStarting(false);
    }
  }

  useEffect(() => {
    if (autoStart && due.length > 0 && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void startRedo(due.map((d) => d.questionId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredLog = log.filter(
    (row) =>
      (skillFilter === "all" || row.skill === skillFilter) &&
      (errorFilter === "all" || row.errorType === errorFilter) &&
      (resultFilter === "all" ||
        (resultFilter === "wrong" ? !row.correct : row.correct)),
  );

  function exportCsv() {
    const header = [
      "attempt_id",
      "date",
      "skill",
      "subtopic",
      "difficulty",
      "format",
      "context",
      "mode",
      "correct",
      "time_seconds",
      "confidence",
      "error_type",
      "error_subtag",
      "notes",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
    };
    const lines = [
      header.join(","),
      ...filteredLog.map((r) =>
        [
          r.id,
          new Date(r.createdAt).toISOString(),
          r.skill,
          r.subtopic,
          r.difficulty,
          r.format,
          r.context,
          r.mode,
          r.correct ? 1 : 0,
          r.timeSeconds.toFixed(1),
          r.confidence,
          r.errorType ?? "",
          r.errorSubtag ?? "",
          r.userNotes ?? "",
        ]
          .map(escape)
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "q86-attempts.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (runner) {
    return (
      <QuestionRunner
        sessionId={runner.sessionId}
        mode="redo"
        questions={runner.questions}
        timing="soft"
        onRestart={() => {
          setRunner(null);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-control border border-redpen/40 bg-redpen/5 px-3 py-2 text-sm text-redpen">
          {error}
        </p>
      )}

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold">
            Due now · {due.length}
          </h2>
          {due.length > 0 && (
            <button
              onClick={() => startRedo(due.map((d) => d.questionId))}
              disabled={starting}
              className={cn(
                "rounded-control bg-ballpoint px-4 py-1.5 text-sm font-medium text-white hover:bg-ballpoint/90",
                starting && "cursor-wait opacity-60",
              )}
            >
              Redo all {due.length} due
            </button>
          )}
        </div>
        {due.length === 0 ? (
          <p className="mt-2 text-sm text-graphite">
            Nothing due. Generate a VOF drill or start a timed set.
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs text-graphite">
              Stage-2 items clear only when solved unaided within 2:30 —
              otherwise they re-enter at stage 1.
            </p>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {due.map((d) => (
                  <tr key={d.id} className="border-t border-grid">
                    <td className="py-2 pr-3">
                      <Link
                        href={`/learn/${d.subtopic}`}
                        className="hover:text-ballpoint hover:underline"
                      >
                        {SUBTOPIC_LABELS[d.subtopic]}
                      </Link>
                      <span className="ml-2 text-xs text-graphite">
                        {SKILL_SHORT_LABELS[d.skill]} · D{d.difficulty}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-graphite">
                      {STAGE_LABELS[d.stage] ?? `stage ${d.stage}`}
                    </td>
                    <td className="py-2 pr-3 text-xs text-graphite">
                      due {formatDistanceToNow(new Date(d.dueAt), { addSuffix: true })}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => startRedo([d.questionId])}
                        disabled={starting}
                        className="text-xs font-medium text-ballpoint hover:underline"
                      >
                        Redo this one
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </section>

      {upcoming.length > 0 && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-sm font-semibold">
            Scheduled · {upcoming.length}
          </h2>
          <ul className="mt-2 space-y-1">
            {upcoming.map((d) => (
              <li key={d.id} className="flex justify-between text-sm">
                <span>
                  {SUBTOPIC_LABELS[d.subtopic]}
                  <span className="ml-2 text-xs text-graphite">
                    {STAGE_LABELS[d.stage] ?? ""}
                  </span>
                </span>
                <span className="font-mono text-xs text-graphite">
                  {formatDistanceToNow(new Date(d.dueAt), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold">
            Error log
            <span className="ml-2 font-mono text-xs font-normal text-graphite">
              {filteredLog.length} of {log.length} attempts
            </span>
          </h2>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-control border border-grid bg-surface px-3 py-1.5 text-xs hover:border-graphite/50"
          >
            <Download size={13} />
            Export CSV ({filteredLog.length} rows)
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <select
            aria-label="Filter by skill"
            value={skillFilter}
            onChange={(e) =>
              setSkillFilter(e.target.value as FundamentalSkill | "all")
            }
            className="rounded-control border border-grid bg-surface px-2 py-1"
          >
            <option value="all">All skills</option>
            {FUNDAMENTAL_SKILLS.map((s) => (
              <option key={s} value={s}>
                {SKILL_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by error type"
            value={errorFilter}
            onChange={(e) => setErrorFilter(e.target.value as ErrorType | "all")}
            className="rounded-control border border-grid bg-surface px-2 py-1"
          >
            <option value="all">All error types</option>
            {ERROR_TYPES.map((et) => (
              <option key={et} value={et}>
                {ERROR_TYPE_LABELS[et]}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by result"
            value={resultFilter}
            onChange={(e) =>
              setResultFilter(e.target.value as "all" | "wrong" | "correct")
            }
            className="rounded-control border border-grid bg-surface px-2 py-1"
          >
            <option value="all">All results</option>
            <option value="wrong">Wrong only</option>
            <option value="correct">Correct only</option>
          </select>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grid text-left text-xs text-graphite">
                <th className="py-2 pr-3 font-normal">When</th>
                <th className="py-2 pr-3 font-normal">Subtopic</th>
                <th className="py-2 pr-3 font-normal">D</th>
                <th className="py-2 pr-3 font-normal">Mode</th>
                <th className="py-2 pr-3 font-normal">Result</th>
                <th className="py-2 pr-3 font-normal">Time</th>
                <th className="py-2 pr-3 font-normal">Confidence</th>
                <th className="py-2 pr-3 font-normal">Error</th>
                <th className="py-2 font-normal">Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.map((r) => (
                <tr key={r.id} className="border-b border-grid last:border-0">
                  <td className="py-1.5 pr-3 font-mono text-xs text-graphite">
                    {formatDistanceToNow(new Date(r.createdAt), {
                      addSuffix: true,
                    })}
                  </td>
                  <td className="py-1.5 pr-3">
                    <Link
                      href={`/learn/${r.subtopic}`}
                      className="hover:text-ballpoint hover:underline"
                    >
                      {SUBTOPIC_LABELS[r.subtopic]}
                    </Link>
                    <span className="ml-1.5 text-[10px] text-graphite">
                      {r.context === "pure" ? "Pure" : "Real"}
                      {r.format === "data_sufficiency" ? " · DS" : ""}
                    </span>
                  </td>
                  <td className="py-1.5 pr-3 font-mono text-xs">
                    {r.difficulty}
                  </td>
                  <td className="py-1.5 pr-3 text-xs text-graphite">
                    {r.mode.replace("_", " ")}
                  </td>
                  <td className="py-1.5 pr-3">
                    <ResultStroke
                      kind={r.correct ? "check" : "cross"}
                      size={13}
                    />
                  </td>
                  <td className="py-1.5 pr-3 font-mono text-xs">
                    {formatSeconds(r.timeSeconds)}
                  </td>
                  <td className="py-1.5 pr-3 text-xs text-graphite">
                    {CONFIDENCE_LABELS[r.confidence]}
                  </td>
                  <td className="py-1.5 pr-3 text-xs">
                    {r.errorType ? (
                      <span className="text-redpen">
                        {ERROR_TYPE_LABELS[r.errorType]}
                      </span>
                    ) : (
                      <span className="text-graphite">—</span>
                    )}
                  </td>
                  <td className="max-w-48 truncate py-1.5 text-xs text-graphite">
                    {r.userNotes ?? ""}
                  </td>
                </tr>
              ))}
              {filteredLog.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="py-4 text-center text-sm text-graphite"
                  >
                    No attempts match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
