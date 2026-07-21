"use client";

import { useRef, useState } from "react";
import { Md } from "@/components/math";
import { logExampleAttempt, markExampleAttempt } from "@/lib/actions";
import { detectCommitMode } from "@/lib/example-grade";
import {
  STRATEGIES,
  STRATEGY_LABELS,
  type ChapterKey,
  type Strategy,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const TAGS = [
  { label: "Warm-up", cls: "bg-highlight text-graphite" },
  { label: "Core", cls: "bg-ballpoint/10 text-ballpoint" },
  { label: "Exam-level", cls: "bg-redpen/5 text-redpen" },
] as const;

const DS_LETTERS = ["A", "B", "C", "D", "E"] as const;
const DS_LEGEND =
  "A: (1) alone · B: (2) alone · C: together · D: each alone · E: not sufficient";

/** A worked example that demands an attempt before it teaches: the
 *  question is always visible, and the solution reveals only after a
 *  strategy commitment and an answer commitment — both logged with
 *  timing, so every reveal is a retrieval event with evidence. The
 *  reveal then shows the commitment against the answer. */
export function ExampleCard({
  subtopic,
  n,
  level,
  question,
  work,
  answer,
}: {
  subtopic: ChapterKey;
  n: number;
  level: 0 | 1 | 2;
  question: string;
  work: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  const [committed, setCommitted] = useState(false);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [pick, setPick] = useState<string>("");
  const [hint, setHint] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [selfMarked, setSelfMarked] = useState(false);
  const firstTouchRef = useRef<number | null>(null);

  const mode = detectCommitMode(question);
  const tag = TAGS[level];
  const solutionId = `example-${n}-solution`;

  const touch = () => {
    firstTouchRef.current ??= Date.now();
    setHint(null);
  };

  function commitAndReveal() {
    if (committed) {
      setOpen((v) => !v);
      return;
    }
    if (strategy == null || !pick.trim()) {
      setHint(
        strategy == null
          ? "Commit a method first — that choice is half the training."
          : "Commit an answer first — a guess beats a blank.",
      );
      return;
    }
    const timeSeconds =
      (Date.now() - (firstTouchRef.current ?? Date.now())) / 1000;
    setCommitted(true);
    setOpen(true);
    logExampleAttempt({
      subtopic,
      exampleN: n,
      strategy,
      answer: pick.trim(),
      timeSeconds,
    })
      .then((res) => {
        if (res.error == null) {
          setAttemptId(res.id);
          setVerdict(res.correct);
        }
      })
      .catch(() => {
        // Offline — the reveal still works; only the log is lost.
      });
  }

  function selfMark(correct: boolean) {
    setVerdict(correct);
    setSelfMarked(true);
    if (attemptId != null) {
      markExampleAttempt(attemptId, correct).catch(() => {});
    }
  }

  return (
    <div className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient">
      <div className="flex items-center justify-between gap-2 border-b border-grid px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
          Example {n}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${tag.cls}`}
        >
          {tag.label}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <Md source={question} className="text-[15px]" />
      </div>

      {!committed && (
        <div className="space-y-2.5 border-t border-grid px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-graphite">Method:</span>
            {STRATEGIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  touch();
                  setStrategy(s);
                }}
                className={cn(
                  "rounded-control border px-2.5 py-1 text-xs transition-colors",
                  strategy === s
                    ? "border-ballpoint bg-ballpoint/10 font-medium text-ballpoint"
                    : "border-grid text-graphite hover:border-graphite/50",
                )}
              >
                {STRATEGY_LABELS[s]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs text-graphite">Answer:</span>
            {mode.kind === "numeric" ? (
              <input
                type="text"
                value={pick}
                onFocus={touch}
                onChange={(e) => {
                  touch();
                  setPick(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitAndReveal();
                }}
                placeholder="Your answer"
                className="w-40 rounded-control border border-grid bg-paper px-2.5 py-1 font-mono text-sm placeholder:text-graphite/60"
              />
            ) : (
              (mode.kind === "choices" ? mode.letters : DS_LETTERS).map(
                (letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => {
                      touch();
                      setPick(letter);
                    }}
                    className={cn(
                      "min-w-[34px] rounded-control border px-2.5 py-1 font-mono text-xs transition-colors",
                      pick === letter
                        ? "border-ballpoint bg-ballpoint/10 font-medium text-ballpoint"
                        : "border-grid text-graphite hover:border-graphite/50",
                    )}
                  >
                    {letter}
                  </button>
                ),
              )
            )}
          </div>
          {mode.kind === "ds" && (
            <p className="font-mono text-[10px] text-graphite">{DS_LEGEND}</p>
          )}
          {hint && (
            <p className="text-xs text-amber" role="status">
              {hint}
            </p>
          )}
        </div>
      )}

      {open && (
        <div id={solutionId} className="border-t border-grid px-4 py-4 sm:px-5">
          <div
            className={cn(
              "mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-control border px-3 py-2 text-sm",
              verdict === true
                ? "border-ballpoint/40 bg-ballpoint/5"
                : verdict === false
                  ? "border-redpen/40 bg-redpen/5"
                  : "border-grid bg-highlight/50",
            )}
          >
            <span className="text-graphite">
              You committed{" "}
              <span className="font-mono font-medium text-ink">{pick}</span>{" "}
              via {strategy ? STRATEGY_LABELS[strategy].toLowerCase() : "—"}.
            </span>
            {verdict === true && (
              <span className="font-medium text-ballpoint">
                Matched{selfMarked ? "" : " ✓"}
              </span>
            )}
            {verdict === false && (
              <span className="font-medium text-redpen">
                Different — find where.
              </span>
            )}
            {verdict === null && (
              <span className="flex items-center gap-1.5">
                <span className="text-xs text-graphite">Score it:</span>
                <button
                  type="button"
                  onClick={() => selfMark(true)}
                  className="rounded-control border border-ballpoint/50 px-2 py-0.5 text-xs text-ballpoint hover:bg-ballpoint/10"
                >
                  I had it
                </button>
                <button
                  type="button"
                  onClick={() => selfMark(false)}
                  className="rounded-control border border-redpen/40 px-2 py-0.5 text-xs text-redpen hover:bg-redpen/10"
                >
                  I missed it
                </button>
              </span>
            )}
          </div>
          <Md source={work} className="text-sm" />
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control border border-ballpoint/30 bg-ballpoint/10 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ballpoint">
              Answer
            </span>
            <Md source={answer} className="text-sm font-medium" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={commitAndReveal}
        aria-expanded={open}
        aria-controls={solutionId}
        className="block w-full border-t border-grid px-4 py-3 text-left text-sm font-medium text-ballpoint transition-colors hover:bg-ballpoint/10 focus-visible:outline-offset-[-2px] sm:px-5"
      >
        {!committed
          ? "Commit your method and answer — then reveal the solution"
          : open
            ? "Hide the solution"
            : "Show the solution again"}
      </button>
    </div>
  );
}
