"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import { requireScoped } from "../auth/session.ts";
import { putSetting } from "../settings.ts";

/**
 * Onboarding writes the two settings the daily plan actually reads — the
 * test date and the timed-set cadence — and stamps `onboardedAt` so the
 * flow is offered once rather than on every visit.
 *
 * It deliberately does not ask for anything the plan cannot use. A
 * question whose answer changes nothing is a question that costs a signup.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type OnboardingResult = { error: string | null };

export async function completeOnboardingAction(
  _previous: OnboardingResult,
  form: FormData,
): Promise<OnboardingResult> {
  const { user, sdb } = await requireScoped();

  const testDate = String(form.get("test_date") ?? "").trim();
  const unknown = form.get("no_date") === "on";
  const cadence = Number(form.get("cadence") ?? 7);

  if (!unknown && testDate.length > 0) {
    if (!ISO_DATE.test(testDate)) return { error: "date_invalid" };
    const parsed = new Date(`${testDate}T00:00:00Z`);
    if (Number.isNaN(parsed.getTime())) return { error: "date_invalid" };
    // A date in the past would make the plan count backwards from a day
    // that has been and gone, which produces a nonsense schedule.
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    if (parsed.getTime() < today.getTime()) return { error: "date_past" };
    await putSetting(sdb, "test_date", testDate);
  }

  if ([3, 5, 7, 10, 14].includes(cadence)) {
    await putSetting(sdb, "timed_set_cadence", String(cadence));
  }

  await db
    .update(users)
    .set({ onboardedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id))
    .run();

  revalidatePath("/idag");
  return { error: null };
}
