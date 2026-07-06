"use client";

import { useState } from "react";
import { SettingsForm } from "./settings-form";

/**
 * The plan-settings disclosure. Client-side so its open state belongs to
 * the user: the router.refresh() after a save would otherwise yank the
 * panel (and its "Saved." confirmation) shut the moment a first test
 * date lands.
 */
export function PlanSettings({
  testDate,
  cadence,
  defaultOpen,
}: {
  testDate: string | null;
  cadence: number;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group w-full sm:w-auto sm:max-w-sm"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 sm:justify-end [&::-webkit-details-marker]:hidden">
        <span className="font-mono text-[11px] text-graphite">
          {testDate ?? "no test date"} · timed every {cadence}d
        </span>
        <span className="text-xs font-medium text-ballpoint underline decoration-dashed underline-offset-4 group-open:hidden">
          adjust
        </span>
        <span className="hidden text-xs font-medium text-ballpoint underline decoration-dashed underline-offset-4 group-open:inline">
          close
        </span>
      </summary>
      <div className="mt-2 rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <SettingsForm testDate={testDate} cadence={cadence} />
      </div>
    </details>
  );
}
