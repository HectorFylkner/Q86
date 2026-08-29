"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { useT } from "@/components/i18n-provider";
import { completeOnboardingAction } from "@/lib/retention/onboarding";
import type { PlanPreviewDay } from "@/lib/diagnostic-plan";
import { cn } from "@/lib/utils";

/**
 * Onboarding: two questions, then the week those answers produce.
 *
 * The week is fetched after the answers are saved rather than guessed at
 * in the browser, because it is the product's real planner — the same one
 * the diagnostic preview uses, and the same one the dashboard runs every
 * morning. Asking for anything the plan cannot use would be a question
 * that costs a signup and buys nothing.
 */

const CADENCES = [3, 5, 7, 10, 14];

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper disabled:opacity-60"
    >
      {pending ? t("auth.working") : label}
    </button>
  );
}

export function OnboardingClient({
  weekFor,
}: {
  weekFor: () => Promise<{ days: PlanPreviewDay[]; daysToTest: number | null }>;
}) {
  const t = useT();
  const [state, action] = useActionState(completeOnboardingAction, {
    error: null,
  });
  const [unknown, setUnknown] = useState(false);
  const [cadence, setCadence] = useState(7);
  const [week, setWeek] = useState<PlanPreviewDay[] | null>(null);
  const [daysToTest, setDaysToTest] = useState<number | null>(null);

  if (week) {
    return (
      <div>
        <h2 className="text-2xl">{t("onboarding.weekTitle")}</h2>
        <p className="measure mt-3 text-base leading-relaxed text-graphite">
          {t("onboarding.weekLede")}
        </p>
        <p className="mt-4 font-mono text-xs text-graphite">
          {daysToTest === null
            ? t("onboarding.noTestDate")
            : t("onboarding.daysToTest", { days: daysToTest })}
        </p>

        <ol className="mt-8 grid gap-px overflow-hidden rounded-card border border-grid bg-grid sm:grid-cols-2 lg:grid-cols-4">
          {week.map((day) => (
            <li key={day.day} className="bg-paper px-4 py-4">
              <p className="font-mono text-xs text-graphite">
                {t("diagnostic.planDay", { n: day.day })}
              </p>
              <ul className="mt-2 space-y-1 text-sm">
                <li>{t("diagnostic.planDrill", { count: day.drillTotal })}</li>
                {day.timedSet && (
                  <li className="text-ballpoint">
                    {t("diagnostic.planTimed")}
                  </li>
                )}
                {day.review && (
                  <li className="text-graphite">
                    {t("diagnostic.planReview")}
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ol>

        <Link
          href="/idag"
          className="mt-8 inline-block rounded-control bg-ink px-5 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          {t("onboarding.start")}
        </Link>
      </div>
    );
  }

  return (
    <form
      action={async (formData) => {
        await action(formData);
        // The week is asked for only after the answers are stored, so it
        // is computed from what the account will actually have.
        const result = await weekFor();
        setWeek(result.days);
        setDaysToTest(result.daysToTest);
      }}
      className="measure space-y-8"
    >
      <fieldset>
        <legend className="font-display text-lg font-semibold">
          {t("onboarding.dateLabel")}
        </legend>
        <p className="mt-1 text-sm text-graphite">{t("onboarding.dateHint")}</p>
        <input
          type="date"
          name="test_date"
          aria-label={t("onboarding.dateLabel")}
          disabled={unknown}
          className="mt-3 block w-full max-w-[16rem]"
        />
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="no_date"
            checked={unknown}
            onChange={(e) => setUnknown(e.target.checked)}
          />
          {t("onboarding.noDateLabel")}
        </label>
        {unknown && (
          <p className="mt-2 text-sm text-graphite">
            {t("onboarding.noDateHint")}
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="font-display text-lg font-semibold">
          {t("onboarding.cadenceLabel")}
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {CADENCES.map((days) => (
            <label
              key={days}
              className={cn(
                "cursor-pointer rounded-control border px-3 py-2 text-sm transition-colors",
                cadence === days
                  ? "border-ink bg-highlight font-medium"
                  : "border-grid hover:border-graphite",
              )}
            >
              <input
                type="radio"
                name="cadence"
                value={days}
                checked={cadence === days}
                onChange={() => setCadence(days)}
                className="sr-only"
              />
              {t("onboarding.cadenceEvery", { days })}
            </label>
          ))}
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="text-sm text-redpen">
          {t("onboarding.dateHint")}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Submit label={t("onboarding.submit")} />
        <Link
          href="/idag"
          className="text-sm text-graphite underline underline-offset-4 transition-colors hover:text-ink"
        >
          {t("onboarding.skip")}
        </Link>
      </div>
    </form>
  );
}
