import Link from "next/link";
import { SectionTabs } from "@/components/section-tabs";
import { readStrategyNote } from "@/lib/strategy-content";
import { STRATEGY_NOTES, STRATEGY_NOTE_TITLES } from "@/lib/strategy";
import { ERROR_TYPES, ERROR_TYPE_LABELS } from "@/lib/taxonomy";
import { ERROR_TYPE_NOTE } from "@/lib/prescriptions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function StrategyIndexPage() {
  const notes = STRATEGY_NOTES.map((id) => {
    const doc = readStrategyNote(id);
    const words = doc?.body.split(/\s+/).length ?? 0;
    return {
      id,
      title: doc?.title ?? STRATEGY_NOTE_TITLES[id],
      minutes: Math.max(2, Math.round(words / 200)),
      covers: ERROR_TYPES.filter((e) => ERROR_TYPE_NOTE[e] === id),
    };
  });

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <SectionTabs group="learn" />
      <div>
        <h1 className="font-display text-xl font-semibold">Strategy playbook</h1>
        <p className="mt-1 text-sm text-graphite">
          Four notes on the things a subtopic chapter cannot teach: how to
          read your own misses, how to spend the clock, how to read a stem,
          and when a guess is the right move. Every tagged miss in the
          post-mortem routes to one of these.
        </p>
      </div>

      <div className="grid gap-2">
        {notes.map((n) => (
          <Link
            key={n.id}
            href={`/strategy/${n.id}`}
            className="group flex items-start gap-3 rounded-card border border-grid bg-surface px-4 py-3.5 shadow-ambient transition-colors hover:border-ballpoint/50 hover:bg-highlight/40"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium transition-colors group-hover:text-ballpoint">
                {n.title}
              </span>
              <span className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 font-mono text-[11px] text-graphite">
                <span>~{n.minutes} min</span>
                {n.covers.length > 0 && (
                  <span>
                    cures:{" "}
                    {n.covers.map((e) => ERROR_TYPE_LABELS[e]).join(", ")}
                  </span>
                )}
              </span>
            </span>
            <span
              className="mt-0.5 text-graphite/50 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden
            >
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
