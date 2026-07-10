export default function Loading() {
  return (
    <div className="space-y-8" aria-label="Loading Q86" aria-busy="true">
      <div className="space-y-3">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-9 w-72 max-w-full" />
        <div className="skeleton h-4 w-[34rem] max-w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(18rem,0.85fr)]">
        <div className="skeleton h-80 rounded-card" />
        <div className="space-y-3 border-t border-grid pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          <div className="skeleton h-5 w-40" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
        </div>
      </div>
    </div>
  );
}
