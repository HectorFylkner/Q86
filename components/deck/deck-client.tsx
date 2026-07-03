"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Md } from "@/components/math";
import type { DeckCard } from "@/lib/deck";
import { cn } from "@/lib/utils";

export function DeckClient({ cards }: { cards: DeckCard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const advance = useCallback(() => {
    if (!flipped) {
      setFlipped(true);
    } else if (index + 1 <= cards.length) {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }, [flipped, index, cards.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        advance();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  if (cards.length === 0) {
    return (
      <section className="rounded-[10px] border border-grid bg-surface p-6 text-center shadow-ambient">
        <p className="text-sm text-graphite">
          No cards yet — the deck builds itself from questions you miss.
          Every miss&apos;s trigger cue and takeaway becomes a flashcard.
        </p>
        <Link
          href="/drill"
          className="mt-3 inline-block rounded-[6px] bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
        >
          Go drill →
        </Link>
      </section>
    );
  }

  if (index >= cards.length) {
    return (
      <section className="rounded-[10px] border border-ballpoint/40 bg-ballpoint/5 p-6 text-center shadow-ambient">
        <p className="font-display text-base font-semibold">
          Deck done — {cards.length} takeaway{cards.length === 1 ? "" : "s"}{" "}
          reviewed.
        </p>
        <p className="mt-1 text-sm text-graphite">
          Two minutes that compound. Come back tomorrow for the next rotation.
        </p>
      </section>
    );
  }

  const card = cards[index];
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <p className="text-center font-mono text-xs text-graphite">
        {index + 1} / {cards.length}
      </p>
      <button
        onClick={advance}
        className={cn(
          "block w-full rounded-[10px] border p-6 text-left shadow-ambient transition-colors",
          flipped ? "border-ballpoint/50 bg-highlight" : "border-grid bg-surface",
        )}
      >
        <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
          {flipped ? "Takeaway" : "Trigger cue"} · {card.subtopicLabel} ·
          missed {formatDistanceToNow(new Date(card.missedAgo), { addSuffix: true })}
        </p>
        <div className="mt-2 text-[15px]">
          <Md source={flipped ? card.back : card.front} />
        </div>
        <p className="mt-3 text-xs text-graphite">
          {flipped ? "Enter for the next card" : "Enter to flip"}
        </p>
      </button>
      {flipped && (
        <p className="text-center">
          <Link
            href={`/drill?qids=${card.questionId}`}
            className="text-xs font-medium text-ballpoint hover:underline"
          >
            Re-solve the question this came from →
          </Link>
        </p>
      )}
    </div>
  );
}
