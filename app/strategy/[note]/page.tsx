import Link from "next/link";
import { notFound } from "next/navigation";
import { headingAnchor, Md } from "@/components/math";
import { readStrategyNote } from "@/lib/strategy-content";
import {
  noteSections,
  STRATEGY_NOTES,
  STRATEGY_NOTE_TITLES,
  type StrategyNoteId,
} from "@/lib/strategy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function StrategyNotePage({
  params,
}: {
  params: Promise<{ note: string }>;
}) {
  const { note } = await params;
  if (!STRATEGY_NOTES.includes(note as StrategyNoteId)) notFound();
  const id = note as StrategyNoteId;
  const doc = readStrategyNote(id);
  if (!doc) notFound();
  const sections = noteSections(doc.body);
  const others = STRATEGY_NOTES.filter((n) => n !== id);

  return (
    <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_190px] lg:gap-10">
      <div className="min-w-0 space-y-5 lg:max-w-3xl">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
            <Link href="/strategy" className="hover:text-ink">
              Strategy
            </Link>{" "}
            · Playbook
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            {doc.title}
          </h1>
        </div>

        <article className="rounded-card border border-grid bg-surface p-6 shadow-ambient sm:p-8">
          <Md source={doc.body} className="text-[15px]" />
        </article>

        <div className="grid gap-2 border-t border-grid pt-4 sm:grid-cols-3">
          {others.map((n) => (
            <Link
              key={n}
              href={`/strategy/${n}`}
              className="group rounded-card border border-grid bg-surface p-3.5 shadow-ambient transition-colors hover:border-ballpoint/50"
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">
                Also in the playbook
              </span>
              <span className="mt-1 block text-sm font-medium group-hover:text-ballpoint">
                {STRATEGY_NOTE_TITLES[n]}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <aside className="hidden lg:block">
        <nav className="sticky top-20">
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">
            In this note
          </p>
          <ul className="mt-2 space-y-1.5">
            {sections.map((s) => (
              <li key={s}>
                <a
                  href={`#${headingAnchor(s)}`}
                  className="text-xs leading-snug text-graphite transition-colors hover:text-ballpoint"
                >
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}
