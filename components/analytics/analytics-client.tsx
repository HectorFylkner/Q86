"use client";

import { formatDistanceToNow } from "date-fns";
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
import { ERROR_TYPES, type EditReason } from "@/lib/taxonomy";
import { useT } from "@/components/i18n-provider";
import {
  editReasonLabel,
  errorTypeLabel,
  skillLabel,
  subtopicLabel,
} from "@/lib/i18n/labels";
import { cn, percent } from "@/lib/utils";
import { useChartTokens } from "@/components/use-chart-tokens";

export function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const t = useT();
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
      <div className="space-y-4">
        <p className="rounded-card border border-grid bg-surface p-5 text-sm text-graphite shadow-ambient">
          No attempts logged yet. Run a drill or a timed set and the report
          fills in.
        </p>
        <Footer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1 — score-report mirror */}
      <Section
        title={t("analytics.mirrorTitle")}
        subtitle={t("analytics.mirrorSubtitle", { count: data.attemptCount })}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <MirrorGroup
            title={t("analytics.contentDomain")}
            bars={data.mirror.domains}
          />
          <MirrorGroup
            title={t("analytics.context")}
            bars={data.mirror.contexts}
          />
          <MirrorGroup
            title={t("analytics.fundamentalSkill")}
            bars={data.mirror.skills}
          />
        </div>
      </Section>

      {/* 2 — heatmap */}
      <Section
        title={t("analytics.heatmapTitle")}
        subtitle={t("analytics.heatmapSubtitle")}
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
                    {t("drillRunner.subtopicColumn")}
                  </th>
                  {ERROR_TYPES.map((et) => (
                    <th
                      key={et}
                      className="px-1 pb-1 text-center text-[10px] font-normal text-graphite"
                    >
                      {errorTypeLabel(t, et)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.heatmap.rows.map((row) => (
                  <tr key={row.subtopic}>
                    <td className="whitespace-nowrap pr-3 text-xs">
                      {subtopicLabel(t, row.subtopic)}
                    </td>
                    {ERROR_TYPES.map((et) => {
                      const count = row.counts[et];
                      const intensity =
                        data.heatmap.max > 0 ? count / data.heatmap.max : 0;
                      return (
                        <td key={et} className="p-0.5">
                          <div
                            title={t("analytics.heatmapCell", {
                              subtopic: subtopicLabel(t, row.subtopic),
                              errorType: errorTypeLabel(t, et),
                              count,
                            })}
                            className="flex h-8 w-16 items-center justify-center rounded-[4px] border border-grid font-mono text-xs"
                            style={{
                              backgroundColor:
                                count === 0
                                  ? "transparent"
                                  : `color-mix(in srgb, ${REDPEN} ${Math.round(
                                      12 + intensity * 68,
                                    )}%, white)`,
                              color: intensity > 0.55 ? "white" : INK,
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
        title={t("analytics.difficultyTitle")}
        subtitle={t("analytics.difficultySubtitle")}
      >
        {data.difficultyMatrix.length === 0 ? (
          <p className="text-sm text-graphite">
            {t("analytics.noAttemptsYet")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr className="text-left text-graphite">
                  <th className="py-1 pr-2 font-medium">
                    {t("drillRunner.subtopicColumn")}
                  </th>
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
                      {subtopicLabel(t, row.subtopic)}
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
        title={t("analytics.volumeTitle")}
        subtitle={t("analytics.volumeSubtitle")}
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
                title={t("analytics.volumeCell", {
                  date: day.date,
                  count: day.count,
                })}
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
        title={t("analytics.scatterTitle")}
        subtitle={t("analytics.scatterSubtitle")}
      >
        <div className="mb-3 flex flex-wrap gap-4">
          <ZoneStat
            label={t("analytics.pastCheckpoint")}
            value={data.zones.over245}
            tone="amber"
          />
          <ZoneStat
            label={t("analytics.sub60Wrong")}
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
              name={t("analytics.axisTime")}
              unit="s"
              domain={[0, "dataMax"]}
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="difficulty"
              name={t("analytics.axisDifficulty")}
              domain={[0.5, 5.5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={AXIS_TICK}
              stroke={GRID}
              tickLine={false}
              label={{
                value: t("analytics.axisDifficulty").toLowerCase(),
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
                value: t("analytics.zonePast245"),
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
                value: t("analytics.zoneSub60"),
                position: "insideTopLeft",
                fill: REDPEN,
                fontSize: 11,
              }}
            />
            <Tooltip
              cursor={{ stroke: GRAPHITE, strokeDasharray: "3 3" }}
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) =>
                name === t("analytics.axisTime")
                  ? [`${value}s`, t("analytics.axisTime")]
                  : [value, t("analytics.axisDifficulty")]
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
        title={t("analytics.ledgerTitle")}
        subtitle={t("analytics.ledgerSubtitle")}
      >
        <div className="mb-3 flex flex-wrap gap-4">
          <ZoneStat
            label={t("analytics.lifetimeNet")}
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
          <ZoneStat
            label={t("analytics.editsMade")}
            value={data.editLedger.total}
          />
          <ZoneStat
            label={t("analytics.fixedWrong")}
            value={data.editLedger.improved}
            tone="blue"
          />
          <ZoneStat
            label={t("analytics.destroyedCorrect")}
            value={data.editLedger.destroyed}
            tone="red"
          />
          <ZoneStat
            label={t("analytics.lockChanged")}
            value={data.editLedger.lockCorrectChanged}
            tone="red"
          />
        </div>
        {data.editLedger.rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grid text-left text-xs text-graphite">
                  <th className="py-2 pr-3 font-normal">
                    {t("analytics.columnWhen")}
                  </th>
                  <th className="py-2 pr-3 font-normal">
                    {t("drillRunner.subtopicColumn")}
                  </th>
                  <th className="py-2 pr-3 font-normal">
                    {t("analytics.columnReason")}
                  </th>
                  <th className="py-2 pr-3 font-normal">
                    {t("analytics.columnOutcome")}
                  </th>
                  <th className="py-2 font-normal">
                    {t("analytics.columnJustification")}
                  </th>
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
                      {subtopicLabel(t, e.subtopic)}
                    </td>
                    <td className="py-1.5 pr-3 text-xs">
                      {editReasonLabel(t, e.reason as EditReason)}
                    </td>
                    <td
                      className={cn(
                        "py-1.5 pr-3 text-xs font-medium",
                        e.toCorrect && !e.fromCorrect && "text-ballpoint",
                        e.fromCorrect && !e.toCorrect && "text-redpen",
                      )}
                    >
                      {e.toCorrect && !e.fromCorrect
                        ? t("analytics.outcomeFixed")
                        : e.fromCorrect && !e.toCorrect
                          ? t("analytics.outcomeDestroyed")
                          : t("analytics.outcomeNeutral")}
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
        title={t("analytics.calibrationTitle")}
        subtitle={t("analytics.calibrationSubtitle")}
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
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [
                `${value}%`,
                name === "expected" ? "Expected" : "Actual",
              ]}
            />
            <Bar
              dataKey="expected"
              name={t("analytics.expected")}
              fill={GRAPHITE}
              fillOpacity={0.35}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name={t("analytics.actual")}
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
        title={t("analytics.trendTitle")}
        subtitle={t("analytics.trendSubtitle")}
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
              name={skillLabel(t, "value_order_factors")}
              stroke={REDPEN}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="equal_unequal_alg"
              name={skillLabel(t, "equal_unequal_alg")}
              stroke={BALLPOINT}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="rates_ratio_percent"
              name={skillLabel(t, "rates_ratio_percent")}
              stroke={AMBER}
              strokeWidth={2}
              dot={{ r: 2, strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="counting_sets_series_prob_stats"
              name={skillLabel(t, "counting_sets_series_prob_stats")}
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
          title={t("analytics.redoTitle")}
          subtitle={t("analytics.redoSubtitle")}
        >
          <div className="flex flex-wrap gap-4">
            <ZoneStat
              label={t("analytics.redoOpen")}
              value={data.redoCompliance.open}
            />
            <ZoneStat
              label={t("analytics.redoOverdue")}
              value={data.redoCompliance.overdue}
              tone={data.redoCompliance.overdue > 0 ? "amber" : undefined}
            />
            <ZoneStat
              label={t("analytics.redoCleared")}
              value={data.redoCompliance.cleared}
              tone="blue"
            />
          </div>
        </Section>

        <Section
          title={t("analytics.eloTitle")}
          subtitle={t("analytics.eloSubtitle")}
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
    <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      <p className="mb-3 mt-0.5 text-xs text-graphite">{subtitle}</p>
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
    <div className="rounded-card border border-grid bg-surface px-3 py-2">
      <div className="text-[11px] text-graphite">{label}</div>
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
