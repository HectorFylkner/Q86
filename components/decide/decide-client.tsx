"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Md } from "@/components/math";
import { saveDecisionRound } from "@/lib/actions";
import type { DecideItem, DecideRecommendation } from "@/lib/decide";
import { CHOICE_LETTERS, cn } from "@/lib/utils";
import { SUBTOPIC_LABELS } from "@/lib/taxonomy";

const SECONDS = 45;

const CALL_LABELS: Record<DecideRecommendation, string> = {
  solve: "Solve",
  guess: "Educated guess",
  bail: "Bail",
};

type Call = { questionId: number; call: DecideRecommendation };

export function DecideClient({ items }: { items: DecideItem[] }) {
  const [phase, setPhase] = useState<"intro" | "running" | "verdict" | "done">(
    "intro",
  );
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(SECONDS);
  const [calls, setCalls] = useState<Call[]>([]);
  const savedRef = useRef(false);

  const item = items[index];

  const commit = useCallback(
    (call: DecideRecommendation) => {
      if (phase !== "running") return;
      setCalls((c) => [...c, { questionId: item.question.id, call }]);
      setPhase("verdict");
    },
    [phase, item],
  );

  // countdown
  useEffect(() => {
    if (phase !== "running") return;
    setRemaining(SECONDS);
    const t = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(t);
          // Time expiring without a call IS a decision failure: counts as solve
          // (the default trap — grinding on by inertia).
          commit("solve");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index]);

  // keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const k = e.key.toLowerCase();
      if (phase === "running") {
        if (k === "s") commit("solve");
        if (k === "g") commit("guess");
        if (k === "b") commit("bail");
      } else if (phase === "verdict" && (k === "enter" || k === "n")) {
        if (index + 1 < items.length) {
          setIndex((i) => i + 1);
          setPhase("running");
        } else {
          setPhase("done");
        }
      } else if (phase === "intro" && k === "enter") {
        setPhase("running");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, index, items.length, commit]);

  const aligned = calls.filter(
    (c, i) => c.call === items[i]?.recommendation,
  ).length;

  // persist once
  useEffect(() => {
    if (phase !== "done" || savedRef.current) return;
    savedRef.current = true;
    void saveDecisionRound({
      total: items.length,
      aligned,
      calls: calls.map((c, i) => ({
        questionId: c.questionId,
        call: c.call,
        recommendation: items[i].recommendation,
      })),
    }).catch(() => {});
  }, [phase, aligned, calls, items]);

  if (items.length === 0) {
    return (
      <p className="rounded-card border border-grid bg-surface p-6 text-sm text-graphite shadow-ambient">
        No questions available — run <code>pnpm seed</code> first.
      </p>
    );
  }

  if (phase === "intro") {
    return (
      <section className="mx-auto max-w-2xl rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <h2 className="font-display text-base font-semibold">
          {items.length} questions · 45 seconds each
        </h2>
        <p className="mt-2 text-sm text-graphite">
          Read the question. Do NOT solve it. Commit to a pacing call:{" "}
          <span className="font-mono font-medium">S</span> solve now,{" "}
          <span className="font-mono font-medium">G</span> eliminate and take an
          educated guess, <span className="font-mono font-medium">B</span> bail
          — pick anything and bank the time. Letting the clock run out counts
          as an unforced &quot;solve&quot;.
        </p>
        <button
          onClick={() => setPhase("running")}
          className="mt-4 rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-on-accent hover:bg-ballpoint/90"
        >
          Start · Enter
        </button>
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="mx-auto max-w-2xl rounded-card border border-ballpoint/40 bg-ballpoint/5 p-6 text-center shadow-ambient">
        <p className="font-display text-lg font-semibold">
          {aligned} / {items.length} calls aligned with your record
        </p>
        <p className="mt-2 text-sm text-graphite">
          Alignment isn&apos;t obedience — a deliberate stretch is fine. The
          habit that matters: decide in 45 seconds and never grind by inertia.
        </p>
      </section>
    );
  }

  const lastCall = calls[calls.length - 1];
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-graphite">
          {index + 1} / {items.length} · {SUBTOPIC_LABELS[item.question.subtopic]}{" "}
          · D{item.question.difficulty}
        </p>
        {phase === "running" && (
          <p
            className={cn(
              "font-mono text-sm font-semibold",
              remaining <= 10 ? "text-redpen" : "text-graphite",
            )}
          >
            0:{String(remaining).padStart(2, "0")}
          </p>
        )}
      </div>

      <section className="rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <Md source={item.question.stemMd} />
        <ol className="mt-4 space-y-1.5">
          {item.question.choices.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="font-mono text-xs font-medium text-graphite">
                {CHOICE_LETTERS[i]}
              </span>
              <Md source={c} />
            </li>
          ))}
        </ol>
      </section>

      {phase === "running" ? (
        <div className="flex flex-wrap gap-2">
          {(["solve", "guess", "bail"] as const).map((call) => (
            <button
              key={call}
              onClick={() => commit(call)}
              className="rounded-control border border-grid bg-surface px-4 py-2 text-sm hover:border-graphite/50"
            >
              {CALL_LABELS[call]}{" "}
              <span className="font-mono text-xs text-graphite">
                {call[0].toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <section
          className={cn(
            "rounded-card border p-4 shadow-ambient",
            lastCall?.call === item.recommendation
              ? "border-ballpoint/50 bg-ballpoint/5"
              : "border-amber/50 bg-amber/5",
          )}
        >
          <p className="text-sm">
            You called <strong>{CALL_LABELS[lastCall.call]}</strong>. Your
            record on {SUBTOPIC_LABELS[item.question.subtopic]} D
            {item.question.difficulty}:{" "}
            {item.sample > 0
              ? `${Math.round(item.predicted * 100)}% over ${item.sample} attempts`
              : `no data yet — difficulty prior ${Math.round(item.predicted * 100)}%`}
            , which points to{" "}
            <strong>{CALL_LABELS[item.recommendation]}</strong>.
          </p>
          <p className="mt-2 text-xs text-graphite">
            Enter for the next question
          </p>
        </section>
      )}
    </div>
  );
}
