import { AnalyticsClient } from "@/components/analytics/analytics-client";
import { gatherAnalytics } from "@/lib/analytics";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default function AnalyticsPage() {
  const data = gatherAnalytics();

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Analytics</h1>
      <AnalyticsClient data={data} />
    </div>
  );
}
