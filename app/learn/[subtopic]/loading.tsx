import {
  Skeleton,
  SkeletonCard,
  SkeletonPage,
} from "@/components/ui/skeleton";

/** Chapter: kicker, display title, meta line, numbered sections. */
export default function Loading() {
  return (
    <SkeletonPage className="mx-auto max-w-5xl">
      <div className="min-w-0 space-y-9 lg:max-w-3xl">
        <div>
          <Skeleton className="h-3 w-48" />
          <Skeleton className="mt-2 h-8 w-80 max-w-full" />
          <Skeleton className="mt-2.5 h-3 w-64 max-w-full" />
        </div>
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <div className="mb-3 flex items-baseline gap-2.5">
              <Skeleton className="h-3.5 w-6" />
              <Skeleton className="h-5 w-48" />
            </div>
            <SkeletonCard lines={i === 0 ? 2 : 4} />
          </div>
        ))}
      </div>
    </SkeletonPage>
  );
}
