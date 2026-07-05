"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Md } from "@/components/math";

/** localStorage key per chapter; value {c: checked indexes, t: item count}.
 *  The Learn index reads the same keys to show readiness badges. */
export function checklistKey(subtopic: string): string {
  return `q86-learn:${subtopic}`;
}

export type ChecklistTestState = {
  passed: boolean;
  lastScore: string | null; // "6/7" from the most recent take
  /** Label of the tier the next take targets ("Easy" | "Medium" | "Hard"). */
  nextTierLabel: string;
  /** All three tiers passed — the next take is a re-certification. */
  ladderComplete: boolean;
};

export function DrillChecklist({
  subtopic,
  items,
  test,
}: {
  subtopic: string;
  items: string[];
  /** Chapter-test state; when present the completed checklist promotes
   *  the test to the primary action (read → drill → prove it). */
  test?: ChecklistTestState;
}) {
  const [checked, setChecked] = useState<boolean[]>(() =>
    items.map(() => false),
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(checklistKey(subtopic));
      if (!raw) return;
      const saved = JSON.parse(raw) as { c?: number[] };
      if (Array.isArray(saved.c)) {
        setChecked(items.map((_, i) => saved.c!.includes(i)));
      }
    } catch {
      // Corrupt storage — start unchecked.
    }
  }, [subtopic, items]);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      const c = next.flatMap((v, j) => (v ? [j] : []));
      try {
        localStorage.setItem(
          checklistKey(subtopic),
          JSON.stringify({ c, t: items.length }),
        );
      } catch {
        // Storage full or unavailable — the ticks still work this visit.
      }
      return next;
    });
  };

  const done = checked.filter(Boolean).length;
  const all = done === items.length && items.length > 0;

  return (
    <div className="rounded-card border border-grid bg-surface shadow-ambient">
      <div className="flex items-center justify-between gap-3 border-b border-grid px-4 py-3 sm:px-5">
        <p className="text-sm text-graphite">
          Tick each one honestly — then go prove it.
        </p>
        <span className="font-mono text-xs text-graphite">
          {done}/{items.length}
        </span>
      </div>
      <div className="h-1 bg-grid/60" aria-hidden>
        <div
          className="h-full bg-ballpoint transition-[width] duration-300"
          style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }}
        />
      </div>

      <ul className="divide-y divide-grid">
        {items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors hover:bg-ballpoint/10 sm:px-5">
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => toggle(i)}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border text-[11px] leading-none text-white transition-colors peer-focus-visible:outline-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ballpoint ${
                  checked[i]
                    ? "border-ballpoint bg-ballpoint"
                    : "border-graphite/70 bg-paper"
                }`}
              >
                {checked[i] ? "✓" : ""}
              </span>
              <Md
                source={item}
                className={`min-w-0 flex-1 text-sm transition-colors ${
                  checked[i] ? "text-graphite" : ""
                }`}
              />
            </label>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-grid px-4 py-3 sm:px-5">
        <p className="text-sm">
          {test?.ladderComplete ? (
            <span className="font-medium text-ballpoint">
              All three tiers passed ✓
              {test.lastScore ? ` · last ${test.lastScore}` : ""}
            </span>
          ) : test?.passed ? (
            <span className="font-medium text-ballpoint">
              Climbing — next: {test.nextTierLabel} tier (bar 6/7).
            </span>
          ) : all ? (
            <span className="font-medium text-ballpoint">
              All checked — prove it on the {test?.nextTierLabel ?? "Easy"}{" "}
              tier.
            </span>
          ) : (
            <span className="text-graphite">
              {test?.lastScore
                ? `Last test: ${test.lastScore} — the bar is 6/7.`
                : "The drill will tell you if the ticks were honest."}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/drill?sub=${subtopic}&d=3`}
            className={
              all && test
                ? "inline-flex min-h-[44px] items-center rounded-control border border-grid px-4 py-2 text-sm font-medium transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
                : "inline-flex min-h-[44px] items-center rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90"
            }
          >
            Drill this now →
          </Link>
          {test && (
            <Link
              href={`/drill?test=${subtopic}`}
              className={
                all
                  ? "inline-flex min-h-[44px] items-center rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90"
                  : "inline-flex min-h-[44px] items-center rounded-control border border-grid px-4 py-2 text-sm font-medium transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
              }
            >
              {test.ladderComplete
                ? `Re-certify (${test.nextTierLabel}) →`
                : `${test.nextTierLabel} tier test →`}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
