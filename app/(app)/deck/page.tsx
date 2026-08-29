import { DeckClient } from "@/components/deck/deck-client";
import { SectionTabs } from "@/components/section-tabs";
import { requireFeature } from "@/lib/billing/entitlements";
import { todaysDeck } from "@/lib/deck";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DeckPage() {
  const { sdb } = await requireFeature("deck");
  const t = await getT();
  const { cards, due, fresh, scheduled } = await todaysDeck(sdb);

  return (
    <div className="space-y-4">
      <SectionTabs group="review" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">
          {t("deck.title")}
        </h1>
        <p className="text-xs text-graphite">{t("deck.lede")}</p>
      </div>
      <p className="font-mono text-[11px] text-graphite">
        {t("deck.counts", { due, fresh, scheduled })}
      </p>
      <DeckClient cards={cards} />
    </div>
  );
}
