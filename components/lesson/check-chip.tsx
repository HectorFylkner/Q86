"use client";

import { useState } from "react";
import { Md } from "@/components/math";

/** A one-line concept check under a core idea: the question is always
 *  visible, the answer sits behind a reveal — the same attempt-first
 *  contract as the worked examples, at ten-second scale. */
export function CheckChip({ q, a, id }: { q: string; a: string; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2.5 rounded-control border border-amber/40 bg-amber/5 px-3 py-2">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="select-none font-mono text-[10px] font-medium uppercase tracking-wider text-amber">
          Check
        </span>
        <Md source={q} className="min-w-0 flex-1 text-[13.5px]" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={id}
          className="font-mono text-[11px] font-medium text-ballpoint transition-colors hover:text-ink"
        >
          {open ? "hide" : "answer"}
        </button>
      </div>
      {open && (
        <div id={id} className="mt-1.5 border-t border-amber/30 pt-1.5">
          <Md source={a} className="text-[13.5px] text-graphite" />
        </div>
      )}
    </div>
  );
}
