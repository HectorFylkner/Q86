import { SSR } from "@phosphor-icons/react";
import { SectionTabs } from "@/components/section-tabs";

export default function QualityLoading() {
  return (
    <div className="space-y-7" aria-busy="true" aria-label="Loading question QA">
      <SectionTabs group="progress" />
      <header className="border-b border-grid pb-7">
        <div className="flex items-center gap-2 text-xs text-graphite">
          <SSR.ShieldWarning size={16} weight="duotone" />
          Opening the quarantine ledger…
        </div>
        <div className="skeleton mt-4 h-8 w-52" />
        <div className="skeleton mt-3 h-3 w-full max-w-xl" />
        <div className="skeleton mt-2 h-3 w-4/5 max-w-lg" />
      </header>
      <div className="grid gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="space-y-5">
          <div className="skeleton h-7 w-48" />
          <div className="skeleton h-24 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="skeleton h-12 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-3 border-t border-grid pt-5">
          <div className="skeleton h-5 w-36" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-16 w-full" />
          <div className="skeleton h-11 w-full" />
        </div>
      </div>
    </div>
  );
}
