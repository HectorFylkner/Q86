import type { ReactNode } from "react";
import { splitList as split, type DirectiveName } from "@/lib/directives";

/**
 * Renderers for the Md dialect's named visual directives — the handful
 * of diagrams where the picture IS the method. Each is a constrained
 * text directive ("::name key=value …" alone on a line), never general
 * HTML or images; grammar and validation live in lib/directives.ts.
 *
 *   ::set-matrix rows="Desk,No desk" cols="Lamp,No lamp"
 *     cells="12,8,?,15" total="40"
 *   ::number-line min=-4 max=4 points="-2:closed:-2,3:open:3"
 *     zones="-2..3:solution"
 *   ::rate-timeline max=8 unit="h" rows="Pump A:0..5,Pump B:2..8"
 */

/** The classic 2×2 double-set matrix with a totals row and column.
 *  cells are a,b,c,d row-major; "?" (or any non-number) renders as the
 *  unknown being solved for. */
function SetMatrix({ params }: { params: Record<string, string> }) {
  const rows = split(params.rows);
  const cols = split(params.cols);
  const cells = split(params.cells);
  if (rows.length !== 2 || cols.length !== 2 || cells.length !== 4) {
    return null;
  }
  const total = params.total ?? "";
  const num = (s: string): number | null => {
    const n = Number(s);
    return Number.isFinite(n) && s !== "" ? n : null;
  };
  const sumOr = (parts: Array<number | null>, fallback: string): string => {
    if (parts.some((p) => p == null)) return fallback;
    return String((parts as number[]).reduce((s, n) => s + n, 0));
  };
  const [a, b, c, d] = cells;
  const rowTotals = [
    sumOr([num(a), num(b)], ""),
    sumOr([num(c), num(d)], ""),
  ];
  const colTotals = [
    sumOr([num(a), num(c)], ""),
    sumOr([num(b), num(d)], ""),
  ];
  const cellCls =
    "border border-grid px-3 py-1.5 text-center font-mono text-sm";
  const headCls =
    "border border-grid bg-highlight/60 px-3 py-1.5 text-center text-xs text-graphite";
  const totalCls =
    "border border-grid bg-highlight/40 px-3 py-1.5 text-center font-mono text-xs text-graphite";
  return (
    <div className="overflow-x-auto">
      <table className="border-collapse">
        <thead>
          <tr>
            <th className={headCls} />
            <th className={headCls}>{cols[0]}</th>
            <th className={headCls}>{cols[1]}</th>
            <th className={headCls}>Total</th>
          </tr>
        </thead>
        <tbody>
          {[0, 1].map((r) => (
            <tr key={r}>
              <th className={headCls}>{rows[r]}</th>
              {[cells[r * 2], cells[r * 2 + 1]].map((cell, i) => (
                <td
                  key={i}
                  className={
                    cellCls +
                    (num(cell) == null ? " font-semibold text-ballpoint" : "")
                  }
                >
                  {cell}
                </td>
              ))}
              <td className={totalCls}>{rowTotals[r]}</td>
            </tr>
          ))}
          <tr>
            <th className={headCls}>Total</th>
            <td className={totalCls}>{colTotals[0]}</td>
            <td className={totalCls}>{colTotals[1]}</td>
            <td className={totalCls + " font-semibold"}>{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** A number line with open/closed points and labeled shaded zones —
 *  the picture behind absolute-value and inequality reasoning.
 *  points="v:open|closed:label,…" zones="from..to:label,…" */
function NumberLine({ params }: { params: Record<string, string> }) {
  const min = Number(params.min);
  const max = Number(params.max);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max) {
    return null;
  }
  const W = 560;
  const H = 76;
  const PAD = 28;
  const x = (v: number) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);
  const points = split(params.points).map((p) => {
    const [v, kind, label] = p.split(":");
    return { v: Number(v), open: kind === "open", label: label ?? v };
  });
  const zones = split(params.zones).map((z) => {
    const [range, label] = z.split(":");
    const [from, to] = range.split("..").map(Number);
    return { from, to, label: label ?? "" };
  });
  const ticks: number[] = [];
  for (let t = Math.ceil(min); t <= Math.floor(max); t++) ticks.push(t);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Number line from ${min} to ${max}`}
      className="max-w-full"
      style={{ width: W }}
    >
      {zones.map(
        (z, i) =>
          Number.isFinite(z.from) &&
          Number.isFinite(z.to) && (
            <g key={i}>
              <rect
                x={x(z.from)}
                y={30}
                width={Math.max(0, x(z.to) - x(z.from))}
                height={12}
                className="fill-ballpoint/20"
              />
              {z.label && (
                <text
                  x={(x(z.from) + x(z.to)) / 2}
                  y={20}
                  textAnchor="middle"
                  className="fill-ballpoint font-mono"
                  fontSize={11}
                >
                  {z.label}
                </text>
              )}
            </g>
          ),
      )}
      <line
        x1={PAD - 10}
        y1={36}
        x2={W - PAD + 10}
        y2={36}
        strokeWidth={1.5}
        className="stroke-graphite"
      />
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            y1={32}
            x2={x(t)}
            y2={40}
            strokeWidth={1}
            className="stroke-graphite"
          />
          <text
            x={x(t)}
            y={58}
            textAnchor="middle"
            className="fill-graphite font-mono"
            fontSize={10}
          >
            {t}
          </text>
        </g>
      ))}
      {points.map(
        (p, i) =>
          Number.isFinite(p.v) && (
            <g key={i}>
              <circle
                cx={x(p.v)}
                cy={36}
                r={5}
                strokeWidth={1.8}
                className={
                  p.open
                    ? "fill-surface stroke-redpen"
                    : "fill-redpen stroke-redpen"
                }
              />
              <text
                x={x(p.v)}
                y={72}
                textAnchor="middle"
                className="fill-redpen font-mono"
                fontSize={10}
              >
                {p.label}
              </text>
            </g>
          ),
      )}
    </svg>
  );
}

/** Horizontal work/travel spans on a shared clock — who is active
 *  when, for rate and meeting problems. rows="Label:from..to,…" */
function RateTimeline({ params }: { params: Record<string, string> }) {
  const max = Number(params.max);
  if (!Number.isFinite(max) || max <= 0) return null;
  const unit = params.unit ?? "";
  const rows = split(params.rows).flatMap((r) => {
    const at = r.lastIndexOf(":");
    if (at < 0) return [];
    const label = r.slice(0, at).trim();
    const [from, to] = r.slice(at + 1).split("..").map(Number);
    if (!Number.isFinite(from) || !Number.isFinite(to)) return [];
    return [{ label, from, to }];
  });
  if (rows.length === 0) return null;
  const W = 560;
  const LABEL = 110;
  const ROW_H = 26;
  const AXIS_H = 26;
  const H = rows.length * ROW_H + AXIS_H;
  const x = (v: number) => LABEL + (v / max) * (W - LABEL - 12);
  const ticks: number[] = [];
  const step = max <= 12 ? 1 : Math.ceil(max / 10);
  for (let t = 0; t <= max; t += step) ticks.push(t);
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Timeline of active intervals"
      className="max-w-full"
      style={{ width: W }}
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            y1={0}
            x2={x(t)}
            y2={rows.length * ROW_H}
            strokeWidth={0.75}
            className="stroke-grid"
          />
          <text
            x={x(t)}
            y={rows.length * ROW_H + 16}
            textAnchor="middle"
            className="fill-graphite font-mono"
            fontSize={10}
          >
            {t}
            {unit}
          </text>
        </g>
      ))}
      {rows.map((r, i) => (
        <g key={i}>
          <text
            x={LABEL - 8}
            y={i * ROW_H + ROW_H / 2 + 4}
            textAnchor="end"
            className="fill-ink"
            fontSize={12}
          >
            {r.label}
          </text>
          <rect
            x={x(Math.max(0, r.from))}
            y={i * ROW_H + 5}
            width={Math.max(0, x(Math.min(max, r.to)) - x(Math.max(0, r.from)))}
            height={ROW_H - 10}
            rx={4}
            className={i % 2 === 0 ? "fill-ballpoint/70" : "fill-amber/70"}
          />
        </g>
      ))}
    </svg>
  );
}

export function renderDirective(
  name: DirectiveName,
  params: Record<string, string>,
): ReactNode {
  switch (name) {
    case "set-matrix":
      return <SetMatrix params={params} />;
    case "number-line":
      return <NumberLine params={params} />;
    case "rate-timeline":
      return <RateTimeline params={params} />;
  }
}
