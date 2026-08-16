import { DeckClient } from "@/components/deck/deck-client";
import { SectionTabs } from "@/components/section-tabs";
import { todaysDeck } from "@/lib/deck";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DeckPage() {
  const { cards, due, fresh, scheduled, missCount, chapterCount } =
    await todaysDeck();

  return (
    <div className="space-y-4">
      <SectionTabs group="review" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-xl font-semibold">Takeaway deck</h1>
        <p className="text-xs text-graphite">
          Two sources, one queue: takeaways from questions you missed, and
          the cues, traps, and concept checks from chapters you&apos;ve
          cemented. Grade honestly — what you know stretches out, what you
          forget comes back tomorrow.
        </p>
      </div>
      <p className="font-mono text-[11px] text-graphite">
        {due} due · {fresh} new · {scheduled} scheduled ahead
        {cards.length > 0 && (
          <>
            {" "}
            — showing {missCount} miss{missCount === 1 ? "" : "es"},{" "}
            {chapterCount} from chapters
          </>
        )}
      </p>
      <DeckClient cards={cards} />
    </div>
  );
}
