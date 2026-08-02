"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Check, X } from "lucide-react";
import { Figure } from "@/components/charts/chart-kit";
import type { MissChainSummary } from "@/lib/miss-chain";
import { cn } from "@/lib/utils";

/**
 * The loop from a miss to mastery, shown rather than asserted.
 *
 * Each of the five links is queried independently, so a break is a fact
 * on the page instead of something discovered months later. An untagged
 * miss in particular looks like nothing has gone wrong — it is only
 * visible as a gap in this chain.
 */
export function MissChainCard({ data }: { data: MissChainSummary }) {
  if (data.chains.length === 0) {
    return (
      <Figure
        title="From miss to mastery"
        caption="Every miss should become a chapter section, a deck card, a spaced redo, and a change in the next plan."
      >
        <p className="rounded-control border border-dashed border-grid p-6 text-center text-caption text-graphite">
          No focused misses yet — the chain fills in as you drill.
        </p>
      </Figure>
    );
  }

  const weakest = [...data.coverage].sort((a, b) => a.done - b.done)[0];

  return (
    <Figure
      title="From miss to mastery"
      caption={
        <>
          The five things that should happen to every miss, checked one by
          one against the most recent {data.chains.length}.{" "}
          {weakest.done < weakest.total ? (
            <>
              The weakest link is{" "}
              <span className="font-medium text-ink">{weakest.label}</span> —{" "}
              {weakest.done} of {weakest.total}.
            </>
          ) : (
            <>Every link is intact across all {data.chains.length}.</>
          )}
        </>
      }
    >
      <ul className="mb-4 flex flex-wrap gap-2">
        {data.coverage.map((c) => (
          <li
            key={c.key}
            className={cn(
              "rounded-control border px-2.5 py-1 text-caption",
              c.done === c.total
                ? "border-good/40 bg-good/5 text-ink"
                : "border-amber/50 bg-amber/5 text-ink",
            )}
          >
            {c.label}{" "}
            <span className="font-mono text-micro text-graphite">
              {c.done}/{c.total}
            </span>
          </li>
        ))}
      </ul>

      <ol className="space-y-3">
        {data.chains.map((chain) => (
          <li
            key={chain.attemptId}
            className="rounded-control border border-grid p-3"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <span className="text-body font-medium">
                {chain.subtopicLabel}
              </span>
              <span className="font-mono text-micro text-graphite">
                D{chain.difficulty} · #{chain.questionId} · missed{" "}
                {formatDistanceToNow(chain.missedAt, { addSuffix: true })} ·{" "}
                {chain.complete}/5 links
              </span>
            </div>
            <ol className="mt-2 grid gap-1.5 sm:grid-cols-5">
              {chain.links.map((link) => {
                const body = (
                  <>
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                          link.done ? "bg-good/15 text-good" : "bg-amber/15 text-amber",
                        )}
                      >
                        {link.done ? <Check size={11} /> : <X size={11} />}
                      </span>
                      <span className="text-caption font-medium">
                        {link.label}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-micro text-graphite">
                      {link.detail}
                    </span>
                  </>
                );
                return (
                  <li key={link.key}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="block rounded-control p-1.5 transition-colors hover:bg-highlight/60"
                      >
                        {body}
                      </Link>
                    ) : (
                      <span className="block p-1.5">{body}</span>
                    )}
                  </li>
                );
              })}
            </ol>
          </li>
        ))}
      </ol>
    </Figure>
  );
}
