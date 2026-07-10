"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveSetting } from "@/lib/actions";

export function SettingsForm({
  testDate,
  cadence,
}: {
  testDate: string | null;
  cadence: number;
}) {
  const router = useRouter();
  const [date, setDate] = useState(testDate ?? "");
  const [cadenceDays, setCadenceDays] = useState(String(cadence));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );

  async function save() {
    setState("saving");
    try {
      // An empty value intentionally clears the date; previously the form
      // could set a date but never remove one.
      await saveSetting("test_date", date);
      await saveSetting("timed_set_cadence", cadenceDays);
      setState("saved");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
      <label className="flex min-w-0 flex-col gap-1.5 text-[13px] text-graphite">
        Test date
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setState("idle");
          }}
          className="w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm text-ink"
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1.5 text-[13px] text-graphite">
        Timed set every
        <select
          value={cadenceDays}
          onChange={(e) => {
            setCadenceDays(e.target.value);
            setState("idle");
          }}
          className="w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm text-ink"
        >
          {[2, 3, 4, 7].map((d) => (
            <option key={d} value={d}>
              {d} days
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={save}
        disabled={state === "saving"}
        className="min-h-11 rounded-control border border-grid-strong bg-surface px-4 py-2 text-sm font-medium hover:border-ballpoint/50"
      >
        {state === "saving" ? "Saving…" : "Save settings"}
      </button>
      <span className="sm:col-span-3" aria-live="polite" role="status">
        {state === "saved" && (
          <span className="text-[13px] text-ballpoint">Plan settings saved.</span>
        )}
        {state === "error" && (
          <span className="text-[13px] text-redpen">
            Saving failed — your previous settings are unchanged.
          </span>
        )}
      </span>
    </div>
  );
}
