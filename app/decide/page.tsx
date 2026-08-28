import { DecideClient } from "@/components/decide/decide-client";
import { SectionTabs } from "@/components/section-tabs";
import { requireFeature } from "@/lib/billing/entitlements";
import { buildDecideRound } from "@/lib/decide";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DecidePage() {
  const { sdb } = await requireFeature("decide");
  const t = await getT();
  const items = await buildDecideRound(sdb, 8);

  return (
    <div className="space-y-4">
      <SectionTabs group="trainers" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">
          {t("decide.title")}
        </h1>
        <p className="text-xs text-graphite">{t("decide.lede")}</p>
      </div>
      <DecideClient items={items} />
    </div>
  );
}
