import {
  Skeleton,
  SkeletonPage,
  SkeletonTabs,
} from "@/components/ui/skeleton";

/** Deck: tabs, title with caption, the count line, one big card. */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonTabs count={2} />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-3.5 w-72 max-w-full" />
      </div>
      <Skeleton className="h-3 w-56" />
      <div className="mx-auto max-w-2xl space-y-3">
        <Skeleton className="mx-auto h-3 w-20" />
        <div className="rounded-card border border-grid bg-surface p-6 shadow-ambient">
          <Skeleton className="h-3 w-64 max-w-full" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
