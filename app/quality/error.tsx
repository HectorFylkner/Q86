"use client";

import { WarningOctagon } from "@phosphor-icons/react";
import { SectionTabs } from "@/components/section-tabs";

export default function QualityError({ reset }: { reset: () => void }) {
  return (
    <div className="space-y-7">
      <SectionTabs group="progress" />
      <section className="grid gap-5 border-y border-redpen/30 py-10 md:grid-cols-[auto_1fr_auto] md:items-center">
        <WarningOctagon
          size={42}
          weight="duotone"
          className="text-redpen"
        />
        <div>
          <h1 className="font-display text-lg font-semibold">
            Question QA could not load
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-graphite">
            The candidate queue is unchanged. Check the database connection and
            retry this view.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-control bg-ballpoint px-4 py-2 text-sm font-semibold text-white transition-transform active:translate-y-px"
        >
          Try again
        </button>
      </section>
    </div>
  );
}
