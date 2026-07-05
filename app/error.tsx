"use client";

/** Route-level error boundary, in the coaching voice: name the failure,
 *  offer the retry, never a stack trace. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-card border border-redpen/40 bg-surface p-6 shadow-ambient">
      <h1 className="font-display text-lg font-semibold">
        This page hit an error
      </h1>
      <p className="mt-1.5 text-sm text-graphite">
        Usually the database taking a beat or a hiccup mid-request — your
        attempts and queue are safe on disk. Retry; if it persists, check
        that the server can reach ./data/q86.db.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-[11px] text-graphite/70">
          digest {error.digest}
        </p>
      )}
      <button
        onClick={reset}
        className="mt-4 rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90"
      >
        Try again
      </button>
    </div>
  );
}
