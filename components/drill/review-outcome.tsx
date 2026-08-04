"use client";

import Link from "next/link";
import { ArrowUp, Minus, RotateCcw } from "lucide-react";
import {
  CHAPTER_REVIEW_STAGE_DAYS,
  type ReviewMovement,
} from "@/lib/cumulative-config";
import type { ChapterReviewOutcome } from "@/lib/cumulative";
import { SUBTOPIC_LABELS } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * What the review just changed about your schedule.
 *
 * The mechanism has worked since it shipped: each chapter's spacing rung
 * moves on its own slice of the result — all correct advances it, partial
 * holds it, none resets it. The result screen showed an accuracy figure and
 * a subtopic table and said none of that, so from the reader's side a
 * cumulative review was ten questions that changed nothing they could see.
 * A spaced-repetition system whose intervals are invisible is asking to be
 * trusted on nothing.
 *
 * Three things are said here that were not said anywhere before: which rung
 * each chapter moved to, *why* it moved that way, and when the chapter comes
 * back. The rule is stated on the card rather than in a help page, because
 * the moment you have just seen it applied is the moment it is learnable.
 */
export function ReviewOutcomeCard({ outcome }: { outcome: ChapterReviewOutcome[] }) {
  if (outcome.length === 0) return null;

  const advanced = outcome.filter((o) => o.movement === "advanced").length;
  const reset = outcome.filter((o) => o.movement === "reset").length;
  const soonest = outcome.reduce(
    (min, o) => Math.min(min, o.intervalDays),
    Number.POSITIVE_INFINITY,
  );

  return (
    <section
      aria-labelledby="review-outcome-heading"
      className="rounded-card border border-grid border-l-2 border-l-amber bg-surface p-5 shadow-ambient"
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-graphite">
        Cumulative review
      </p>
      <h2 id="review-outcome-heading" className="font-display text-lg font-semibold">
        What this changed
      </h2>
      <p className="mt-1 text-sm text-graphite">
        {advanced > 0 && reset > 0 ? (
          <>
            {advanced} {advanced === 1 ? "chapter" : "chapters"} moved further
            out and {reset} came back to the start. The next one is due in{" "}
            {soonest} {soonest === 1 ? "day" : "days"}.
          </>
        ) : advanced > 0 ? (
          <>
            {advanced === outcome.length
              ? "Every chapter moved further out"
              : `${advanced} of ${outcome.length} chapters moved further out`}
            . The next one is due in {soonest} {soonest === 1 ? "day" : "days"}.
          </>
        ) : reset > 0 ? (
          <>
            {reset} {reset === 1 ? "chapter is" : "chapters are"} at the start
            of the ladder — that is what missing every question of a slice
            means. The next one is due in {soonest}{" "}
            {soonest === 1 ? "day" : "days"}.
          </>
        ) : (
          <>
            Everything held its interval. A partial slice is as likely to be
            noise as decay, so nothing was penalised. The next one is due in{" "}
            {soonest} {soonest === 1 ? "day" : "days"}.
          </>
        )}
      </p>

      <ul className="mt-3 divide-y divide-grid border-t border-grid">
        {outcome.map((o) => (
          <li
            key={o.subtopic}
            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5"
          >
            <div className="min-w-0">
              <Link
                href={`/learn/${o.subtopic}`}
                className="text-sm hover:text-ballpoint hover:underline"
              >
                {SUBTOPIC_LABELS[o.subtopic]}
              </Link>
              <span className="ml-2 font-mono text-[11px] text-graphite">
                {o.correct}/{o.total}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Movement kind={o.movement} moved={o.stageAfter !== o.stageBefore} />
              <span className="font-mono text-[11px] text-graphite">
                {o.stageBefore === o.stageAfter
                  ? `stays at ${CHAPTER_REVIEW_STAGE_DAYS[o.stageAfter]}d`
                  : `${CHAPTER_REVIEW_STAGE_DAYS[o.stageBefore]}d → ${CHAPTER_REVIEW_STAGE_DAYS[o.stageAfter]}d`}
              </span>
              <span className="font-mono text-[11px] text-ink">
                back in {o.intervalDays}d
              </span>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-graphite">
        The rule, so it is learnable rather than mysterious: all correct moves a
        chapter one rung further out ({CHAPTER_REVIEW_STAGE_DAYS.join(" → ")}{" "}
        days), a partial slice holds the interval, and none correct sends it
        back to {CHAPTER_REVIEW_STAGE_DAYS[0]} days. It holds rather
        than resets on a partial because one slip across two questions is as
        likely to be noise as decay, and resetting three weeks of spacing on it
        would make the ladder unclimbable.
      </p>
    </section>
  );
}

function Movement({
  kind,
  moved,
}: {
  kind: ReviewMovement;
  /** False when a reset landed on the rung the chapter was already on —
   *  "back to the start" would be a claim about a move that never happened. */
  moved: boolean;
}) {
  const spec: Record<
    ReviewMovement,
    { Icon: typeof ArrowUp; label: string; tone: string }
  > = {
    advanced: { Icon: ArrowUp, label: "further out", tone: "text-good" },
    held: { Icon: Minus, label: "held", tone: "text-graphite" },
    reset: {
      Icon: RotateCcw,
      label: moved ? "back to the start" : "still at the start",
      tone: "text-redpen",
    },
  };
  const { Icon, label, tone } = spec[kind];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", tone)}>
      <Icon size={13} aria-hidden />
      {label}
    </span>
  );
}
