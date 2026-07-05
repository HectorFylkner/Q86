"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { ChoiceList } from "@/components/drill/choice-list";
import { ConfidencePicker } from "@/components/drill/confidence-picker";
import { SolutionPanel } from "@/components/drill/solution-panel";
import { ResultStroke } from "@/components/drill/result-stroke";
import { finishSession, logAttempt, tagAttempt } from "@/lib/actions";
import { CHAPTER_TEST_BAR } from "@/lib/chapter-test-config";
import { RAMP_STAGE_LABELS, type RampBudget } from "@/lib/ramp";
import type { Question } from "@/lib/db/schema";
import {
  DIFFICULTY_LABELS,
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  SKILL_LABELS,
  SUBTOPIC_LABELS,
  type Confidence,
  type Difficulty,
  type ErrorType,
  type SessionFocus,
  type Subtopic,
} from "@/lib/taxonomy";
import { cn, formatSeconds, percent } from "@/lib/utils";

const SOFT_TARGET_SECONDS = 135; // soft 2:15 target

type Result = {
  questionId: number;
  selectedIndex: number;
  correct: boolean;
  timeSeconds: number;
  confidence: Confidence;
  attemptId: number | null;
  saveFailed: boolean;
  errorType: ErrorType | null;
};

export function QuestionRunner({
  sessionId,
  mode,
  questions,
  timing,
  focus = "focused",
  test,
  budgets,
  onRestart,
}: {
  sessionId: number;
  mode: "drill" | "redo";
  questions: Question[];
  timing: "untimed" | "soft";
  focus?: SessionFocus;
  /** Set when this run is a chapter test for the given subtopic. */
  test?: Subtopic | null;
  /** Timed-transfer ramp target per question id; the clock tightens
   *  only where recent accuracy has earned it. */
  budgets?: Record<number, RampBudget>;
  onRestart?: () => void;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"answering" | "revealed" | "done">(
    "answering",
  );
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  const question = questions[index];
  const currentResult = results[index];

  useEffect(() => {
    if (phase !== "answering" || timing !== "soft") return;
    const t = setInterval(
      () => setElapsed((Date.now() - startRef.current) / 1000),
      250,
    );
    return () => clearInterval(t);
  }, [phase, timing, index]);

  const submit = useCallback(() => {
    if (phase !== "answering") return;
    if (selected == null) {
      setHint("Pick an answer — keys 1–5 or A–E.");
      return;
    }
    if (confidence == null) {
      setHint("Set confidence first — G guess, L lean, K lock.");
      return;
    }
    const timeSeconds = (Date.now() - startRef.current) / 1000;
    const correct = selected === question.correctIndex;
    const result: Result = {
      questionId: question.id,
      selectedIndex: selected,
      correct,
      timeSeconds,
      confidence,
      attemptId: null,
      saveFailed: false,
      errorType: null,
    };
    setResults((r) => [...r, result]);
    setPhase("revealed");
    setHint(null);

    logAttempt({
      sessionId,
      questionId: question.id,
      mode,
      selectedIndex: selected,
      timeSeconds,
      confidence,
      focus,
    })
      .then(({ attemptId }) => {
        setResults((r) =>
          r.map((res, i) => (i === index ? { ...res, attemptId } : res)),
        );
      })
      .catch(() => {
        setResults((r) =>
          r.map((res, i) => (i === index ? { ...res, saveFailed: true } : res)),
        );
      });
  }, [phase, selected, confidence, question, sessionId, mode, focus, index]);

  const next = useCallback(() => {
    if (phase !== "revealed") return;
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setPhase("answering");
      setSelected(null);
      setConfidence(null);
      setHint(null);
      setElapsed(0);
      startRef.current = Date.now();
    } else {
      const all = results;
      const summary = {
        total: all.length,
        correct: all.filter((r) => r.correct).length,
        avgTimeSeconds:
          all.length > 0
            ? all.reduce((s, r) => s + r.timeSeconds, 0) / all.length
            : 0,
      };
      finishSession(sessionId, summary).catch(() => {});
      setPhase("done");
    }
  }, [phase, index, questions.length, results, sessionId]);

  const tagError = useCallback(
    (errorType: ErrorType) => {
      const res = results[index];
      if (!res || res.attemptId == null) return;
      setResults((r) =>
        r.map((item, i) => (i === index ? { ...item, errorType } : item)),
      );
      tagAttempt(res.attemptId, { errorType }).catch(() => {});
    },
    [results, index],
  );

  const gotoPostmortem = useCallback(() => {
    const res = results[index];
    if (res?.attemptId != null) router.push(`/postmortem/${res.attemptId}`);
  }, [results, index, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      )
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key.toLowerCase();

      if (phase === "answering") {
        if (/^[1-5]$/.test(k)) {
          setSelected(Number(k) - 1);
          setHint(null);
          e.preventDefault();
        } else if (/^[a-e]$/.test(k)) {
          setSelected(k.charCodeAt(0) - 97);
          setHint(null);
          e.preventDefault();
        } else if (k === "g" || k === "l" || k === "k") {
          setConfidence(k === "g" ? "guess" : k === "l" ? "lean" : "lock");
          setHint(null);
          e.preventDefault();
        } else if (e.key === "Enter" && !e.repeat) {
          submit();
          e.preventDefault();
        }
      } else if (phase === "revealed") {
        if ((e.key === "Enter" || k === "n") && !e.repeat) {
          next();
          e.preventDefault();
        } else if (k === "p") {
          gotoPostmortem();
          e.preventDefault();
        } else if (currentResult && !currentResult.correct && /^[1-7]$/.test(k)) {
          tagError(ERROR_TYPES[Number(k) - 1]);
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, submit, next, tagError, gotoPostmortem, currentResult]);

  if (phase === "done") {
    const correct = results.filter((r) => r.correct).length;
    const avg =
      results.reduce((s, r) => s + r.timeSeconds, 0) /
      Math.max(1, results.length);
    const passed =
      test != null && correct / Math.max(1, results.length) >= CHAPTER_TEST_BAR;
    const bar = Math.ceil(results.length * CHAPTER_TEST_BAR);
    return (
      <div className="space-y-4">
        {test != null && (
          <div
            className={cn(
              "rounded-card border p-5 shadow-ambient",
              passed
                ? "border-ballpoint/50 bg-ballpoint/5"
                : "border-amber/50 bg-amber/5",
            )}
          >
            <h2 className="font-display text-lg font-semibold">
              {passed ? "Chapter test passed" : "Not passed yet"}
            </h2>
            <p className="mt-1 text-sm text-graphite">
              {passed
                ? `${correct}/${results.length} — this chapter now shows as passed on the Learn index. Keep it warm with drills; retakes can't demote you.`
                : `${correct}/${results.length}, and the bar is ${bar}/${results.length}. Post-mortem the misses below, revisit the trap gallery, then retake.`}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/learn/${test}`}
                className="rounded-control border border-grid bg-surface px-4 py-2 text-sm transition-colors hover:border-graphite/50"
              >
                Back to the chapter
              </Link>
              {!passed && (
                <Link
                  href={`/drill?test=${test}`}
                  className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90"
                >
                  Retake with fresh questions →
                </Link>
              )}
            </div>
          </div>
        )}
        <div className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
          <h2 className="font-display text-lg font-semibold">
            {test != null
              ? "The paper trail"
              : mode === "redo"
                ? "Redo complete"
                : "Drill complete"}
          </h2>
          <div className="mt-3 flex flex-wrap gap-6">
            <Stat label="Accuracy" value={`${percent(correct, results.length)}%`} />
            <Stat label="Correct" value={`${correct}/${results.length}`} />
            <Stat label="Avg time" value={formatSeconds(avg)} />
          </div>
        </div>
        <div className="overflow-x-auto rounded-card border border-grid bg-surface shadow-ambient">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-grid text-left text-xs text-graphite">
                <th className="px-3 py-2 font-normal">#</th>
                <th className="px-3 py-2 font-normal">Subtopic</th>
                <th className="px-3 py-2 font-normal">Result</th>
                <th className="px-3 py-2 font-normal">Time</th>
                <th className="px-3 py-2 font-normal">Confidence</th>
                <th className="px-3 py-2 font-normal" />
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const q = questions[i];
                return (
                  <tr key={i} className="border-b border-grid last:border-0">
                    <td className="px-3 py-2 font-mono text-xs">{i + 1}</td>
                    <td className="px-3 py-2">{SUBTOPIC_LABELS[q.subtopic]}</td>
                    <td className="px-3 py-2">
                      <ResultStroke kind={r.correct ? "check" : "cross"} size={14} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {formatSeconds(r.timeSeconds)}
                    </td>
                    <td className="px-3 py-2 text-xs text-graphite">
                      {r.confidence}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {!r.correct && r.attemptId != null && (
                        <Link
                          href={`/postmortem/${r.attemptId}`}
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
        <div className="flex gap-3">
          {onRestart && (
            <button
              onClick={onRestart}
              className="rounded-control border border-grid bg-surface px-4 py-2 text-sm hover:border-graphite/50"
            >
              Set up another drill
            </button>
          )}
          <Link
            href="/"
            className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
          >
            Back to today
          </Link>
        </div>
      </div>
    );
  }

  const revealed = phase === "revealed";
  const ramp = budgets?.[question.id] ?? null;
  // The ramp overrides the blanket 2:15: build-stage cells show no
  // ticking clock at all (accuracy first), later stages show their
  // earned target.
  const targetSeconds = ramp
    ? ramp.budgetSeconds
    : SOFT_TARGET_SECONDS;
  const overTarget =
    timing === "soft" && targetSeconds != null && elapsed > targetSeconds;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-graphite">
          <span className="font-mono">
            Question {index + 1} of {questions.length}
          </span>
          <Chip>{SKILL_LABELS[question.fundamentalSkill]}</Chip>
          <Chip>{SUBTOPIC_LABELS[question.subtopic]}</Chip>
          <Chip>{DIFFICULTY_LABELS[question.difficulty as Difficulty]}</Chip>
          {question.format === "data_sufficiency" && <Chip>DS</Chip>}
        </div>
        {timing === "soft" &&
          !revealed &&
          (targetSeconds != null ? (
            <span
              className={cn(
                "font-mono text-sm",
                overTarget ? "text-amber" : "text-graphite",
              )}
              title={
                ramp
                  ? ramp.stage === "exam"
                    ? "Exam pace — accuracy held inside the soft cap, so this cell now trains at the exam benchmark."
                    : "Soft cap — accuracy is proven here; the exam benchmark comes once you hold it under this cap."
                  : undefined
              }
            >
              {formatSeconds(elapsed)}
              <span className="ml-1.5 text-[10px] opacity-70">
                / {formatSeconds(targetSeconds)}
                {ramp && ` · ${RAMP_STAGE_LABELS[ramp.stage]}`}
              </span>
            </span>
          ) : (
            <span
              className="font-mono text-[10px] uppercase tracking-wide text-graphite/80"
              title="This cell hasn't proven accuracy yet, so no clock is shown. Get it accurate; the cap arrives on its own."
            >
              no clock yet — accuracy first
            </span>
          ))}
      </div>

      <motion.div
        key={question.id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="rounded-card border border-grid bg-surface p-5 shadow-ambient"
      >
        <Md source={question.stemMd} className="text-[16px]" />
        <div className="mt-5">
          <ChoiceList
            choices={question.choices}
            selected={
              revealed ? (currentResult?.selectedIndex ?? null) : selected
            }
            revealed={revealed}
            correctIndex={question.correctIndex}
            onSelect={(i) => {
              setSelected(i);
              setHint(null);
            }}
          />
        </div>

        {!revealed && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-grid pt-3">
            <ConfidencePicker value={confidence} onChange={setConfidence} />
            <button
              onClick={submit}
              className="rounded-control bg-ballpoint px-4 py-1.5 text-sm font-medium text-white hover:bg-ballpoint/90"
            >
              Confirm answer
              <span className="ml-2 font-mono text-[10px] opacity-70">↵</span>
            </button>
          </div>
        )}

        {hint && (
          <p className="mt-2 text-sm text-amber" role="status">
            {hint}
          </p>
        )}
        {currentResult?.saveFailed && (
          <p className="mt-2 text-sm text-redpen" role="alert">
            This attempt was not saved — check that the dev server can reach
            ./data/q86.db.
          </p>
        )}
      </motion.div>

      {revealed && currentResult && (
        <>
          {currentResult.correct && currentResult.confidence === "guess" && (
            <p className="text-xs text-amber">
              Landed, but it was a guess — this one re-enters the redo
              ladder and does not count toward mastery.
            </p>
          )}
          {!currentResult.correct && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-graphite">Tag the miss (keys 1–7):</span>
              {ERROR_TYPES.map((et, i) => (
                <button
                  key={et}
                  onClick={() => tagError(et)}
                  disabled={currentResult.attemptId == null}
                  className={cn(
                    "rounded-control border px-2 py-1 transition-colors duration-150",
                    currentResult.errorType === et
                      ? "border-redpen bg-redpen/5 font-medium text-redpen"
                      : "border-grid text-graphite hover:border-graphite/50",
                    currentResult.attemptId == null && "opacity-50",
                  )}
                >
                  <span className="mr-1 font-mono opacity-60">{i + 1}</span>
                  {ERROR_TYPE_LABELS[et]}
                </button>
              ))}
            </div>
          )}
          <SolutionPanel
            question={question}
            selectedIndex={currentResult.selectedIndex}
          />
          <div className="flex items-center justify-between">
            <button
              onClick={gotoPostmortem}
              disabled={currentResult.attemptId == null}
              className={cn(
                "rounded-control border border-grid bg-surface px-3 py-1.5 text-sm hover:border-graphite/50",
                currentResult.attemptId == null && "opacity-50",
              )}
            >
              Send to post-mortem
              <span className="ml-2 font-mono text-[10px] text-graphite">P</span>
            </button>
            <button
              onClick={next}
              className="rounded-control bg-ballpoint px-4 py-1.5 text-sm font-medium text-white hover:bg-ballpoint/90"
            >
              {index + 1 < questions.length ? "Next question" : "Finish"}
              <span className="ml-2 font-mono text-[10px] opacity-70">N</span>
            </button>
          </div>
        </>
      )}

      <p className="text-center text-[11px] text-graphite/80">
        1–5 or A–E select · G/L/K confidence · Enter confirm · N next
      </p>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-control border border-grid bg-surface px-1.5 py-0.5 text-[11px]">
      {children}
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-graphite">{label}</div>
      <div className="font-mono text-2xl font-medium">{value}</div>
    </div>
  );
}
