"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
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
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
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
    surface: SURFACE,
    onAccent: ON_ACCENT,
  } = useChartTokens();
  const AXIS_TICK = { fill: GRAPHITE, fontSize: 11 } as const;
  const tooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--grid)",
    borderRadius: "var(--radius-control)",
    boxShadow: "var(--shadow-ambient)",
    fontSize: 12,
    color: "var(--ink)",
  } as const;
  if (data.attemptCount === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          kicker="No marks on the paper yet"
          action={
            <ButtonLink href="/drill" variant="secondary" size="sm">
              Run your first drill →
            </ButtonLink>
          }
        >
          No attempts logged yet. Run a drill or a timed set and every
          figure on this page fills in.
        </EmptyState>
        <Footer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                  <th className="pr-3 text-left font-mono text-micro uppercase tracking-wider font-normal text-graphite">
                    Subtopic
                  </th>
                  {ERROR_TYPES.map((et) => (
                    <th
                      key={et}
                      className="px-1 pb-1 text-center font-mono text-micro uppercase tracking-wider font-normal text-graphite"
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
                      {SUBTOPIC_LABELS[row.subtopic]}
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
                                    )}%, ${SURFACE})`,
                              color: intensity > 0.55 ? ON_ACCENT : INK,
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
                <tr className="text-left font-mono text-micro uppercase tracking-wider text-graphite">
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
                    <td className="py-1.5 pr-2">{SUBTOPIC_LABELS[row.subtopic]}</td>
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
                          <span
                            className={cn(
                              "inline-block rounded-[4px] px-1.5 py-0.5 font-mono",
                              pct >= 80
                                ? "bg-ballpoint/10 text-ballpoint"
                                : pct >= 60
                                  ? "bg-amber/10 text-amber"
                                  : "bg-redpen/10 text-redpen",
                            )}
                          >
                            {pct}%
                          </span>{" "}
                          <span className="text-graphite">
                            {cell.correct}/{cell.total}
                          </span>
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
        <p className="mt-2 text-caption text-graphite">
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
              isAnimationActive={false}
              cursor={{ stroke: GRAPHITE, strokeDasharray: "3 3" }}
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) =>
                name === "Time" ? [`${value}s`, "Time"] : [value, "Difficulty"]
              }
            />
            <Scatter
              isAnimationActive={false}
              name="Correct"
              data={data.scatter.filter((p) => p.correct)}
              fill={BALLPOINT}
              fillOpacity={0.55}
            />
            <Scatter
              isAnimationActive={false}
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
                <tr className="border-b border-grid text-left font-mono text-micro uppercase tracking-wider text-graphite">
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
              actual: c.actual ?? 0,
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
              isAnimationActive={false}
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [
                `${value}%`,
                name === "expected" ? "Expected" : "Actual",
              ]}
            />
            <Bar
              isAnimationActive={false}
              dataKey="expected"
              name="Expected"
              fill={GRAPHITE}
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              isAnimationActive={false}
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
            <Tooltip isAnimationActive={false} contentStyle={tooltipStyle} />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="value_order_factors"
              name={SKILL_LABELS.value_order_factors}
              stroke={BALLPOINT}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="equal_unequal_alg"
              name={SKILL_LABELS.equal_unequal_alg}
              stroke={INK}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              isAnimationActive={false}
              type="monotone"
              dataKey="rates_ratio_percent"
              name={SKILL_LABELS.rates_ratio_percent}
              stroke={GRAPHITE}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              isAnimationActive={false}
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
              <Tooltip isAnimationActive={false} contentStyle={tooltipStyle} />
              <ReferenceLine x={1200} stroke={GRAPHITE} strokeDasharray="4 3" />
              <Bar
                isAnimationActive={false}
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



/** Recharts' 1.5s mount tween is disabled on every series; the report
 *  instead arrives with the house entrance (reduced motion drops the
 *  lift and keeps the fade, via MotionConfig). */
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
    <motion.section
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
    >
      <h2 className="font-display text-base font-semibold">{title}</h2>
      <p className="mb-3 mt-0.5 text-xs text-graphite">{subtitle}</p>
      {children}
    </motion.section>
  );
}

function MirrorGroup({ title, bars }: { title: string; bars: MirrorBar[] }) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-micro uppercase tracking-wider text-graphite">{title}</h3>
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
    <div className="rounded-card border border-grid bg-surface px-3 py-2">
      <div className="font-mono text-micro uppercase tracking-wider text-graphite">{label}</div>
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
    <p className="border-t border-grid pt-4 text-center text-caption text-graphite">
      Calibration comes from official GMAC material only. This platform
      trains; official mocks measure.
    </p>
  );
}
