"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { pushChapterPack } from "@/lib/actions";
import type { Subtopic } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * The end of a chapter should not be the end of the chapter. This pushes
 * the chapter's own artifacts — its trigger cues, named traps, and
 * concept checks — into the spaced deck, scheduled by the same engine as
 * the cards built from questions you miss.
 */
export function CementPack({
  subtopic,
  packSize,
  breakdown,
  inDeck,
  dueNow,
}: {
  subtopic: Subtopic;
  packSize: number;
  breakdown: { cues: number; traps: number; checks: number };
  inDeck: number;
  dueNow: number;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    added: number;
    alreadyPresent: number;
  } | null>(null);

  // After a push the whole pack is present, by construction.
  const complete = result !== null || inDeck >= packSize;

  return (
    <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-sm font-semibold">Cement this chapter</h3>
        <span className="font-mono text-[11px] text-graphite">
          {breakdown.cues} cues · {breakdown.traps} traps · {breakdown.checks}{" "}
          checks
        </span>
      </div>
      <p className="mt-1 text-sm leading-snug text-graphite">
        Push this chapter&apos;s {packSize} cards into the takeaway deck.
        They schedule alongside the cards from questions you miss, and the
        text stays live — edit the chapter and the cards follow.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() =>
            startTransition(async () => {
              setResult(await pushChapterPack(subtopic));
            })
          }
          disabled={pending}
          className={cn(
            "rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90",
            pending && "cursor-wait opacity-60",
          )}
        >
          {pending
            ? "Adding…"
            : complete
              ? "Re-check the pack"
              : inDeck > 0
                ? `Add the ${packSize - inDeck} remaining`
                : `Add ${packSize} cards to the deck`}
        </button>

        {result ? (
          <span className="text-sm">
            {result.added > 0 ? (
              <span className="text-ballpoint">
                {result.added} card{result.added === 1 ? "" : "s"} added.
              </span>
            ) : (
              <span className="text-graphite">
                Already in the deck — schedules untouched.
              </span>
            )}
          </span>
        ) : inDeck > 0 ? (
          <span className="font-mono text-[11px] text-graphite">
            {inDeck} of {packSize} already in the deck
            {dueNow > 0 && ` · ${dueNow} due now`}
          </span>
        ) : null}

        {(result?.added ?? 0) > 0 || inDeck > 0 ? (
          <Link
            href="/deck"
            className="text-xs font-medium text-ballpoint hover:underline"
          >
            Open the deck →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
