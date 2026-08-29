"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { useI18n } from "@/components/i18n-provider";
import type { PublicQuestion, DiagnosticResult } from "@/lib/diagnostic";
import { scoreDiagnosticAction } from "@/lib/diagnostic-actions";
import { skillLabel, subtopicLabel, formatLabel } from "@/lib/i18n/labels";
import { formatPercent } from "@/lib/i18n/format";
import { cn } from "@/lib/utils";
import type { PlanPreviewDay } from "@/lib/diagnostic-plan";
import { patternCategoryLabel } from "@/lib/i18n/labels";

/**
 * The free diagnostic, run entirely in this component's state.
 *
 * Nothing is persisted anywhere: no row, no cookie, no localStorage. A
 * visitor who closes the tab leaves no trace, which is exactly what the
 * landing page promises. Scoring is a server action so the correct answers
 * stay on the server; the plan preview comes back with it.
 */

const CHOICE_LETTERS = ["A", "B", "C", "D", "E"];

type Stage = "intro" | "running" | "result";

export function DiagnosticClient({
  questions,
  previewFor,
}: {
  questions: PublicQuestion[];
  /** Server action bound in the page: result in, week out. */
  previewFor: (result: DiagnosticResult) => Promise<PlanPreviewDay[]>;
}) {
  const { locale, t } = useI18n();
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Array<number | null>>(
    () => questions.map(() => null),
  );
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [week, setWeek] = useState<PlanPreviewDay[]>([]);
  const [pending, start] = useTransition();

  const total = questions.length;
  const question = questions[index];
  const answered = useMemo(
    () => answers.filter((a) => a !== null).length,
    [answers],
  );

  function choose(choiceIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = choiceIndex;
      return next;
    });
  }

  function finish() {
    start(async () => {
      const scored = await scoreDiagnosticAction(answers);
      setResult(scored);
      setWeek(await previewFor(scored));
      setStage("result");
    });
  }

  if (stage === "intro") {
    return (
      <div className="measure">
        <p className="text-lg leading-relaxed text-graphite">
          {t("diagnostic.lede")}
        </p>
        <button
          type="button"
          onClick={() => setStage("running")}
          className="mt-8 rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {t("diagnostic.startButton")}
        </button>
        <p className="mt-5 font-mono text-xs text-graphite">
          {t("diagnostic.bankNote")}
        </p>
      </div>
    );
  }

  if (stage === "running" && question) {
    return (
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-mono text-xs text-graphite">
            {t("diagnostic.progress", { n: index + 1, total })}
          </p>
          <p className="font-mono text-xs text-graphite">
            {skillLabel(t, question.fundamentalSkill)} ·{" "}
            {formatLabel(t, question.format)}
          </p>
        </div>

        <div
          aria-hidden
          className="mt-3 h-px w-full bg-grid"
          role="presentation"
        >
          <motion.div
            className="h-px bg-ink"
            initial={false}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
          />
        </div>

        <div className="mt-8">
          <Md source={question.stemMd} className="text-base leading-relaxed" />
        </div>

        <div
          role="radiogroup"
          aria-label={t("lesson.answerChoices")}
          className="mt-7 space-y-2"
        >
          {question.choices.map((choice, ci) => {
            const selected = answers[index] === ci;
            return (
              <button
                key={ci}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => choose(ci)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-card border px-4 py-3 text-left transition-colors",
                  selected
                    ? "border-ink bg-highlight"
                    : "border-grid bg-surface hover:border-graphite",
                )}
              >
                <span className="font-mono text-xs text-graphite">
                  {CHOICE_LETTERS[ci]}
                </span>
                <Md source={choice} className="text-sm" />
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-control border border-grid px-4 py-2.5 text-sm disabled:opacity-40"
          >
            {t("diagnostic.back")}
          </button>
          {index < total - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="rounded-control bg-ink px-4 py-2.5 text-sm font-medium text-paper"
            >
              {answers[index] === null ? t("diagnostic.skip") : t("diagnostic.next")}
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={finish}
              className="rounded-control bg-ink px-4 py-2.5 text-sm font-medium text-paper disabled:opacity-60"
            >
              {t("diagnostic.finish")}
            </button>
          )}
          <span className="font-mono text-xs text-graphite">
            {answered}/{total}
          </span>
        </div>
      </div>
    );
  }

  if (stage === "result" && result) {
    return (
      <div>
        <div className="rule-top-strong pt-6">
          <p className="eyebrow">{t("diagnostic.estimateLabel")}</p>
          <motion.p
            className="mt-3 font-display text-[clamp(3rem,9vw,5.5rem)] font-bold leading-none tracking-tight"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            {t("diagnostic.estimateRange", {
              low: result.bandLow,
              high: result.bandHigh,
            })}
          </motion.p>
          <p className="mt-3 font-mono text-sm text-graphite">
            {t("diagnostic.correctOf", {
              correct: result.correct,
              total: result.total,
            })}
          </p>
          <p className="measure mt-5 text-sm leading-relaxed text-graphite">
            {t("diagnostic.estimateCaveat")}
          </p>
        </div>

        <div className="mt-14">
          <p className="eyebrow">{t("diagnostic.perSkillTitle")}</p>
          <ul className="mt-4 space-y-3">
            {result.perSkill.map((row) => {
              const rate = row.total > 0 ? row.correct / row.total : 0;
              return (
                <li key={row.skill} className="flex items-center gap-4 text-sm">
                  <span className="w-56 shrink-0">
                    {skillLabel(t, row.skill)}
                  </span>
                  <span className="h-2 flex-1 rounded-full bg-grid">
                    <motion.span
                      className="block h-2 rounded-full bg-ink"
                      initial={{ width: 0 }}
                      animate={{ width: `${rate * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                    />
                  </span>
                  <span className="w-20 text-right font-mono text-xs text-graphite">
                    {row.correct}/{row.total} · {formatPercent(rate, locale)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-14 rule-top pt-6">
          <p className="eyebrow">{t("diagnostic.weakestTitle")}</p>
          <p className="measure mt-3 text-xl leading-snug">
            {result.correct === result.total
              ? t("diagnostic.perfect")
              : result.weakestSubtopic
                ? t("diagnostic.weakestSubtopic", {
                    skill: skillLabel(t, result.weakestSkill),
                    subtopic: subtopicLabel(t, result.weakestSubtopic),
                  })
                : t("diagnostic.weakestSkillOnly", {
                    skill: skillLabel(t, result.weakestSkill),
                  })}
          </p>
        </div>

        {week.length > 0 && (
          <div className="mt-14 rule-top pt-6">
            <p className="eyebrow">{t("diagnostic.planTitle")}</p>
            <p className="measure mt-3 text-sm leading-relaxed text-graphite">
              {t("diagnostic.planLede")}
            </p>
            <ol className="mt-6 grid gap-px overflow-hidden rounded-card border border-grid bg-grid sm:grid-cols-2 lg:grid-cols-4">
              {week.map((day) => (
                <li key={day.day} className="bg-paper px-4 py-4">
                  <p className="font-mono text-xs text-graphite">
                    {t("diagnostic.planDay", { n: day.day })}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {day.day === 1 && result.weakestSubtopic && (
                      <li>
                        {t("diagnostic.planRead", {
                          subtopic: subtopicLabel(t, result.weakestSubtopic),
                        })}
                      </li>
                    )}
                    <li>
                      {t("diagnostic.planDrill", { count: day.drillTotal })}
                    </li>
                    {day.patternRounds.length > 0 && (
                      <li className="text-graphite">
                        {t("diagnostic.planPatterns", {
                          categories: day.patternRounds
                            .map((c) => patternCategoryLabel(t, c))
                            .join(" · "),
                        })}
                      </li>
                    )}
                    {day.timedSet && (
                      <li className="text-ballpoint">
                        {t("diagnostic.planTimed")}
                      </li>
                    )}
                    {day.review && (
                      <li className="text-graphite">
                        {t("diagnostic.planReview")}
                      </li>
                    )}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="mt-14 rule-top-strong pt-6">
          <h2 className="text-2xl">{t("diagnostic.ctaTitle")}</h2>
          <p className="measure mt-3 text-base leading-relaxed text-graphite">
            {t("diagnostic.ctaBody")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
            >
              {t("diagnostic.ctaButton")}
            </Link>
            <Link
              href="/priser"
              className="text-sm text-graphite underline underline-offset-4 transition-colors hover:text-ink"
            >
              {t("diagnostic.ctaSecondary")}
            </Link>
            <button
              type="button"
              onClick={() => {
                setAnswers(questions.map(() => null));
                setIndex(0);
                setResult(null);
                setWeek([]);
                setStage("intro");
              }}
              className="text-sm text-graphite underline underline-offset-4 transition-colors hover:text-ink"
            >
              {t("diagnostic.retake")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
