"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Md } from "@/components/math";
import { gradeDeckCard, gradeLessonCard } from "@/lib/actions";
import type { DeckCard } from "@/lib/deck";
import type { ReviewGrade } from "@/lib/srs";
import { cn } from "@/lib/utils";

/** Front/back framing per card source: question takeaways recall the
 *  method from its cue; concept cards recall the action from a chapter
 *  cue phrase, or the fix from a trap's wrong turn. */
const FACE_LABELS: Record<
  DeckCard["source"],
  { front: string; back: string }
> = {
  question: { front: "Trigger cue", back: "Takeaway" },
  cue: { front: "You see", back: "You do" },
  trap: { front: "Trap — what goes wrong here?", back: "The fix" },
};

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
      const { source, id } = card;
      startTransition(() => {
        void (source === "question" ? gradeDeckCard(id, g) : gradeLessonCard(id, g));
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
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
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
          Nothing due — the deck builds itself from questions you miss, and
          cards you&apos;ve graded return when their interval comes up.
        </p>
        <Link
          href="/drill"
          className="mt-3 inline-block rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
        >
          Go drill →
        </Link>
      </section>
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
        <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
          {flipped ? FACE_LABELS[card.source].back : FACE_LABELS[card.source].front}
          {" · "}
          {card.subtopicLabel}
          {card.missedAgo != null &&
            ` · missed ${formatDistanceToNow(new Date(card.missedAgo), { addSuffix: true })}`}
        </p>
        <div className="mt-2 text-[15px]">
          <Md source={flipped ? card.back : card.front} />
        </div>
        {!flipped && (
          <p className="mt-3 text-xs text-graphite">Enter to flip</p>
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
          <p className="flex flex-wrap justify-center gap-x-4 text-center">
            {card.source === "question" && (
              <Link
                href={`/drill?qids=${card.id}`}
                className="text-xs font-medium text-ballpoint hover:underline"
              >
                Re-solve the question this came from →
              </Link>
            )}
            <Link
              href={`/learn/${card.subtopic}#${card.source === "trap" ? "traps" : "cues"}`}
              className="text-xs text-graphite hover:text-ballpoint hover:underline"
            >
              Chapter: {card.subtopicLabel} →
            </Link>
          </p>
        </>
      ) : null}
    </div>
  );
}
