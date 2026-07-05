import {
  Skeleton,
  SkeletonPage,
} from "@/components/ui/skeleton";

/** Learn index: title, the four method cards, chapter card grids. */
export default function Loading() {
  return (
    <SkeletonPage className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3.5 w-72 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="rounded-card border border-grid bg-surface px-3.5 py-3 shadow-ambient"
          >
            <Skeleton className="h-3 w-6" />
            <Skeleton className="mt-2 h-4 w-16" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
      {Array.from({ length: 2 }, (_, s) => (
        <div key={s}>
          <Skeleton className="mb-2 h-4 w-56" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient"
              >
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </SkeletonPage>
  );
}
