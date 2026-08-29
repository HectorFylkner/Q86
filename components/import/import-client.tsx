"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveBaselineReport } from "@/lib/actions";
import type { ParsedReport } from "@/lib/ai/schemas";
import { useT } from "@/components/i18n-provider";
import type { Key } from "@/lib/i18n";
import { limitMessage } from "@/lib/ops/limit-message";
import { contextLabel, domainLabel, skillLabel } from "@/lib/i18n/labels";
import { cn } from "@/lib/utils";

type Stage =
  | { kind: "editing" }
  | { kind: "parsing" }
  | { kind: "review"; parsed: ParsedReport }
  | { kind: "saving"; parsed: ParsedReport }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/** GMAT section names, kept in English inside Swedish prose because that
 *  is how they appear on the report the reader is holding. */
const SECTION_KEYS: Record<string, Key> = {
  quant: "importer.sectionQuant",
  verbal: "importer.sectionVerbal",
  data_insights: "importer.sectionDataInsights",
};

export function ImportClient() {
  const t = useT();
  const router = useRouter();
  const [rawText, setRawText] = useState("");
  const [stage, setStage] = useState<Stage>({ kind: "editing" });

  async function parse() {
    setStage({ kind: "parsing" });
    try {
      const res = await fetch("/api/parse-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });
      const body = (await res.json()) as {
        parsed?: ParsedReport;
        error?: string;
        reason?: string;
      };
      const limited = limitMessage(t, body);
      if (limited) throw new Error(limited);
      if (!res.ok || !body.parsed) {
        throw new Error(body.error ?? `Parsing failed (${res.status}).`);
      }
      setStage({ kind: "review", parsed: body.parsed });
    } catch (e) {
      setStage({
        kind: "error",
        message:
          e instanceof Error
            ? e.message
            : t("importer.parseFailed"),
      });
    }
  }

  async function confirmSave(parsed: ParsedReport) {
    setStage({ kind: "saving", parsed });
    try {
      await saveBaselineReport({ rawText, parsed });
      setStage({ kind: "saved" });
      setRawText("");
      router.refresh();
    } catch {
      setStage({
        kind: "error",
        message: t("importer.saveFailed"),
      });
    }
  }

  const parsed =
    stage.kind === "review" || stage.kind === "saving" ? stage.parsed : null;

  return (
    <div className="space-y-5">
      <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
        <h2 className="font-display text-sm font-semibold">
          {t("importer.pasteTitle")}
        </h2>
        <p className="mt-1 text-xs text-graphite">{t("importer.pasteLede")}</p>
        <textarea
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            if (stage.kind === "saved" || stage.kind === "error")
              setStage({ kind: "editing" });
          }}
          rows={10}
          placeholder={t("importer.pastePlaceholder")}
          className="mt-3 w-full rounded-control border border-grid bg-surface px-3 py-2 font-mono text-xs placeholder:text-graphite/60"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={parse}
            disabled={rawText.trim().length < 40 || stage.kind === "parsing"}
            className={cn(
              "rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90",
              (rawText.trim().length < 40 || stage.kind === "parsing") &&
                "cursor-not-allowed opacity-50",
            )}
          >
            {t("importer.parseButton")}
          </button>
          {stage.kind === "parsing" && (
            <span className="flex items-center gap-2 text-sm text-graphite">
              <span className="skeleton h-3 w-3 rounded-full" />
              {t("importer.parsing")}
            </span>
          )}
          {stage.kind === "saved" && (
            <span className="text-sm text-ballpoint">
              {t("importer.saved")}
            </span>
          )}
          {stage.kind === "error" && (
            <span className="text-sm text-redpen">{stage.message}</span>
          )}
        </div>
      </section>

      {parsed && (
        <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
          <h2 className="font-display text-sm font-semibold">
            {t("importer.parsedTitle")}
          </h2>

          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium text-graphite">
                {t("importer.sections")}
              </h3>
              <table className="mt-1 w-full text-sm">
                <tbody>
                  {parsed.sections.map((s) => (
                    <tr key={s.section} className="border-t border-grid">
                      <td className="py-1.5 pr-2">
                        {s.section in SECTION_KEYS
                          ? t(SECTION_KEYS[s.section])
                          : s.section}
                      </td>
                      <td className="py-1.5 pr-2 font-mono">
                        {s.scaled_score ?? "—"}
                      </td>
                      <td className="py-1.5 font-mono text-xs text-graphite">
                        {s.percentile != null ? `${s.percentile}th pct` : "—"}
                      </td>
                    </tr>
                  ))}
                  {parsed.total_score != null && (
                    <tr className="border-t border-grid font-medium">
                      <td className="py-1.5 pr-2">{t("importer.total")}</td>
                      <td className="py-1.5 font-mono" colSpan={2}>
                        {parsed.total_score}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-xs font-medium text-graphite">
                {t("importer.quantSkills")}
              </h3>
              <table className="mt-1 w-full text-sm">
                <tbody>
                  {parsed.fundamental_skills.map((s) => (
                    <tr key={s.skill} className="border-t border-grid">
                      <td className="py-1.5 pr-2">
                        {skillLabel(t, s.skill)}
                      </td>
                      <td className="py-1.5 font-mono">
                        {t("importer.percentile", { value: s.percentile })}
                      </td>
                    </tr>
                  ))}
                  {parsed.fundamental_skills.length === 0 && (
                    <tr>
                      <td className="py-1.5 text-xs text-graphite">
                        {t("importer.noneInText")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <h3 className="mt-3 text-xs font-medium text-graphite">
                {t("importer.domainsContexts")}
              </h3>
              <p className="mt-1 text-sm">
                {[
                  ...parsed.content_domains.map(
                    (d) =>
                      `${domainLabel(t, d.domain)} ${t("importer.percentile", {
                        value: d.percentile,
                      })}`,
                  ),
                  ...parsed.contexts.map(
                    (c) =>
                      `${contextLabel(t, c.context)} ${t("importer.percentile", {
                        value: c.percentile,
                      })}`,
                  ),
                ].join(" · ") || t("importer.noneFound")}
              </p>

              {parsed.per_question_rows.length > 0 && (
                <p className="mt-3 text-xs text-graphite">
                  {t("importer.timingRows", {
                    count: parsed.per_question_rows.length,
                  })}
                </p>
              )}
              {parsed.test_date && (
                <p className="mt-1 text-xs text-graphite">
                  {t("importer.testDate", { date: parsed.test_date })}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-3 border-t border-grid pt-3">
            <button
              onClick={() => confirmSave(parsed)}
              disabled={stage.kind === "saving"}
              className={cn(
                "rounded-control bg-ballpoint px-4 py-2 text-sm font-medium text-white hover:bg-ballpoint/90",
                stage.kind === "saving" && "cursor-wait opacity-60",
              )}
            >
              {stage.kind === "saving"
                ? t("common.saving")
                : t("importer.confirmSave")}
            </button>
            <button
              onClick={() => setStage({ kind: "editing" })}
              className="rounded-control border border-grid bg-surface px-4 py-2 text-sm hover:border-graphite/50"
            >
              {t("importer.discard")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
