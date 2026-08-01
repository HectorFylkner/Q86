"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Announcements for things that change without the user acting on them,
 * or whose visual change is the whole message.
 *
 * A timed section with a running clock and no live region is not usable
 * without sight: the one piece of information that decides every
 * abandon-or-continue call is invisible to a screen reader. Same for an
 * answer result, which is a drawn stroke and a colour — nothing a
 * screen reader can read — and for the redo queue, where clearing an
 * item changes state on the page but not the focused element.
 */

/**
 * A polite live region. Renders visually hidden; the text is announced
 * when it changes.
 *
 * `assertive` is reserved for the clock's final warnings, where waiting
 * for a pause in speech would defeat the purpose.
 */
export function Announce({
  message,
  assertive = false,
  atomic = true,
}: {
  message: string;
  assertive?: boolean;
  atomic?: boolean;
}) {
  return (
    <div
      role={assertive ? "alert" : "status"}
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * A clock that announces on a coarse schedule instead of every tick.
 *
 * A per-second live region is unusable — the screen reader never stops
 * talking and nothing else can be heard. This announces at each stated
 * milestone once, so the information arrives when it matters and is
 * silent the rest of the time.
 */
const CLOCK_MILESTONES = [
  30 * 60,
  20 * 60,
  15 * 60,
  10 * 60,
  5 * 60,
  2 * 60,
  60,
  30,
  10,
];

export function ClockAnnouncer({
  remainingSeconds,
  questionNumber,
  totalQuestions,
}: {
  remainingSeconds: number;
  questionNumber: number;
  totalQuestions: number;
}) {
  const [message, setMessage] = useState("");
  const announced = useRef(new Set<number>());

  useEffect(() => {
    const next = CLOCK_MILESTONES.find(
      (m) => remainingSeconds <= m && !announced.current.has(m),
    );
    if (next == null) return;
    announced.current.add(next);
    const minutes = Math.floor(next / 60);
    const label =
      next >= 60
        ? `${minutes} minute${minutes === 1 ? "" : "s"} remaining`
        : `${next} seconds remaining`;
    setMessage(
      `${label}. Question ${questionNumber} of ${totalQuestions}.`,
    );
  }, [remainingSeconds, questionNumber, totalQuestions]);

  return <Announce message={message} assertive={remainingSeconds <= 120} />;
}

/**
 * The clock, readable on demand rather than only on a milestone.
 *
 * `role="timer"` plus an accessible name means assistive tech can be
 * pointed at it and asked "what does it say now" without the region
 * interrupting anything.
 */
export function TimerReadout({
  remainingSeconds,
  className,
}: {
  remainingSeconds: number;
  className?: string;
}) {
  const m = Math.floor(Math.max(0, remainingSeconds) / 60);
  const s = Math.floor(Math.max(0, remainingSeconds) % 60);
  return (
    <span
      role="timer"
      aria-label={`Time remaining: ${m} minute${m === 1 ? "" : "s"} ${s} second${s === 1 ? "" : "s"}`}
      className={className}
    >
      {m}:{String(s).padStart(2, "0")}
    </span>
  );
}
