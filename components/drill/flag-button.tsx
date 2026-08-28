"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n-provider";
import { flagQuestion } from "@/lib/actions";
import { flagReasonLabel } from "@/lib/i18n/labels";
import {
  FLAG_REASONS,
  type FlagReason,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/** Compact content-QC control: flag the current question with a reason
 *  and optional note. Flags land in the review list on Analytics. */
export function FlagButton({ questionId }: { questionId: number }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<FlagReason | null>(null);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  if (sent) {
    return (
      <p className="text-xs text-graphite">
        {t("drill.flagged")}
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
        {t("drill.flagPrompt")}
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
              "rounded-full border px-2.5 py-1 text-xs transition-colors",
              reason === r
                ? "border-redpen bg-redpen/10 font-medium text-redpen"
                : "border-grid text-graphite hover:border-graphite/50 hover:text-ink",
            )}
          >
            {flagReasonLabel(t, r)}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("drill.flagNote")}
          className="min-w-0 flex-1 text-sm"
        />
        <button
          type="button"
          disabled={!reason || pending}
          onClick={() => {
            if (!reason) return;
            startTransition(async () => {
              await flagQuestion({ questionId, reason, note });
              setSent(true);
            });
          }}
          className="rounded-control border border-redpen/50 px-3 py-1.5 text-sm font-medium text-redpen transition-colors hover:bg-redpen/10 disabled:opacity-40"
        >
          {pending ? t("drill.flagging") : t("drill.flagSubmit")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-graphite hover:text-ink"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}
