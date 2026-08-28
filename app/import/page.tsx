import { desc } from "drizzle-orm";
import { SectionTabs } from "@/components/section-tabs";
import { ImportClient } from "@/components/import/import-client";
import { requireFeature } from "@/lib/billing/entitlements";
import { getI18n } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { skillShortLabel } from "@/lib/i18n/labels";
import { baselineReports } from "@/lib/db/schema";
import type { FundamentalSkill } from "@/lib/taxonomy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ImportPage() {
  const { sdb } = await requireFeature("import");
  const { locale, t } = await getI18n();
  const reports = await sdb.q
    .select()
    .from(baselineReports)
    .where(sdb.own(baselineReports))
    .orderBy(desc(baselineReports.createdAt))
    .all();

  return (
    <div className="space-y-5">
      <SectionTabs group="progress" />
      <h1 className="font-display text-xl font-semibold">
        {t("pages.import")}
      </h1>
      <ImportClient />

      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold">
              {t("pages.importBackupTitle")}
            </h2>
            <p className="mt-0.5 text-xs text-graphite">
              {t("pages.importBackupLede")}
            </p>
          </div>
          <a
            href="/api/export"
            download
            className="rounded-control border border-grid px-4 py-2 text-sm font-medium transition-colors hover:border-ballpoint/50 hover:text-ballpoint"
          >
            {t("pages.importBackupButton")}
          </a>
        </div>
      </section>

      {reports.length > 0 && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-sm font-semibold">
            {t("pages.importBaselines", { count: reports.length })}
          </h2>
          <p className="mt-0.5 text-xs text-graphite">
            {t("pages.importBaselinesLede")}
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
                    {formatDate(new Date(r.createdAt), locale, "numeric")}
                  </span>
                  <span>
                    {parsed.test_date
                      ? `${t("pages.importTest", { date: parsed.test_date })} · `
                      : ""}
                    Quant {quant?.scaled_score ?? "—"}
                  </span>
                  <span className="text-xs text-graphite">
                    {(parsed.fundamental_skills ?? [])
                      .map(
                        (s) =>
                          `${skillShortLabel(t, s.skill)} ${s.percentile}`,
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
