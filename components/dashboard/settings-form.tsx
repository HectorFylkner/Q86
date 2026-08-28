"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n-provider";
import { saveSetting } from "@/lib/actions";

export function SettingsForm({
  testDate,
  cadence,
}: {
  testDate: string | null;
  cadence: number;
}) {
  const t = useT();
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
        {t("settings.testDate")}
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setState("idle");
          }}
          className="rounded-control border border-grid bg-surface px-2 py-1.5 text-sm text-ink"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-graphite">
        {t("settings.timedSetEvery")}
        <select
          value={cadenceDays}
          onChange={(e) => {
            setCadenceDays(e.target.value);
            setState("idle");
          }}
          className="rounded-control border border-grid bg-surface px-2 py-1.5 text-sm text-ink"
        >
          {[2, 3, 4, 7].map((d) => (
            <option key={d} value={d}>
              {d} {t("common.days")}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={save}
        disabled={state === "saving"}
        className="rounded-control border border-grid bg-surface px-3 py-1.5 text-sm hover:border-graphite/50"
      >
        {state === "saving" ? t("common.saving") : t("settings.saveSettings")}
      </button>
      {state === "saved" && (
        <span className="text-xs text-ballpoint">{t("common.saved")}</span>
      )}
      {state === "error" && (
        <span className="text-xs text-redpen">{t("settings.saveFailed")}</span>
      )}
    </div>
  );
}
