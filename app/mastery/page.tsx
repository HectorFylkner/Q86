import Link from "next/link";
import { SectionTabs } from "@/components/section-tabs";
import { SectionCard } from "@/components/ui/card";
import { computeLadders, MASTERY_BAR, MIN_ATTEMPTS } from "@/lib/mastery";
import {
  FUNDAMENTAL_SKILLS,
  SKILL_LABELS,
  SUBTOPIC_LABELS,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MasteryPage() {
  const ladders = await computeLadders();
  const masteredCount = ladders.filter((l) => l.mastered).length;

  return (
    <div className="space-y-4">
      <SectionTabs group="progress" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">Mastery ladders</h1>
        <p className="text-xs text-graphite">
          A rung clears at ≥{Math.round(MASTERY_BAR * 100)}% over your last 10
          attempts (minimum {MIN_ATTEMPTS}). {masteredCount} of{" "}
          {ladders.length} ladders fully climbed.
        </p>
      </div>

      {FUNDAMENTAL_SKILLS.map((skill) => (
        <SectionCard key={skill} title={SKILL_LABELS[skill]}>
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
                      {SUBTOPIC_LABELS[ladder.subtopic]}
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
                          title={
                            rung.state === "empty"
                              ? `D${rung.difficulty}: no questions in the bank`
                              : `D${rung.difficulty}: ${rung.correct}/${rung.total} in the last window`
                          }
                          className={cn(
                            "rounded-[4px] border text-center font-mono text-[11px] leading-6",
                            rung.state === "mastered" &&
                              "border-ballpoint bg-ballpoint text-on-ballpoint",
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
                  {ladder.currentRung != null && (
                    <Link
                      href={`/drill?sub=${ladder.subtopic}&d=${ladder.currentRung}`}
                      className="mt-2 inline-block text-xs font-medium text-ballpoint hover:underline"
                    >
                      Work rung D{ladder.currentRung} →
                    </Link>
                  )}
                </div>
              ))}
          </div>
        </SectionCard>
      ))}
    </div>
  );
}
