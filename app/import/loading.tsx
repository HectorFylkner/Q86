import {
  Skeleton,
  SkeletonPage,
  SkeletonTabs,
} from "@/components/ui/skeleton";

/** Import: tabs, title, the paste card with its tall textarea, backup. */
export default function Loading() {
  return (
    <SkeletonPage className="space-y-5">
      <SkeletonTabs count={3} />
      <Skeleton className="h-7 w-56" />
      <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-2 h-3 w-80 max-w-full" />
        <Skeleton className="mt-3 h-56 w-full rounded-control" />
        <Skeleton className="mt-3 h-10 w-40 rounded-control" />
      </div>
      <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-44 rounded-control" />
        </div>
      </div>
    </SkeletonPage>
  );
}
