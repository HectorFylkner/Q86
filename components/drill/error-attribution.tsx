"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { suggestErrorType } from "@/lib/actions";
import type { Attribution } from "@/lib/error-inference";
import { ERROR_TYPES, ERROR_TYPE_LABELS, type ErrorType } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * Why the platform thinks this miss happened — and the one tap that
 * corrects it when it is wrong.
 *
 * Before this, tagging a miss was six unlabelled-by-evidence buttons and
 * a shrug, so most misses went untagged and never reached the heatmap or
 * the plan. Now the strongest candidate arrives already selected with
 * the observations behind it, and disagreeing costs one keystroke. A
 * misdiagnosis the user can see is a misdiagnosis the user can fix; a
 * silent one trains the wrong repair for weeks.
 */
export function ErrorAttribution({
  attemptId,
  value,
  onChange,
  onSuggestion,
  disabled,
}: {
  attemptId: number | null;
  value: ErrorType | null;
  /**
   * Receives the chosen type *and* the suggestion that was on screen when it
   * was chosen, so the caller can persist the pair. A tag stored without the
   * suggestion it agreed or disagreed with is not a labelled example.
   */
  onChange: (
    errorType: ErrorType,
    suggestion: { errorType: ErrorType; confidence: number } | null,
  ) => void;
  /** Reports what was displayed, so a tag made from the keyboard — which
   *  never passes through this component — records it too. */
  onSuggestion?: (
    attemptId: number,
    suggestion: { errorType: ErrorType; confidence: number } | null,
  ) => void;
  disabled?: boolean;
}) {
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [loading, setLoading] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);

  useEffect(() => {
    if (attemptId == null) return;
    let cancelled = false;
    setLoading(true);
    setAttribution(null);
    setShowEvidence(false);
    void suggestErrorType({ attemptId })
      .then((result) => {
        if (cancelled) return;
        setAttribution(result);
        onSuggestion?.(
          attemptId,
          result?.best
            ? { errorType: result.best.errorType, confidence: result.best.confidence }
            : null,
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // `onSuggestion` is intentionally not a dependency: it is a reporting
    // channel, and re-running the query because the parent re-rendered would
    // recompute the suggestion the reader is currently looking at.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const best = attribution?.best ?? null;
  const suggested = best?.errorType ?? null;
  const uncertain = attribution?.uncertain ?? true;
  const shown = best
    ? { errorType: best.errorType, confidence: best.confidence }
    : null;

  return (
    <section
      aria-label="Why this one was missed"
      className="rounded-card border border-grid bg-surface p-4 shadow-ambient"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-body font-semibold">
          Why this one went wrong
        </h3>
        {loading && (
          <span className="text-micro text-graphite">reading the evidence…</span>
        )}
      </div>

      {best && (
        <div className="mt-2">
          <p className="text-caption text-graphite">
            {uncertain ? (
              <>
                The evidence leans toward{" "}
                <span className="font-medium text-ink">{best.label}</span>, but
                only just — {Math.round(best.confidence * 100)}% of the signal.
                Your call.
              </>
            ) : (
              <>
                Most likely{" "}
                <span className="font-medium text-ink">{best.label}</span> —{" "}
                {Math.round(best.confidence * 100)}% of the signal points there.
              </>
            )}
          </p>

          <button
            type="button"
            onClick={() => setShowEvidence((v) => !v)}
            aria-expanded={showEvidence}
            className="mt-1.5 inline-flex items-center gap-1 text-caption text-ballpoint hover:underline"
          >
            <ChevronDown
              size={13}
              className={cn("transition-transform", showEvidence && "rotate-180")}
              aria-hidden
            />
            {showEvidence ? "Hide the evidence" : "Show the evidence"}
          </button>

          {showEvidence && (
            <ul className="mt-2 space-y-1.5 border-l-2 border-grid pl-3">
              {attribution!.candidates.map((candidate) => (
                <li key={candidate.errorType}>
                  <p className="text-caption font-medium">
                    {candidate.label}{" "}
                    <span className="font-mono text-micro font-normal text-graphite">
                      {Math.round(candidate.confidence * 100)}%
                    </span>
                  </p>
                  <ul className="mt-0.5 space-y-0.5">
                    {candidate.evidence.map((e, i) => (
                      <li key={i} className="text-caption text-graphite">
                        {e.fact}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!loading && !best && (
        <p className="mt-1 text-caption text-graphite">
          Nothing in the timing, the confidence or the answer chosen points
          anywhere in particular. Tag it yourself — you were there.
        </p>
      )}

      <div
        className="mt-3 flex flex-wrap items-center gap-1.5"
        role="group"
        aria-label="Error type for this miss"
      >
        {ERROR_TYPES.map((et, i) => {
          const isSuggested = et === suggested;
          const isChosen = value === et;
          return (
            <button
              key={et}
              type="button"
              onClick={() => onChange(et, shown)}
              disabled={disabled}
              aria-pressed={isChosen}
              className={cn(
                "rounded-control border px-2.5 py-1.5 text-caption transition-colors",
                isChosen
                  ? "border-redpen bg-redpen/10 font-medium text-redpen"
                  : isSuggested
                    ? "border-ballpoint/60 bg-ballpoint/5 text-ink"
                    : "border-grid text-graphite hover:border-graphite/50 hover:text-ink",
                disabled && "opacity-50",
              )}
            >
              <span className="mr-1 font-mono text-micro opacity-60">{i + 1}</span>
              {ERROR_TYPE_LABELS[et]}
              {isSuggested && !isChosen && (
                <span className="ml-1 font-mono text-micro text-ballpoint">
                  suggested
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-micro text-graphite">
        {value
          ? "Tagged. It is in the heatmap and the plan's inputs now."
          : "Untagged misses never reach the heatmap or the plan — one key (1–6) fixes that."}
      </p>
    </section>
  );
}
