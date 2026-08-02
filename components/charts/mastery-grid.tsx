"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Figure } from "@/components/charts/chart-kit";
import type { MasteryGridRow } from "@/lib/mastery-config";
import { masteryLevel, needsWork, type MasteryLevel } from "@/lib/analytics-math";
import { MASTERY_BAR, MIN_ATTEMPTS } from "@/lib/mastery-config";
import { SKILL_LABELS, SKILL_SHORT_LABELS, type FundamentalSkill } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const BANDS = [2, 3, 4, 5];

/**
 * The cells carry no printed value, deliberately.
 *
 * A four-step single-hue ramp has a band in its middle where neither ink
 * nor paper clears 4.5:1 against the fill — measured, not assumed (see
 * scripts/check-contrast.mjs). Ninety-six numbers is also a number on
 * every point, which is exactly the density that stops labels working.
 * So the fill carries magnitude, the ring carries "below the bar", and
 * the exact figures live where they can be read properly: each cell's
 * accessible name and tooltip, and the row summary at the right.
 */

/**
 * The whole domain at one glance: 24 subtopics × 4 difficulty bands.
 *
 * The encoding is sequential (magnitude = accuracy), one hue, four
 * monotone steps — so the eye reads strength as ink density, the way a
 * marked page reads. Weak cells are not encoded by hue: a cell that has
 * enough attempts and sits below the mastery bar carries a red-pen ring,
 * which is a second channel and survives colour-blindness and print.
 * Untouched and empty cells are the surface itself, so absence of
 * evidence never looks like weakness.
 */
type Level = MasteryLevel;

const levelOf = (cell: { correct: number; total: number }) =>
  masteryLevel(cell, MASTERY_BAR);

