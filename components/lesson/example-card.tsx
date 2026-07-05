"use client";

import { useState } from "react";
import { Md } from "@/components/math";

const TAGS = [
  { label: "Warm-up", cls: "bg-highlight text-graphite" },
  { label: "Core", cls: "bg-ballpoint/10 text-ballpoint" },
  { label: "Exam-level", cls: "bg-redpen/10 text-redpen" },
] as const;

/** A worked example that asks to be attempted before it teaches: the
 *  question is always visible, the solution is behind a reveal. */
export function ExampleCard({
  n,
  level,
  question,
  work,
  answer,
}: {
  n: number;
  level: 0 | 1 | 2;
  question: string;
  work: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  const tag = TAGS[level];
  return (
    <div className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient">
      <div className="flex items-center justify-between gap-2 border-b border-grid px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
          Example {n}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${tag.cls}`}
        >
          {tag.label}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <Md source={question} className="text-[15px]" />
      </div>

      {open ? (
        <div className="border-t border-grid px-4 py-4 sm:px-5">
          <Md source={work} className="text-sm" />
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control border border-ballpoint/30 bg-ballpoint/10 px-3 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-ballpoint">
              Answer
            </span>
            <Md source={answer} className="text-sm font-medium" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-expanded={open}
            className="mt-3 text-xs text-graphite transition-colors hover:text-ink"
          >
            Hide solution
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className="block w-full border-t border-grid px-4 py-3 text-left text-sm font-medium text-ballpoint transition-colors hover:bg-highlight/40 sm:px-5"
        >
          Try it on paper first — then reveal the solution
        </button>
      )}
    </div>
  );
}
