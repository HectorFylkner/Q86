/**
 * A designed first-run moment: a dashed, unfilled region of the paper
 * with a mono kicker, the reason it's blank, and the next pen stroke.
 */
export function EmptyState({
  kicker,
  action,
  children,
}: {
  kicker: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-dashed border-grid bg-surface/60 px-6 py-10 text-center">
      <p className="font-mono text-micro uppercase tracking-wider text-graphite">
        {kicker}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-graphite">{children}</p>
      {action && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">{action}</div>
      )}
    </section>
  );
}
