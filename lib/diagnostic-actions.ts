"use server";

import {
  normaliseAnswers,
  scoreDiagnostic,
  type DiagnosticResult,
} from "./diagnostic.ts";

/**
 * Scoring runs on the server so the correct answers never reach the
 * browser. Nothing is written and no session is required: this is the one
 * action in the product an anonymous visitor may call.
 */
export async function scoreDiagnosticAction(
  answers: unknown,
): Promise<DiagnosticResult> {
  return scoreDiagnostic(normaliseAnswers(answers));
}
