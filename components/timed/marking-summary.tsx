"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { Odometer } from "@/components/odometer";
import { ResultStroke } from "@/components/drill/result-stroke";
import type { AnswerRecord } from "@/components/timed/timed-client";
import type { SaveTimedResponse, TimedEditInput } from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import { pacingRead, TIME_BENCH, type PacedItem } from "@/lib/pacing";
import type { Difficulty } from "@/lib/taxonomy";
import { useT } from "@/components/i18n-provider";
import {
  contextLabel,
  domainLabel,
  editReasonLabel,
  skillLabel,
} from "@/lib/i18n/labels";
import { CHOICE_LETTERS, cn, formatSeconds, percent } from "@/lib/utils";

const STROKE_STAGGER_SECONDS = 0.04;

/**
 * The "marking" moment: result ticks draw in sequentially down the
 * question table with a 40 ms stagger, then the stat numerals roll up.
 */
export function MarkingSummary({
  questions,
  answers,
  edits,
  saved,
  onRestart,
}: {
  questions: Question[];
  answers: (AnswerRecord | null)[];
  edits: TimedEditInput[];
  saved: SaveTimedResponse;
  onRestart: () => void;
}) {
  const t = useT();
  const [showStats, setShowStats] = useState(false);

  const answered = answers.filter(Boolean).length;
  const correctCount = questions.filter(
    (q) => saved.correctByQuestionId[q.id],
  ).length;
  const violations = answers.filter((a) => a?.timeViolation).length;
  const sub60Wrong = questions.filter((q, i) => {
    const a = answers[i];
    return a && a.timeSeconds < 60 && !saved.correctByQuestionId[q.id];
  }).length;
  const notReached = questions.length - answered;

  useEffect(() => {
    const timer = setTimeout(
      () => setShowStats(true),
      questions.length * STROKE_STAGGER_SECONDS * 1000 + 600,
    );
    return () => clearTimeout(timer);
  }, [questions.length]);

  const editByQuestionId = new Map<number, TimedEditInput>();
  for (const e of edits) editByQuestionId.set(e.questionId, e);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-semibold">
        {t("marking.sectionMarked")}
      </h2>

      <div className="overflow-x-auto rounded-card border border-grid bg-surface shadow-ambient">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grid text-left text-xs text-graphite">
              <th className="px-3 py-2 font-normal">{t("marking.columnQ")}</th>
              <th className="px-3 py-2 font-normal">
                {t("drillRunner.timeColumn")}
              </th>
              <th className="px-3 py-2 font-normal">
                {t("drillRunner.resultColumn")}
              </th>
              <th className="px-3 py-2 font-normal">
                {t("marking.columnDomain")}
              </th>
              <th className="px-3 py-2 font-normal">
                {t("marking.columnContext")}
              </th>
              <th className="px-3 py-2 font-normal">
                {t("marking.columnSkill")}
              </th>
              <th className="px-3 py-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {questions.map((q, i) => {
              const a = answers[i];
              const correct = saved.correctByQuestionId[q.id];
              const edit = editByQuestionId.get(q.id);
              const attemptId = saved.attemptIdByQuestionId[q.id];
              return (
                <tr key={q.id} className="border-b border-grid last:border-0">
                  <td className="px-3 py-2 font-mono text-xs">{i + 1}</td>
                  <td
                    className={cn(
                      "px-3 py-2 font-mono text-xs",
                      a && a.timeSeconds > 165 && "text-amber",
                      a && a.timeSeconds < 60 && !correct && "text-redpen",
                    )}
                  >
                    {a ? formatSeconds(a.timeSeconds) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {a ? (
                      <span className="flex items-center gap-2">
                        <ResultStroke
                          kind={correct ? "check" : "cross"}
                          size={15}
                          delay={i * STROKE_STAGGER_SECONDS}
                        />
                        {edit && (
                          <span
                            className={cn(
                              "rounded-[4px] border px-1 py-px text-[10px]",
                              edit.toIndex === q.correctIndex
                                ? "border-ballpoint/50 text-ballpoint"
                                : "border-redpen/50 text-redpen",
                            )}
                          >
                            {t("marking.editedFromTo", {
                              from: CHOICE_LETTERS[edit.fromIndex],
                              to: CHOICE_LETTERS[edit.toIndex],
                            })}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-graphite">
                        {t("marking.notReachedCell")}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {domainLabel(t, q.contentDomain)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {contextLabel(t, q.context)}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {skillLabel(t, q.fundamentalSkill)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {a && !correct && attemptId != null && (
                      <Link
                        href={`/postmortem/${attemptId}`}
                        className="text-xs text-ballpoint hover:underline"
                      >
                        {t("drillRunner.postmortemLink")}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-5"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard
              label={t("marking.sectionAccuracy")}
              value={`${percent(correctCount, questions.length)}%`}
            />
            <StatCard
              label={t("common.correct")}
              value={`${correctCount}/${questions.length}`}
            />
            <StatCard
              label={t("marking.timeViolations")}
              value={String(violations)}
              tone={violations > 0 ? "amber" : undefined}
            />
            <StatCard
              label={t("marking.sub60Wrong")}
              value={String(sub60Wrong)}
              tone={sub60Wrong > 0 ? "red" : undefined}
            />
            <StatCard
              label={t("marking.editNetSession")}
              value={signed(saved.sessionEditNet)}
              tone={
                saved.sessionEditNet < 0
                  ? "red"
                  : saved.sessionEditNet > 0
                    ? "blue"
                    : undefined
              }
            />
            <StatCard
              label={t("marking.editNetLifetime")}
              value={signed(saved.lifetimeEditNet)}
              tone={
                saved.lifetimeEditNet < 0
                  ? "red"
                  : saved.lifetimeEditNet > 0
                    ? "blue"
                    : undefined
              }
            />
          </div>

          {notReached > 0 && (
            <p className="text-sm text-redpen">
              {t("marking.notReachedNote", { count: notReached })}
            </p>
          )}

          <PacingCard questions={questions} answers={answers} saved={saved} />


          {edits.length > 0 && (
            <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
              <h3 className="font-display text-sm font-semibold">
                {t("marking.editsThisSession")}
              </h3>
              <ul className="mt-2 space-y-2">
                {edits.map((e, i) => {
                  const q = questions.find((x) => x.id === e.questionId);
                  if (!q) return null;
                  const qNum = questions.indexOf(q) + 1;
                  const fromCorrect = e.fromIndex === q.correctIndex;
                  const toCorrect = e.toIndex === q.correctIndex;
                  const outcome = toCorrect
                    ? fromCorrect
                      ? t("marking.outcomeNoChange")
                      : t("marking.outcomeFixed")
                    : fromCorrect
                      ? t("marking.outcomeDestroyed")
                      : t("marking.outcomeWrongEither");
                  return (
                    <li key={i} className="text-sm">
                      <span className="font-mono text-xs">Q{qNum}</span>{" "}
                      {CHOICE_LETTERS[e.fromIndex]}→
                      {CHOICE_LETTERS[e.toIndex]} ·{" "}
                      {editReasonLabel(t, e.reason)} ·{" "}
                      <span
                        className={cn(
                          toCorrect && !fromCorrect && "text-ballpoint",
                          fromCorrect && !toCorrect && "text-redpen",
                        )}
                      >
                        {outcome}
                      </span>
                      <span className="block pl-8 text-xs text-graphite">
                        “{e.justification}”
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="rounded-control border border-grid bg-surface px-4 py-2 text-sm hover:border-graphite/50"
            >
              {t("marking.setUpAnother")}
            </button>
            <Link
              href="/"
              className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
            >
              {t("drillRunner.backToToday")}
            </Link>
          </div>
        </motion.div>
      )}

      {/* Solutions for wrong answers, below the fold of the marking moment */}
      {showStats && (
        <div className="space-y-3">
          {questions.map((q, i) => {
            const a = answers[i];
            if (!a || saved.correctByQuestionId[q.id]) return null;
            return (
              <details
                key={q.id}
                className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
              >
                <summary className="cursor-pointer text-sm font-medium">
                  {t("marking.reviewSummary", {
                    n: i + 1,
                    picked: CHOICE_LETTERS[a.selectedIndex],
                    correct: CHOICE_LETTERS[q.correctIndex],
                  })}
                </summary>
                <div className="mt-3 space-y-3 border-t border-grid pt-3">
                  <Md source={q.stemMd} className="text-[15px]" />
                  <div>
                    <h4 className="mb-1 font-display text-xs font-semibold text-ballpoint">
                      {t("drill.fastestPath")}
                    </h4>
                    <Md source={q.fastestPathMd} className="text-sm" />
                  </div>
                  <Md source={q.solutionMd} className="text-sm" />
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function signed(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

/** Per-difficulty benchmarks, time sinks, and rushed-wrong questions —
 *  where the section's minutes actually went. */
function PacingCard({
  questions,
  answers,
  saved,
}: {
  questions: Question[];
  answers: (AnswerRecord | null)[];
  saved: SaveTimedResponse;
}) {
  const t = useT();
  const items: PacedItem[] = questions.flatMap((q, i) => {
    const a = answers[i];
    if (!a) return [];
    return [
      {
        index: i,
        difficulty: q.difficulty as Difficulty,
        timeSeconds: a.timeSeconds,
        correct: !!saved.correctByQuestionId[q.id],
      },
    ];
  });
  if (items.length === 0) return null;
  const read = pacingRead(items);

  return (
    <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <h3 className="font-display text-sm font-semibold">
        {t("marking.pacingRead")}
      </h3>
      <p className="mt-0.5 text-xs text-graphite">{t("marking.pacingLede")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {read.byDifficulty.map((row) => {
          const over = row.avgSeconds > row.benchSeconds * 1.2;
          const under = row.avgSeconds < row.benchSeconds * 0.8;
          return (
            <span
              key={row.difficulty}
              className={cn(
                "rounded-control border border-grid px-2.5 py-1 font-mono text-xs",
                over && "border-amber/60 text-amber",
                under && "text-graphite",
              )}
            >
              {t("marking.pacingRow", {
                difficulty: row.difficulty,
                yours: formatSeconds(row.avgSeconds),
                bench: formatSeconds(row.benchSeconds),
                n: row.n,
              })}
            </span>
          );
        })}
      </div>
      {read.sinks.length > 0 && (
        <p className="mt-3 text-sm">
          <span className="font-medium text-amber">
            {t("marking.timeSinks")}
          </span>{" "}
          <span className="text-graphite">
            {read.sinks
              .slice(0, 4)
              .map((s) =>
                t("marking.sinkItem", {
                  n: s.index + 1,
                  time: formatSeconds(s.timeSeconds),
                  difficulty: s.difficulty,
                  bench: formatSeconds(TIME_BENCH[s.difficulty]),
                }),
              )
              .join(" · ")}
            {t("marking.timeSinksNote")}
          </span>
        </p>
      )}
      {read.rushedWrong.length > 0 && (
        <p className="mt-2 text-sm">
          <span className="font-medium text-redpen">
            {t("marking.rushedWrong")}
          </span>{" "}
          <span className="text-graphite">
            {read.rushedWrong
              .map((s) => `Q${s.index + 1} (${formatSeconds(s.timeSeconds)})`)
              .join(" · ")}
            {t("marking.rushedWrongNote")}
          </span>
        </p>
      )}
      {read.sinks.length === 0 && read.rushedWrong.length === 0 && (
        <p className="mt-3 text-sm text-ballpoint">
          {t("marking.cleanPacing")}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "red" | "amber" | "blue";
}) {
  return (
    <div className="rounded-card border border-grid bg-surface p-3 shadow-ambient">
      <div className="text-[11px] leading-tight text-graphite">{label}</div>
      <Odometer
        text={value}
        className={cn(
          "mt-1 font-mono text-xl font-medium",
          tone === "red" && "text-redpen",
          tone === "amber" && "text-amber",
          tone === "blue" && "text-ballpoint",
        )}
      />
    </div>
  );
}
