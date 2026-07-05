"use client";

import { useEffect, useRef, useState } from "react";
import {
  startChapterTest,
  startDrill,
  startDrillWithQuestions,
  type DrillTiming,
} from "@/lib/actions";
import type { ChapterTier } from "@/lib/chapter-test-config";
import type { Question } from "@/lib/db/schema";
import type { RampBudget } from "@/lib/ramp";
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
      budgets: Record<number, RampBudget>;
      test?: Subtopic;
      testTier?: ChapterTier;
      rung?: { subtopic: string; difficulty: number } | null;
    };

export function DrillClient({
  rows,
  autoStartIds,
  autoStartRung,
  autoStartTest,
}: {
  rows: CountRow[];
  autoStartIds?: number[] | null;
  autoStartRung?: {
    subtopic: string;
    difficulty: number | null;
    count: number;
  } | null;
  autoStartTest?: { subtopic: Subtopic; tier: ChapterTier } | null;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "setup", error: null });
  const autoStartedRef = useRef(false);

  // Mastery-ladder rung drills arrive as /drill?sub=…&d=…; coach
  // prescriptions as /drill?sub=…&n=… (any difficulty).
  useEffect(() => {
    if (!autoStartRung || autoStartedRef.current) return;
    autoStartedRef.current = true;
    void handleStart(
      {
        filter: {
          subtopics: [autoStartRung.subtopic as never],
          ...(autoStartRung.difficulty != null
            ? {
                difficultyMin: autoStartRung.difficulty,
                difficultyMax: autoStartRung.difficulty,
              }
            : {}),
        },
        count: autoStartRung.count,
        timing: "soft",
        focus: "focused",
      },
      autoStartRung.difficulty != null
        ? {
            subtopic: autoStartRung.subtopic,
            difficulty: autoStartRung.difficulty,
          }
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStartRung]);

  // Chapter tests arrive as /drill?test=<subtopic>[&tier=…]
  useEffect(() => {
    if (!autoStartTest || autoStartedRef.current) return;
    autoStartedRef.current = true;
    setStage({ kind: "loading" });
    startChapterTest(autoStartTest.subtopic, autoStartTest.tier)
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
            budgets: res.budgets,
            test: autoStartTest.subtopic,
            testTier: autoStartTest.tier,
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
            budgets: res.budgets,
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

  async function handleStart(
    config: DrillConfigValue,
    rung: { subtopic: string; difficulty: number } | null = null,
  ) {
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
        budgets: res.budgets,
        rung,
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
        testTier={stage.testTier}
        rung={stage.rung}
        budgets={stage.budgets}
        onRestart={() => setStage({ kind: "setup", error: null })}
      />
    );
  }

  return <DrillSetup rows={rows} error={stage.error} onStart={handleStart} />;
}
