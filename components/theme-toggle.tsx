"use client";

import { useEffect, useState } from "react";

type Mode = "auto" | "dark" | "light";
const ORDER: Mode[] = ["auto", "dark", "light"];
const LABELS: Record<Mode, string> = { auto: "Auto", dark: "Night", light: "Paper" };

function apply(mode: Mode) {
  // The resolved theme is always stamped (see themeInit in app/layout.tsx)
  // so the stylesheet keeps a single dark-token source; auto resolves the
  // OS preference here and on every OS change.
  const root = document.documentElement;
  root.dataset.theme =
    mode === "auto"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : mode;
  window.dispatchEvent(new Event("q86-theme"));
}

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("auto");

  useEffect(() => {
    const saved = localStorage.getItem("q86-theme") as Mode | null;
    if (saved && ORDER.includes(saved)) setMode(saved);
  }, []);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    localStorage.setItem("q86-theme", next);
    apply(next);
  }

  return (
    <button
      onClick={cycle}
      title="Theme: auto follows your system; Night is the dark desk; Paper is the exam-light default"
      className="rounded-control border border-grid px-2.5 py-1 font-mono text-xs text-graphite transition-colors hover:border-graphite/50 hover:text-ink"
    >
      {LABELS[mode]}
    </button>
  );
}
