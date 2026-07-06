"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { markLessonRead, saveLessonChecklist } from "@/lib/actions";
import type { Subtopic } from "@/lib/taxonomy";

/** Pre-server lesson progress lived in localStorage under
 *  `q86-learn:<subtopic>` as {c: checked indexes, t: item count}. This
 *  one-shot sync pushes any chapter the server does not know about yet
 *  into lesson_progress, then refreshes so the server-rendered badges
 *  pick it up. Safe to mount on every visit: chapters the server
 *  already tracks are skipped. */
export function LessonProgressSync({ known }: { known: Subtopic[] }) {
  const router = useRouter();
  const ranRef = useRef(false);
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    const knownSet = new Set<string>(known);
    const jobs: Promise<void>[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key?.startsWith("q86-learn:")) continue;
        const subtopic = key.slice("q86-learn:".length);
        if (knownSet.has(subtopic)) continue;
        try {
          const saved = JSON.parse(localStorage.getItem(key) ?? "") as {
            c?: number[];
            t?: number;
          };
          if (!Array.isArray(saved.c) || typeof saved.t !== "number") continue;
          jobs.push(
            saveLessonChecklist(subtopic as Subtopic, saved.c, saved.t),
          );
        } catch {
          // Corrupt entry — leave it; the server simply never learns of it.
        }
      }
    } catch {
      // localStorage unavailable — nothing to migrate.
    }
    if (jobs.length > 0) {
      Promise.allSettled(jobs).then(() => router.refresh());
    }
  }, [known, router]);
  return null;
}

/** Stamps read_at on first open so the plan can tell "never opened"
 *  from "opened but not finished". Renders nothing. */
export function MarkLessonRead({
  subtopic,
  alreadyRead,
}: {
  subtopic: Subtopic;
  alreadyRead: boolean;
}) {
  const sentRef = useRef(false);
  useEffect(() => {
    if (alreadyRead || sentRef.current) return;
    sentRef.current = true;
    markLessonRead(subtopic).catch(() => {
      // Offline or server hiccup — the next visit will stamp it.
    });
  }, [subtopic, alreadyRead]);
  return null;
}
