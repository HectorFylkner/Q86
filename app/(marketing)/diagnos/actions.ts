"use server";

import type { DiagnosticResult } from "@/lib/diagnostic";
import { previewWeek, type PlanPreviewDay } from "@/lib/diagnostic-plan";

/**
 * The plan preview is computed on the server for one reason: it calls the
 * product's real planner, and shipping that to the browser would put the
 * scheduling logic in a bundle a visitor could read and a competitor could
 * lift. It takes no session and writes nothing.
 */
export async function previewWeekAction(
  result: DiagnosticResult,
): Promise<PlanPreviewDay[]> {
  return previewWeek(result).days;
}
