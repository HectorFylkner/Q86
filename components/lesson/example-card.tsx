"use client";

import { useState } from "react";
import { Md } from "@/components/math";
import { useT } from "@/components/i18n-provider";
import type { Key } from "@/lib/i18n";

const TAGS = [
  { key: "lesson.levelWarmup", cls: "bg-highlight text-graphite" },
  { key: "lesson.levelCore", cls: "bg-ballpoint/10 text-ballpoint" },
  { key: "lesson.levelExam", cls: "bg-redpen/5 text-redpen" },
] as const satisfies ReadonlyArray<{ key: Key; cls: string }>;

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
  const t = useT();
  const [open, setOpen] = useState(false);
  const tag = TAGS[level];
  const solutionId = `example-${n}-solution`;
  return (
    <div className="overflow-hidden rounded-card border border-grid bg-surface shadow-ambient">
      <div className="flex items-center justify-between gap-2 border-b border-grid px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-graphite">
          {t("lesson.example", { n })}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${tag.cls}`}
        >
          {t(tag.key)}
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
              {t("lesson.answer")}
            </span>
            <Md source={answer} className="text-sm font-medium" />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={solutionId}
        className="block w-full border-t border-grid px-4 py-3 text-left text-sm font-medium text-ballpoint transition-colors hover:bg-ballpoint/10 focus-visible:outline-offset-[-2px] sm:px-5"
      >
        {open ? t("lesson.hideSolution") : t("lesson.revealSolution")}
      </button>
    </div>
  );
}
