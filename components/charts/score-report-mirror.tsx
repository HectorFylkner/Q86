"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Figure } from "@/components/charts/chart-kit";
import type { MirrorPair, ScoreReportMirror } from "@/lib/analytics";
import { ordinal } from "@/lib/utils";

/**
 * The score-report mirror.
 *
 * Laid out the way the official Focus report is — total on top, the three
 * section scores beneath it, then the Quant breakdowns by fundamental
 * skill, content domain and context — so an imported report and the
 * platform's own numbers can be read side by side without translation.
 *
 * The two columns are deliberately NOT drawn on a shared axis: a report
 * percentile and a platform accuracy are different quantities, and
 * plotting them against one common scale would invite a comparison that
 * is not valid. They share a row, not a scale — which is exactly the
 * comparison that *is* valid: same cut, two independent readings.
 *
 * Platform accuracy counts Quant-format items only. Data Sufficiency
 * moved to Data Insights on the Focus Edition, so folding it in here
 * would make the mirror disagree with the report it mirrors.
 */
export function ScoreReportMirrorCard({ data }: { data: ScoreReportMirror }) {
  const hasReport = data.reportedAt != null;

  return (
    <Figure
      title="Score-report mirror"
      caption={
        <>
          The official report&apos;s cuts, in the official order, beside the
          platform&apos;s own reading of the same cuts.{" "}
          {hasReport ? (
            <>
              Imported{" "}
              {format(new Date(data.reportedAt as unknown as Date), "d MMM yyyy")}.
            </>
          ) : (
            <>
              No report imported yet —{" "}
              <Link href="/import" className="text-ballpoint hover:underline">
                import one
              </Link>{" "}
              and the left column fills in.
            </>
          )}{" "}
          {data.dataInsightsExcluded > 0 && (
            <>
              {data.dataInsightsExcluded} Data Sufficiency attempts are
              excluded: DS is a Data Insights format on the Focus Edition,
              not a Quant one.
            </>
          )}
        </>
      }
    >
      {hasReport && (
        <div className="mb-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-control border border-ink/15 bg-highlight/50 px-3 py-2">
            <p className="font-mono text-micro uppercase tracking-wider text-graphite">
              Total score
            </p>
            <p className="text-figure font-semibold">
              {data.totalScore ?? "—"}
            </p>
          </div>
          {data.sections.map((s) => (
            <div
              key={s.section}
              className="rounded-control border border-grid px-3 py-2"
            >
              <p className="truncate font-mono text-micro uppercase tracking-wider text-graphite">
                {s.label}
              </p>
              <p className="text-figure font-semibold">
                {s.scaledScore ?? "—"}
              </p>
              <p className="text-micro text-graphite">
                {s.percentile != null ? `${ordinal(s.percentile)} pct` : "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-5">
        <MirrorSection
          heading="Fundamental skills"
          rows={data.skills}
          reportedColor="var(--graphite)"
          platformColor="var(--ballpoint)"
        />
        <MirrorSection
          heading="Content domains"
          rows={data.domains}
          reportedColor="var(--graphite)"
          platformColor="var(--ballpoint)"
        />
        <MirrorSection
          heading="Contexts"
          rows={data.contexts}
          reportedColor="var(--graphite)"
          platformColor="var(--ballpoint)"
        />
      </div>
    </Figure>
  );
}

function MirrorSection({
  heading,
  rows,
  reportedColor,
  platformColor,
}: {
  heading: string;
  rows: MirrorPair[];
  reportedColor: string;
  platformColor: string;
}) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 border-b border-grid pb-1">
        <h4 className="font-display text-body font-semibold">{heading}</h4>
        <p className="flex gap-3 font-mono text-micro uppercase tracking-wider text-graphite">
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: reportedColor }}
            />
            report pct
          </span>
          <span className="flex items-center gap-1">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: platformColor }}
            />
            platform acc
          </span>
        </p>
      </div>
      {/* The meters have a hard minimum width; contain their scroll inside
          the card rather than letting the page scroll sideways. */}
      <div className="overflow-x-auto">
      <table className="w-full min-w-[440px] border-collapse text-left">
        <caption className="sr-only">
          {heading}: the imported report&apos;s percentile and the
          platform&apos;s accuracy over Quant-format attempts, per category.
          The two are different quantities and share a row, not a scale.
        </caption>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-grid/60 last:border-0">
              <th
                scope="row"
                className="w-[38%] py-2 pr-3 text-body font-normal"
              >
                {row.label}
              </th>
              <td className="w-[26%] py-2 pr-3">
                <Meter
                  value={row.reported}
                  color={reportedColor}
                  format={ordinal}
                  emptyLabel="not in report"
                />
              </td>
              <td className="py-2">
                <Meter
                  value={row.platform}
                  color={platformColor}
                  format={(v) => `${v}%`}
                  emptyLabel="no attempts"
                  note={row.platformTotal > 0 ? `n=${row.platformTotal}` : undefined}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </section>
  );
}

function Meter({
  value,
  color,
  format: formatValue,
  emptyLabel,
  note,
}: {
  value: number | null;
  color: string;
  format: (value: number) => string;
  emptyLabel: string;
  note?: string;
}) {
  if (value == null) {
    return <span className="text-caption text-graphite">{emptyLabel}</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 min-w-[48px] flex-1 rounded-full bg-grid">
        <div
          className="h-2 rounded-full"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-11 shrink-0 text-right font-mono text-caption font-medium tabular-nums">
        {formatValue(value)}
      </span>
      {note && (
        <span className="w-10 shrink-0 font-mono text-micro text-graphite">
          {note}
        </span>
      )}
    </div>
  );
}
