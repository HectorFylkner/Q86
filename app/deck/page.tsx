import { DeckClient } from "@/components/deck/deck-client";
import { SectionTabs } from "@/components/section-tabs";
import { todaysDeck } from "@/lib/deck";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DeckPage() {
  const { cards, due, fresh, scheduled } = await todaysDeck();

  return (
    <div className="space-y-4">
      <SectionTabs group="review" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">Takeaway deck</h1>
        <p className="text-xs text-graphite">
          Takeaways from missed questions, plus cue and trap cards from
          chapters you have passed. Produce the answer before flipping;
          grade honestly — cards you know stretch to longer intervals,
          cards you forget come back tomorrow.
        </p>
      </div>
      <p className="font-mono text-[11px] text-graphite">
        {due} due · {fresh} new · {scheduled} scheduled ahead
      </p>
      <DeckClient cards={cards} />
    </div>
  );
}
