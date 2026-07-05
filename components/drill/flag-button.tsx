"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { flagQuestion } from "@/lib/actions";
import {
  FLAG_REASONS,
  FLAG_REASON_LABELS,
  type FlagReason,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/** Compact content-QC control: flag the current question with a reason
 *  and optional note. Flags land in the review list on Analytics. */
export function FlagButton({ questionId }: { questionId: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="text-xs text-graphite">
        Flagged — it&apos;s waiting in the review list on Analytics.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-graphite transition-colors hover:text-redpen"
      >
        Something wrong with this question? Flag it
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {FLAG_REASONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={cn(
              "rounded-control border px-2.5 py-1 text-xs transition-colors",
              reason === r
                ? "border-redpen bg-redpen/10 font-medium text-redpen"
                : "border-grid text-graphite hover:border-graphite/50 hover:text-ink",
            )}
          >
            {FLAG_REASON_LABELS[r]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What looks wrong? (optional)"
          className="min-w-0 flex-1 text-sm"
        />
        <Button
          type="button"
          variant="dangerOutline"
          size="sm"
          disabled={!reason || pending}
          onClick={() => {
            if (!reason) return;
            startTransition(async () => {
              await flagQuestion({ questionId, reason, note });
              setSent(true);
            });
          }}
        >
          {pending ? "Flagging…" : "Flag question"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-graphite hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
