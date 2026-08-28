"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Md } from "@/components/math";
import { saveDecisionRound } from "@/lib/actions";
import type { DecideItem, DecideRecommendation } from "@/lib/decide";
import { useI18n } from "@/components/i18n-provider";
import { formatPercent } from "@/lib/i18n/format";
import { subtopicLabel } from "@/lib/i18n/labels";
import type { Key, Translate } from "@/lib/i18n";
import { CHOICE_LETTERS, cn } from "@/lib/utils";

const SECONDS = 45;

const CALL_KEYS: Record<DecideRecommendation, Key> = {
  solve: "decide.callSolve",
  guess: "decide.callGuess",
  bail: "decide.callBail",
};

const callLabel = (t: Translate, call: DecideRecommendation): string =>
  t(CALL_KEYS[call]);

type Call = { questionId: number; call: DecideRecommendation };

export function DecideClient({ items }: { items: DecideItem[] }) {
  const { locale, t } = useI18n();
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
    const timer = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timer);
          // Time expiring without a call IS a decision failure: counts as solve
          // (the default trap — grinding on by inertia).
          commit("solve");
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
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
        {t("decide.empty")}
      </p>
    );
  }

  if (phase === "intro") {
    return (
      <section className="mx-auto max-w-2xl rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <h2 className="font-display text-base font-semibold">
          {t("decide.introTitle", { count: items.length })}
        </h2>
        <p className="mt-2 text-sm text-graphite">
          {t("decide.introBody", { s: "S", g: "G", b: "B" })}
        </p>
        <button
          onClick={() => setPhase("running")}
          className="mt-4 rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
        >
          {t("decide.start")}
        </button>
      </section>
    );
  }

  if (phase === "done") {
    return (
      <section className="mx-auto max-w-2xl rounded-card border border-ballpoint/40 bg-ballpoint/5 p-6 text-center shadow-ambient">
        <p className="font-display text-lg font-semibold">
          {t("decide.doneTitle", { aligned, total: items.length })}
        </p>
        <p className="mt-2 text-sm text-graphite">{t("decide.doneBody")}</p>
      </section>
    );
  }

  const lastCall = calls[calls.length - 1];
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs text-graphite">
          {index + 1} / {items.length} ·{" "}
          {subtopicLabel(t, item.question.subtopic)} · D
          {item.question.difficulty}
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
              {callLabel(t, call)}{" "}
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
            {t("decide.youCalled")}{" "}
            <strong>{callLabel(t, lastCall.call)}</strong>.{" "}
            {t("decide.yourRecordOn")}{" "}
            {subtopicLabel(t, item.question.subtopic)} D
            {item.question.difficulty}:{" "}
            {item.sample > 0
              ? t("decide.withSample", {
                  percent: formatPercent(item.predicted, locale),
                  sample: item.sample,
                })
              : t("decide.noSample", {
                  percent: formatPercent(item.predicted, locale),
                })}
            , {t("decide.whichPointsTo")}{" "}
            <strong>{callLabel(t, item.recommendation)}</strong>.
          </p>
          <p className="mt-2 text-xs text-graphite">{t("decide.nextHint")}</p>
        </section>
      )}
    </div>
  );
}
