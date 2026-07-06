"use client";

import { useEffect, useRef, useState } from "react";
import {
  startChapterTest,
  startDrill,
  startDrillWithQuestions,
  type DrillTiming,
} from "@/lib/actions";
import type { Question } from "@/lib/db/schema";
import type { SessionFocus, Subtopic } from "@/lib/taxonomy";
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
      focus: SessionFocus;
      test?: Subtopic;
    };

export function DrillClient({
  rows,
  autoStartIds,
  autoStartRung,
  autoStartTest,
}: {
  rows: CountRow[];
  autoStartIds?: number[] | null;
  /** With difficulty: a mastery-ladder rung. Without: a subtopic drill
   *  (coach prescription / reread follow-up) across all difficulties. */
  autoStartRung?: {
    subtopic: string;
    difficulty: number | null;
    count?: number;
  } | null;
  autoStartTest?: Subtopic | null;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "setup", error: null });
  const autoStartedRef = useRef(false);

  // Subtopic deep links arrive as /drill?sub=…&d=… or /drill?sub=…&n=…
  useEffect(() => {
    if (!autoStartRung || autoStartedRef.current) return;
    autoStartedRef.current = true;
    void handleStart({
      filter: {
        subtopics: [autoStartRung.subtopic as never],
        ...(autoStartRung.difficulty != null && {
          difficultyMin: autoStartRung.difficulty,
          difficultyMax: autoStartRung.difficulty,
        }),
      },
      count: autoStartRung.count ?? 6,
      timing: "soft",
      focus: "focused",
    });
  }, [autoStartRung]);

  // Chapter tests arrive as /drill?test=<subtopic>
  useEffect(() => {
    if (!autoStartTest || autoStartedRef.current) return;
    autoStartedRef.current = true;
    setStage({ kind: "loading" });
    startChapterTest(autoStartTest)
      .then((res) => {
        if (res.error != null || res.sessionId == null) {
          setStage({ kind: "setup", error: res.error ?? "Could not start." });
        } else {
          setStage({
            kind: "running",
            sessionId: res.sessionId,
            questions: res.questions,
            timing: "soft",
            focus: "focused",
            test: autoStartTest,
          });
        }
      })
      .catch(() =>
        setStage({
          kind: "setup",
          error: "Could not start the test — the server did not respond.",
        }),
      );
  }, [autoStartTest]);

  // Twin drills and coach prescriptions arrive as /drill?qids=…
  useEffect(() => {
    if (!autoStartIds?.length || autoStartedRef.current) return;
    autoStartedRef.current = true;
    setStage({ kind: "loading" });
    startDrillWithQuestions(autoStartIds)
      .then((res) => {
        if (res.error != null || res.sessionId == null) {
          setStage({ kind: "setup", error: res.error ?? "Could not start." });
        } else {
          setStage({
            kind: "running",
            sessionId: res.sessionId,
            questions: res.questions,
            timing: "soft",
            focus: "focused",
          });
        }
      })
      .catch(() =>
        setStage({
          kind: "setup",
          error: "Could not start the drill — the server did not respond.",
        }),
      );
  }, [autoStartIds]);

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
        focus: config.focus,
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
        <div className="skeleton h-64 w-full rounded-card" />
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
        focus={stage.focus}
        test={stage.test}
        onRestart={() => setStage({ kind: "setup", error: null })}
      />
    );
  }

  return <DrillSetup rows={rows} error={stage.error} onStart={handleStart} />;
}
