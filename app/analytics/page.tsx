import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { SectionTabs } from "@/components/section-tabs";
import { FlagsCard } from "@/components/analytics/flags-card";
import { gatherAnalytics } from "@/lib/analytics";
import { requireFeature } from "@/lib/billing/entitlements";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AnalyticsPage() {
  const { sdb } = await requireFeature("analytics");
  const t = await getT();
  const data = await gatherAnalytics(sdb);

  return (
    <div className="space-y-4">
      <SectionTabs group="progress" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">
          {t("pages.analytics")}
        </h1>
        {data.casualExcluded > 0 && (
          <p className="text-xs text-graphite">
            {t("pages.analyticsCasual", { count: data.casualExcluded })}
          </p>
        )}
      </div>
      <AnalyticsClient data={data} />
      <FlagsCard />
    </div>
  );
}
