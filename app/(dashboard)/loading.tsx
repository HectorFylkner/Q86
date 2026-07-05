import {
  Skeleton,
  SkeletonCard,
  SkeletonPage,
} from "@/components/ui/skeleton";

/** Today: header with the big day count, plan cards, skill weights. */
export default function Loading() {
  return (
    <SkeletonPage className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-24" />
          <div className="mt-2 flex items-baseline gap-2">
            <Skeleton className="h-11 w-24" />
            <Skeleton className="h-3.5 w-28" />
          </div>
        </div>
        <div className="flex items-end gap-3">
          <Skeleton className="h-9 w-36" />
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>
      <div className="rounded-card border border-grid bg-surface px-4 py-3 shadow-ambient">
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <SkeletonCard key={i} lines={3} />
        ))}
      </div>
      <SkeletonCard lines={4} />
    </SkeletonPage>
  );
}
