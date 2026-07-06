import Link from "next/link";
import { SectionTabs } from "@/components/section-tabs";
import {
  computeLadders,
  MASTERY_BAR,
  MIN_ATTEMPTS,
  PACE_BAR_SECONDS,
  STALE_DAYS,
  type Rung,
} from "@/lib/mastery";
import {
  FUNDAMENTAL_SKILLS,
  SKILL_LABELS,
  SUBTOPIC_LABELS,
} from "@/lib/taxonomy";
import { cn, formatSeconds } from "@/lib/utils";

function rungTitle(rung: Rung): string {
  if (rung.state === "empty") {
    return `D${rung.difficulty}: no questions in the bank`;
  }
  const base = `D${rung.difficulty}: ${rung.correct}/${rung.total} in the last window`;
  const pace =
    rung.medianSeconds != null
      ? `, median ${formatSeconds(rung.medianSeconds)} (bar ${formatSeconds(
          PACE_BAR_SECONDS[rung.difficulty],
        )})`
      : "";
  if (rung.state === "stale") {
    return `${base} — last attempt ${rung.daysSinceLast} days ago; confirm it still holds`;
  }
  if (rung.state === "slow") {
    return `${base}${pace} — accurate but over the pace bar`;
  }
  return `${base}${pace}`;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MasteryPage() {
  const ladders = await computeLadders();
  const masteredCount = ladders.filter((l) => l.mastered).length;

  return (
    <div className="space-y-4">
      <SectionTabs group="progress" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">Mastery ladders</h1>
        <p className="text-xs text-graphite">
          A rung clears at ≥{Math.round(MASTERY_BAR * 100)}% over your last 10
          attempts (minimum {MIN_ATTEMPTS}) at exam pace (
          {formatSeconds(PACE_BAR_SECONDS[3])} at D3 →{" "}
          {formatSeconds(PACE_BAR_SECONDS[5])} at D5), and decays after{" "}
          {STALE_DAYS} days without contact — accurate-but-slow and stale
          rungs show as their own states. {masteredCount} of {ladders.length}{" "}
          ladders fully climbed.
        </p>
      </div>

      {FUNDAMENTAL_SKILLS.map((skill) => (
        <section
          key={skill}
          className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
        >
          <h2 className="font-display text-sm font-semibold">
            {SKILL_LABELS[skill]}
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ladders
              .filter((l) => l.skill === skill)
              .map((ladder) => (
                <div
                  key={ladder.subtopic}
                  className={cn(
                    "rounded-[8px] border p-3",
                    ladder.mastered
                      ? "border-ballpoint/40 bg-ballpoint/5"
                      : "border-grid",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-sm font-medium">
                      <Link
                        href={`/learn/${ladder.subtopic}`}
                        className="hover:text-ballpoint hover:underline"
                      >
                        {SUBTOPIC_LABELS[ladder.subtopic]}
                      </Link>
                    </h3>
                    {ladder.mastered && (
                      <span className="font-mono text-[10px] font-semibold text-ballpoint">
                        CLIMBED
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-end gap-1.5">
                    {ladder.rungs.map((rung) => (
                      <div key={rung.difficulty} className="flex-1">
                        <div
                          title={rungTitle(rung)}
                          className={cn(
                            "rounded-[4px] border text-center font-mono text-[11px] leading-6",
                            rung.state === "mastered" &&
                              "border-ballpoint bg-ballpoint text-white",
                            rung.state === "stale" &&
                              "border-dashed border-ballpoint/70 bg-ballpoint/10 text-ballpoint",
                            rung.state === "slow" &&
                              "border-amber bg-amber text-white",
                            rung.state === "working" &&
                              "border-amber bg-amber/10 text-amber",
                            rung.state === "untouched" &&
                              "border-grid text-graphite",
                            rung.state === "empty" &&
                              "border-dashed border-grid text-graphite/40",
                          )}
                          style={{ height: `${16 + rung.difficulty * 4}px` }}
                        >
                          D{rung.difficulty}
                        </div>
                      </div>
                    ))}
                  </div>
                  {ladder.currentRung != null &&
                    (() => {
                      const rung = ladder.rungs.find(
                        (r) => r.difficulty === ladder.currentRung,
                      );
                      const label =
                        rung?.state === "stale"
                          ? `Confirm D${ladder.currentRung} still holds →`
                          : rung?.state === "slow"
                            ? `D${ladder.currentRung} accurate but slow — speed drill →`
                            : `Work rung D${ladder.currentRung} →`;
                      return (
                        <Link
                          href={`/drill?sub=${ladder.subtopic}&d=${ladder.currentRung}`}
                          className="mt-2 inline-block text-xs font-medium text-ballpoint hover:underline"
                        >
                          {label}
                        </Link>
                      );
                    })()}
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
