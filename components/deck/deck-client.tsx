"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Md } from "@/components/math";
import { gradeDeckCard, gradeLessonCard } from "@/lib/actions";
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

/** Chapter cards get the ballpoint accent; misses keep the red-pen one, so
 *  the two sources stay visually distinct without a second style system. */
function accentFor(card: DeckCard): { chip: string; back: string } {
  if (card.kind === "miss") {
    return {
      chip: "border-redpen/40 text-redpen",
      back: "border-redpen/40 bg-redpen/5",
    };
  }
  return {
    chip: "border-ballpoint/40 text-ballpoint",
    back: "border-ballpoint/50 bg-highlight",
  };
}

export function DeckClient({ cards }: { cards: DeckCard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [, startTransition] = useTransition();

  const card = index < cards.length ? cards[index] : null;

  const grade = useCallback(
    (g: ReviewGrade) => {
      if (!card) return;
      const { kind, id, questionId } = card;
      startTransition(() => {
        if (kind === "miss" && questionId != null) {
          void gradeDeckCard(questionId, g);
        } else {
          void gradeLessonCard(id, g);
        }
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
        <p className="text-sm text-graphite">
          Nothing due. The deck fills from two places: questions you miss
          arrive on their own, and a chapter&apos;s cues, traps, and concept
          checks arrive when you push its pack from the chapter page.
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link
            href="/drill"
            className="rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
          >
            Go drill →
          </Link>
          <Link
            href="/learn"
            className="rounded-control border border-grid px-4 py-2 text-sm font-medium hover:border-ballpoint/50"
          >
            Read a chapter →
          </Link>
        </div>
      </section>
    );
  }

  if (!card) {
    return (
      <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-6 text-center shadow-ambient">
        <p className="font-display text-base font-semibold">
          Deck done — {cards.length} card{cards.length === 1 ? "" : "s"} graded.
        </p>
        <p className="mt-1 text-sm text-graphite">
          Two minutes that compound. The cards you knew are scheduled out;
          the ones you forgot return tomorrow.
        </p>
      </section>
    );
  }

  const accent = accentFor(card);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <p className="text-center font-mono text-xs text-graphite">
        {index + 1} / {cards.length}
        {card.state === "new" && " · new"}
      </p>
      <button
        onClick={advance}
        className={cn(
          "block w-full rounded-card border p-6 text-left shadow-ambient transition-colors",
          flipped ? accent.back : "border-grid bg-surface",
        )}
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-graphite">
          <span
            className={cn("rounded-control border px-1.5 py-0.5", accent.chip)}
          >
            {card.kindLabel}
          </span>
          <span>{card.subtopicLabel}</span>
          <span>
            ·{" "}
            {card.kind === "miss" ? "missed " : "added "}
            {formatDistanceToNow(new Date(card.addedAt), { addSuffix: true })}
          </span>
        </span>
        <div className="mt-2 text-[15px]">
          <Md source={flipped ? card.back : card.front} />
        </div>
        {!flipped && (
          <p className="mt-3 text-xs text-graphite">
            {card.prompt} · Enter to flip
          </p>
        )}
      </button>
      {flipped ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => grade("forgot")}
              className="min-h-[44px] rounded-control border border-redpen/40 px-3 py-2 text-sm font-medium text-redpen transition-colors hover:bg-redpen/10"
            >
              Forgot{" "}
              <span className="font-mono text-[11px] opacity-70">
                {days(card.intervals.forgot)} · 1
              </span>
            </button>
            <button
              onClick={() => grade("hard")}
              className="min-h-[44px] rounded-control border border-amber/50 px-3 py-2 text-sm font-medium text-amber transition-colors hover:bg-amber/10"
            >
              Hard{" "}
              <span className="font-mono text-[11px] opacity-70">
                {days(card.intervals.hard)} · 2
              </span>
            </button>
            <button
              onClick={() => grade("good")}
              className="min-h-[44px] rounded-control border border-ballpoint/50 px-3 py-2 text-sm font-medium text-ballpoint transition-colors hover:bg-ballpoint/10"
            >
              Good{" "}
              <span className="font-mono text-[11px] opacity-70">
                {days(card.intervals.good)} · 3
              </span>
            </button>
          </div>
          <p className="text-center">
            {card.kind === "miss" && card.questionId != null ? (
              <Link
                href={`/drill?qids=${card.questionId}`}
                className="text-xs font-medium text-ballpoint hover:underline"
              >
                Re-solve the question this came from →
              </Link>
            ) : (
              <Link
                href={`/learn/${card.subtopic}#${card.chapterAnchor ?? "cues"}`}
                className="text-xs font-medium text-ballpoint hover:underline"
              >
                Open this in the chapter →
              </Link>
            )}
          </p>
        </>
      ) : null}
    </div>
  );
}
