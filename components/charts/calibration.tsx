"use client";

import { Figure, Legend } from "@/components/charts/chart-kit";
import { useChartTokens } from "@/components/use-chart-tokens";
import type { AnalyticsData } from "@/lib/analytics";
import { CONFIDENCE_LABELS, type Confidence } from "@/lib/taxonomy";

/**
 * Calibration: what you said you knew, against what you actually knew.
 *
 * On a section where the decisive skill is knowing when to walk away, a
 * student who cannot tell a solved problem from a nearly-solved one
 * loses points they already had. The two failure modes are opposite and
 * need to look opposite:
 *
 *   overconfident — "lock" answers that miss. Every one is a question
 *   you would have abandoned if you had known, and a minute you spent
 *   somewhere it was not needed.
 *
 *   underconfident — "guess" answers that land. Every one is a question
 *   you actually could do and rushed away from.
 *
 * The bar is drawn from the claim to the outcome, so the *direction* of
 * the gap is the shape of the mark, not just its colour.
 */
export function CalibrationChart({
  rows,
  meanError,
}: {
  rows: AnalyticsData["calibration"];
  meanError: number | null;
}) {
  const tokens = useChartTokens();
  const withData = rows.filter((r) => r.actual != null && r.total > 0);

  if (withData.length === 0) {
    return (
      <Figure
        title="Calibration"
        caption="What you said you knew, against what you actually knew."
      >
        <p className="rounded-control border border-dashed border-grid p-6 text-center text-caption text-graphite">
          No confidence-marked attempts yet.
        </p>
      </Figure>
    );
  }

  const worst = [...withData].sort(
    (a, b) => Math.abs(b.gap ?? 0) - Math.abs(a.gap ?? 0),
  )[0];
  const overall =
    meanError == null
      ? null
      : meanError < 8
        ? "well calibrated"
        : meanError < 18
          ? "loosely calibrated"
          : "poorly calibrated";

  return (
    <Figure
      title="Calibration"
      caption={
        <>
          Each row runs from what that confidence level claims to what it
          actually delivers.{" "}
          {overall && meanError != null && (
            <>
              Weighted across all three, you are{" "}
              <span className="font-medium text-ink">{overall}</span> — a mean
              gap of{" "}
              <span className="font-mono font-medium text-ink">
                {meanError.toFixed(1)} points
              </span>
              .{" "}
            </>
          )}
          {worst.gap != null && Math.abs(worst.gap) >= 8 && (
            <>
              The biggest miss is{" "}
              <span className="font-medium text-ink">
                {CONFIDENCE_LABELS[worst.confidence as Confidence]}
              </span>
              :{" "}
              {worst.gap > 0
                ? `you are ${worst.gap} points more sure than you are right — those are the questions to abandon sooner.`
                : `you are ${-worst.gap} points more right than you are sure — those are the questions you are rushing away from.`}
            </>
          )}
        </>
      }
    >
      <ul className="space-y-3">
        {rows.map((row) => {
          const label = CONFIDENCE_LABELS[row.confidence as Confidence];
          if (row.actual == null || row.total === 0) {
            return (
              <li key={row.confidence} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-body">{label}</span>
                <span className="text-caption text-graphite">
                  no attempts marked {label.toLowerCase()} yet
                </span>
              </li>
            );
          }
          const over = (row.gap ?? 0) > 0;
          const from = Math.min(row.expected, row.actual);
          const to = Math.max(row.expected, row.actual);
          return (
            <li key={row.confidence}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-body font-medium">{label}</span>
                <span className="font-mono text-caption text-graphite">
                  claims {row.expected}% · delivers {row.actual}% ·{" "}
                  <span className={over ? "text-redpen" : "text-good"}>
                    {over ? "+" : ""}
                    {row.gap} pts {over ? "overconfident" : "underconfident"}
                  </span>{" "}
                  · n={row.total}
                </span>
              </div>
              <div className="relative mt-1.5 h-3 rounded-full bg-grid">
                {/* The bar spans the gap, so its length IS the error and
                    its colour says which direction the error runs. */}
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    left: `${from}%`,
                    width: `${Math.max(1, to - from)}%`,
                    backgroundColor: over ? tokens.bad : tokens.good,
                  }}
                />
                <span
                  aria-hidden
                  className="absolute top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full"
                  style={{ left: `${row.expected}%`, backgroundColor: tokens.graphite }}
                />
                <span
                  aria-hidden
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                  style={{
                    left: `${row.actual}%`,
                    borderColor: over ? tokens.bad : tokens.good,
                    backgroundColor: tokens.surface,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Legend
        className="mt-3"
        items={[
          { label: "Claimed accuracy", color: tokens.graphite, shape: "line" },
          { label: "Actual accuracy", color: tokens.ink, shape: "ring" },
          { label: "Overconfident gap", color: tokens.bad },
          { label: "Underconfident gap", color: tokens.good },
        ]}
      />
    </Figure>
  );
}
