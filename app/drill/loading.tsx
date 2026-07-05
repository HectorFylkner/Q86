import {
  Skeleton,
  SkeletonCard,
  SkeletonPage,
} from "@/components/ui/skeleton";

/** Drill: title, the setup card with its chip rows, the generate card. */
export default function Loading() {
  return (
    <SkeletonPage>
      <Skeleton className="h-7 w-24" />
      <div className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <Skeleton className="h-5 w-16" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["w-24", "w-40", "w-36", "w-44", "w-52"].map((w) => (
            <Skeleton key={w} className={`h-8 rounded-control ${w}`} />
          ))}
        </div>
        <Skeleton className="mt-5 h-5 w-28" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["w-28", "w-24", "w-32", "w-28", "w-36", "w-24"].map((w, i) => (
            <Skeleton key={i} className={`h-7 rounded-control ${w}`} />
          ))}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-8 w-32 rounded-control" />
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-grid pt-4">
          <Skeleton className="h-10 w-52 rounded-control" />
        </div>
      </div>
      <SkeletonCard lines={2} />
    </SkeletonPage>
  );
}
