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
      if (date) await saveSetting("test_date", date);
      await saveSetting("timed_set_cadence", cadenceDays);
      setState("saved");
      router.refresh();
    } catch {
      setState("error");
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-graphite">
        Test date
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setState("idle");
          }}
          className="rounded-[6px] border border-grid bg-surface px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-graphite">
        Timed set every
        <select
          value={cadenceDays}
          onChange={(e) => {
            setCadenceDays(e.target.value);
            setState("idle");
          }}
          className="rounded-[6px] border border-grid bg-surface px-2 py-1.5 text-sm text-ink"
        >
          {[2, 3, 4, 7].map((d) => (
            <option key={d} value={d}>
              {d} days
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={save}
        disabled={state === "saving"}
        className="rounded-[6px] border border-grid bg-surface px-3 py-1.5 text-sm hover:border-graphite/50"
      >
        {state === "saving" ? "Saving…" : "Save settings"}
      </button>
      {state === "saved" && <span className="text-xs text-ballpoint">Saved.</span>}
      {state === "error" && (
        <span className="text-xs text-redpen">Saving failed — retry.</span>
      )}
    </div>
  );
}
