import {
  SkeletonChartCard,
  SkeletonPage,
  SkeletonTabs,
  SkeletonTitle,
} from "@/components/ui/skeleton";

/** Analytics: tabs, title, a run of chart-shaped section cards. */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonTabs count={3} />
      <SkeletonTitle />
      <div className="space-y-6">
        <SkeletonChartCard height="h-40" />
        <SkeletonChartCard height="h-48" />
        <SkeletonChartCard height="h-72" />
        <SkeletonChartCard height="h-56" />
      </div>
    </SkeletonPage>
  );
}
