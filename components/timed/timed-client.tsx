"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { Md } from "@/components/math";
import { ChoiceList } from "@/components/drill/choice-list";
import { ConfidencePicker } from "@/components/drill/confidence-picker";
import { TimeInkBar, type Checkpoint } from "@/components/timed/time-ink-bar";
import { ReviewGrid } from "@/components/timed/review-grid";
import { MarkingSummary } from "@/components/timed/marking-summary";
import { Button, KeyHint } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  saveTimedSession,
  startTimedSet,
  type SaveTimedResponse,
  type TimedEditInput,
  type TimedKind,
} from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import {
  FUNDAMENTAL_SKILLS,
  SKILL_LABELS,
  type Confidence,
  type FundamentalSkill,
  type SessionFocus,
} from "@/lib/taxonomy";
import { OVERTIME_SECONDS } from "@/components/timed/overtime";
import { cn, formatSeconds } from "@/lib/utils";

const PULSE_THRESHOLD_SECONDS = OVERTIME_SECONDS; // 2:45 decision pulse

export type AnswerRecord = {
  selectedIndex: number;
  confidence: Confidence;
  timeSeconds: number;
  timeViolation: boolean;
};

type Stage =
  | { kind: "config"; error: string | null }
  | { kind: "loading" }
  | { kind: "ritual"; countdown: number }
  | { kind: "running" }
  | { kind: "review" }
  | { kind: "saving" }
  | { kind: "summary"; saved: SaveTimedResponse }
  | { kind: "error"; message: string };

