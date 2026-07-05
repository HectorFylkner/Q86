/** Every page is force-dynamic; this is the pending state between
 *  navigation and data — the shape of a page being drafted. */
export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-7 w-44" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="skeleton h-36 w-full rounded-card" />
        <div className="skeleton h-36 w-full rounded-card" />
        <div className="skeleton hidden h-36 w-full rounded-card sm:block" />
        <div className="skeleton hidden h-36 w-full rounded-card lg:block" />
      </div>
      <div className="skeleton h-64 w-full rounded-card" />
    </div>
  );
}
