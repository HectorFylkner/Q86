export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto mt-16 max-w-sm">
      <div className="rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <h1 className="font-display text-lg font-semibold">Q86</h1>
        <p className="mt-1 text-sm text-graphite">
          This instance is private. Enter the site password to train.
        </p>
        <form method="POST" action="/api/login" className="mt-4 space-y-3">
          <input
            type="password"
            name="password"
            autoFocus
            required
            placeholder="Site password"
            aria-label="Site password"
            className="w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm outline-none focus:border-ballpoint"
          />
          {error && (
            <p className="text-sm text-redpen">
              That password is not right — try again.
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
