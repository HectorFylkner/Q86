"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Md } from "@/components/math";
import { useI18n } from "@/components/i18n-provider";
import { gradeDeckCard } from "@/lib/actions";
import { dateFnsLocale } from "@/lib/i18n/format";
import { subtopicLabel } from "@/lib/i18n/labels";
import type { DeckCard } from "@/lib/deck";
import type { ReviewGrade } from "@/lib/srs";
import { cn } from "@/lib/utils";

const GRADE_KEYS: Record<string, ReviewGrade> = {
  "1": "forgot",
  "2": "hard",
  "3": "good",
};

function days(n: number): string {
  return n === 1 ? "1d" : `${n}d`;
}

export function DeckClient({ cards }: { cards: DeckCard[] }) {
  const { locale, t } = useI18n();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [, startTransition] = useTransition();

  const card = index < cards.length ? cards[index] : null;

  const grade = useCallback(
    (g: ReviewGrade) => {
      if (!card) return;
      const questionId = card.questionId;
      startTransition(() => {
        void gradeDeckCard(questionId, g);
      });
      setIndex((i) => i + 1);
      setFlipped(false);
    },
    [card],
  );

  const advance = useCallback(() => {
    if (!flipped) setFlipped(true);
    else grade("good");
  }, [flipped, grade]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      } else if (flipped && GRADE_KEYS[e.key]) {
        e.preventDefault();
        grade(GRADE_KEYS[e.key]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, flipped, grade]);

  if (cards.length === 0) {
    return (
      <section className="rounded-card border border-grid bg-surface p-6 text-center shadow-ambient">
        <p className="text-sm text-graphite">{t("deck.empty")}</p>
        <Link
          href="/drill"
          className="mt-3 inline-block rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
        >
          {t("deck.goDrill")}
        </Link>
      </section>
    );
  }

  if (!card) {
    return (
      <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-6 text-center shadow-ambient">
        <p className="font-display text-base font-semibold">
          {t("deck.done", { count: cards.length })}
        </p>
        <p className="mt-1 text-sm text-graphite">{t("deck.doneNote")}</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <p className="text-center font-mono text-xs text-graphite">
        {index + 1} / {cards.length}
        {card.state === "new" && ` · ${t("deck.new")}`}
      </p>
      <button
        onClick={advance}
        className={cn(
          "block w-full rounded-card border p-6 text-left shadow-ambient transition-colors",
          flipped ? "border-ballpoint/50 bg-highlight" : "border-grid bg-surface",
        )}
      >
        <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
          {flipped ? t("deck.takeaway") : t("deck.triggerCue")} ·{" "}
          {subtopicLabel(t, card.subtopic)} ·{" "}
          {t("deck.missed", {
            when: formatDistanceToNow(new Date(card.missedAgo), {
              addSuffix: true,
              locale: dateFnsLocale(locale),
            }),
          })}
        </p>
        <div className="mt-2 text-[15px]">
          <Md source={flipped ? card.back : card.front} />
        </div>
        {!flipped && (
          <p className="mt-3 text-xs text-graphite">{t("deck.flipHint")}</p>
        )}
      </button>
      {flipped ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => grade("forgot")}
              className="min-h-[44px] rounded-control border border-redpen/40 px-3 py-2 text-sm font-medium text-redpen transition-colors hover:bg-redpen/10"
            >
              {t("deck.forgot")}{" "}
              <span className="font-mono text-[11px] opacity-70">
                {days(card.intervals.forgot)} · 1
              </span>
            </button>
            <button
              onClick={() => grade("hard")}
              className="min-h-[44px] rounded-control border border-amber/50 px-3 py-2 text-sm font-medium text-amber transition-colors hover:bg-amber/10"
            >
              {t("deck.hard")}{" "}
              <span className="font-mono text-[11px] opacity-70">
                {days(card.intervals.hard)} · 2
              </span>
            </button>
            <button
              onClick={() => grade("good")}
              className="min-h-[44px] rounded-control border border-ballpoint/50 px-3 py-2 text-sm font-medium text-ballpoint transition-colors hover:bg-ballpoint/10"
            >
              {t("deck.good")}{" "}
              <span className="font-mono text-[11px] opacity-70">
                {days(card.intervals.good)} · 3
              </span>
            </button>
          </div>
          <p className="text-center">
            <Link
              href={`/drill?qids=${card.questionId}`}
              className="text-xs font-medium text-ballpoint hover:underline"
            >
              {t("deck.resolve")}
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
