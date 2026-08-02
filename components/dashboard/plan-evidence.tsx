"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { PHASE_LABELS, type DailyPlan, type SkillRecord } from "@/lib/plan";
import {
  SKILL_LABELS,
  FUNDAMENTAL_SKILLS,
  type FundamentalSkill,
} from "@/lib/taxonomy";
import { cn } from "@/lib/utils";

/**
 * The plan, with its reasoning attached.
 *
 * A plan you cannot argue with is a plan you either follow blindly or
 * ignore. Every number here is traceable to the observation that
 * produced it — the rolling record, the imported percentile, the manual
 * override, the phase, the floor — so disagreement can be on grounds
 * rather than on feel, and the override is one click away when the
 * grounds are wrong.
 */
export function PlanEvidence({
  plan,
  skillAccuracy,
  baselineWeakness,
  weightOverrides,
  daysToTest,
}: {
  plan: DailyPlan;
  skillAccuracy: Record<FundamentalSkill, SkillRecord>;
  baselineWeakness: Record<FundamentalSkill, number> | null;
  weightOverrides: Partial<Record<FundamentalSkill, number>> | null;
  daysToTest: number | null;
}) {
  const [open, setOpen] = useState(false);

  const rows = FUNDAMENTAL_SKILLS.map((skill) => {
    const weight = plan.weights[skill];
    const record = skillAccuracy[skill];
    const count = plan.drill.bySkill.find((s) => s.skill === skill)?.count ?? 0;
    const override = weightOverrides?.[skill];
    const platformWeakness =
      record.total > 0 ? 1 - record.correct / record.total : null;
    const baseline = baselineWeakness?.[skill] ?? null;

    const because: string[] = [];
    if (override != null) {
      because.push(
        `You set a manual weight of ${Math.round(override * 100)} for this skill, which overrides the measured record.`,
      );
    } else if (platformWeakness == null) {
      because.push(
        "No focused attempts recorded yet, so it starts at neutral weakness (0.50).",
      );
    } else {
      because.push(
        `${record.correct} of the last ${record.total} focused attempts were right — a measured weakness of ${platformWeakness.toFixed(2)}.`,
      );
    }
    if (baseline != null && override == null) {
      because.push(
        `The imported score report puts this skill's weakness at ${baseline.toFixed(2)}; the two are blended half and half.`,
      );
    }
    if (weight <= 0.0501) {
      because.push(
        "Pinned at the 5% floor: every skill keeps a maintenance share so a mastered topic cannot quietly rot.",
      );
    }

    return { skill, weight, count, record, because };
  }).sort((a, b) => b.weight - a.weight);

  const totalReason =
    daysToTest == null
      ? "No test date set, so volume sits at the default 12."
      : `${daysToTest} days out puts you in the ${plan.phase ? PHASE_LABELS[plan.phase] : "—"} phase, which sets today's volume at ${plan.drill.total}.`;

  return (
    <section className="rounded-card border border-grid bg-surface p-4 shadow-ambient">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-display text-title font-semibold">
          Why today looks like this
        </h2>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 text-caption text-ballpoint hover:underline"
        >
          <ChevronDown
            size={13}
            className={cn("transition-transform", open && "rotate-180")}
            aria-hidden
          />
          {open ? "Hide the evidence" : "Show the evidence"}
        </button>
      </div>
      <p className="mt-0.5 max-w-[72ch] text-caption text-graphite">
        {totalReason} The mix comes from rolling accuracy blended with the
        imported report, with a 5% floor per skill.{" "}
        <Link href="/analytics" className="text-ballpoint hover:underline">
          The numbers behind it are on Analytics
        </Link>
        .
      </p>

      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.skill}>
            <div className="flex items-center gap-3 text-body">
              <span className="w-56 shrink-0 truncate sm:w-64">
                {SKILL_LABELS[row.skill]}
              </span>
              <div
                className="h-2 flex-1 rounded-full bg-grid"
                role="img"
                aria-label={`${Math.round(row.weight * 100)} percent of today's mix`}
              >
                <div
                  className="h-2 rounded-full bg-ballpoint"
                  style={{ width: `${Math.round(row.weight * 100)}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right font-mono text-caption font-medium">
                {Math.round(row.weight * 100)}%
              </span>
              <span className="w-20 shrink-0 text-right font-mono text-micro text-graphite">
                {row.count} question{row.count === 1 ? "" : "s"}
              </span>
            </div>
            {open && (
              <ul className="ml-1 mt-1 space-y-0.5 border-l-2 border-grid pl-3">
                {row.because.map((reason, i) => (
                  <li key={i} className="text-caption text-graphite">
                    {reason}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
