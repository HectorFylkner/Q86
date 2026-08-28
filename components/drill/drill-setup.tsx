"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuestionFilter } from "@/lib/engine";
import type { DrillTiming } from "@/lib/actions";
import {
  DIFFICULTIES,
  FUNDAMENTAL_SKILLS,
  SUBTOPICS_BY_SKILL,
  type FundamentalSkill,
  type QuestionFormat,
  type SessionFocus,
  type Subtopic,
} from "@/lib/taxonomy";
import { useT } from "@/components/i18n-provider";
import { skillLabel, subtopicLabel } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

export type CountRow = {
  subtopic: Subtopic;
  difficulty: number;
  format: QuestionFormat;
  count: number;
};

export type DrillConfigValue = {
  filter: QuestionFilter;
  count: number;
  timing: DrillTiming;
  focus: SessionFocus;
};

const COUNT_OPTIONS = [5, 10, 15, 20];

export function DrillSetup({
  rows,
  error,
  onStart,
  canGenerate,
}: {
  rows: CountRow[];
  error: string | null;
  onStart: (config: DrillConfigValue) => void;
  /** Generation writes into the shared verified bank, so it belongs to the
   *  operator rather than to a subscriber (ADR 0001 §2). */
  canGenerate: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [skill, setSkill] = useState<FundamentalSkill | "all">(
    "value_order_factors",
  );
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [diffMin, setDiffMin] = useState(2);
  const [diffMax, setDiffMax] = useState(5);
  const [count, setCount] = useState(10);
  const [timing, setTiming] = useState<DrillTiming>("soft");
  const [format, setFormat] = useState<QuestionFormat | "all">("all");
  const [focus, setFocus] = useState<SessionFocus>("focused");
  const [genState, setGenState] = useState<
    | { kind: "idle" }
    | { kind: "working"; stage: string }
    | { kind: "done"; verified: number; failed: number }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  const skillSubtopics: readonly Subtopic[] =
    skill === "all"
      ? (Object.values(SUBTOPICS_BY_SKILL).flat() as Subtopic[])
      : SUBTOPICS_BY_SKILL[skill];

  const matching = useMemo(() => {
    const subs = subtopics.length > 0 ? subtopics : skillSubtopics;
    return rows
      .filter(
        (r) =>
          subs.includes(r.subtopic) &&
          r.difficulty >= diffMin &&
          r.difficulty <= diffMax &&
          (format === "all" || r.format === format),
      )
      .reduce((s, r) => s + r.count, 0);
  }, [rows, subtopics, skillSubtopics, diffMin, diffMax, format]);

  function toggleSubtopic(s: Subtopic) {
    setSubtopics((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  }

  function buildFilter(): QuestionFilter {
    return {
      skills: skill === "all" ? undefined : [skill],
      subtopics: subtopics.length > 0 ? subtopics : undefined,
      formats: format === "all" ? undefined : [format],
      difficultyMin: diffMin,
      difficultyMax: diffMax,
    };
  }

  async function generateMore() {
    setGenState({ kind: "working", stage: t("drillSetup.generating") });
    const stages = [t("drillSetup.generating"), t("drillSetup.verifying")];
    let stageIdx = 0;
    const ticker = setInterval(() => {
      stageIdx = (stageIdx + 1) % stages.length;
      setGenState((s) =>
        s.kind === "working" ? { kind: "working", stage: stages[stageIdx] } : s,
      );
    }, 6000);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          count: 10,
          skill: skill === "all" ? undefined : skill,
          subtopics: subtopics.length > 0 ? subtopics : undefined,
          difficultyMin: diffMin,
          difficultyMax: diffMax,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          (body as { error?: string } | null)?.error ??
            `Generation failed with status ${res.status}.`,
        );
      }
      const body = (await res.json()) as { verified: number; failed: number };
      setGenState({ kind: "done", verified: body.verified, failed: body.failed });
      router.refresh();
    } catch (e) {
      setGenState({
        kind: "error",
        message:
          e instanceof Error
            ? e.message
            : t("drillSetup.generateFailed"),
      });
    } finally {
      clearInterval(ticker);
    }
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-control border border-redpen/40 bg-redpen/5 px-3 py-2 text-sm text-redpen">
          {error}
        </p>
      )}

      <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <h2 className="font-display text-base font-semibold">
          {t("drillSetup.skill")}
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {(["all", ...FUNDAMENTAL_SKILLS] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setSkill(s);
                setSubtopics([]);
              }}
              className={cn(
                "rounded-control border px-3 py-1.5 text-sm transition-colors duration-150",
                skill === s
                  ? "border-ink bg-highlight font-medium"
                  : "border-grid text-graphite hover:border-graphite/50",
              )}
            >
              {s === "all" ? t("drillSetup.allSkills") : skillLabel(t, s)}
            </button>
          ))}
        </div>

        <h2 className="mt-4 font-display text-base font-semibold">
          {t("drillSetup.subtopics")}
          <span className="ml-2 text-xs font-normal text-graphite">
            {t("drillSetup.subtopicsHint")}
          </span>
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skillSubtopics.map((s) => (
            <button
              key={s}
              onClick={() => toggleSubtopic(s)}
              className={cn(
                "rounded-control border px-2.5 py-1 text-xs transition-colors duration-150",
                subtopics.includes(s)
                  ? "border-ink bg-highlight font-medium"
                  : "border-grid text-graphite hover:border-graphite/50",
              )}
            >
              {subtopicLabel(t, s)}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-sm font-medium">{t("drillSetup.difficulty")}</h3>
            <div className="mt-1.5 flex items-center gap-2 text-sm">
              <select
                aria-label={t("drillSetup.minDifficulty")}
                value={diffMin}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDiffMin(v);
                  if (v > diffMax) setDiffMax(v);
                }}
                className="rounded-control border border-grid bg-surface px-2 py-1"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    D{d}
                  </option>
                ))}
              </select>
              <span className="text-graphite">{t("drillSetup.to")}</span>
              <select
                aria-label={t("drillSetup.maxDifficulty")}
                value={diffMax}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDiffMax(v);
                  if (v < diffMin) setDiffMin(v);
                }}
                className="rounded-control border border-grid bg-surface px-2 py-1"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    D{d}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-[11px] text-graphite">
              {t("drillSetup.difficultyNote")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium">
              {t("drillSetup.questionCount")}
            </h3>
            <div className="mt-1.5 flex gap-1.5">
              {COUNT_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setCount(c)}
                  className={cn(
                    "rounded-control border px-2.5 py-1 font-mono text-sm",
                    count === c
                      ? "border-ink bg-highlight font-medium"
                      : "border-grid text-graphite hover:border-graphite/50",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">{t("drillSetup.timing")}</h3>
            <div className="mt-1.5 flex gap-1.5">
              {(
                [
                  ["untimed", t("drillSetup.untimed")],
                  ["soft", t("drillSetup.softTarget")],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTiming(value)}
                  className={cn(
                    "rounded-control border px-2.5 py-1 text-sm",
                    timing === value
                      ? "border-ink bg-highlight font-medium"
                      : "border-grid text-graphite hover:border-graphite/50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium">{t("drillSetup.format")}</h3>
            <div className="mt-1.5 flex gap-1.5">
              {(
                [
                  ["all", t("drillSetup.bothFormats")],
                  ["problem_solving", "PS"],
                  ["data_sufficiency", "DS · Data Insights"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setFormat(value)}
                  className={cn(
                    "rounded-control border px-2.5 py-1 text-sm",
                    format === value
                      ? "border-ink bg-highlight font-medium"
                      : "border-grid text-graphite hover:border-graphite/50",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 border-t border-grid pt-4">
          <h3 className="text-sm font-medium">
            {t("drillSetup.sessionFocus")}
          </h3>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {(
              [
                ["focused", t("drillSetup.focused")],
                ["casual", t("drillSetup.casual")],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFocus(value)}
                className={cn(
                  "rounded-control border px-2.5 py-1 text-sm",
                  focus === value
                    ? "border-ink bg-highlight font-medium"
                    : "border-grid text-graphite hover:border-graphite/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {focus === "casual" && (
            <p className="mt-1.5 text-[11px] text-amber">
              {t("drillSetup.casualNote")}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-grid pt-4">
          <button
            onClick={() =>
              onStart({
                filter: buildFilter(),
                count: Math.min(count, matching),
                timing,
                focus,
              })
            }
            disabled={matching === 0}
            className={cn(
              "rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90",
              matching === 0 && "cursor-not-allowed opacity-50",
            )}
          >
            {t("drillSetup.startDrill", { count: Math.min(count, matching) })}
          </button>
          <span className="text-sm text-graphite">
            {t("drillSetup.matching", { count: matching })}
            {matching > 0 && matching < count && t("drillSetup.clamped")}
          </span>
        </div>
      </section>

      {canGenerate && (
      <section className="rounded-card border border-grid bg-surface p-5 shadow-ambient">
        <h2 className="font-display text-base font-semibold">
          {t("drillSetup.generateTitle")}
        </h2>
        <p className="mt-1 text-sm text-graphite">
          {t("drillSetup.generateLede")}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={generateMore}
            disabled={genState.kind === "working"}
            className={cn(
              "rounded-control border border-ballpoint px-4 py-2 text-sm font-medium text-ballpoint hover:bg-ballpoint/5",
              genState.kind === "working" && "cursor-wait opacity-60",
            )}
          >
            {t("drillSetup.generateButton")}
          </button>
          {genState.kind === "working" && (
            <span className="flex items-center gap-2 text-sm text-graphite">
              <span className="skeleton h-3 w-3 rounded-full" />
              {genState.stage}
            </span>
          )}
          {genState.kind === "done" && (
            <span className="text-sm">
              <span className="text-ballpoint">
                {t("drillSetup.generatedVerified", {
                  count: genState.verified,
                })}
              </span>
              {genState.failed > 0 && (
                <span className="text-graphite">
                  {" · "}
                  {t("drillSetup.generatedFailed", { count: genState.failed })}
                </span>
              )}
            </span>
          )}
          {genState.kind === "error" && (
            <span className="text-sm text-redpen">{genState.message}</span>
          )}
        </div>
      </section>
      )}
    </div>
  );
}
