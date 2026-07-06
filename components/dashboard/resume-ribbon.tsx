"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { abandonSession, isSessionOpen } from "@/lib/actions";
import {
  clearDrillSnapshot,
  clearTimedSnapshot,
  readDrillSnapshot,
  readTimedSnapshot,
  type DrillSnapshot,
  type TimedSnapshot,
} from "@/lib/inflight";
import { formatSeconds } from "@/lib/utils";

/** Interrupted work surfaces on Today as paper left on the desk.
 *  Snapshots live in localStorage, so this renders nothing on the server
 *  and fills in after mount. */
export function ResumeRibbon() {
  const router = useRouter();
  const [timed, setTimed] = useState<TimedSnapshot | null>(null);
  const [drill, setDrill] = useState<DrillSnapshot | null>(null);

  useEffect(() => {
    const t = readTimedSnapshot();
    const d = readDrillSnapshot();
    if (t) {
      isSessionOpen(t.sessionId)
        .then((open) => (open ? setTimed(t) : clearTimedSnapshot()))
        .catch(() => setTimed(t));
    }
    if (d) {
      isSessionOpen(d.sessionId)
        .then((open) => (open ? setDrill(d) : clearDrillSnapshot()))
        .catch(() => setDrill(d));
    }
  }, []);

  if (!timed && !drill) return null;

  return (
    <div className="space-y-3">
      {timed && (
        <Card className="border-ballpoint/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold">
                You left a section on the desk
              </h2>
              <p className="mt-0.5 text-xs text-graphite">
                {timed.answers.filter(Boolean).length} of{" "}
                {timed.questionIds.length} answered ·{" "}
                {timed.endsAt > Date.now()
                  ? `${formatSeconds((timed.endsAt - Date.now()) / 1000)} still on the clock — it kept running`
                  : "the clock ran out while you were away"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push("/timed?resume=1")}>
                {timed.endsAt > Date.now() ? "Pick up the pen" : "Mark the paper"}
              </Button>
              <Button
                size="sm"
                variant="redpen"
                onClick={() => {
                  clearTimedSnapshot();
                  setTimed(null);
                  void abandonSession(timed.sessionId);
                }}
              >
                Tear it up
              </Button>
            </div>
          </div>
        </Card>
      )}
      {drill && (
        <Card className="border-ballpoint/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-sm font-semibold">
                You left a drill on the desk
              </h2>
              <p className="mt-0.5 text-xs text-graphite">
                {drill.results.length} of {drill.questionIds.length} answered —
                every answer so far already counts.
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => router.push("/drill?resume=1")}>
                Pick up the pen
              </Button>
              <Button
                size="sm"
                variant="redpen"
                onClick={() => {
                  clearDrillSnapshot();
                  setDrill(null);
                  void abandonSession(drill.sessionId);
                }}
              >
                Tear it up
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
