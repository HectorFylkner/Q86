"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logExternalMiss } from "@/lib/actions";
import {
  ALL_SUBTOPICS,
  DIFFICULTY_LABELS,
  ERROR_TYPES,
  ERROR_TYPE_LABELS,
  SUBTOPIC_LABELS,
  type Difficulty,
  type ErrorType,
  type Subtopic,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * Cross-source capture: the highest-signal misses happen on official
 * mocks and OG problems, outside the app. This form gives them the same
 * afterlife as an in-app miss — redo ladder, deck, error log, analytics.
 */
export function ExternalMissForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subtopic, setSubtopic] = useState<Subtopic>("percent_change_chains");
  const [difficulty, setDifficulty] = useState(4);
  const [context, setContext] = useState<"pure" | "real">("pure");
  const [sourceLabel, setSourceLabel] = useState("");
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [note, setNote] = useState("");
  const [cue, setCue] = useState("");
  const [takeaway, setTakeaway] = useState("");
  const [state, setState] = useState<
    "idle" | "saving" | "saved" | { error: string }
  >("idle");

  async function submit() {
    setState("saving");
    try {
      const res = await logExternalMiss({
        subtopic,
        difficulty,
        context,
        sourceLabel,
        errorType,
        note: note || null,
        cue: cue || null,
        takeaway: takeaway || null,
      });
      if (res.error) {
        setState({ error: res.error });
        return;
      }
      setState("saved");
      setSourceLabel("");
      setNote("");
      setCue("");
      setTakeaway("");
      setErrorType(null);
      router.refresh();
    } catch {
      setState({ error: "Could not save — the server did not respond." });
    }
  }

  if (!open) {
    return (
      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-sm font-semibold">
              Log an outside miss
            </h2>
            <p className="mt-0.5 text-xs text-graphite">
              Official mock or OG miss? Capture it here and it enters the
              same redo ladder, deck, and error log as an in-app miss —
              instead of dying in a spreadsheet.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="rounded-control border border-grid bg-surface px-4 py-2 text-sm hover:border-graphite/50"
          >
            Log a miss
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <h2 className="font-display text-sm font-semibold">
        Log an outside miss
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1 text-xs text-graphite">
          Source
          <input
            value={sourceLabel}
            onChange={(e) => {
              setSourceLabel(e.target.value);
              setState("idle");
            }}
            placeholder="OG 2024 #312"
            className="w-44 rounded-control border border-grid bg-surface px-2 py-1.5 text-sm text-ink placeholder:text-graphite/60"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-graphite">
          Subtopic
          <select
            value={subtopic}
            onChange={(e) => setSubtopic(e.target.value as Subtopic)}
            className="rounded-control border border-grid bg-surface px-2 py-1.5 text-sm text-ink"
          >
            {ALL_SUBTOPICS.map((s) => (
              <option key={s} value={s}>
                {SUBTOPIC_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-graphite">
          Difficulty
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="rounded-control border border-grid bg-surface px-2 py-1.5 text-sm text-ink"
          >
            {[2, 3, 4, 5].map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABELS[d as Difficulty]}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs text-graphite">
          Context
          <div className="flex gap-1">
            {(["pure", "real"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setContext(c)}
                className={cn(
                  "rounded-control border px-2.5 py-1.5 text-sm",
                  context === c
                    ? "border-ink bg-highlight font-medium text-ink"
                    : "border-grid text-graphite hover:border-graphite/50",
                )}
              >
                {c === "pure" ? "Pure" : "Real"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-graphite">What failed:</span>
        {ERROR_TYPES.map((et) => (
          <button
            key={et}
            onClick={() => setErrorType(errorType === et ? null : et)}
            className={cn(
              "rounded-control border px-2 py-1 transition-colors duration-150",
              errorType === et
                ? "border-redpen bg-redpen/5 font-medium text-redpen"
                : "border-grid text-graphite hover:border-graphite/50",
            )}
          >
            {ERROR_TYPE_LABELS[et]}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="What happened (optional — becomes the stem note and log entry)"
        rows={2}
        className="mt-3 w-full rounded-control border border-grid bg-surface px-3 py-2 text-sm placeholder:text-graphite/60"
      />
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <input
          value={cue}
          onChange={(e) => setCue(e.target.value)}
          placeholder="Trigger cue — when to reach for the method (optional)"
          className="rounded-control border border-grid bg-surface px-3 py-2 text-sm placeholder:text-graphite/60"
        />
        <input
          value={takeaway}
          onChange={(e) => setTakeaway(e.target.value)}
          placeholder="Takeaway — one line (optional; both fields → deck card)"
          className="rounded-control border border-grid bg-surface px-3 py-2 text-sm placeholder:text-graphite/60"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={submit}
          disabled={state === "saving"}
          className={cn(
            "rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90",
            state === "saving" && "cursor-wait opacity-60",
          )}
        >
          {state === "saving" ? "Saving…" : "Log the miss"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="text-sm text-graphite hover:underline"
        >
          Close
        </button>
        {state === "saved" && (
          <span className="text-sm text-ballpoint" role="status">
            Logged — it&apos;s in the ladder now.
          </span>
        )}
        {typeof state === "object" && (
          <span className="text-sm text-redpen" role="alert">
            {state.error}
          </span>
        )}
      </div>
    </section>
  );
}
