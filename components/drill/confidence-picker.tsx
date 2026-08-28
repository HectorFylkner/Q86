"use client";

import { useT } from "@/components/i18n-provider";
import { confidenceLabel } from "@/lib/i18n/labels";
import { CONFIDENCES, type Confidence } from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

const KEY_HINTS: Record<Confidence, string> = {
  guess: "G",
  lean: "L",
  lock: "K",
};

export function ConfidencePicker({
  value,
  onChange,
  disabled,
}: {
  value: Confidence | null;
  onChange: (c: Confidence) => void;
  disabled?: boolean;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-graphite">
        {t("drillRunner.confidence")}
      </span>
      <div
        className="flex gap-1"
        role="radiogroup"
        aria-label={t("drillRunner.confidence")}
      >
        {CONFIDENCES.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={value === c}
            disabled={disabled}
            onClick={() => onChange(c)}
            className={cn(
              "rounded-control border px-2.5 py-1 text-xs transition-colors duration-150",
              value === c
                ? "border-ink bg-highlight font-medium text-ink"
                : "border-grid text-graphite hover:border-graphite/50",
              disabled && "opacity-50",
            )}
          >
            {confidenceLabel(t, c)}
            <span className="ml-1.5 font-mono text-[10px] opacity-60">
              {KEY_HINTS[c]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
