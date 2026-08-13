"use client";

import { useState } from "react";
import { Md } from "@/components/math";
import type { Titled } from "@/lib/lesson-parse";

/** Index-based fallback tags for chapters whose markers carry no tier. */
const FALLBACK_TAGS = [
  { label: "Warm-up", cls: "bg-highlight text-graphite" },
  { label: "Core", cls: "bg-ballpoint/10 text-ballpoint" },
  { label: "Exam-level", cls: "bg-redpen/5 text-redpen" },
] as const;

/** Tier chip styling along the ramp: warm-up in highlighter, the middle
 *  of the scale in ballpoint, the top two tiers increasingly red. */
function tierTag(tier: string): { label: string; cls: string } {
  if (tier === "Warm-up") {
    return { label: tier, cls: "bg-highlight text-graphite" };
  }
  if (tier === "705 level") {
    return { label: tier, cls: "bg-amber/10 text-amber" };
  }
  if (tier === "Q86 level") {
    return { label: tier, cls: "bg-redpen/5 text-redpen" };
  }
  return { label: tier, cls: "bg-ballpoint/10 text-ballpoint" };
}

function pace(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** A worked example that asks to be attempted before it teaches: the
 *  question is always visible, the solution sits behind one persistent
 *  disclosure button (label and aria-expanded flip in place, so focus
 *  and screen-reader state survive the toggle). The tier chip and pace
 *  target frame the attempt; wrong-turn notes teach from the error after
 *  the answer confirms the clean path. */
export function ExampleCard({
  n,
  level,
  tier,
  targetSeconds,
  question,
  work,
  wrongTurns,
  answer,
}: {
  n: number;
  level: 0 | 1 | 2;
  tier: string | null;
  targetSeconds: number | null;
  question: string;
  work: string;
  wrongTurns: Titled[];
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  const tag = tier ? tierTag(tier) : FALLBACK_TAGS[level];
  const solutionId = `example-${n}-solution`;
  return (
    <div className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient">
      <div className="flex items-center justify-between gap-2 border-b border-grid px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
          Example {n}
        </span>
        <span className="flex items-center gap-1.5">
          {targetSeconds && (
            <span className="rounded-full border border-grid px-2 py-0.5 font-mono text-[10px] text-graphite">
              target {pace(targetSeconds)}
            </span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${tag.cls}`}
          >
            {tag.label}
          </span>
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <Md source={question} className="text-[15px]" />
      </div>

      {open && (
        <div id={solutionId} className="border-t border-grid px-4 py-4 sm:px-5">
          <Md source={work} className="text-sm" />
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control border border-ballpoint/30 bg-ballpoint/10 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ballpoint">
              Answer
            </span>
            <Md source={answer} className="text-sm font-medium" />
          </div>
          {wrongTurns.length > 0 && (
            <div className="mt-3 space-y-2">
              {wrongTurns.map((wt, i) => (
                <div
                  key={i}
                  className="rounded-control border border-grid border-l-2 border-l-redpen/70 bg-surface px-3 py-2"
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-redpen">
                    ✗ Wrong turn
                  </p>
                  <div className="mt-1">
                    {wt.name && (
                      <Md source={`**${wt.name}**`} className="text-[13.5px]" />
                    )}
                    <Md
                      source={wt.body}
                      className={`text-[13.5px] text-graphite ${wt.name ? "mt-0.5" : ""}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={solutionId}
        className="block w-full border-t border-grid px-4 py-3 text-left text-sm font-medium text-ballpoint transition-colors hover:bg-ballpoint/10 focus-visible:outline-offset-[-2px] sm:px-5"
      >
        {open
          ? "Hide the solution"
          : targetSeconds
            ? `Try it on paper first — target ${pace(targetSeconds)} — then reveal`
            : "Try it on paper first — then reveal the solution"}
      </button>
    </div>
  );
}
