import {
  Skeleton,
  SkeletonPage,
  SkeletonTabs,
} from "@/components/ui/skeleton";

/** Queue: tabs, title, the due card, the error-log table card. */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonTabs count={2} />
      <Skeleton className="h-7 w-64 max-w-full" />
      <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-36 rounded-control" />
        </div>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
      <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-32 rounded-control" />
        </div>
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-8 w-32 rounded-control" />
          ))}
        </div>
        <div className="mt-4 space-y-2.5">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-3.5 w-full" />
          ))}
        </div>
      </div>
    </SkeletonPage>
  );
}