export function TimedClient({
  verifiedTotal,
  autoStart,
}: {
  verifiedTotal: number;
  autoStart?: TimedKind | null;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "config", error: null });
  const autoStartedRef = useRef(false);
  const [kind, setKind] = useState<TimedKind>("full");
  const [miniSkill, setMiniSkill] = useState<FundamentalSkill | "mix">("mix");
  const [showTimer, setShowTimer] = useState(false);
  const [focus, setFocus] = useState<SessionFocus>("focused");

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [mode, setMode] = useState<"timed_set" | "section_sim">("section_sim");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(AnswerRecord | null)[]>([]);
  const [bookmarks, setBookmarks] = useState<boolean[]>([]);
  const [editRecords, setEditRecords] = useState<TimedEditInput[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [elapsedCurrent, setElapsedCurrent] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const [violatedCurrent, setViolatedCurrent] = useState(false);

  const endsAtRef = useRef<number | null>(null);
  const questionStartRef = useRef<number>(0);
  const finalizedRef = useRef(false);
  const violatedRef = useRef(false);
  const totalSeconds = kind === "full" ? 45 * 60 : 15 * 60;
  const questionCount = kind === "full" ? 21 : 7;

  const checkpoints: Checkpoint[] =
    kind === "full"
      ? [
          { remainingTarget: 30 * 60, label: "Q7 · 30:00" },
          { remainingTarget: 15 * 60, label: "Q14 · 15:00" },
        ]
      : [
          { remainingTarget: 10 * 60, label: "Q3 · 10:00" },
          { remainingTarget: 5 * 60, label: "Q5 · 5:00" },
        ];

  // One-click launch from the daily plan (/timed?start=full|mini).
  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      void handleStart(autoStart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ------------------------------------------------------------------ start
  async function handleStart(selectedKind: TimedKind) {
    setKind(selectedKind);
    setStage({ kind: "loading" });
    try {
      const res = await startTimedSet({
        kind: selectedKind,
        skill:
          selectedKind === "mini" && miniSkill !== "mix" ? miniSkill : undefined,
        showTimer,
        focus,
      });
      if (res.error != null || res.sessionId == null || res.mode == null) {
        setStage({ kind: "config", error: res.error ?? "Could not start." });
        return;
      }
      finalizedRef.current = false;
      setSessionId(res.sessionId);
      setMode(res.mode);
      setQuestions(res.questions);
      setAnswers(new Array(res.questions.length).fill(null));
      setBookmarks(new Array(res.questions.length).fill(false));
      setEditRecords([]);
      setCurrentIndex(0);
      setSelected(null);
      setConfidence(null);
      violatedRef.current = false;
      setViolatedCurrent(false);
      setPulseKey(0);
      setStage({ kind: "ritual", countdown: 3 });
    } catch {
      setStage({
        kind: "config",
        error: "Could not start the set — the server did not respond.",
      });
    }
  }

  // ----------------------------------------------------------------- ritual
  useEffect(() => {
    if (stage.kind !== "ritual") return;
    if (stage.countdown <= 0) {
      const now = Date.now();
      endsAtRef.current = now + totalSeconds * 1000;
      questionStartRef.current = now;
      setRemaining(totalSeconds);
      setStage({ kind: "running" });
      return;
    }
    const t = setTimeout(
      () => setStage({ kind: "ritual", countdown: stage.countdown - 1 }),
      1000,
    );
    return () => clearTimeout(t);
  }, [stage, totalSeconds]);

  // ------------------------------------------------------------------ clock
  const finalizeRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (stage.kind !== "running" && stage.kind !== "review") return;
    const t = setInterval(() => {
      const endsAt = endsAtRef.current;
      if (endsAt == null) return;
      const rem = Math.max(0, (endsAt - Date.now()) / 1000);
      setRemaining(rem);
      if (stage.kind === "running") {
        const elapsed = (Date.now() - questionStartRef.current) / 1000;
        setElapsedCurrent(elapsed);
        if (elapsed > PULSE_THRESHOLD_SECONDS && !violatedRef.current) {
          violatedRef.current = true;
          setViolatedCurrent(true);
          setPulseKey((k) => k + 1);
        }
      }
      if (rem <= 0) finalizeRef.current();
    }, 250);
    return () => clearInterval(t);
  }, [stage.kind]);

  // --------------------------------------------------------------- finalize
  const finalize = useCallback(
    (
      finalAnswers: (AnswerRecord | null)[],
      finalEdits: TimedEditInput[],
      finalBookmarks: boolean[],
    ) => {
      if (sessionId == null) return;
      // Clock expiry ticks and a simultaneous user submit can both land
      // here — only the first one saves the section.
      if (finalizedRef.current) return;
      finalizedRef.current = true;
      setStage({ kind: "saving" });
      const results = questions.flatMap((q, i) => {
        const a = finalAnswers[i];
        if (!a) return [];
        return [
          {
            questionId: q.id,
            selectedIndex: a.selectedIndex,
            timeSeconds: a.timeSeconds,
            confidence: a.confidence,
            bookmarked: finalBookmarks[i],
            timeViolation: a.timeViolation,
          },
        ];
      });
      const notReachedCount = finalAnswers.filter((a) => a == null).length;
      saveTimedSession({
        sessionId,
        mode,
        results,
        edits: finalEdits,
        durationSeconds:
          totalSeconds -
          Math.max(0, ((endsAtRef.current ?? 0) - Date.now()) / 1000),
        notReachedCount,
        focus,
      })
        .then((saved) => setStage({ kind: "summary", saved }))
        .catch((e) => {
          finalizedRef.current = false; // allow the retry button to re-save
          setStage({
            kind: "error",
            message:
              e instanceof Error
                ? e.message
                : "Saving failed. Your results are still on this screen — retry.",
          });
        });
    },
    [sessionId, mode, questions, totalSeconds, focus],
  );

  // Keep a live reference for the clock-expiry path.
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const editsRef = useRef(editRecords);
  editsRef.current = editRecords;
  const bookmarksRef = useRef(bookmarks);
  bookmarksRef.current = bookmarks;
  useEffect(() => {
    finalizeRef.current = () =>
      finalize(answersRef.current, editsRef.current, bookmarksRef.current);
  }, [finalize]);

  // ----------------------------------------------------------------- submit
  const confirmAnswer = useCallback(() => {
    if (stage.kind !== "running") return;
    if (selected == null) {
      setHint("You must answer to advance — keys 1–5 or A–E.");
      return;
    }
    if (confidence == null) {
      setHint("Set confidence first — G guess, L lean, K lock.");
      return;
    }
    const timeSeconds = (Date.now() - questionStartRef.current) / 1000;
    const record: AnswerRecord = {
      selectedIndex: selected,
      confidence,
      timeSeconds,
      timeViolation: violatedCurrent,
    };
    const nextAnswers = answers.map((a, i) => (i === currentIndex ? record : a));
    setAnswers(nextAnswers);
    setHint(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setConfidence(null);
      violatedRef.current = false;
      setViolatedCurrent(false);
      setElapsedCurrent(0);
      questionStartRef.current = Date.now();
    } else if (remaining > 0) {
      setStage({ kind: "review" });
    } else {
      finalize(nextAnswers, editRecords, bookmarks);
    }
  }, [
    stage.kind,
    selected,
    confidence,
    violatedCurrent,
    answers,
    currentIndex,
    questions.length,
    remaining,
    finalize,
    editRecords,
    bookmarks,
  ]);

  const toggleBookmark = useCallback(
    (index: number) => {
      setBookmarks((b) => b.map((v, i) => (i === index ? !v : v)));
    },
    [setBookmarks],
  );

  // --------------------------------------------------------------- keyboard
  useEffect(() => {
    if (stage.kind !== "running") return;
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
      if (/^[1-5]$/.test(k)) {
        setSelected(Number(k) - 1);
        setHint(null);
        e.preventDefault();
      } else if (/^[acde]$/.test(k)) {
        setSelected(k.charCodeAt(0) - 97);
        setHint(null);
        e.preventDefault();
      } else if (k === "b") {
        // In timed mode B is the bookmark toggle (official mechanic);
        // choice B stays reachable via key 2.
        toggleBookmark(currentIndex);
        e.preventDefault();
      } else if (k === "g" || k === "l" || k === "k") {
        setConfidence(k === "g" ? "guess" : k === "l" ? "lean" : "lock");
        setHint(null);
        e.preventDefault();
      } else if (e.key === "Enter" && !e.repeat) {
        confirmAnswer();
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage.kind, confirmAnswer, toggleBookmark, currentIndex]);

  // ------------------------------------------------------------------ views
  if (stage.kind === "config") {
    const enough = (n: number) => verifiedTotal >= n;
    return (
      <div className="space-y-5">
        {stage.error && <ErrorBanner>{stage.error}</ErrorBanner>}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-card border border-grid bg-surface p-5 shadow-ambient">
            <h2 className="font-display text-base font-semibold">
              Full section
            </h2>
            <p className="mt-1 flex-1 text-sm text-graphite">
              21 questions, 45:00, weighted mix across all four skills.
              Faithful mechanics: answer to advance, B bookmarks, review
              screen with up to 3 edits if time remains.
            </p>
            <Button
              onClick={() => handleStart("full")}
              disabled={!enough(21)}
              className="mt-4"
            >
              Start 21-question section
            </Button>
            {!enough(21) && (
              <p className="mt-2 text-xs text-graphite">
                Needs 21 verified questions; the bank has {verifiedTotal}.{" "}
                <Link
                  href="/drill"
                  className="font-medium text-ballpoint hover:underline"
                >
                  Generate more →
                </Link>
              </p>
            )}
          </div>
          <div className="flex flex-col rounded-card border border-grid bg-surface p-5 shadow-ambient">
            <h2 className="font-display text-base font-semibold">Mini set</h2>
            <p className="mt-1 text-sm text-graphite">
              7 questions, 15:00. Mixed or single-skill.
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(["mix", ...FUNDAMENTAL_SKILLS] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setMiniSkill(s)}
                  className={cn(
                    "rounded-control border px-2.5 py-1 text-xs",
                    miniSkill === s
                      ? "border-ink bg-highlight font-medium"
                      : "border-grid text-graphite hover:border-graphite/50",
                  )}
                >
                  {s === "mix" ? "Mixed" : SKILL_LABELS[s]}
                </button>
              ))}
            </div>
            <div className="flex-1" />
            <Button
              onClick={() => handleStart("mini")}
              disabled={!enough(7)}
              className="mt-4"
            >
              Start 7-question mini
            </Button>
            {!enough(7) && (
              <p className="mt-2 text-xs text-graphite">
                Needs 7 verified questions; the bank has {verifiedTotal}.{" "}
                <Link
                  href="/drill"
                  className="font-medium text-ballpoint hover:underline"
                >
                  Generate more →
                </Link>
              </p>
            )}
          </div>
        </div>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-graphite">
          <input
            type="checkbox"
            checked={showTimer}
            onChange={(e) => setShowTimer(e.target.checked)}
            className="h-4 w-4 accent-[var(--ballpoint)]"
          />
          Show the per-question timer (hidden by default, like the real exam)
        </label>
        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-graphite">
          <input
            type="checkbox"
            checked={focus === "casual"}
            onChange={(e) => setFocus(e.target.checked ? "casual" : "focused")}
            className="h-4 w-4 accent-[var(--ballpoint)]"
          />
          Casual session — exclude this set from analytics and the daily plan
        </label>
        {focus === "casual" && (
          <p className="text-caption text-amber">
            Misses still join the redo queue; only the statistics skip this
            session.
          </p>
        )}
      </div>
    );
  }

  if (stage.kind === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-64 w-full rounded-card" />
        <p className="text-sm text-graphite">Assembling the set…</p>
      </div>
    );
  }

  if (stage.kind === "ritual") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="rounded-card border border-grid bg-surface px-10 py-8 text-center shadow-ambient"
        >
          <p className="font-display text-2xl font-semibold">
            Q1 pays the same as Q{questionCount}.
          </p>
          <p className="mt-3 font-mono text-sm text-graphite">
            {stage.countdown}
          </p>
        </motion.div>
      </div>
    );
  }

  if (stage.kind === "saving") {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="skeleton h-6 w-40" />
        <div className="skeleton h-48 w-full rounded-card" />
        <p className="text-sm text-graphite">Marking the section…</p>
      </div>
    );
  }

  if (stage.kind === "error") {
    return (
      <div className="mx-auto max-w-xl space-y-3 rounded-card border border-redpen/40 bg-surface p-5 shadow-ambient">
        <ErrorBanner>{stage.message}</ErrorBanner>
        <Button onClick={() => finalize(answers, editRecords, bookmarks)}>
          Retry saving the session
        </Button>
      </div>
    );
  }

  if (stage.kind === "summary") {
    return (
      <MarkingSummary
        questions={questions}
        answers={answers}
        edits={editRecords}
        saved={stage.saved}
        onRestart={() => setStage({ kind: "config", error: null })}
      />
    );
  }

  if (stage.kind === "review") {
    return (
      <>
        <TimeInkBar
          totalSeconds={totalSeconds}
          remainingSeconds={remaining}
          checkpoints={checkpoints}
          pulseKey={0}
        />
        <ReviewGrid
          questions={questions}
          answers={answers}
          bookmarks={bookmarks}
          edits={editRecords}
          onToggleBookmark={toggleBookmark}
          onCommitEdit={(questionIndex, toIndex, reason, justification) => {
            const q = questions[questionIndex];
            const answer = answers[questionIndex];
            if (!answer) return;
            setEditRecords((prev) => [
              ...prev,
              {
                questionId: q.id,
                fromIndex: answer.selectedIndex,
                toIndex,
                reason,
                justification,
              },
            ]);
            setAnswers((prev) =>
              prev.map((a, i) =>
                i === questionIndex && a ? { ...a, selectedIndex: toIndex } : a,
              ),
            );
          }}
          onSubmit={() => finalize(answers, editRecords, bookmarks)}
        />
      </>
    );
  }

  // running
  const question = questions[currentIndex];
  return (
    <>
      <TimeInkBar
        totalSeconds={totalSeconds}
        remainingSeconds={remaining}
        checkpoints={checkpoints}
        pulseKey={pulseKey}
      />
      <div className="mx-auto mt-4 max-w-3xl space-y-4">
        <div className="flex items-center justify-between text-xs text-graphite">
          <span className="font-mono">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="flex items-center gap-3">
            {showTimer && (
              <span
                className={cn(
                  "font-mono",
                  elapsedCurrent > PULSE_THRESHOLD_SECONDS && "text-amber",
                )}
              >
                {formatSeconds(elapsedCurrent)} on this question
              </span>
            )}
            <button
              onClick={() => toggleBookmark(currentIndex)}
              className={cn(
                "flex items-center gap-1 rounded-control border px-2 py-1",
                bookmarks[currentIndex]
                  ? "border-amber bg-highlight text-amber"
                  : "border-grid text-graphite hover:border-graphite/50",
              )}
            >
              <Bookmark size={12} />
              {bookmarks[currentIndex] ? "Bookmarked" : "Bookmark"}
              <span className="font-mono text-micro opacity-60">B</span>
            </button>
          </span>
        </div>

        <div className="relative rounded-card border border-grid bg-surface p-5 shadow-ambient">
          {violatedCurrent && (
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-amber"
              title="Past the 2:45 checkpoint"
            />
          )}
          <Md source={question.stemMd} className="text-stem" />
          <div className="mt-5">
            <ChoiceList
              choices={question.choices}
              selected={selected}
              revealed={false}
              correctIndex={question.correctIndex}
              onSelect={(i) => {
                setSelected(i);
                setHint(null);
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-grid pt-3">
            <ConfidencePicker value={confidence} onChange={setConfidence} />
            <Button size="sm" onClick={confirmAnswer}>
              {currentIndex + 1 < questions.length
                ? "Confirm and advance"
                : "Confirm final answer"}
              <KeyHint>↵</KeyHint>
            </Button>
          </div>
          {hint && (
            <p className="mt-2 text-sm text-amber" role="status">
              {hint}
            </p>
          )}
        </div>
        <p className="text-center text-caption text-graphite/80">
          1–5 or A/C/D/E select · B bookmark · G/L/K confidence · Enter
          confirm — you cannot return until the review screen
        </p>
      </div>
    </>
  );
}
