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
import {
  CONTEXT_LABELS,
  DOMAIN_LABELS,
  EDIT_REASON_LABELS,
  SKILL_LABELS,
} from "@/lib/taxonomy";
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
    const t = setTimeout(
      () => setShowStats(true),
      questions.length * STROKE_STAGGER_SECONDS * 1000 + 600,
    );
    return () => clearTimeout(t);
  }, [questions.length]);

  const editByQuestionId = new Map<number, TimedEditInput>();
  for (const e of edits) editByQuestionId.set(e.questionId, e);

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-semibold">Section marked</h2>

      <div className="overflow-x-auto rounded-card border border-grid bg-surface shadow-ambient">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-grid text-left text-xs text-graphite">
              <th className="px-3 py-2 font-normal">Q#</th>
              <th className="px-3 py-2 font-normal">Time</th>
              <th className="px-3 py-2 font-normal">Result</th>
              <th className="px-3 py-2 font-normal">Domain</th>
              <th className="px-3 py-2 font-normal">Context</th>
              <th className="px-3 py-2 font-normal">Skill</th>
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
                            edited {CHOICE_LETTERS[edit.fromIndex]}→
                            {CHOICE_LETTERS[edit.toIndex]}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-xs text-graphite">not reached</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {DOMAIN_LABELS[q.contentDomain]}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {CONTEXT_LABELS[q.context]}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {SKILL_LABELS[q.fundamentalSkill]}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {a && !correct && attemptId != null && (
                      <Link
                        href={`/postmortem/${attemptId}`}
                        className="text-xs text-ballpoint hover:underline"
                      >
                        Post-mortem
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
              label="Section accuracy"
              value={`${percent(correctCount, questions.length)}%`}
            />
            <StatCard
              label="Correct"
              value={`${correctCount}/${questions.length}`}
            />
            <StatCard
              label="Time violations (>2:45)"
              value={String(violations)}
              tone={violations > 0 ? "amber" : undefined}
            />
            <StatCard
              label="Sub-60s wrong"
              value={String(sub60Wrong)}
              tone={sub60Wrong > 0 ? "red" : undefined}
            />
            <StatCard
              label="Edit net (this session)"
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
              label="Edit net (lifetime)"
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
              {notReached} questions were never reached — the clock beat you
              to them.
            </p>
          )}

          {edits.length > 0 && (
            <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
              <h3 className="font-display text-sm font-semibold">
                Edits this session
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
                      ? "no change"
                      : "fixed a wrong answer (+1)"
                    : fromCorrect
                      ? "destroyed a correct answer (−1)"
                      : "wrong either way (0)";
                  return (
                    <li key={i} className="text-sm">
                      <span className="font-mono text-xs">Q{qNum}</span>{" "}
                      {CHOICE_LETTERS[e.fromIndex]}→
                      {CHOICE_LETTERS[e.toIndex]} ·{" "}
                      {EDIT_REASON_LABELS[e.reason]} ·{" "}
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
              Set up another timed set
            </button>
            <Link
              href="/"
              className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
            >
              Back to today
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
                  Q{i + 1} — you picked {CHOICE_LETTERS[a.selectedIndex]},
                  correct is {CHOICE_LETTERS[q.correctIndex]}
                </summary>
                <div className="mt-3 space-y-3 border-t border-grid pt-3">
                  <Md source={q.stemMd} className="text-[15px]" />
                  <div>
                    <h4 className="mb-1 font-display text-xs font-semibold text-ballpoint">
                      Fastest path
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
