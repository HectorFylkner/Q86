import { DecideClient } from "@/components/decide/decide-client";
import { SectionTabs } from "@/components/section-tabs";
import { buildDecideRound } from "@/lib/decide";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function DecidePage() {
  const items = await buildDecideRound(8);

  return (
    <div className="space-y-4">
      <SectionTabs group="trainers" />
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">Decision drills</h1>
        <p className="text-xs text-graphite">
          45 seconds per question: commit to solve, guess, or bail — without
          solving. Judged against your own record on questions like it.
        </p>
      </div>
      <DecideClient items={items} />
    </div>
  );
}