export function MasteryGrid({ rows }: { rows: MasteryGridRow[] }) {
  const [skill, setSkill] = useState<FundamentalSkill | "all">("all");

  const shown = useMemo(
    () => (skill === "all" ? rows : rows.filter((r) => r.skill === skill)),
    [rows, skill],
  );

  const attempted = rows.reduce((s, r) => s + r.total, 0);
  const weakCells = rows.reduce(
    (s, r) =>
      s +
      r.cells.filter((c) => needsWork(c, MASTERY_BAR, MIN_ATTEMPTS)).length,
    0,
  );

  // HTML inline styles take CSS variables directly (unlike SVG
  // presentation attributes), so the grid needs no resolved colours at
  // all: it stays correct on the server, through hydration, and across a
  // live theme change, with no JS in the loop.
  const fillFor = (level: Level) =>
    level === 0 ? "transparent" : `var(--ramp-${level})`;


  const skills = [...new Set(rows.map((r) => r.skill))];

  return (
    <Figure
      title="Mastery grid"
      caption={
        <>
          Every subtopic against every difficulty band. Ink density is
          accuracy; a red ring marks a cell with at least {MIN_ATTEMPTS}{" "}
          attempts sitting below the {Math.round(MASTERY_BAR * 100)}% bar —
          the cells worth working. Empty cells are untouched, not weak.{" "}
          <span className="font-medium text-ink">
            {weakCells} of {rows.length * BANDS.length} cells need work
          </span>
          .
        </>
      }
      actions={
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by skill">
          {(["all", ...skills] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSkill(value as FundamentalSkill | "all")}
              aria-pressed={skill === value}
              className={cn(
                "rounded-control border px-2 py-0.5 text-micro transition-colors",
                skill === value
                  ? "border-ink bg-highlight font-medium text-ink"
                  : "border-grid text-graphite hover:border-graphite/50 hover:text-ink",
              )}
            >
              {value === "all"
                ? "All"
                : SKILL_SHORT_LABELS[value as FundamentalSkill]}
            </button>
          ))}
        </div>
      }
    >
      {attempted === 0 ? (
        <p className="rounded-control border border-dashed border-grid p-6 text-center text-caption text-graphite">
          No focused attempts yet — the grid fills in as you drill.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-[420px] border-separate border-spacing-y-[4px] text-left">
            <caption className="sr-only">
              Accuracy per subtopic and difficulty band. Each cell gives
              correct answers out of attempts.
            </caption>
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[46%] min-w-[180px] pb-1.5 pr-3 font-mono text-micro font-medium uppercase tracking-wider text-graphite"
                >
                  Subtopic
                </th>
                {BANDS.map((band) => (
                  <th
                    key={band}
                    scope="col"
                    className="w-[52px] pb-1.5 text-center font-mono text-micro font-medium uppercase tracking-wider text-graphite"
                  >
                    D{band}
                  </th>
                ))}
                <th
                  scope="col"
                  className="w-[64px] pb-1.5 text-right font-mono text-micro font-medium uppercase tracking-wider text-graphite"
                >
                  Row
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.subtopic}>
                  <th
                    scope="row"
                    className="max-w-0 truncate pr-3 text-body font-normal"
                  >
                    <Link
                      href={`/learn/${row.subtopic}`}
                      className="hover:text-ballpoint hover:underline"
                      title={`${row.label} · ${SKILL_LABELS[row.skill]}`}
                    >
                      {row.label}
                    </Link>
                  </th>
                  {row.cells.map((cell) => {
                    const level = levelOf(cell);
                    const weak = needsWork(cell, MASTERY_BAR, MIN_ATTEMPTS);
                    const pct =
                      cell.total > 0
                        ? Math.round((cell.correct / cell.total) * 100)
                        : null;
                    const label =
                      cell.total === 0
                        ? cell.available === 0
                          ? "no items in the bank"
                          : "untouched"
                        : `${cell.correct} of ${cell.total} correct (${pct}%)`;
                    return (
                      <td key={cell.difficulty} className="w-[52px] px-[3px]">
                        <Link
                          href={`/drill?sub=${row.subtopic}&d=${cell.difficulty}`}
                          aria-label={`${row.label}, difficulty ${cell.difficulty}: ${label}. Drill this cell.`}
                          title={label}
                          className={cn(
                            "flex h-9 w-11 items-center justify-center rounded-[3px] transition-transform hover:scale-[1.06] sm:w-14",
                            level === 0 && "border border-dashed border-grid",
                          )}
                          style={{
                            backgroundColor: fillFor(level),
                            // The weak-cell ring sits OUTSIDE the fill,
                            // separated from it by a 2px surface gap, so
                            // it is measured against the card surface
                            // (4.8:1) rather than against a blue fill
                            // (1.6:1). Same reason the dataviz spec puts
                            // a surface ring on overlapping marks.
                            boxShadow: weak
                              ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--bad)"
                              : undefined,
                          }}
                        >
                          <span className="sr-only">{label}</span>
                        </Link>
                      </td>
                    );
                  })}
                  <td className="pl-2 text-right font-mono text-micro text-graphite">
                    {row.total > 0
                      ? `${Math.round((row.correct / row.total) * 100)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-graphite">
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-micro uppercase tracking-wider">
            Accuracy
          </span>
          {[
            ["<50", 1],
            ["50–69", 2],
            ["70–84", 3],
            ["85+", 4],
          ].map(([label, level]) => (
            <span key={label as string} className="flex items-center gap-1">
              <span
                aria-hidden
                className="inline-block h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: fillFor(level as Level) }}
              />
              {label}
            </span>
          ))}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-[2px]"
            style={{
              backgroundColor: "var(--ramp-2)",
              boxShadow:
                "0 0 0 1.5px var(--surface), 0 0 0 3px var(--bad)",
            }}
          />
          below the bar with enough attempts
        </span>
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-3 w-3 rounded-[2px] border border-dashed border-grid"
          />
          untouched
        </span>
      </div>
    </Figure>
  );
}
