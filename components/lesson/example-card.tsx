"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Md } from "@/components/math";

const TAGS = [
  { label: "Warm-up", cls: "bg-highlight text-graphite" },
  { label: "Core", cls: "bg-ballpoint/10 text-ballpoint" },
  { label: "Exam-level", cls: "bg-redpen/5 text-redpen" },
] as const;

/** A worked example that asks to be attempted before it teaches: the
 *  question is always visible, the solution sits behind one persistent
 *  disclosure button (label and aria-expanded flip in place, so focus
 *  and screen-reader state survive the toggle). */
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
  const solutionId = `example-${n}-solution`;
  return (
    <div className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient">
      <div className="flex items-center justify-between gap-2 border-b border-grid px-4 py-2.5 sm:px-5">
        <span className="font-mono text-micro uppercase tracking-wider text-graphite">
          Example {n}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-micro ${tag.cls}`}
        >
          {tag.label}
        </span>
      </div>

      <div className="px-4 py-4 sm:px-5">
        <Md source={question} className="text-body" />
      </div>

      {open && (
        <motion.div
          id={solutionId}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="border-t border-grid px-4 py-4 sm:px-5"
        >
          <Md source={work} className="text-sm" />
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-control border border-ballpoint/30 bg-ballpoint/10 px-3 py-2">
            <span className="font-mono text-micro uppercase tracking-wider text-ballpoint">
              Answer
            </span>
            <Md source={answer} className="text-sm font-medium" />
          </div>
        </motion.div>
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
          : "Try it on paper first — then reveal the solution"}
      </button>
    </div>
  );
}
