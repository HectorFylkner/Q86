import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { gatherAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AnalyticsPage() {
  const data = gatherAnalytics();

  return (
    <div className="space-y-4">
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
      <AnalyticsClient data={data} />
    </div>
  );
}
