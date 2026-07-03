import { DeckClient } from "@/components/deck/deck-client";
import { todaysDeck } from "@/lib/deck";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DeckPage() {
  const now = new Date();
  const dayIndex = Math.floor(
    (now.getTime() - now.getTimezoneOffset() * 60_000) / 86_400_000,
  );
  const { cards, poolSize } = await todaysDeck(dayIndex);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">Takeaway deck</h1>
        <p className="text-xs text-graphite">
          Front: when to reach for the method. Back: the takeaway. Built from
          your {poolSize} missed question{poolSize === 1 ? "" : "s"}; the deck
          rotates daily.
        </p>
      </div>
      <DeckClient cards={cards} />
    </div>
  );
}
