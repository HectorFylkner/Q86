import {
  Skeleton,
  SkeletonPage,
} from "@/components/ui/skeleton";

/** Timed: title, the two set cards, the two option lines. */
export default function Loading() {
  return (
    <SkeletonPage>
      <Skeleton className="h-7 w-32" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }, (_, i) => (
          <div
            key={i}
            className="rounded-card border border-grid bg-surface p-5 shadow-ambient"
          >
            <Skeleton className="h-5 w-32" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="mt-5 h-10 w-full rounded-control" />
          </div>
        ))}
      </div>
      <Skeleton className="h-4 w-96 max-w-full" />
      <Skeleton className="h-4 w-80 max-w-full" />
    </SkeletonPage>
  );
}
