"use client";

import { ArrowClockwise, House } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl border-l-2 border-redpen pl-5 sm:pl-7">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-redpen">
        The work was preserved where possible
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight">
        This page hit an unexpected error.
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-6 text-graphite">
        Retry the current view first. If it fails again, return to Today; Q86
        records completed answers as they are submitted in drills.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-11 items-center gap-2 rounded-control bg-ballpoint px-4 py-2 text-sm font-semibold text-white"
        >
          <ArrowClockwise size={18} weight="bold" />
          Retry this view
        </button>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-control border border-grid-strong bg-surface px-4 py-2 text-sm font-medium"
        >
          <House size={18} />
          Back to Today
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono text-[11px] text-faint">
          Reference {error.digest}
        </p>
      )}
    </section>
  );
}
