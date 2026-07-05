import {
  Skeleton,
  SkeletonPage,
  SkeletonTabs,
} from "@/components/ui/skeleton";

/** Decide: tabs, title with caption, the intro card. */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonTabs count={2} />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-80 max-w-full" />
      </div>
      <div className="mx-auto max-w-2xl rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <Skeleton className="h-5 w-64 max-w-full" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-3/4" />
        </div>
        <Skeleton className="mt-5 h-10 w-36 rounded-control" />
      </div>
    </SkeletonPage>
  );
}
