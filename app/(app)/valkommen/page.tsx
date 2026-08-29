import { OnboardingClient } from "@/components/onboarding/onboarding-client";
import { requireFeature } from "@/lib/billing/entitlements";
import { getT } from "@/lib/i18n/server";
import { weekForAccountAction } from "./actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function OnboardingPage() {
  // "plan" is a free feature; the gate is here so the page cannot be
  // reached without a session, like every other page under (app).
  await requireFeature("drill");
  const t = await getT();

  return (
    <div className="mx-auto w-full max-w-[900px] pt-6">
      <p className="eyebrow">Q86</p>
      <h1 className="mt-3 font-display text-[clamp(1.9rem,5vw,2.8rem)] font-bold leading-[1.05] tracking-tight">
        {t("onboarding.title")}
      </h1>
      <p className="measure mt-4 text-lg leading-relaxed text-graphite">
        {t("onboarding.lede")}
      </p>
      <div className="mt-10">
        <OnboardingClient weekFor={weekForAccountAction} />
      </div>
    </div>
  );
}
