import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { SectionTabs } from "@/components/section-tabs";
import { FlagsCard } from "@/components/analytics/flags-card";
import { TechniqueCard } from "@/components/analytics/technique-card";
import { InferenceCard } from "@/components/analytics/inference-card";
import { gatherAnalytics } from "@/lib/analytics";
import { strategyReport } from "@/lib/strategy-server";
import { suggestionAgreement } from "@/lib/inference-audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AnalyticsPage() {
  const data = await gatherAnalytics();
  const strategies = await strategyReport();
  const inference = await suggestionAgreement();

  return (
    <div className="space-y-4">
      <SectionTabs group="progress" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">Analytics</h1>
        {data.casualExcluded > 0 && (
          <p className="text-xs text-graphite">
            {data.casualExcluded} casual-session attempt
            {data.casualExcluded === 1 ? "" : "s"} excluded from every figure
            on this page.
          </p>
        )}
      </div>
      {data.attemptCount > 0 && <TechniqueCard report={strategies} />}
      <AnalyticsClient data={data} />
      <InferenceCard data={inference} />
      <FlagsCard />
    </div>
  );
}
