"use client";

import {
  ArrowRight,
  Crosshair,
  Stack,
  Timer,
  WarningCircle,
} from "@phosphor-icons/react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsData, MirrorBar } from "@/lib/analytics";
import {
  EDIT_REASON_LABELS,
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  SKILL_LABELS,
  SUBTOPIC_LABELS,
  type EditReason,
} from "@/lib/taxonomy";
import { cn, percent } from "@/lib/utils";
import { useChartTokens } from "@/components/use-chart-tokens";

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  // Charts follow the active theme (SVG attrs cannot use CSS variables).
  const {
    ink: INK,
    graphite: GRAPHITE,
    grid: GRID,
    ballpoint: BALLPOINT,
    redpen: REDPEN,
    amber: AMBER,
  } = useChartTokens();
  const AXIS_TICK = { fill: GRAPHITE, fontSize: 11 } as const;
  const tooltipStyle = {
    backgroundColor: "var(--surface)",
    border: `1px solid ${GRID}`,
    borderRadius: 6,
    fontSize: 12,
    color: INK,
  } as const;
  if (data.attemptCount === 0) {
    return (
      <div className="space-y-8">
        <section className="grid gap-6 border-y border-grid-strong py-9 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-ballpoint/25 bg-ballpoint/10 text-ballpoint">
            <Crosshair size={28} weight="duotone" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
              Evidence pending
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight">
              Give the dashboard a clean baseline.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-graphite">
              A 12-question focused drill is enough to start the accuracy,
              pacing, and confidence story. Casual sessions stay excluded.
            </p>
          </div>
          <Link
            href="/drill?plan=1"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-ballpoint px-4 py-2 text-sm font-semibold text-white"
          >
            Start the baseline
            <ArrowRight size={16} aria-hidden />
          </Link>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <InsightBrief data={data} />

      {/* 1 — score-report mirror */}
      <Section
        title="Score-report mirror"
        subtitle={`Accuracy by domain, context, and fundamental skill — same cuts as the official report. ${data.attemptCount} attempts.`}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <MirrorGroup title="Content domain" bars={data.mirror.domains} />
          <MirrorGroup title="Context" bars={data.mirror.contexts} />
          <MirrorGroup title="Fundamental skill" bars={data.mirror.skills} />
        </div>
      </Section>

      {/* 2 — heatmap */}
      <Section
        title="Miss heatmap"
        subtitle="Classified wrong answers: subtopic × error type."
      >
        {data.heatmap.rows.length === 0 ? (
          <p className="text-sm text-graphite">
            No classified misses yet — tag error types after wrong answers or
            confirm a post-mortem.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr>
                  <th className="pr-3 text-left text-xs font-normal text-graphite">
                    Subtopic
                  </th>
                  {ERROR_TYPES.map((et) => (
                    <th
                      key={et}
                      className="px-1 pb-1 text-center text-[10px] font-normal text-graphite"
                    >
                      {ERROR_TYPE_LABELS[et]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.heatmap.rows.map((row) => (
                  <tr key={row.subtopic}>
                    <td className="whitespace-nowrap pr-3 text-xs">
                      <Link
                        href={`/learn/${row.subtopic}`}
                        className="hover:text-ballpoint hover:underline"
                      >
                        {SUBTOPIC_LABELS[row.subtopic]}
                      </Link>
                      <Link
                        href={`/drill?sub=${row.subtopic}`}
                        className="ml-2 font-mono text-[10px] text-graphite hover:text-ballpoint hover:underline"
                      >
                        drill →
                      </Link>
                    </td>
                    {ERROR_TYPES.map((et) => {
                      const count = row.counts[et];
                      const intensity =
                        data.heatmap.max > 0 ? count / data.heatmap.max : 0;
                      return (
                        <td key={et} className="p-0.5">
                          <div
                            title={`${SUBTOPIC_LABELS[row.subtopic]} × ${ERROR_TYPE_LABELS[et]}: ${count}`}
                            className="flex h-8 w-16 items-center justify-center rounded-[4px] border border-grid font-mono text-xs"
                            style={{
                              backgroundColor:
                                count === 0
                                  ? "transparent"
                                  : `color-mix(in srgb, ${REDPEN} ${Math.round(
                                      12 + intensity * 68,
                                    )}%, var(--surface))`,
                              color:
                                intensity > 0.55
                                  ? "var(--on-redpen)"
                                  : INK,
                            }}
                          >
                            {count > 0 ? count : ""}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 2a — cross-attribution: filed under X, really Y */}
      {data.crossAttribution.length > 0 && (
        <Section
          title="Misattributed misses"
          subtitle="Misses filed under one subtopic whose post-mortem says a different concept actually failed — the reread belongs to the right-hand chapter."
        >
          <ul className="space-y-1.5 text-sm">
            {data.crossAttribution.map((row) => (
              <li
                key={`${row.filed}|${row.really}`}
                className="flex flex-wrap items-baseline gap-x-2"
              >
                <span className="font-mono text-xs text-graphite">
                  {row.count}×
                </span>
                <span className="text-graphite">
                  filed under {SUBTOPIC_LABELS[row.filed]}, really
                </span>
                <Link
                  href={`/learn/${row.really}#ideas`}
                  className="font-medium text-ballpoint hover:underline"
                >
                  {SUBTOPIC_LABELS[row.really]}
                </Link>
                <Link
                  href={`/drill?sub=${row.really}&n=6`}
                  className="font-mono text-[11px] text-graphite hover:text-ballpoint hover:underline"
                >
                  drill →
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 2b — accuracy × difficulty matrix */}
      <Section
        title="Accuracy by difficulty"
        subtitle="Where exactly each subtopic breaks: accuracy per difficulty tier, focused attempts only."
      >
        {data.difficultyMatrix.length === 0 ? (
          <p className="text-sm text-graphite">
            No attempts yet — the matrix fills in as you train.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr className="text-left text-graphite">
                  <th className="py-1 pr-2 font-medium">Subtopic</th>
                  {[2, 3, 4, 5].map((d) => (
                    <th key={d} className="w-24 py-1 pr-2 font-medium">
                      D{d}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.difficultyMatrix.map((row) => (
                  <tr key={row.subtopic} className="border-t border-grid">
                    <td className="py-1.5 pr-2">
                      <Link
                        href={`/learn/${row.subtopic}`}
                        className="hover:text-ballpoint hover:underline"
                      >
                        {SUBTOPIC_LABELS[row.subtopic]}
                      </Link>
                    </td>
                    {[2, 3, 4, 5].map((d) => {
                      const cell = row.cells[d];
                      if (!cell || cell.total === 0) {
                        return (
                          <td key={d} className="py-1.5 pr-2 text-graphite/50">
                            —
                          </td>
                        );
                      }
                      const pct = Math.round((cell.correct / cell.total) * 100);
                      return (
                        <td key={d} className="py-1.5 pr-2">
                          <Link
                            href={`/drill?sub=${row.subtopic}&d=${d}`}
                            title={`Drill ${SUBTOPIC_LABELS[row.subtopic]} at D${d}`}
                            className="group/cell inline-flex items-baseline gap-1.5"
                          >
                            <span
                              className={cn(
                                "inline-block rounded-[4px] px-1.5 py-0.5 font-mono transition-shadow group-hover/cell:ring-1 group-hover/cell:ring-ballpoint/50",
                                pct >= 80
                                  ? "bg-ballpoint/10 text-ballpoint"
                                  : pct >= 60
                                    ? "bg-amber/10 text-amber"
                                    : "bg-redpen/10 text-redpen",
                              )}
                            >
                              {pct}%
                            </span>
                            <span className="text-graphite">
                              {cell.correct}/{cell.total}
                            </span>
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 2c — training volume calendar */}
      <Section
        title="Training volume"
        subtitle="Focused attempts per day, last 12 weeks. Consistency beats intensity."
      >
        <div className="flex flex-wrap items-end gap-[3px]">
          {data.volume.map((day) => {
            const level =
              day.count === 0
                ? "bg-grid/60"
                : day.count < 10
                  ? "bg-ballpoint/25"
                  : day.count < 25
                    ? "bg-ballpoint/55"
                    : "bg-ballpoint";
            return (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} attempt${day.count === 1 ? "" : "s"}`}
                className={cn("h-4 w-4 rounded-[3px]", level)}
              />
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-graphite">
          Each square is a day: blank → none, light → under 10, mid → under 25,
          full → 25+.
        </p>
      </Section>

      {/* 3 — time vs accuracy scatter */}
      <Section
        title="Time vs. accuracy"
        subtitle="Every attempt is a dot. The shaded zones are the two documented failure modes."
      >
        <div className="mb-3 flex flex-wrap gap-4">
          <ZoneStat
            label="Attempts past 2:45"
            value={data.zones.over245}
            tone="amber"
          />
          <ZoneStat
            label="Sub-60s wrong answers"
            value={data.zones.sub60Wrong}
            tone="red"
          />
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke={GRID} strokeDasharray="0" />
            <XAxis
              type="number"
              dataKey="time"
              name="Time"
              unit="s"
              domain={[0, "dataMax"]}
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="difficulty"
              name="Difficulty"
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
              label={{
                value: "difficulty",
                angle: -90,
                position: "insideLeft",
                fill: GRAPHITE,
                fontSize: 11,
              }}
            />
            <ReferenceArea
              x1={165}
              fill={AMBER}
              fillOpacity={0.07}
              label={{
                value: "past 2:45",
                position: "insideTopRight",
                fill: AMBER,
                fontSize: 11,
              }}
            />
            <ReferenceArea
              x1={0}
              x2={60}
              fill={REDPEN}
              fillOpacity={0.05}
              label={{
                value: "sub-60s",
                position: "insideTopLeft",
                fill: REDPEN,
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ stroke: GRAPHITE, strokeDasharray: "3 3" }}
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) =>
                name === "Time" ? [`${value}s`, "Time"] : [value, "Difficulty"]
              }
            />
            <Scatter
              name="Correct"
              data={data.scatter.filter((p) => p.correct)}
              fill={BALLPOINT}
              fillOpacity={0.55}
            />
            <Scatter
              name="Wrong"
              data={data.scatter.filter((p) => !p.correct)}
              fill={REDPEN}
              fillOpacity={0.75}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconSize={9}
              formatter={(value) => (
                <span style={{ color: INK }}>{value}</span>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </Section>

      {/* 4 — edit ledger */}
      <Section
        title="Edit ledger"
        subtitle="Every Review & Edit answer change, lifetime."
      >
        <div className="mb-3 flex flex-wrap gap-4">
          <ZoneStat
            label="Lifetime net points from edits"
            value={data.editLedger.lifetimeNet}
            tone={
              data.editLedger.lifetimeNet < 0
                ? "red"
                : data.editLedger.lifetimeNet > 0
                  ? "blue"
                  : undefined
            }
            signed
          />
          <ZoneStat label="Edits made" value={data.editLedger.total} />
          <ZoneStat
            label="Fixed a wrong answer"
            value={data.editLedger.improved}
            tone="blue"
          />
          <ZoneStat
            label="Destroyed a correct answer"
            value={data.editLedger.destroyed}
            tone="red"
          />
          <ZoneStat
            label="Lock-confidence correct answers changed"
            value={data.editLedger.lockCorrectChanged}
            tone="red"
          />
        </div>
        {data.editLedger.rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid text-left text-xs text-graphite">
                  <th className="py-2 pr-3 font-normal">When</th>
                  <th className="py-2 pr-3 font-normal">Subtopic</th>
                  <th className="py-2 pr-3 font-normal">Reason</th>
                  <th className="py-2 pr-3 font-normal">Outcome</th>
                  <th className="py-2 font-normal">Justification</th>
                </tr>
              </thead>
              <tbody>
                {data.editLedger.rows.map((e) => (
                  <tr key={e.id} className="border-b border-grid last:border-0">
                    <td className="py-1.5 pr-3 font-mono text-xs text-graphite">
                      {formatDistanceToNow(new Date(e.createdAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="py-1.5 pr-3 text-xs">
                      {SUBTOPIC_LABELS[e.subtopic]}
                    </td>
                    <td className="py-1.5 pr-3 text-xs">
                      {EDIT_REASON_LABELS[e.reason as EditReason] ?? e.reason}
                    </td>
                    <td
                      className={cn(
                        "py-1.5 pr-3 text-xs font-medium",
                        e.toCorrect && !e.fromCorrect && "text-ballpoint",
                        e.fromCorrect && !e.toCorrect && "text-redpen",
                      )}
                    >
                      {e.toCorrect && !e.fromCorrect
                        ? "+1 fixed"
                        : e.fromCorrect && !e.toCorrect
                          ? "−1 destroyed"
                          : "0 neutral"}
                    </td>
                    <td className="max-w-md py-1.5 text-xs text-graphite">
                      “{e.justification}”
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* 5 — calibration */}
      <Section
        title="Calibration"
        subtitle="Accuracy by pre-answer confidence: expected vs. actual."
      >
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data.calibration.map((c) => ({
              bucket: `${c.confidence[0].toUpperCase()}${c.confidence.slice(1)} (${c.total})`,
              expected: c.expected,
              actual: c.actual,
            }))}
            margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
            barCategoryGap="28%"
            barGap={2}
          >
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="bucket"
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              unit="%"
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [
                value == null ? "Insufficient evidence" : `${String(value)}%`,
                name === "expected" ? "Expected" : "Actual",
              ]}
            />
            <Bar
              dataKey="expected"
              name="Expected"
              fill={GRAPHITE}
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              fill={BALLPOINT}
              radius={[4, 4, 0, 0]}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconSize={9}
              formatter={(value) => <span style={{ color: INK }}>{value}</span>}
            />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      {/* 6 — rolling trend */}
      <Section
        title="Rolling 7-day accuracy by skill"
        subtitle="Each point is the trailing 7-day accuracy on that day; gaps mean no attempts in the window."
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={data.trend}
            margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
          >
            <CartesianGrid stroke={GRID} vertical={false} />
            <XAxis
              dataKey="date"
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
              interval={4}
            />
            <YAxis
              domain={[0, 100]}
              unit="%"
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Line
              type="monotone"
              dataKey="value_order_factors"
              name={SKILL_LABELS.value_order_factors}
              stroke={REDPEN}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="equal_unequal_alg"
              name={SKILL_LABELS.equal_unequal_alg}
              stroke={BALLPOINT}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="rates_ratio_percent"
              name={SKILL_LABELS.rates_ratio_percent}
              stroke={AMBER}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="counting_sets_series_prob_stats"
              name={SKILL_LABELS.counting_sets_series_prob_stats}
              stroke={GRAPHITE}
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              connectNulls
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconSize={9}
              formatter={(value) => <span style={{ color: INK }}>{value}</span>}
            />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      {/* 7 — redo compliance + pattern ELO */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Section
          title="Redo-queue compliance"
          subtitle="Spaced redos: what's open, overdue, and cleared."
        >
          <div className="flex flex-wrap gap-4">
            <ZoneStat label="Open" value={data.redoCompliance.open} />
            <ZoneStat
              label="Overdue"
              value={data.redoCompliance.overdue}
              tone={data.redoCompliance.overdue > 0 ? "amber" : undefined}
            />
            <ZoneStat
              label="Cleared (cold-solved)"
              value={data.redoCompliance.cleared}
              tone="blue"
            />
          </div>
        </Section>

        <Section
          title="Pattern-trainer ELO"
          subtitle="Per-category rating; the line marks the 1200 start."
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.eloBars}
              layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 8 }}
            >
              <CartesianGrid stroke={GRID} horizontal={false} />
              <XAxis
                type="number"
                domain={[1000, 1600]}
                tick={AXIS_TICK}
                stroke={GRID}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                width={150}
                tick={{ ...AXIS_TICK, fontSize: 10 }}
                stroke={GRID}
                tickLine={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <ReferenceLine x={1200} stroke={GRAPHITE} strokeDasharray="4 3" />
              <Bar
                dataKey="rating"
                name="ELO"
                fill={BALLPOINT}
                radius={[0, 4, 4, 0]}
                barSize={12}
                label={{
                  position: "right",
                  fill: INK,
                  fontSize: 11,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Section>
      </div>

      <Footer />
    </div>
  );
}

type Insight = {
  title: string;
  evidence: string;
  href: string;
  action: string;
  tone: "blue" | "amber" | "red";
  icon: React.ReactNode;
};

function InsightBrief({ data }: { data: AnalyticsData }) {
  const insights: Insight[] = [];
  const weakestSkill = data.mirror.skills
    .filter((bar) => bar.total >= 5)
    .sort(
      (a, b) =>
        a.correct / a.total - b.correct / b.total || b.total - a.total,
    )[0];

  if (data.redoCompliance.overdue > 0) {
    insights.push({
      title: "Close the overdue loop first",
      evidence: `${data.redoCompliance.overdue} spaced redo${data.redoCompliance.overdue === 1 ? " is" : "s are"} overdue. New volume is less valuable while exact misses are decaying.`,
      href: "/queue?start=1",
      action: "Clear the redo queue",
      tone: "red",
      icon: <Stack size={20} weight="duotone" aria-hidden />,
    });
  }

  if (weakestSkill) {
    const accuracy = percent(weakestSkill.correct, weakestSkill.total);
    insights.push({
      title: `${weakestSkill.label} is the current leverage point`,
      evidence: `${accuracy}% over ${weakestSkill.total} focused attempts—enough evidence to prioritize without treating a tiny sample as truth.`,
      href: "/mastery",
      action: "Open the mastery rung",
      tone: accuracy < 60 ? "red" : "amber",
      icon: <Crosshair size={20} weight="duotone" aria-hidden />,
    });
  }

  if (data.zones.over245 > 0 || data.zones.sub60Wrong > 0) {
    const dominant =
      data.zones.over245 >= data.zones.sub60Wrong
        ? `${data.zones.over245} attempts ran past 2:45`
        : `${data.zones.sub60Wrong} wrong answers landed under 60 seconds`;
    insights.push({
      title: "Pacing is costing decisions",
      evidence: `${dominant}. Use a mini set to rehearse the decision checkpoint, not just faster arithmetic.`,
      href: "/timed?start=mini",
      action: "Run a 15-minute set",
      tone: "amber",
      icon: <Timer size={20} weight="duotone" aria-hidden />,
    });
  }

  const worstCalibration = data.calibration
    .filter((bucket) => bucket.actual != null && bucket.total >= 5)
    .sort(
      (a, b) =>
        Math.abs((b.actual ?? b.expected) - b.expected) -
        Math.abs((a.actual ?? a.expected) - a.expected),
    )[0];
  if (
    insights.length < 3 &&
    worstCalibration?.actual != null &&
    Math.abs(worstCalibration.actual - worstCalibration.expected) >= 15
  ) {
    insights.push({
      title: `${worstCalibration.confidence} confidence needs recalibration`,
      evidence: `Actual accuracy is ${worstCalibration.actual}% against a ${worstCalibration.expected}% reference over ${worstCalibration.total} attempts.`,
      href: "/drill",
      action: "Run a deliberate drill",
      tone: "blue",
      icon: <WarningCircle size={20} weight="duotone" aria-hidden />,
    });
  }

  const shown = insights.slice(0, 3);
  if (shown.length === 0) {
    shown.push({
      title: "Keep collecting clean evidence",
      evidence:
        "No single weakness has enough signal to outrank the rest. A balanced focused drill is the honest next step.",
      href: "/drill?plan=1",
      action: "Start the balanced drill",
      tone: "blue",
      icon: <Crosshair size={20} weight="duotone" aria-hidden />,
    });
  }

  return (
    <section aria-labelledby="coach-brief-title">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-grid-strong pb-4">
        <div>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite">
            Coach brief
          </p>
          <h2
            id="coach-brief-title"
            className="mt-1 font-display text-2xl font-semibold tracking-tight"
          >
            Evidence translated into action.
          </h2>
        </div>
        <p className="max-w-md text-[13px] leading-5 text-graphite">
          Deterministic findings from focused, trusted attempts—never a
          predicted official score.
        </p>
      </div>
      <div className="divide-y divide-grid">
        {shown.map((insight, index) => (
          <article
            key={`${insight.title}-${index}`}
            className="grid gap-3 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border",
                insight.tone === "blue" &&
                  "border-ballpoint/25 bg-ballpoint/10 text-ballpoint",
                insight.tone === "amber" &&
                  "border-amber/25 bg-amber/10 text-amber",
                insight.tone === "red" &&
                  "border-redpen/25 bg-redpen/10 text-redpen",
              )}
            >
              {insight.icon}
            </span>
            <div>
              <h3 className="font-display text-[17px] font-semibold tracking-tight">
                {insight.title}
              </h3>
              <p className="mt-1 max-w-2xl text-[13px] leading-5 text-graphite">
                {insight.evidence}
              </p>
            </div>
            <Link
              href={insight.href}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ballpoint hover:underline"
            >
              {insight.action}
              <ArrowRight size={15} aria-hidden />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}



function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-grid-strong pt-5">
      <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
      <p className="mb-4 mt-1 text-[13px] leading-5 text-graphite">{subtitle}</p>
      {children}
    </section>
  );
}

function MirrorGroup({ title, bars }: { title: string; bars: MirrorBar[] }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-medium text-graphite">{title}</h3>
      <div className="space-y-2">
        {bars.map((bar) => {
          const pct = bar.total > 0 ? percent(bar.correct, bar.total) : null;
          return (
            <div key={bar.key} className="text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-xs">{bar.label}</span>
                <span className="font-mono text-xs">
                  {pct != null ? `${pct}%` : "—"}
                  <span className="ml-1 text-graphite">
                    {bar.correct}/{bar.total}
                  </span>
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-grid">
                <div
                  className="h-2 rounded-full bg-ballpoint"
                  style={{ width: `${pct ?? 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ZoneStat({
  label,
  value,
  tone,
  signed,
}: {
  label: string;
  value: number;
  tone?: "red" | "amber" | "blue";
  signed?: boolean;
}) {
  return (
    <div className="border-l border-grid-strong pl-3">
      <div className="text-[12px] text-graphite">{label}</div>
      <div
        className={cn(
          "font-mono text-xl font-medium",
          tone === "red" && "text-redpen",
          tone === "amber" && "text-amber",
          tone === "blue" && "text-ballpoint",
        )}
      >
        {signed && value > 0 ? `+${value}` : value}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <p className="border-t border-grid pt-4 text-center text-xs text-graphite">
      Calibration comes from official GMAC material only. This platform
      trains; official mocks measure.
    </p>
  );
}
