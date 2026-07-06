import { cn } from "@/lib/utils";

/** The exam-paper card: solid surface over the graph-paper shell. */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-grid bg-surface shadow-ambient",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-card border border-grid bg-surface p-4 shadow-ambient",
        className,
      )}
    >
      <h2 className="font-display text-sm font-semibold">{title}</h2>
      {subtitle && (
        <p className="mb-3 mt-0.5 text-xs text-graphite">{subtitle}</p>
      )}
      {children}
    </section>
  );
}
