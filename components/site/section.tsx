import { cn } from "@/lib/utils";

/**
 * The public site's one layout primitive: a section on a hairline, with a
 * mono eyebrow and a display heading, at one of two measures.
 *
 * Having exactly one of these is what keeps the site reading as a single
 * committed design rather than as a stack of unrelated blocks.
 */
export function Section({
  eyebrow,
  title,
  lede,
  children,
  className,
  rule = true,
  wide = false,
}: {
  eyebrow?: string;
  title?: string;
  lede?: string;
  children?: React.ReactNode;
  className?: string;
  rule?: boolean;
  wide?: boolean;
}) {
  return (
    <section
      className={cn(
        "mx-auto w-full px-5 sm:px-8",
        wide ? "max-w-[1180px]" : "max-w-[980px]",
        className,
      )}
    >
      <div className={cn("py-16 sm:py-24", rule && "rule-top")}>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && (
          <h2 className="mt-3 max-w-[18ch] text-[clamp(1.75rem,4vw,2.6rem)]">
            {title}
          </h2>
        )}
        {lede && (
          <p className="measure-tight mt-4 text-lg leading-relaxed text-graphite">
            {lede}
          </p>
        )}
        {children && <div className={cn(title || lede ? "mt-10" : "")}>{children}</div>}
      </div>
    </section>
  );
}
