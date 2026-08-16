"use client";

import Link from "next/link";
import type { Prescription } from "@/lib/prescriptions";
import { formatSeconds } from "@/lib/utils";
import { cn } from "@/lib/utils";

/**
 * The cure for a tagged miss, as links rather than advice. The playbook
 * note "Reading your misses" prescribes one route per error type; this is
 * that routing, made clickable.
 */
export function PrescriptionCard({
  prescription,
}: {
  prescription: Prescription;
}) {
  const { errorLabel, diagnosis, steps, pacing } = prescription;

  return (
    <section className="rounded-card border border-ballpoint/40 bg-ballpoint/5 p-4 shadow-ambient">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <h2 className="font-display text-sm font-semibold">Your prescription</h2>
        <span className="rounded-control border border-ballpoint/40 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-ballpoint">
          {errorLabel}
        </span>
      </div>
      <p className="mt-1 text-sm text-graphite">{diagnosis}</p>

      {pacing && (
        <p className="mt-2 rounded-control bg-surface px-3 py-2 font-mono text-[11px] text-graphite">
          This attempt: {formatSeconds(pacing.seconds)} against a{" "}
          {formatSeconds(pacing.benchSeconds)} benchmark —{" "}
          <span className={cn(pacing.sink ? "text-redpen" : "text-ink")}>
            {pacing.ratio.toFixed(1)}× bench
            {pacing.sink ? " · time sink" : ""}
          </span>
        </p>
      )}

      <ol className="mt-3 space-y-2">
        {steps.map((step, i) => (
          <li key={step.href + i}>
            <Link
              href={step.href}
              className={cn(
                "group block rounded-control border px-3 py-2 transition-colors",
                step.primary
                  ? "border-ballpoint bg-ballpoint text-white hover:bg-ballpoint/90"
                  : "border-grid bg-surface hover:border-ballpoint/50",
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{step.label}</span>
                <span
                  className={cn(
                    "shrink-0 text-xs",
                    step.primary ? "text-white/70" : "text-graphite/60",
                  )}
                  aria-hidden
                >
                  →
                </span>
              </span>
              <span
                className={cn(
                  "mt-0.5 block text-xs leading-snug",
                  step.primary ? "text-white/80" : "text-graphite",
                )}
              >
                {step.detail}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
