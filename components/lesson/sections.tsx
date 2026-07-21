import type { ReactNode } from "react";
import { Md } from "@/components/math";
import type { Cue, Titled } from "@/lib/lesson-parse";

/** Numbered section frame: kicker index + display heading + tagline. */
export function SectionShell({
  id,
  index,
  title,
  tagline,
  children,
}: {
  id: string;
  index: number;
  title: string;
  tagline?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="min-w-0 scroll-mt-24">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span className="font-mono text-[11px] font-medium text-ballpoint">
          {String(index).padStart(2, "0")}
        </span>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {tagline && (
          <span className="text-xs text-graphite">{tagline}</span>
        )}
      </div>
      {children}
    </section>
  );
}

/** "Why this matters" — a lede, not a card: bigger type, ballpoint rule. */
export function WhyLede({ source }: { source: string }) {
  return (
    <div className="border-l-2 border-ballpoint pl-4 sm:pl-5">
      <Md source={source} className="max-w-[70ch] text-[16px] leading-7" />
    </div>
  );
}

/** "The core ideas" — one numbered card per rule. */
export function CoreIdeas({
  intro,
  ideas,
}: {
  intro: string;
  ideas: string[];
}) {
  return (
    <div className="space-y-2">
      {intro && <Md source={intro} className="text-sm text-graphite" />}
      {ideas.map((idea, i) => (
        <div
          key={i}
          className="flex gap-3.5 rounded-card border border-grid bg-surface p-4 shadow-ambient sm:px-5"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ballpoint/10 font-mono text-[11px] font-medium text-ballpoint">
            {i + 1}
          </span>
          <Md source={idea} className="min-w-0 max-w-[70ch] flex-1 text-[14.5px]" />
        </div>
      ))}
    </div>
  );
}

/** "Trigger cues" — phrase → method pairs as recognition cards. */
export function CueGrid({ cues }: { cues: Cue[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {cues.map((cue, i) => (
        <div
          key={i}
          className="flex flex-col rounded-card border border-grid bg-surface p-4 shadow-ambient sm:px-5"
        >
          <p className="font-mono text-[10px] uppercase tracking-wider text-graphite">
            When you see
          </p>
          <Md source={cue.see} className="mt-1 text-sm font-medium" />
          {cue.act && (
            <>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-ballpoint">
                → Reach for
              </p>
              <Md source={cue.act} className="mt-1 text-sm text-graphite" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function TitledCard({
  item,
  accent,
  marker,
}: {
  item: Titled;
  accent: "redpen" | "amber";
  marker: string;
}) {
  const accentText = accent === "redpen" ? "text-redpen" : "text-amber";
  const accentBorder =
    accent === "redpen" ? "border-l-redpen/70" : "border-l-amber/70";
  return (
    <div
      className={`rounded-card border border-grid border-l-2 ${accentBorder} bg-surface p-4 shadow-ambient sm:px-5`}
    >
      <div className="flex gap-2.5">
        <span
          className={`select-none font-mono text-[13px] leading-6 ${accentText}`}
          aria-hidden
        >
          {marker}
        </span>
        <div className="min-w-0 flex-1">
          {item.name && (
            <Md source={`**${item.name}**`} className="text-sm" />
          )}
          <Md
            source={item.body}
            className={`text-sm text-graphite ${item.name ? "mt-0.5" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}

/** "Trap gallery" — the classic wrong turns, marked in red pen. */
export function TrapGallery({ traps }: { traps: Titled[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {traps.map((t, i) => (
        <TitledCard key={i} item={t} accent="redpen" marker="✗" />
      ))}
    </div>
  );
}

/** "Speed moves" — legitimate shortcuts, marked in amber. */
export function SpeedMoves({ moves }: { moves: Titled[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {moves.map((m, i) => (
        <TitledCard key={i} item={m} accent="amber" marker="≫" />
      ))}
    </div>
  );
}
