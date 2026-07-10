"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Fire } from "@phosphor-icons/react";
import { Md } from "@/components/math";
import { Odometer } from "@/components/odometer";
import { ResultStroke } from "@/components/drill/result-stroke";
import {
  savePatternRound,
  type PatternRoundItem,
  type PatternRoundResult,
} from "@/lib/actions";
import {
  generateFor,
  PATTERN_CATEGORIES,
  PATTERN_CATEGORY_LABELS,
  type PatternCategoryKey,
  type PatternItem,
} from "@/lib/generators";
import { mulberry32 } from "@/lib/generators/rng";
import { cn } from "@/lib/utils";

const ROUND_SECONDS = 90;
const FEEDBACK_MS = 700;

export type CategoryStats = {
  key: PatternCategoryKey;
  label: string;
  rating: number;
  attempts: number;
  bestRound: number;
  streak: number;
};

type Selection = PatternCategoryKey | "mixed";

type Stage =
  | { kind: "setup"; error: string | null }
  | { kind: "running" }
  | { kind: "saving" }
  | { kind: "done"; result: PatternRoundResult };

type ActiveItem = {
  item: PatternItem;
  category: PatternCategoryKey;
};

export function PatternsClient({
  stats,
  dayStreak,
  mixedBest,
  autoStart,
}: {
  stats: CategoryStats[];
  dayStreak: number;
  mixedBest: number;
  autoStart?: Selection | null;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ kind: "setup", error: null });
  const [selection, setSelection] = useState<Selection>(autoStart ?? "mixed");
  const autoStartedRef = useRef(false);
  const [remaining, setRemaining] = useState(ROUND_SECONDS);
  const [active, setActive] = useState<ActiveItem | null>(null);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    answer: string;
  } | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const rngRef = useRef<() => number>(() => 0);
  const endsAtRef = useRef(0);
  const itemStartRef = useRef(0);
  const finishedRef = useRef(false);
  const itemsRef = useRef<PatternRoundItem[]>([]);
  const recentPromptsRef = useRef<string[]>([]);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextItem = useCallback(() => {
    const rng = rngRef.current;
    const category: PatternCategoryKey =
      selection === "mixed"
        ? PATTERN_CATEGORIES[Math.floor(rng() * PATTERN_CATEGORIES.length)].key
        : selection;
    let item = generateFor(category, rng);
    for (
      let tries = 0;
      tries < 8 && recentPromptsRef.current.includes(item.prompt);
      tries++
    ) {
      item = generateFor(category, rng);
    }
    recentPromptsRef.current = [
      ...recentPromptsRef.current.slice(-5),
      item.prompt,
    ];
    setActive({ item, category });
    setTyped("");
    setFeedback(null);
    itemStartRef.current = Date.now();
  }, [selection]);

  function startRound() {
    rngRef.current = mulberry32((Date.now() % 2147483647) + 1);
    finishedRef.current = false;
    itemsRef.current = [];
    recentPromptsRef.current = [];
    setScore(0);
    setAnswered(0);
    setRemaining(ROUND_SECONDS);
    endsAtRef.current = Date.now() + ROUND_SECONDS * 1000;
    setStage({ kind: "running" });
  }

  // First item once running.
  useEffect(() => {
    if (stage.kind === "running" && active == null) nextItem();
  }, [stage.kind, active, nextItem]);

  // One-click launch from the daily plan (/patterns?start=…).
  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      startRound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finishRound = useCallback(() => {
    // The clock tick and the feedback timer can both land here at 0:00 —
    // only the first one saves the round.
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setStage({ kind: "saving" });
    setActive(null);
    savePatternRound({ category: selection, items: itemsRef.current })
      .then((result) => {
        setStage({ kind: "done", result });
        router.refresh();
      })
      .catch(() =>
        setStage({
          kind: "setup",
          error:
            "The round could not be saved — the server did not respond. Ratings are unchanged.",
        }),
      );
  }, [selection, router]);

  // Clock.
  useEffect(() => {
    if (stage.kind !== "running") return;
    const t = setInterval(() => {
      const rem = Math.max(0, (endsAtRef.current - Date.now()) / 1000);
      setRemaining(rem);
      if (rem <= 0) finishRound();
    }, 100);
    return () => clearInterval(t);
  }, [stage.kind, finishRound]);

  const submitAnswer = useCallback(
    (userAnswer: string) => {
      if (!active || feedback) return;
      const correct = answersMatch(userAnswer, active.item.answer);
      itemsRef.current.push({
        category: active.category,
        promptText: active.item.prompt,
        correctAnswer: active.item.answer,
        userAnswer,
        ms: Date.now() - itemStartRef.current,
        correct,
        difficultyRating: active.item.difficultyRating,
      });
      setAnswered((n) => n + 1);
      if (correct) setScore((s) => s + 1);
      setFeedback({ correct, answer: active.item.answer });
      feedbackTimerRef.current = setTimeout(() => {
        if (Date.now() >= endsAtRef.current) finishRound();
        else nextItem();
      }, FEEDBACK_MS);
    },
    [active, feedback, nextItem, finishRound],
  );

  // Option keys 1–4 (typed mode uses the input directly).
  useEffect(() => {
    if (stage.kind !== "running") return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA"))
        return;
      if (!active?.item.options || feedback) return;
      if (/^[1-4]$/.test(e.key)) {
        const option = active.item.options[Number(e.key) - 1];
        if (option != null) {
          submitAnswer(option);
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stage.kind, active, feedback, submitAnswer]);

  // Focus the typed input on each new item.
  useEffect(() => {
    if (active && !active.item.options) inputRef.current?.focus();
  }, [active]);

  if (stage.kind === "setup" || stage.kind === "saving") {
    const isSaving = stage.kind === "saving";
    return (
      <div className="space-y-5">
        {stage.kind === "setup" && stage.error && (
          <p className="rounded-control border border-redpen/40 bg-redpen/5 px-3 py-2 text-sm text-redpen">
            {stage.error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <Fire size={15} weight="regular" className="text-amber" aria-hidden />
            <span className="font-mono font-medium">{dayStreak}</span>
            <span className="text-graphite">day streak</span>
          </div>
          <span className="text-sm text-graphite">
            90-second rounds · answers computed by code, instant and always
            correct
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setSelection("mixed")}
            className={cn(
              "flex flex-col rounded-card border p-4 text-left shadow-ambient transition-colors duration-150",
              selection === "mixed"
                ? "border-ink bg-highlight"
                : "border-grid bg-surface hover:border-graphite/50",
            )}
          >
            <span className="font-display text-sm font-semibold">Mixed</span>
            <span className="mt-1 text-xs text-graphite">
              All nine categories, shuffled
            </span>
            <span className="mt-2 font-mono text-xs text-graphite">
              best round {mixedBest}
            </span>
          </button>
          {stats.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelection(s.key)}
              className={cn(
                "flex flex-col rounded-card border p-4 text-left shadow-ambient transition-colors duration-150",
                selection === s.key
                  ? "border-ink bg-highlight"
                  : "border-grid bg-surface hover:border-graphite/50",
              )}
            >
              <span className="font-display text-sm font-semibold">
                {s.label}
              </span>
              <span className="mt-1 flex items-baseline gap-2">
                <Odometer
                  text={String(s.rating)}
                  className="font-mono text-lg font-medium"
                />
                <span className="text-[10px] text-graphite">ELO</span>
              </span>
              <span className="mt-1 font-mono text-xs text-graphite">
                best {s.bestRound} · streak {s.streak} ·{" "}
                {s.attempts} answered
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={startRound}
          disabled={isSaving}
          className={cn(
            "rounded-control bg-ballpoint px-5 py-2.5 text-sm font-medium text-white hover:bg-ballpoint/90",
            isSaving && "cursor-wait opacity-60",
          )}
        >
          {isSaving
            ? "Saving the round…"
            : `Start 90-second round: ${
                selection === "mixed"
                  ? "Mixed"
                  : PATTERN_CATEGORY_LABELS[selection]
              }`}
        </button>
      </div>
    );
  }

  if (stage.kind === "done") {
    const { result } = stage;
    const items = itemsRef.current;
    const avgMs =
      items.length > 0
        ? items.reduce((s, i) => s + i.ms, 0) / items.length
        : 0;
    return (
      <div className="space-y-5">
        {result.personalBest.isNew && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="rounded-control border border-ballpoint/50 bg-highlight px-3 py-2 text-sm font-medium text-ballpoint"
          >
            New personal best: {result.personalBest.current} (previous{" "}
            {result.personalBest.previous}).
          </motion.p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatTile label="Score" text={String(score)} />
          <StatTile
            label="Accuracy"
            text={`${answered > 0 ? Math.round((score / answered) * 100) : 0}%`}
          />
          <StatTile label="Avg time" text={`${(avgMs / 1000).toFixed(1)}s`} />
          <StatTile label="Day streak" text={String(result.dayStreak)} />
        </div>

        <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h3 className="font-display text-sm font-semibold">Rating changes</h3>
          <ul className="mt-2 space-y-2">
            {Object.keys(result.newRatings).map((category) => {
              const oldR = Math.round(result.oldRatings[category]);
              const newR = Math.round(result.newRatings[category]);
              const delta = newR - oldR;
              return (
                <li key={category} className="flex items-center gap-3 text-sm">
                  <span className="w-56">
                    {PATTERN_CATEGORY_LABELS[
                      category as PatternCategoryKey
                    ] ?? category}
                  </span>
                  <Odometer
                    text={String(newR)}
                    className="font-mono text-lg font-medium"
                  />
                  <span
                    className={cn(
                      "font-mono text-xs",
                      delta > 0
                        ? "text-ballpoint"
                        : delta < 0
                          ? "text-redpen"
                          : "text-graphite",
                    )}
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </span>
                  <span className="font-mono text-xs text-graphite">
                    streak {result.categoryStreaks[category] ?? 0}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={startRound}
            className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
          >
            Another round
          </button>
          <button
            onClick={() => setStage({ kind: "setup", error: null })}
            className="rounded-control border border-grid bg-surface px-4 py-2 text-sm hover:border-graphite/50"
          >
            Change category
          </button>
        </div>
      </div>
    );
  }

  // running
  const fraction = remaining / ROUND_SECONDS;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between font-mono text-sm">
        <span className={cn(remaining < 15 && "text-amber")}>
          {Math.ceil(remaining)}s
        </span>
        <span>
          <span className="font-medium">{score}</span>
          <span className="text-graphite"> / {answered} correct</span>
        </span>
      </div>
      <div className="h-[3px] w-full rounded-full bg-grid">
        <div
          className="h-[3px] rounded-full bg-ballpoint transition-[width] duration-100 ease-linear"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>

      {active && (
        <div className="rounded-card border border-grid bg-surface p-6 shadow-ambient">
          <div className="text-xs text-graphite">
            {PATTERN_CATEGORY_LABELS[active.category]}
          </div>
          <div className="mt-2 min-h-16 text-lg">
            <Md source={active.item.prompt} />
          </div>

          {feedback ? (
            <div className="mt-4 flex items-center gap-3">
              <ResultStroke kind={feedback.correct ? "check" : "cross"} />
              {!feedback.correct && (
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="text-graphite">Answer:</span>
                  <Md source={feedback.answer} />
                </span>
              )}
            </div>
          ) : active.item.options ? (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {active.item.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => submitAnswer(option)}
                  className="flex items-center gap-2 rounded-control border border-grid px-3 py-2 text-left text-sm hover:border-graphite/50"
                >
                  <span className="font-mono text-xs text-graphite">
                    {i + 1}
                  </span>
                  <Md source={option} />
                </button>
              ))}
            </div>
          ) : (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (typed.trim() !== "") submitAnswer(typed.trim());
              }}
            >
              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                inputMode="decimal"
                autoComplete="off"
                aria-label="Your answer"
                placeholder="Type the number"
                className="w-44 rounded-control border border-grid bg-surface px-3 py-2 font-mono text-lg"
              />
              <button
                type="submit"
                className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
              >
                Answer
                <span className="ml-2 font-mono text-[10px] opacity-70">↵</span>
              </button>
            </form>
          )}
        </div>
      )}
      <p className="text-center text-[11px] text-graphite/80">
        {active?.item.options
          ? "Keys 1–4 answer"
          : "Type the number, Enter answers"}
      </p>
    </div>
  );
}

function answersMatch(user: string, canonical: string): boolean {
  const u = user.trim();
  const c = canonical.trim();
  if (u.localeCompare(c, undefined, { sensitivity: "accent" }) === 0)
    return true;
  const un = Number(u.replace("%", ""));
  const cn = Number(c.replace("%", ""));
  if (Number.isFinite(un) && Number.isFinite(cn)) {
    return Math.abs(un - cn) < 1e-9;
  }
  return false;
}

function StatTile({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-card border border-grid bg-surface p-3 shadow-ambient">
      <div className="text-[11px] text-graphite">{label}</div>
      <Odometer text={text} className="mt-1 font-mono text-xl font-medium" />
    </div>
  );
}
