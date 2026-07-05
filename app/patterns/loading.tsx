import {
  Skeleton,
  SkeletonPage,
  SkeletonTabs,
} from "@/components/ui/skeleton";

/** Patterns: tabs, title, streak line, the category card grid. */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonTabs count={2} />
      <Skeleton className="h-7 w-44" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-2 h-6 w-16" />
            <Skeleton className="mt-2 h-3 w-40 max-w-full" />
          </div>
        ))}
      </div>
      <Skeleton className="h-10 w-72 max-w-full rounded-control" />
    </SkeletonPage>
  );
}
