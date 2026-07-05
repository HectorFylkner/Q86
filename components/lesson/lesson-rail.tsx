"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type RailItem = { id: string; label: string };

function atPageBottom(): boolean {
  const doc = document.documentElement;
  return window.scrollY + window.innerHeight >= doc.scrollHeight - 2;
}

/** Fixed reading-progress bar. Must be mounted OUTSIDE any sticky/aside
 *  subtree: position:sticky creates a stacking context that would trap
 *  the bar's z-index under the app header. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2.5px]"
      aria-hidden
    >
      <div
        className="h-full bg-ballpoint"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}

/** "On this page" scroll-spy nav for the desktop side rail. */
export function LessonRail({ items }: { items: RailItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      // At the bottom the last section may never cross the top threshold;
      // clamp so the final item can light up.
      if (atPageBottom()) {
        setActive(items[items.length - 1]?.id ?? "");
        return;
      }
      let current = items[0]?.id ?? "";
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= 130) current = it.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  return (
    <nav aria-label="On this page" className="space-y-0.5">
      <p className="mb-2 font-mono text-micro uppercase tracking-wider text-graphite">
        On this page
      </p>
      {items.map((it) => (
        <a
          key={it.id}
          href={`#${it.id}`}
          className={cn(
            "block border-l-2 py-1 pl-3 text-sm transition-colors",
            active === it.id
              ? "border-ballpoint font-medium text-ink"
              : "border-grid text-graphite hover:text-ink",
          )}
        >
          {it.label}
        </a>
      ))}
    </nav>
  );
}
