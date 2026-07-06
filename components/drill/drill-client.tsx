"use client";

import { useEffect, useRef, useState } from "react";
import {
  abandonSession,
  fetchQuestionsByIds,
  isSessionOpen,
  startChapterTest,
  startDrill,
  startDrillWithQuestions,
  type DrillTiming,
} from "@/lib/actions";
import {
  clearDrillSnapshot,
  readDrillSnapshot,
  type DrillSnapshot,
} from "@/lib/inflight";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Question } from "@/lib/db/schema";
import type { SessionFocus, Subtopic } from "@/lib/taxonomy";
import { DrillSetup, type CountRow, type DrillConfigValue } from "./drill-setup";
import { QuestionRunner, type RunnerResumeState } from "./question-runner";

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
      mode?: "drill" | "redo";
      resumeState?: RunnerResumeState;
    };

export function DrillClient({
  rows,
  autoStartIds,
  autoStartRung,
  autoStartTest,
  autoResume,
}: {
  rows: CountRow[];
  autoStartIds?: number[] | null;
  autoStartRung?: { subtopic: string; difficulty: number } | null;
  autoStartTest?: Subtopic | null;
  autoResume?: boolean;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "setup", error: null });
  const [resumeOffer, setResumeOffer] = useState<DrillSnapshot | null>(null);
  const autoStartedRef = useRef(false);

  // A snapshot on the desk: confirm the session is still open, then offer
  // it in setup (or resume straight away from /drill?resume=1).
  useEffect(() => {
    if (autoStartedRef.current) return;
    const snap = readDrillSnapshot();
    if (!snap) return;
    let cancelled = false;
    isSessionOpen(snap.sessionId)
      .then((open) => {
        if (cancelled) return;
        if (!open) {
          clearDrillSnapshot();
          return;
        }
        if (autoResume) void resumeFrom(snap);
        else setResumeOffer(snap);
      })
      .catch(() => {
        if (!cancelled) setResumeOffer(snap);
      });
    return () => {
      cancelled = true;
    };
    // Mount-only by design: the snapshot offer is read once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function resumeFrom(snap: DrillSnapshot) {
    setStage({ kind: "loading" });
    try {
      const qs = await fetchQuestionsByIds(snap.questionIds);
      if (qs.length !== snap.questionIds.length) {
        clearDrillSnapshot();
        setResumeOffer(null);
        setStage({
          kind: "setup",
          error: "That drill can't be resumed — its questions are gone.",
        });
        return;
      }
      setResumeOffer(null);
      setStage({
        kind: "running",
        sessionId: snap.sessionId,
        questions: qs,
        timing: snap.timing,
        focus: snap.focus,
        test: (snap.test as Subtopic | null) ?? undefined,
        mode: snap.mode,
        resumeState: {
          index: snap.index,
          phase: snap.phase,
          results: snap.results,
          questionStartedAt: snap.questionStartedAt,
        },
      });
    } catch {
      setStage({
        kind: "setup",
        error: "Could not resume — the server did not respond.",
      });
    }
  }

  function tearUp(snap: DrillSnapshot) {
    clearDrillSnapshot();
    setResumeOffer(null);
    void abandonSession(snap.sessionId);
  }

  // Mastery-ladder rung drills arrive as /drill?sub=…&d=…
  useEffect(() => {
    if (!autoStartRung || autoStartedRef.current) return;
    autoStartedRef.current = true;
    void handleStart({
      filter: {
        subtopics: [autoStartRung.subtopic as never],
        difficultyMin: autoStartRung.difficulty,
        difficultyMax: autoStartRung.difficulty,
      },
      count: 6,
      timing: "soft",
      focus: "focused",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Starting fresh supersedes anything left on the desk.
    clearDrillSnapshot();
    setResumeOffer(null);
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
        mode={stage.mode ?? "drill"}
        questions={stage.questions}
        timing={stage.timing}
        focus={stage.focus}
        test={stage.test}
        resumeState={stage.resumeState}
        onRestart={() => setStage({ kind: "setup", error: null })}
      />
    );
  }

  return (
    <div className="space-y-5">
      {resumeOffer && (
        <Card className="border-ballpoint/40 p-5">
          <h2 className="font-display text-base font-semibold">
            A drill is still on the desk
          </h2>
          <p className="mt-1 text-sm text-graphite">
            {resumeOffer.results.length} of {resumeOffer.questionIds.length}{" "}
            answered — every answer so far already counts.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => resumeFrom(resumeOffer)}>
              Pick up the pen
            </Button>
            <Button variant="redpen" onClick={() => tearUp(resumeOffer)}>
              Tear it up
            </Button>
          </div>
        </Card>
      )}
      <DrillSetup rows={rows} error={stage.error} onStart={handleStart} />
    </div>
  );
}
