import { desc } from "drizzle-orm";
import { format } from "date-fns";
import { ImportClient } from "@/components/import/import-client";
import { db } from "@/lib/db";
import { baselineReports } from "@/lib/db/schema";
import { SKILL_SHORT_LABELS, type FundamentalSkill } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ImportPage() {
  const reports = await db
    .select()
    .from(baselineReports)
    .orderBy(desc(baselineReports.createdAt))
    .all();

  return (
    <div className="space-y-5">
      <h1 className="font-display text-xl font-semibold">
        Score-report import
      </h1>
      <ImportClient />

      {reports.length > 0 && (
        <section className="rounded-[10px] border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-sm font-semibold">
            Imported baselines · {reports.length}
          </h2>
          <p className="mt-0.5 text-xs text-graphite">
            The most recent import seeds the daily plan&apos;s weakness
            weights.
          </p>
          <ul className="mt-2 space-y-1.5">
            {reports.map((r) => {
              const parsed = r.parsed as {
                test_date?: string | null;
                sections?: Array<{
                  section: string;
                  scaled_score: number | null;
                }>;
                fundamental_skills?: Array<{
                  skill: FundamentalSkill;
                  percentile: number;
                }>;
              };
              const quant = parsed.sections?.find((s) => s.section === "quant");
              return (
                <li key={r.id} className="flex flex-wrap gap-x-3 text-sm">
                  <span className="font-mono text-xs text-graphite">
                    {format(new Date(r.createdAt), "yyyy-MM-dd")}
                  </span>
                  <span>
                    {parsed.test_date ? `test ${parsed.test_date} · ` : ""}
                    Quant {quant?.scaled_score ?? "—"}
                  </span>
                  <span className="text-xs text-graphite">
                    {(parsed.fundamental_skills ?? [])
                      .map(
                        (s) =>
                          `${SKILL_SHORT_LABELS[s.skill]} ${s.percentile}th`,
                      )
                      .join(" · ")}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
