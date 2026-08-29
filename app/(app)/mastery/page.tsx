import Link from "next/link";
import { SectionTabs } from "@/components/section-tabs";
import { requireFeature } from "@/lib/billing/entitlements";
import { getI18n } from "@/lib/i18n/server";
import { formatPercent } from "@/lib/i18n/format";
import { skillLabel, subtopicLabel } from "@/lib/i18n/labels";
import { computeLadders, MASTERY_BAR, MIN_ATTEMPTS } from "@/lib/mastery";
import {
  FUNDAMENTAL_SKILLS,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function MasteryPage() {
  const { sdb } = await requireFeature("mastery");
  const { locale, t } = await getI18n();
  const ladders = await computeLadders(sdb);
  const masteredCount = ladders.filter((l) => l.mastered).length;

  return (
    <div className="space-y-4">
      <SectionTabs group="progress" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">
          {t("pages.mastery")}
        </h1>
        <p className="text-xs text-graphite">
          {t("pages.masteryLede", {
            bar: formatPercent(MASTERY_BAR, locale),
            minimum: MIN_ATTEMPTS,
            mastered: masteredCount,
            total: ladders.length,
          })}
        </p>
      </div>

      {FUNDAMENTAL_SKILLS.map((skill) => (
        <section
          key={skill}
          className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
        >
          <h2 className="font-display text-sm font-semibold">
            {skillLabel(t, skill)}
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
                      {subtopicLabel(t, ladder.subtopic)}
                    </h3>
                    {ladder.mastered && (
                      <span className="font-mono text-[10px] font-semibold text-ballpoint">
                        {t("pages.masteryClimbed")}
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
                              "border-ballpoint bg-ballpoint text-white",
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
        </section>
      ))}
    </div>
  );
}
