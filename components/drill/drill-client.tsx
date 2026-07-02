"use client";

import { useState } from "react";
import { startDrill, type DrillTiming } from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import { DrillSetup, type CountRow, type DrillConfigValue } from "./drill-setup";
import { QuestionRunner } from "./question-runner";

type Stage =
  | { kind: "setup"; error: string | null }
  | { kind: "loading" }
  | {
      kind: "running";
      sessionId: number;
      questions: Question[];
      timing: DrillTiming;
    };

export function DrillClient({ rows }: { rows: CountRow[] }) {
  const [stage, setStage] = useState<Stage>({ kind: "setup", error: null });

  async function handleStart(config: DrillConfigValue) {
    setStage({ kind: "loading" });
    try {
      const res = await startDrill(config);
      if (res.error != null || res.sessionId == null) {
        setStage({ kind: "setup", error: res.error ?? "Could not start drill." });
        return;
      }
      setStage({
        kind: "running",
        sessionId: res.sessionId,
        questions: res.questions,
        timing: config.timing,
      });
    } catch {
      setStage({
        kind: "setup",
        error: "Could not start the drill — the server did not respond.",
      });
    }
  }

  if (stage.kind === "loading") {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-64 w-full rounded-[10px]" />
        <p className="text-sm text-graphite">Selecting questions…</p>
      </div>
    );
  }

  if (stage.kind === "running") {
    return (
      <QuestionRunner
        sessionId={stage.sessionId}
        mode="drill"
        questions={stage.questions}
        timing={stage.timing}
        onRestart={() => setStage({ kind: "setup", error: null })}
      />
    );
  }

  return <DrillSetup rows={rows} error={stage.error} onStart={handleStart} />;
}
