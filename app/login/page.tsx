import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/ui/error-banner";

export const dynamic = "force-dynamic";

/** The front door: bare graph paper, the wordmark at display scale, one
 *  input in the global chrome, one working-ink button. No shell chrome
 *  renders until the visitor is in. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-sm flex-col justify-center">
      <div className="text-center">
        <p className="font-mono text-caption uppercase tracking-wider text-graphite">
          Private instance
        </p>
        <h1 className="mt-2 font-display text-5xl font-bold tracking-tight text-ink">
          Q86
        </h1>
        <p className="mt-1.5 text-sm text-graphite">the target is the name</p>
      </div>
      <div className="mt-8 rounded-card border border-grid bg-surface p-6 shadow-ambient">
        <form method="POST" action="/api/login" className="space-y-3">
          <label
            htmlFor="password"
            className="block font-mono text-caption uppercase tracking-wider text-graphite"
          >
            Site password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            autoFocus
            required
            placeholder="••••••••"
            className="w-full text-sm"
          />
          {error && (
            <ErrorBanner>That password is not right — try again.</ErrorBanner>
          )}
          <Button type="submit" className="w-full">
            Enter
          </Button>
        </form>
      </div>
      <p className="mt-6 text-center font-mono text-caption text-graphite">
        Q1 pays the same as Q21.
      </p>
    </div>
  );
}
