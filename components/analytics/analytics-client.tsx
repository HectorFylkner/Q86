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
import {
  EDIT_REASON_LABELS,
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  SKILL_LABELS,
  SUBTOPIC_LABELS,
  type EditReason,
  type ErrorType,
  type Subtopic,
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
      {/* 0 — readiness */}
      <Section
        title="Readiness"
        subtitle="Anchored to official scores only. Everything below the anchor is a leading indicator from practice data — direction, not destination. No predicted score, ever."
      >
        <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
          <div>
            <div className="text-[11px] text-graphite">
              Latest official quant
            </div>
            <div className="font-mono text-3xl font-semibold">
              {data.readiness.anchor.score ?? "—"}
            </div>
            {data.readiness.anchor.date && (
              <div className="font-mono text-xs text-graphite">
                {data.readiness.anchor.date}
              </div>
            )}
          </div>
          {data.readiness.series.filter((p) => p.score != null).length >= 2 ? (
            <div className="font-mono text-xs text-graphite">
              {data.readiness.series
                .filter((p) => p.score != null)
                .map((p) => `${p.date.slice(5)}: ${p.score}`)
                .join("  →  ")}
            </div>
          ) : data.readiness.anchor.score == null ? (
            <p className="max-w-md text-sm text-graphite">
              No official score imported yet. Take an official mock, import
              the report, and this panel gains its anchor — until then it
              reads leading indicators only.
            </p>
          ) : null}
        </div>
        <ul className="mt-4 space-y-2">
          {data.readiness.leaks.map((leak) => (
            <li key={leak.key} className="flex items-start gap-2.5 text-sm">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  leak.severity === "red" && "bg-redpen",
                  leak.severity === "amber" && "bg-amber",
                  leak.severity === "ok" && "bg-ballpoint",
                )}
              />
              <span>
                <span className="font-medium">{leak.label}.</span>{" "}
                <span className="text-graphite">{leak.detail}</span>
                {leak.href && (
                  <>
                    {" "}
                    <a
                      href={leak.href}
                      className="font-medium text-ballpoint hover:underline"
                    >
                      Work it →
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Section>

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
          <>
            <HeatTable
              rows={data.heatmap.rows}
              max={data.heatmap.max}
              redpen={REDPEN}
            />
            <SlipSiteLinks slipSites={data.slipSites} />
          </>
        )}
      </Section>

      {/* 2a — subtag heatmap: the subtopic that actually failed */}
      <Section
        title="Where misses actually fail"
        subtitle="The post-mortem's failing subtopic — often not the chapter the question was filed under."
      >
        {data.subtagHeatmap.rows.length === 0 ? (
          <p className="text-sm text-graphite">
            No failing-subtopic tags yet. The coach suggests one on every
            post-mortem — confirm it there and this view fills in.
          </p>
        ) : (
          <HeatTable
            rows={data.subtagHeatmap.rows}
            max={data.subtagHeatmap.max}
            redpen={REDPEN}
            meta={(row) => (
              <span className="ml-2 whitespace-nowrap text-[10px] text-graphite">
                {row.crossTopic ? `${row.crossTopic} leaked in · ` : ""}
                <a
                  href={`/learn/${row.subtopic}#traps`}
                  className="text-ballpoint hover:underline"
                >
                  chapter →
                </a>
              </span>
            )}
          />
        )}
      </Section>

      {/* 2b — error mechanism trend */}
      {data.errorTrend.top.length > 0 && (
        <Section
          title="Error mechanism trend"
          subtitle="Classified misses per week by mechanism. The question is whether each line is falling."
        >
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={data.errorTrend.weeks.map((w) => ({
                week: w.weekStartKey.slice(5).replace("-", "/"),
                ...w.counts,
              }))}
              margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid stroke={GRID} vertical={false} />
              <XAxis
                dataKey="week"
                tick={AXIS_TICK}
                stroke={GRID}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS_TICK}
                stroke={GRID}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => [
                  value,
                  ERROR_TYPE_LABELS[name as (typeof ERROR_TYPES)[number]] ??
                    name,
                ]}
              />
              {data.errorTrend.top.map((et, i) => (
                <Line
                  key={et}
                  type="monotone"
                  dataKey={et}
                  name={et}
                  stroke={[REDPEN, BALLPOINT, AMBER, GRAPHITE][i]}
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 0 }}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: 12 }}
                iconSize={9}
                formatter={(value) => (
                  <span style={{ color: INK }}>
                    {ERROR_TYPE_LABELS[
                      value as (typeof ERROR_TYPES)[number]
                    ] ?? value}
                  </span>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
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
          <ZoneStat
            label="Guessed corrects (re-queued, not mastery)"
            value={data.zones.luckyCorrect}
            tone="amber"
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

      {/* 3b — triage discipline */}
      <Section
        title="Triage discipline"
        subtitle="Sunk costs: timed questions where you stayed past 1.5× benchmark on a cell your own record rates guess-or-bail."
      >
        {data.discipline.timedAnswered === 0 ? (
          <p className="text-sm text-graphite">
            No timed sets yet — the triage read needs real sections. Run one
            from Timed, then check back here.
          </p>
        ) : (
          <>
            <div className="mb-3 flex flex-wrap gap-4">
              <ZoneStat
                label="Sunk-cost violations"
                value={data.discipline.sunkCount}
                tone={data.discipline.sunkCount > 0 ? "red" : undefined}
              />
              <ZoneStat
                label="Minutes donated past the bail line"
                value={data.discipline.minutesDonated}
                tone={data.discipline.minutesDonated > 0 ? "amber" : undefined}
              />
              <ZoneStat
                label="Triage honored (kept to benchmark)"
                value={data.discipline.wins}
                tone="blue"
              />
              {data.discipline.decideCalls > 0 && (
                <ZoneStat
                  label={`/decide alignment (${data.discipline.decideCalls} calls)`}
                  value={percent(
                    data.discipline.decideAligned,
                    data.discipline.decideCalls,
                  )}
                />
              )}
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={data.discipline.weekly.map((w) => ({
                  week: w.weekStartKey.slice(5).replace("-", "/"),
                  sunkCosts: w.sunkCosts,
                  answered: w.timedAnswered,
                  donated: Math.round(w.secondsDonated / 60),
                }))}
                margin={{ top: 8, right: 16, bottom: 4, left: 0 }}
                barCategoryGap="35%"
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    name === "donated" ? `${value} min` : value,
                    name === "sunkCosts"
                      ? "Sunk costs"
                      : name === "donated"
                        ? "Minutes donated"
                        : "Timed answers",
                  ]}
                />
                <Bar
                  dataKey="sunkCosts"
                  name="Sunk costs"
                  fill={REDPEN}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="donated"
                  name="Minutes donated"
                  fill={AMBER}
                  fillOpacity={0.5}
                  radius={[4, 4, 0, 0]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconSize={9}
                  formatter={(value) => (
                    <span style={{ color: INK }}>{value}</span>
                  )}
                />
              </BarChart>
            </ResponsiveContainer>
            {data.discipline.worst.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {data.discipline.worst.slice(0, 6).map((v) => (
                  <li key={v.attemptId} className="text-sm text-graphite">
                    <span className="font-mono text-xs text-redpen">
                      {Math.round(v.timeSeconds)}s
                    </span>{" "}
                    on a D{v.difficulty} {SUBTOPIC_LABELS[v.subtopic]} your
                    record solves {Math.round(v.verdict.predicted * 100)}%
                    of the time
                    {v.verdict.yourCall != null &&
                      ` — your own call: ${v.verdict.yourCall}`}
                    .{" "}
                    <a
                      href={`/postmortem/${v.attemptId}`}
                      className="text-ballpoint hover:underline"
                    >
                      Post-mortem
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {data.discipline.sunkCount === 0 && (
              <p className="mt-3 text-sm text-ballpoint">
                No sunk costs on record — every expensive question you have
                walked into was one your record backs.
              </p>
            )}
          </>
        )}
      </Section>

      {/* 3c — section replay */}
      <Section
        title="Section replay"
        subtitle="Accuracy and pace by section quarter — fatigue and end-rushing live here. In-app sims beside your imported official rows."
      >
        {data.longitudinal.simCount === 0 &&
        data.longitudinal.officialRowReports === 0 ? (
          <p className="text-sm text-graphite">
            Needs a full 21-question section sim or an imported report with
            per-question rows. Run one; the replay reads itself.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full max-w-xl text-sm">
                <thead>
                  <tr className="border-b border-grid text-left text-xs text-graphite">
                    <th className="py-1.5 pr-3 font-normal">Quarter</th>
                    {data.longitudinal.simCount > 0 && (
                      <>
                        <th className="py-1.5 pr-3 font-normal">
                          Sims · accuracy
                        </th>
                        <th className="py-1.5 pr-3 font-normal">
                          Sims · avg time
                        </th>
                      </>
                    )}
                    {data.longitudinal.officialRowReports > 0 && (
                      <>
                        <th className="py-1.5 pr-3 font-normal">
                          Official · accuracy
                        </th>
                        <th className="py-1.5 font-normal">
                          Official · avg time
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3].map((i) => {
                    const sim = data.longitudinal.quarters[i];
                    const off = data.longitudinal.officialQuarters[i];
                    return (
                      <tr key={i} className="border-b border-grid last:border-0">
                        <td className="py-1.5 pr-3 font-mono text-xs">
                          Q{i + 1}
                        </td>
                        {data.longitudinal.simCount > 0 && (
                          <>
                            <td className="py-1.5 pr-3 font-mono text-xs">
                              {sim?.accuracy != null
                                ? `${Math.round(sim.accuracy * 100)}%`
                                : "—"}
                            </td>
                            <td className="py-1.5 pr-3 font-mono text-xs">
                              {sim?.avgSeconds != null
                                ? `${Math.round(sim.avgSeconds)}s`
                                : "—"}
                            </td>
                          </>
                        )}
                        {data.longitudinal.officialRowReports > 0 && (
                          <>
                            <td className="py-1.5 pr-3 font-mono text-xs">
                              {off?.accuracy != null
                                ? `${Math.round(off.accuracy * 100)}%`
                                : "—"}
                            </td>
                            <td className="py-1.5 font-mono text-xs">
                              {off?.avgSeconds != null
                                ? `${Math.round(off.avgSeconds)}s`
                                : "—"}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <ReplayNotes quarters={data.longitudinal.quarters} />
          </>
        )}
      </Section>

      {/* 3d — pacing across weeks */}
      <Section
        title="Pacing across weeks"
        subtitle="The marking summary's pacing read, re-read longitudinally: are the sinks drying up, is the bench ratio settling toward 1.0, is editing earning points?"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div>
            <h4 className="mb-1 text-xs font-medium text-graphite">
              Sinks & panic answers per week
            </h4>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart
                data={data.longitudinal.pacingWeeks.map((w) => ({
                  week: w.weekStartKey.slice(5).replace("-", "/"),
                  sinks: w.sinks,
                  rushedWrong: w.rushedWrong,
                }))}
                margin={{ top: 4, right: 8, bottom: 0, left: -22 }}
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number, name: string) => [
                    value,
                    name === "sinks" ? "Time sinks" : "Rushed & wrong",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="sinks"
                  stroke={AMBER}
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="rushedWrong"
                  stroke={REDPEN}
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-medium text-graphite">
              Time ÷ benchmark (1.0 = exam pace)
            </h4>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart
                data={data.longitudinal.pacingWeeks.map((w) => ({
                  week: w.weekStartKey.slice(5).replace("-", "/"),
                  ratio:
                    w.benchRatioAvg != null
                      ? Math.round(w.benchRatioAvg * 100) / 100
                      : null,
                }))}
                margin={{ top: 4, right: 8, bottom: 0, left: -22 }}
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 2]}
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [`${value}×`, "vs bench"]}
                />
                <ReferenceLine y={1} stroke={GRAPHITE} strokeDasharray="4 3" />
                <Line
                  type="monotone"
                  dataKey="ratio"
                  stroke={BALLPOINT}
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 0 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="mb-1 text-xs font-medium text-graphite">
              Edit net per week
            </h4>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart
                data={data.longitudinal.editWeeks.map((w) => ({
                  week: w.weekStartKey.slice(5).replace("-", "/"),
                  net: w.net,
                }))}
                margin={{ top: 4, right: 8, bottom: 0, left: -22 }}
              >
                <CartesianGrid stroke={GRID} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={AXIS_TICK}
                  stroke={GRID}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: number) => [
                    value > 0 ? `+${value}` : value,
                    "Edit net",
                  ]}
                />
                <ReferenceLine y={0} stroke={GRAPHITE} />
                <Bar dataKey="net" fill={BALLPOINT} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Section>

      {/* 3e — twin transfer */}
      {data.twins && (
        <Section
          title="Twin transfer"
          subtitle="Twins share their original's skeleton but flip pure ↔ real context. The accuracy gap is the transfer cost the feature exists to measure."
        >
          {data.twins.originals.total + data.twins.twins.total === 0 ? (
            <p className="text-sm text-graphite">
              {data.twins.pairs} twins exist but haven&apos;t been attempted
              yet — drill them from a post-mortem&apos;s twin block.
            </p>
          ) : (
            <div className="flex flex-wrap gap-4">
              <ZoneStat
                label={`Originals (${data.twins.originals.total} attempts)`}
                value={percent(
                  data.twins.originals.correct,
                  data.twins.originals.total,
                )}
              />
              <ZoneStat
                label={`Twins (${data.twins.twins.total} attempts)`}
                value={percent(
                  data.twins.twins.correct,
                  data.twins.twins.total,
                )}
                tone={
                  data.twins.twins.total > 0 &&
                  data.twins.originals.total > 0 &&
                  percent(data.twins.twins.correct, data.twins.twins.total) <
                    percent(
                      data.twins.originals.correct,
                      data.twins.originals.total,
                    ) -
                      10
                    ? "amber"
                    : undefined
                }
              />
            </div>
          )}
        </Section>
      )}

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

/** Coaching lines under the section replay: fade and end-rush, named. */
function ReplayNotes({
  quarters,
}: {
  quarters: AnalyticsData["longitudinal"]["quarters"];
}) {
  const q1 = quarters[0];
  const q4 = quarters[3];
  if (!q1 || !q4 || q1.accuracy == null || q4.accuracy == null) return null;
  const fade = q1.accuracy - q4.accuracy > 0.12;
  const rush =
    q1.avgSeconds != null &&
    q4.avgSeconds != null &&
    q4.avgSeconds < q1.avgSeconds * 0.65;
  if (!fade && !rush) {
    return (
      <p className="mt-2 text-sm text-ballpoint">
        Quarters hold steady — no fade, no end-rush on record.
      </p>
    );
  }
  return (
    <div className="mt-2 space-y-1 text-sm">
      {fade && (
        <p>
          <span className="font-medium text-redpen">Late-section fade:</span>{" "}
          <span className="text-graphite">
            accuracy drops {Math.round((q1.accuracy - q4.accuracy) * 100)}{" "}
            points from Q1 to Q4. That is stamina, not knowledge — train
            full sections, not fragments.
          </span>
        </p>
      )}
      {rush && (
        <p>
          <span className="font-medium text-amber">End-rushing:</span>{" "}
          <span className="text-graphite">
            Q4 answers take{" "}
            {Math.round(((q4.avgSeconds ?? 0) / (q1.avgSeconds ?? 1)) * 100)}%
            of Q1&apos;s time. The early questions are borrowing minutes the
            late ones repay in guesses.
          </span>
        </p>
      )}
    </div>
  );
}

type HeatRow = {
  subtopic: Subtopic;
  counts: Record<ErrorType, number>;
  crossTopic?: number;
};

/** Subtopic × error-type grid. Cells mix the redpen toward the surface
 *  token (not literal white) so the ramp reads in both themes. */
function HeatTable({
  rows,
  max,
  redpen,
  meta,
}: {
  rows: HeatRow[];
  max: number;
  redpen: string;
  meta?: (row: HeatRow) => React.ReactNode;
}) {
  return (
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
          {rows.map((row) => (
            <tr key={row.subtopic}>
              <td className="whitespace-nowrap pr-3 text-xs">
                {SUBTOPIC_LABELS[row.subtopic]}
                {meta?.(row)}
              </td>
              {ERROR_TYPES.map((et) => {
                const count = row.counts[et];
                const intensity = max > 0 ? count / max : 0;
                return (
                  <td key={et} className="p-0.5">
                    <div
                      title={`${SUBTOPIC_LABELS[row.subtopic]} × ${ERROR_TYPE_LABELS[et]}: ${count}`}
                      className="flex h-8 w-16 items-center justify-center rounded-[4px] border border-grid font-mono text-xs"
                      style={{
                        backgroundColor:
                          count === 0
                            ? "transparent"
                            : `color-mix(in srgb, ${redpen} ${Math.round(
                                12 + intensity * 68,
                              )}%, var(--surface))`,
                        color:
                          intensity > 0.55 ? "var(--paper)" : "var(--ink)",
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
  );
}

/** One-click drill sets assembled from the questions where a given slip
 *  historically occurs. */
function SlipSiteLinks({
  slipSites,
}: {
  slipSites: Partial<Record<ErrorType, number[]>>;
}) {
  const entries = ERROR_TYPES.filter(
    (et) => (slipSites[et]?.length ?? 0) >= 2,
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs">
      <span className="text-graphite">
        Re-solve the questions where each slip happened:
      </span>
      {entries.map((et) => (
        <a
          key={et}
          href={`/drill?qids=${slipSites[et]!.join(",")}`}
          className="text-ballpoint hover:underline"
        >
          {ERROR_TYPE_LABELS[et]} ({slipSites[et]!.length}) →
        </a>
      ))}
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
