"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ReferenceArea,
  ReferenceLine,
  Scatter,
  ScatterChart,
  ZAxis,
} from "recharts";
import {
  Figure,
  Legend,
  MARK,
  Plot,
  Tooltip,
  TooltipCard,
  XAxis,
  YAxis,
  useAxisProps,
} from "@/components/charts/chart-kit";
import { useChartTokens } from "@/components/use-chart-tokens";
import type { PacingView as PacingData } from "@/lib/analytics";
import { RUSH_RATIO, SINK_RATIO } from "@/lib/pacing";

/**
 * Pacing: time against correctness against the section budget.
 *
 * The two failure modes have to look different, because their repairs
 * are opposite. Rushing is a cluster of wrong answers hard against the
 * left edge — the fix is to slow down and finish the setup. Overinvesting
 * is a tail to the right of the benchmark — the fix is to abandon
 * earlier. A single "average time" number hides both by averaging them
 * against each other.
 *
 * Outcome is encoded twice: colour AND shape (filled dot = correct,
 * hollow ring = wrong), because the good/bad pair sits in the CVD floor
 * band and colour alone would not carry it.
 */
function mmss(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PacingChart({ data }: { data: PacingData }) {
  const tokens = useChartTokens();
  const axis = useAxisProps(tokens);

  if (data.points.length === 0) {
    return (
      <Figure
        title="Pacing"
        caption="Time against correctness, measured against the section budget."
      >
        <p className="rounded-control border border-dashed border-grid p-6 text-center text-caption text-graphite">
          No timed attempts yet.
        </p>
      </Figure>
    );
  }

  const correct = data.points.filter((p) => p.correct);
  const wrong = data.points.filter((p) => !p.correct);
  const cap = 420;
  const clamp = (p: { seconds: number }) => Math.min(p.seconds, cap);

  // Jitter within the difficulty band so overlapping dots stay countable.
  const jitter = (p: { difficulty: number; seconds: number }, i: number) =>
    p.difficulty + (((i * 37) % 11) - 5) / 22;

  const shaped = (points: PacingData["points"]) =>
    points.map((p, i) => ({
      x: clamp(p),
      y: jitter(p, i),
      seconds: p.seconds,
      difficulty: p.difficulty,
      bench: p.bench,
      correct: p.correct,
    }));

  return (
    <Figure
      title="Pacing"
      caption={
        <>
          Every focused attempt: how long it took, and whether it landed.
          The dashed line is the section budget of{" "}
          <span className="font-medium text-ink">
            {data.budgetSeconds}s per question
          </span>{" "}
          (21 in 45 minutes). Left of the rush band is too fast to have
          finished the setup; right of the sink band is time that belonged
          to another question.
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat
          label="Median time"
          value={data.medianSeconds != null ? mmss(data.medianSeconds) : "—"}
          note={`budget ${mmss(data.budgetSeconds)}`}
        />
        <Stat
          label="Rushed & wrong"
          value={String(data.rushedWrong)}
          note={`under ${RUSH_RATIO * 100}% of benchmark`}
          tone="bad"
        />
        <Stat
          label="Time sinks"
          value={String(data.timeSinks)}
          note={`${Math.round(data.sinkOverspendSeconds / 60)} min recoverable`}
          tone="amber"
        />
      </div>

      <Plot height={260} className="mt-4">
        <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
          {axis.grid}
          {/* The rush and sink zones, drawn once around the D3 benchmark
              so the reader has a fixed frame; each point still carries its
              own benchmark in the tooltip. */}
          <ReferenceArea
            x1={0}
            x2={125 * RUSH_RATIO}
            fill={tokens.bad}
            fillOpacity={0.06}
            strokeOpacity={0}
          />
          <ReferenceArea
            x1={125 * SINK_RATIO}
            x2={cap}
            fill={tokens.amber}
            fillOpacity={0.06}
            strokeOpacity={0}
          />
          <ReferenceLine
            x={data.budgetSeconds}
            stroke={tokens.graphite}
            strokeDasharray="4 4"
            strokeWidth={1}
          />
          <XAxis
            {...axis.xAxis}
            type="number"
            dataKey="x"
            domain={[0, cap]}
            ticks={[0, 60, 128, 180, 240, 300, 360, 420]}
            tickFormatter={(v: number) => (v === 0 ? "0" : mmss(v))}
            label={{
              value: "time on the question",
              position: "insideBottomRight",
              offset: -2,
              fill: tokens.graphite,
              fontSize: 11,
            }}
          />
          <YAxis
            {...axis.yAxis}
            type="number"
            dataKey="y"
            domain={[1.5, 5.5]}
            ticks={[2, 3, 4, 5]}
            tickFormatter={(v: number) => `D${v}`}
            width={34}
          />
          <ZAxis range={[46, 46]} />
          <Tooltip
            cursor={axis.tooltipCursor}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as {
                seconds: number;
                difficulty: number;
                bench: number;
                correct: boolean;
              };
              return (
                <TooltipCard
                  title={`Difficulty ${p.difficulty}`}
                  rows={[
                    { label: "Time", value: mmss(p.seconds) },
                    { label: "Benchmark", value: mmss(p.bench) },
                    {
                      label: "Outcome",
                      value: p.correct ? "correct" : "wrong",
                      color: p.correct ? tokens.good : tokens.bad,
                    },
                  ]}
                  note={
                    p.seconds > p.bench * SINK_RATIO
                      ? "Time sink — this is where the clock goes."
                      : !p.correct && p.seconds < p.bench * RUSH_RATIO
                        ? "Rushed — too fast to have finished the setup."
                        : undefined
                  }
                />
              );
            }}
          />
          <Scatter
            name="Correct"
            data={shaped(correct)}
            fill={tokens.good}
            fillOpacity={0.75}
            stroke={tokens.surface}
            strokeWidth={MARK.ringWidth}
            isAnimationActive={false}
          />
          <Scatter
            name="Wrong"
            data={shaped(wrong)}
            shape="circle"
            fill="none"
            isAnimationActive={false}
          >
            {shaped(wrong).map((_, i) => (
              <Cell
                key={i}
                fill={tokens.surface}
                stroke={tokens.bad}
                strokeWidth={MARK.ringWidth}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </Plot>

      <Legend
        className="mt-2"
        items={[
          { label: "Correct", color: tokens.good, shape: "dot" },
          { label: "Wrong", color: tokens.bad, shape: "ring" },
          { label: `Budget ${mmss(data.budgetSeconds)}`, color: tokens.graphite, shape: "line" },
        ]}
      />

      <h4 className="mt-5 font-display text-body font-semibold">
        Accuracy by time spent
      </h4>
      <p className="mt-0.5 text-caption text-graphite">
        The shape of this curve is the diagnosis: a low left end means
        rushing costs you points; a low right end means the extra minutes
        were not buying anything.
      </p>
      <Plot height={170} className="mt-2">
        <BarChart
          data={data.buckets.map((b) => ({
            label: b.label,
            accuracy: b.total > 0 ? Math.round((b.correct / b.total) * 100) : null,
            total: b.total,
            correct: b.correct,
          }))}
          margin={{ top: 12, right: 8, bottom: 0, left: 0 }}
        >
          {axis.grid}
          <XAxis {...axis.xAxis} dataKey="label" interval={0} />
          <YAxis
            {...axis.yAxis}
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(v: number) => `${v}%`}
            width={44}
          />
          <Tooltip
            cursor={{ fill: tokens.highlight, fillOpacity: 0.5 }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0].payload as {
                accuracy: number | null;
                total: number;
                correct: number;
              };
              return (
                <TooltipCard
                  title={String(label)}
                  rows={[
                    {
                      label: "Accuracy",
                      value: p.accuracy == null ? "—" : `${p.accuracy}%`,
                    },
                    { label: "Attempts", value: `${p.correct}/${p.total}` },
                  ]}
                />
              );
            }}
          />
          <Bar
            dataKey="accuracy"
            maxBarSize={MARK.barSize}
            radius={MARK.barRadius}
            isAnimationActive={false}
          >
            {/* Label every bar: a 0% bucket draws no bar at all, and an
                invisible bar is indistinguishable from a missing one. */}
            <LabelList
              dataKey="accuracy"
              position="top"
              offset={6}
              fill={tokens.graphite}
              fontSize={11}
              fontFamily="var(--font-mono)"
              formatter={(v: number | null) => (v == null ? "no data" : `${v}%`)}
            />
            {data.buckets.map((b, i) => (
              <Cell
                key={i}
                fill={
                  b.to != null && b.to <= 90
                    ? tokens.bad
                    : b.from >= 180
                      ? tokens.amber
                      : tokens.ballpoint
                }
                fillOpacity={b.total === 0 ? 0.25 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </Plot>
      <Legend
        className="mt-1"
        items={[
          { label: "Fast (under 1:30)", color: tokens.bad },
          { label: "On budget", color: tokens.ballpoint },
          { label: "Overinvested (3:00+)", color: tokens.amber },
        ]}
      />
    </Figure>
  );
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "bad" | "amber";
}) {
  return (
    <div className="rounded-control border border-grid px-3 py-2">
      <p className="font-mono text-micro uppercase tracking-wider text-graphite">
        {label}
      </p>
      <p
        className={
          tone === "bad"
            ? "text-figure font-semibold text-redpen"
            : tone === "amber"
              ? "text-figure font-semibold text-amber"
              : "text-figure font-semibold"
        }
      >
        {value}
      </p>
      <p className="text-micro text-graphite">{note}</p>
    </div>
  );
}
