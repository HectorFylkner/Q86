"use client";

import Link from "next/link";
import { Line, LineChart, ReferenceLine, YAxis } from "recharts";
import { Figure, Plot } from "@/components/charts/chart-kit";
import { useChartTokens } from "@/components/use-chart-tokens";
import type { EloTrajectory } from "@/lib/analytics";
import { ELO_START } from "@/lib/elo";

/**
 * ELO per pattern category, as small multiples.
 *
 * Nine categories on one plot would need nine hues; the palette stops at
 * four and cycling is never allowed. Faceting is the answer the form
 * asks for anyway — the question is not "which category is highest" but
 * "which one is not moving", and a wall of identically scaled sparklines
 * answers that at a glance. One hue throughout: the facet title carries
 * identity, so colour is free to carry nothing.
 */
export function EloTrajectories({ data }: { data: EloTrajectory[] }) {
  const tokens = useChartTokens();
  const withData = data.filter((d) => d.points.length > 1);

  if (withData.length === 0) {
    return (
      <Figure
        title="Pattern ELO"
        caption="Rating per pattern category, updated on every answer."
      >
        <p className="rounded-control border border-dashed border-grid p-6 text-center text-caption text-graphite">
          No pattern rounds yet — the trainers page starts these.
        </p>
      </Figure>
    );
  }

  const all = withData.flatMap((d) => d.points.map((p) => p.rating));
  const min = Math.min(...all, ELO_START) - 30;
  const max = Math.max(...all, ELO_START) + 30;
  const weakest = [...withData].sort((a, b) => a.current - b.current)[0];

  return (
    <Figure
      title="Pattern ELO trajectory"
      caption={
        <>
          One panel per category, all on the same {Math.round(min)}–
          {Math.round(max)} scale so the panels are comparable. The dashed
          line is the {ELO_START} start. Today&apos;s plan pulls the two
          lowest — currently{" "}
          <span className="font-medium text-ink">{weakest.label}</span> at{" "}
          <span className="font-mono font-medium text-ink">
            {weakest.current}
          </span>
          .
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {withData.map((cat) => {
          const rising = cat.delta >= 0;
          return (
            <Link
              key={cat.category}
              href={`/patterns?start=${cat.category}`}
              className="group rounded-control border border-grid p-3 transition-colors hover:border-ballpoint/50"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-caption font-medium group-hover:text-ballpoint">
                  {cat.label}
                </span>
                <span className="shrink-0 font-mono text-body font-semibold tabular-nums">
                  {cat.current}
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-micro text-graphite">
                  {cat.points.length - 1} answered
                </span>
                <span
                  className={
                    rising
                      ? "font-mono text-micro text-good"
                      : "font-mono text-micro text-redpen"
                  }
                >
                  {rising ? "+" : ""}
                  {cat.delta} since start
                </span>
              </div>
              <Plot height={54} className="mt-1.5">
                <LineChart
                  data={cat.points}
                  margin={{ top: 4, right: 2, bottom: 2, left: 2 }}
                >
                  <YAxis domain={[min, max]} hide />
                  <ReferenceLine
                    y={ELO_START}
                    stroke={tokens.grid}
                    strokeDasharray="3 3"
                    strokeWidth={1}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke={tokens.ballpoint}
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </Plot>
            </Link>
          );
        })}
      </div>
    </Figure>
  );
}
