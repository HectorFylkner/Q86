import {
  Skeleton,
  SkeletonPage,
  SkeletonTabs,
  SkeletonTitle,
} from "@/components/ui/skeleton";

/** Mastery: tabs, title, one section per skill with ladder tiles. */
export default function Loading() {
  return (
    <SkeletonPage>
      <SkeletonTabs count={3} />
      <SkeletonTitle />
      {Array.from({ length: 3 }, (_, s) => (
        <div
          key={s}
          className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
        >
          <Skeleton className="h-4 w-56" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="rounded-[8px] border border-grid p-3">
                <Skeleton className="h-4 w-32" />
                <div className="mt-2 flex items-end gap-1.5">
                  {["h-6", "h-7", "h-8", "h-9"].map((h) => (
                    <Skeleton key={h} className={`flex-1 rounded-[4px] ${h}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </SkeletonPage>
  );
}
