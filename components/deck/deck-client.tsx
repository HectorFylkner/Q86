"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Md } from "@/components/math";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { gradeDeckCard } from "@/lib/actions";
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
      <EmptyState
        kicker="Deck clear"
        action={<ButtonLink href="/drill">Go drill →</ButtonLink>}
      >
        Nothing due — the deck builds itself from questions you miss, and
        cards you&apos;ve graded return when their interval comes up.
      </EmptyState>
    );
  }

  if (!card) {
    return (
      <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-6 text-center shadow-ambient">
        <p className="font-display text-base font-semibold">
          Deck done — {cards.length} takeaway{cards.length === 1 ? "" : "s"}{" "}
          graded.
        </p>
        <p className="mt-1 text-sm text-graphite">
          Two minutes that compound. The cards you knew are scheduled out;
          the ones you forgot return tomorrow.
        </p>
      </section>
    );
  }

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
          flipped ? "border-ballpoint/50 bg-highlight" : "border-grid bg-surface",
        )}
      >
        {/* One deliberate turn per face — brief, easing out, never bouncy. */}
        <motion.span
          key={`${card.questionId}-${flipped}`}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="block"
        >
        <p className="font-mono text-micro uppercase tracking-wider text-graphite">
          {flipped ? "Takeaway" : "Trigger cue"} · {card.subtopicLabel} ·
          missed {formatDistanceToNow(new Date(card.missedAgo), { addSuffix: true })}
        </p>
        <div className="mt-2 text-body">
          <Md source={flipped ? card.back : card.front} />
        </div>
        {!flipped && (
          <p className="mt-3 text-xs text-graphite">Enter to flip</p>
        )}
        </motion.span>
      </button>
      {flipped ? (
        <>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => grade("forgot")}
              className="min-h-[44px] rounded-control border border-redpen/40 px-3 py-2 text-sm font-medium text-redpen transition-colors hover:bg-redpen/10"
            >
              Forgot{" "}
              <span className="font-mono text-caption opacity-70">
                {days(card.intervals.forgot)} · 1
              </span>
            </button>
            <button
              onClick={() => grade("hard")}
              className="min-h-[44px] rounded-control border border-amber/50 px-3 py-2 text-sm font-medium text-amber transition-colors hover:bg-amber/10"
            >
              Hard{" "}
              <span className="font-mono text-caption opacity-70">
                {days(card.intervals.hard)} · 2
              </span>
            </button>
            <button
              onClick={() => grade("good")}
              className="min-h-[44px] rounded-control border border-ballpoint/50 px-3 py-2 text-sm font-medium text-ballpoint transition-colors hover:bg-ballpoint/10"
            >
              Good{" "}
              <span className="font-mono text-caption opacity-70">
                {days(card.intervals.good)} · 3
              </span>
            </button>
          </div>
          <p className="text-center">
            <Link
              href={`/drill?qids=${card.questionId}`}
              className="text-xs font-medium text-ballpoint hover:underline"
            >
              Re-solve the question this came from →
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
