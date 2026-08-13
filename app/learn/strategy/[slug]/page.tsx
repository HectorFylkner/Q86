import Link from "next/link";
import { notFound } from "next/navigation";
import { Md } from "@/components/math";
import {
  LessonRail,
  ReadingProgress,
  type RailItem,
} from "@/components/lesson/lesson-rail";
import { SectionShell } from "@/components/lesson/sections";
import {
  STRATEGY_SLUGS,
  listStrategyNotes,
  readStrategyNote,
  type StrategySlug,
} from "@/lib/lessons";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Playbook notes are free-form: H1 title, then "## …" sections rendered
 *  in the chapter section frame. No fixed section names — doctrine reads
 *  as an essay, not a toolkit. */
function splitH2(body: string): Array<{ title: string; body: string }> {
  const out: Array<{ title: string; body: string }> = [];
  let current: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (current) out.push({ title: current, body: buf.join("\n").trim() });
    buf = [];
  };
  for (const line of body.split("\n")) {
    const h = line.match(/^##\s+(.*?)\s*$/);
    if (h && !line.startsWith("###")) {
      flush();
      current = h[1];
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}

function anchor(title: string, i: number): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || `section-${i + 1}`;
}

export default async function StrategyNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!STRATEGY_SLUGS.includes(slug as StrategySlug)) notFound();
  const note = readStrategyNote(slug as StrategySlug);
  if (!note) notFound();

  const notes = listStrategyNotes();
  const at = notes.findIndex((n) => n.slug === slug);
  const meta = at >= 0 ? notes[at] : null;
  const prev = at > 0 ? notes[at - 1] : null;
  const next = at >= 0 && at < notes.length - 1 ? notes[at + 1] : null;

  const sections = splitH2(note.body);
  const rail: RailItem[] = sections.map((s, i) => ({
    id: anchor(s.title, i),
    label: s.title,
  }));

  return (
    <div className="mx-auto max-w-5xl lg:grid lg:grid-cols-[minmax(0,1fr)_190px] lg:gap-10">
      <ReadingProgress />
      <div className="min-w-0 space-y-9 lg:max-w-3xl">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-graphite">
            <Link href="/learn" className="hover:text-ink">
              Learn
            </Link>{" "}
            · The playbook
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold">
            {note.title}
          </h1>
          {meta && (
            <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-[11px] text-graphite">
              <span>
                Note {at + 1} of {notes.length}
              </span>
              <span>~{meta.minutes} min</span>
              <span>applies to every chapter</span>
            </p>
          )}
        </div>

        {sections.map((s, i) => (
          <SectionShell
            key={i}
            id={anchor(s.title, i)}
            index={i + 1}
            title={s.title}
          >
            <div className="border-l-2 border-grid pl-4 sm:pl-5">
              <Md
                source={s.body}
                className="max-w-[70ch] text-[15px] leading-7"
              />
            </div>
          </SectionShell>
        ))}

        {(prev || next) && (
          <div className="grid gap-2 border-t border-grid pt-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/learn/strategy/${prev.slug}`}
                className="group rounded-card border border-grid bg-surface p-4 shadow-ambient transition-colors hover:border-ballpoint/50 sm:px-5"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">
                  ← Previous note
                </span>
                <span className="mt-1 block text-sm font-medium group-hover:text-ballpoint">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span className="hidden sm:block" />
            )}
            {next && (
              <Link
                href={`/learn/strategy/${next.slug}`}
                className="group rounded-card border border-grid bg-surface p-4 text-right shadow-ambient transition-colors hover:border-ballpoint/50 sm:px-5"
              >
                <span className="font-mono text-[10px] uppercase tracking-wider text-graphite">
                  Next note →
                </span>
                <span className="mt-1 block text-sm font-medium group-hover:text-ballpoint">
                  {next.title}
                </span>
              </Link>
            )}
          </div>
        )}
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-20">
          <LessonRail items={rail} />
        </div>
      </aside>
    </div>
  );
}
