import {
  Skeleton,
  SkeletonPage,
} from "@/components/ui/skeleton";

/** Post-mortem: title, the chip row, question card, scratch card. */
export default function Loading() {
  return (
    <SkeletonPage>
      <Skeleton className="h-7 w-72 max-w-full" />
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-20 rounded-control" />
          ))}
        </div>
        <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <Skeleton className="h-4 w-32" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-11 w-full rounded-control" />
            ))}
          </div>
        </div>
        <div className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-2 h-3 w-72 max-w-full" />
          <Skeleton className="mt-3 h-24 w-full rounded-card" />
        </div>
      </div>
    </SkeletonPage>
  );
}
