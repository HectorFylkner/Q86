type SummaryMetricProps = {
  label: string;
  value: string;
  detail: string;
};

export function SummaryMetric({
  label,
  value,
  detail,
}: SummaryMetricProps) {
  return (
    <div className="rounded-card border border-grid bg-surface p-3 shadow-ambient sm:p-4">
      <p className="font-mono text-[10px] uppercase tracking-wide text-graphite">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-graphite">{detail}</p>
    </div>
  );
}
