"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Md } from "@/components/math";
import { TIER_SPEC, type ChapterTier } from "@/lib/chapter-test-config";

/** localStorage key per chapter; value {c: checked indexes, t: item count}.
 *  The Learn index reads the same keys to show readiness badges. */
export function checklistKey(subtopic: string): string {
  return `q86-learn:${subtopic}`;
}

export type ChecklistTierState = {
  tier: ChapterTier;
  passed: boolean;
  unlocked: boolean;
  available: boolean;
  /** The difficulties this tier actually serves, e.g. "D3–D4". */
  range: string;
  size: number;
  /** "5/6" from the most recent take of this tier. */
  lastScore: string | null;
};

export type ChecklistTestState = {
  /** Every required tier cleared. */
  passed: boolean;
  tiers: ChecklistTierState[];
};

export function DrillChecklist({
  subtopic,
  items,
  drill,
  test,
}: {
  subtopic: string;
  items: string[];
  /** Where "go prove it" leads. A content chapter drills its subtopic; a
   *  technique chapter drills the items whose fastest path uses it. */
  drill: { href: string; label: string };
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
          {test?.passed ? (
            <span className="font-medium text-ballpoint">
              Chapter passed ✓
            </span>
          ) : all ? (
            <span className="font-medium text-ballpoint">
              {test ? "All checked — prove it on the test." : "All checked — go prove it."}
            </span>
          ) : (
            <span className="text-graphite">
              The drill will tell you if the ticks were honest.
            </span>
          )}
        </p>
        <Link
          href={drill.href}
          className={
            all && test
              ? "inline-flex min-h-[44px] items-center rounded-control border border-grid px-4 py-2 text-sm font-medium transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
              : "inline-flex min-h-[44px] items-center rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ballpoint/90"
          }
        >
          {drill.label}
        </Link>
      </div>

      {/* The tier ladder. Progression is the point: attempting the top
          band on unproved foundations produces a score that teaches
          nothing, so each rung stays locked until the one below clears. */}
      {test && (
        <div className="border-t border-grid px-4 py-3 sm:px-5">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">
            Chapter test · three tiers
          </p>
          <ul className="mt-2 space-y-1.5">
            {test.tiers.map((t, i) => {
              const spec = TIER_SPEC[t.tier];
              const below = i > 0 ? TIER_SPEC[test.tiers[i - 1].tier] : null;
              return (
                <li
                  key={t.tier}
                  className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      <span
                        className={`text-sm font-medium ${
                          t.unlocked ? "" : "text-graphite"
                        }`}
                      >
                        {spec.label}
                      </span>
                      <span className="font-mono text-[11px] text-graphite">
                        {t.size} · {t.range}
                      </span>
                      {t.passed && (
                        <span className="font-mono text-[11px] text-ballpoint">
                          ✓ passed
                        </span>
                      )}
                      {!t.passed && t.lastScore && (
                        <span className="font-mono text-[11px] text-amber">
                          last {t.lastScore}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-graphite">
                      {!t.available
                        ? "Not enough verified questions in this chapter yet."
                        : t.unlocked
                          ? spec.blurb
                          : `Clear ${below ? below.label : "the previous tier"} first.`}
                    </span>
                  </span>
                  {t.available && t.unlocked ? (
                    <Link
                      href={`/drill?test=${subtopic}&tier=${t.tier}`}
                      className="inline-flex min-h-[44px] shrink-0 items-center rounded-control border border-grid px-3 py-2 text-sm font-medium transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
                    >
                      {t.passed ? "Retake" : "Take it →"}
                    </Link>
                  ) : (
                    <span
                      className="inline-flex min-h-[44px] shrink-0 items-center px-3 py-2 font-mono text-[11px] text-graphite"
                      aria-hidden
                    >
                      {t.available ? "locked" : "—"}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
