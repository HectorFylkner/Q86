import Link from "next/link";

/**
 * The frame every credential screen shares. Deliberately narrow and
 * unadorned: the app's graph-paper ground shows through, the card is the
 * only surface, and nothing competes with the form.
 */
export function AuthShell({
  title,
  lede,
  children,
  footer,
}: {
  title: string;
  lede: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto mt-10 w-full max-w-[26rem] sm:mt-16">
      <Link
        href="/"
        className="font-display text-2xl font-bold tracking-tight text-ink"
      >
        Q86
      </Link>
      <div className="mt-4 rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <h1 className="font-display text-lg font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-graphite">{lede}</p>
        <div className="mt-5">{children}</div>
      </div>
      {footer && (
        <div className="mt-4 text-center text-sm text-graphite">{footer}</div>
      )}
    </div>
  );
}

export function FieldLabel({
  children,
  htmlFor,
}: {
  children: React.ReactNode;
  htmlFor: string;
}) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-graphite">
      {children}
    </label>
  );
}

export const inputClass =
  "mt-1 w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm text-ink";

export const submitClass =
  "w-full rounded-control bg-ballpoint px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60";
