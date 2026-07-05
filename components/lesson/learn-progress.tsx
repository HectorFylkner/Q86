"use client";

import { useEffect, useState } from "react";
import { checklistKey } from "./drill-checklist";

type ReadState = { c: number; t: number };

function readState(subtopic: string): ReadState | null {
  try {
    const raw = localStorage.getItem(checklistKey(subtopic));
    if (!raw) return null;
    const saved = JSON.parse(raw) as { c?: number[]; t?: number };
    if (!Array.isArray(saved.c) || typeof saved.t !== "number") return null;
    return { c: saved.c.length, t: saved.t };
  } catch {
    return null;
  }
}

/** Per-chapter readiness badge, from the chapter's checklist ticks. */
export function ReadBadge({ subtopic }: { subtopic: string }) {
  const [state, setState] = useState<ReadState | null>(null);
  useEffect(() => setState(readState(subtopic)), [subtopic]);
  if (!state || state.c === 0) return null;
  const done = state.t > 0 && state.c >= state.t;
  return (
    <span
      className={`font-mono text-[11px] ${done ? "text-ballpoint" : "text-graphite"}`}
    >
      {done ? "✓ prepared" : `${state.c}/${state.t} checks`}
    </span>
  );
}

/** Header line on the Learn index: how many chapters are fully prepared. */
export function LearnPrepared({ subtopics }: { subtopics: string[] }) {
  const [prepared, setPrepared] = useState<number | null>(null);
  useEffect(() => {
    let n = 0;
    for (const s of subtopics) {
      const st = readState(s);
      if (st && st.t > 0 && st.c >= st.t) n++;
    }
    setPrepared(n);
  }, [subtopics]);
  if (prepared === null || prepared === 0) return null;
  return (
    <p className="font-mono text-xs text-ballpoint">
      {prepared} of {subtopics.length} chapters prepared
    </p>
  );
}
