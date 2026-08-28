"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/i18n-provider";

type Mode = "auto" | "dark" | "light";
const ORDER: Mode[] = ["auto", "dark", "light"];

function apply(mode: Mode) {
  const root = document.documentElement;
  if (mode === "auto") delete root.dataset.theme;
  else root.dataset.theme = mode;
  window.dispatchEvent(new Event("q86-theme"));
}

export function ThemeToggle() {
  const t = useT();
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

  const label =
    mode === "auto"
      ? t("theme.auto")
      : mode === "dark"
        ? t("theme.night")
        : t("theme.paper");

  return (
    <button
      onClick={cycle}
      title={t("theme.hint")}
      aria-label={t("theme.label")}
      className="rounded-control border border-grid px-2.5 py-1 font-mono text-xs text-graphite transition-colors hover:border-graphite/50 hover:text-ink"
    >
      {label}
    </button>
  );
}
