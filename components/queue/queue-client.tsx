"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Download } from "lucide-react";
import { QuestionRunner } from "@/components/drill/question-runner";
import { ResultStroke } from "@/components/drill/result-stroke";
import { startRedoSession } from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import {
  ERROR_TYPES,
  FUNDAMENTAL_SKILLS,
  type Confidence,
  type Context,
  type ErrorType,
  type FundamentalSkill,
  type QuestionFormat,
  type SessionMode,
  type Subtopic,
} from "@/lib/taxonomy";
import { useI18n } from "@/components/i18n-provider";
import type { Key, Translate } from "@/lib/i18n";
import { dateFnsLocale } from "@/lib/i18n/format";
import {
  confidenceLabel,
  contextLabel,
  errorTypeLabel,
  skillLabel,
  skillShortLabel,
  subtopicLabel,
} from "@/lib/i18n/labels";
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

const STAGE_KEYS: Record<number, Key> = {
  0: "queue.stage0",
  1: "queue.stage1",
  2: "queue.stage2",
};

const stageLabel = (t: Translate, stage: number): string =>
  stage in STAGE_KEYS ? t(STAGE_KEYS[stage]) : t("queue.stageN", { n: stage });

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
  const { locale, t } = useI18n();
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
        setError(res.error ?? t("queue.couldNotStart"));
      } else {
        setRunner({ sessionId: res.sessionId, questions: res.questions });
      }
    } catch {
      setError(t("queue.couldNotStartServer"));
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
            {t("queue.dueNow", { count: due.length })}
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
              {t("queue.redoAll", { count: due.length })}
            </button>
          )}
        </div>
        {due.length === 0 ? (
          <p className="mt-2 text-sm text-graphite">
            {t("queue.nothingDue")}
          </p>
        ) : (
          <>
            <p className="mt-1 text-xs text-graphite">
              {t("queue.stageNote")}
            </p>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {due.map((d) => (
                  <tr key={d.id} className="border-t border-grid">
                    <td className="py-2 pr-3">
                      {subtopicLabel(t, d.subtopic)}
                      <span className="ml-2 text-xs text-graphite">
                        {skillShortLabel(t, d.skill)} · D{d.difficulty}
                      </span>
                    </td>
                    <td className="py-2 pr-3 font-mono text-xs text-graphite">
                      {stageLabel(t, d.stage)}
                    </td>
                    <td className="py-2 pr-3 text-xs text-graphite">
                      {t("queue.due", {
                        when: formatDistanceToNow(new Date(d.dueAt), {
                          addSuffix: true,
                          locale: dateFnsLocale(locale),
                        }),
                      })}
                    </td>
                    <td className="py-2 text-right">
                      <button
                        onClick={() => startRedo([d.questionId])}
                        disabled={starting}
                        className="text-xs font-medium text-ballpoint hover:underline"
                      >
                        {t("queue.redoThis")}
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
            {t("queue.scheduled", { count: upcoming.length })}
          </h2>
          <ul className="mt-2 space-y-1">
            {upcoming.map((d) => (
              <li key={d.id} className="flex justify-between text-sm">
                <span>
                  {subtopicLabel(t, d.subtopic)}
                  <span className="ml-2 text-xs text-graphite">
                    {stageLabel(t, d.stage)}
                  </span>
                </span>
                <span className="font-mono text-xs text-graphite">
                  {formatDistanceToNow(new Date(d.dueAt), {
                    addSuffix: true,
                    locale: dateFnsLocale(locale),
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-sm font-semibold">
            {t("queue.errorLog")}
            <span className="ml-2 font-mono text-xs font-normal text-graphite">
              {t("queue.logCount", {
                shown: filteredLog.length,
                total: log.length,
              })}
            </span>
          </h2>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 rounded-control border border-grid bg-surface px-3 py-1.5 text-xs hover:border-graphite/50"
          >
            <Download size={13} />
            {t("queue.exportCsv", { rows: filteredLog.length })}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <select
            aria-label={t("queue.filterBySkill")}
            value={skillFilter}
            onChange={(e) =>
              setSkillFilter(e.target.value as FundamentalSkill | "all")
            }
            className="rounded-control border border-grid bg-surface px-2 py-1"
          >
            <option value="all">{t("drillSetup.allSkills")}</option>
            {FUNDAMENTAL_SKILLS.map((s) => (
              <option key={s} value={s}>
                {skillLabel(t, s)}
              </option>
            ))}
          </select>
          <select
            aria-label={t("queue.filterByErrorType")}
            value={errorFilter}
            onChange={(e) => setErrorFilter(e.target.value as ErrorType | "all")}
            className="rounded-control border border-grid bg-surface px-2 py-1"
          >
            <option value="all">{t("queue.allErrorTypes")}</option>
            {ERROR_TYPES.map((et) => (
              <option key={et} value={et}>
                {errorTypeLabel(t, et)}
              </option>
            ))}
          </select>
          <select
            aria-label={t("queue.filterByResult")}
            value={resultFilter}
            onChange={(e) =>
              setResultFilter(e.target.value as "all" | "wrong" | "correct")
            }
            className="rounded-control border border-grid bg-surface px-2 py-1"
          >
            <option value="all">{t("queue.allResults")}</option>
            <option value="wrong">{t("queue.wrongOnly")}</option>
            <option value="correct">{t("queue.correctOnly")}</option>
          </select>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grid text-left text-xs text-graphite">
                <th className="py-2 pr-3 font-normal">
                  {t("queue.columnWhen")}
                </th>
                <th className="py-2 pr-3 font-normal">
                  {t("drillRunner.subtopicColumn")}
                </th>
                <th className="py-2 pr-3 font-normal">D</th>
                <th className="py-2 pr-3 font-normal">
                  {t("queue.columnMode")}
                </th>
                <th className="py-2 pr-3 font-normal">
                  {t("drillRunner.resultColumn")}
                </th>
                <th className="py-2 pr-3 font-normal">
                  {t("drillRunner.timeColumn")}
                </th>
                <th className="py-2 pr-3 font-normal">
                  {t("drillRunner.confidence")}
                </th>
                <th className="py-2 pr-3 font-normal">
                  {t("queue.columnError")}
                </th>
                <th className="py-2 font-normal">{t("queue.columnNotes")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLog.map((r) => (
                <tr key={r.id} className="border-b border-grid last:border-0">
                  <td className="py-1.5 pr-3 font-mono text-xs text-graphite">
                    {formatDistanceToNow(new Date(r.createdAt), {
                      addSuffix: true,
                      locale: dateFnsLocale(locale),
                    })}
                  </td>
                  <td className="py-1.5 pr-3">
                    {subtopicLabel(t, r.subtopic)}
                    <span className="ml-1.5 text-[10px] text-graphite">
                      {contextLabel(t, r.context)}
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
                    {confidenceLabel(t, r.confidence)}
                  </td>
                  <td className="py-1.5 pr-3 text-xs">
                    {r.errorType ? (
                      <span className="text-redpen">
                        {errorTypeLabel(t, r.errorType)}
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
                    {t("queue.noMatches")}
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
