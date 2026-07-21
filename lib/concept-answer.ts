import type { AnswerSpec } from "../curriculum/v3/segments/types.ts";

function normalizedText(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[$`*_]/g, "")
    .trim()
    .replace(/[.,;:!?]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseSimpleNumericAnswer(value: string): number | null {
  const isPercent = value.includes("%");
  const normalized = value
    .normalize("NFKC")
    .replace(/[$,%\s]/g, "")
    .replace(/[−–—]/g, "-");
  const fraction = normalized.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (denominator === 0) return null;
    const result = numerator / denominator / (isPercent ? 100 : 1);
    return Number.isFinite(result) ? result : null;
  }
  if (!/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/.test(normalized)) return null;
  const result = Number(normalized) / (isPercent ? 100 : 1);
  return Number.isFinite(result) ? result : null;
}

export function gradeConceptAnswer(answer: AnswerSpec, response: string): boolean {
  if (answer.kind === "exact") {
    const candidate = answer.caseSensitive ? response.trim() : normalizedText(response);
    return answer.acceptedAnswers.some((accepted) =>
      answer.caseSensitive
        ? accepted.trim() === candidate
        : normalizedText(accepted) === candidate,
    );
  }
  if (answer.kind === "numeric") {
    const parsed = parseSimpleNumericAnswer(response);
    if (parsed == null) return false;
    const tolerance = answer.tolerance ?? Math.max(1e-9, Math.abs(answer.value) * 1e-9);
    return Math.abs(parsed - answer.value) <= tolerance;
  }
  const index = Number(response);
  return Number.isInteger(index) && index === answer.correctIndex;
}

export function answerLabel(answer: AnswerSpec): string {
  if (answer.kind === "exact") return answer.acceptedAnswers[0] ?? "";
  if (answer.kind === "numeric") return String(answer.value);
  return answer.choices[answer.correctIndex] ?? "";
}

export function conceptContentVersionNumber(version: string): number {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) throw new Error(`Invalid concept content version: ${version}`);
  const [major, minor, patch] = match.slice(1).map(Number);
  if ([major, minor, patch].some((part) => !Number.isInteger(part) || part < 0 || part > 999)) {
    throw new Error(`Concept content version parts must be 0..999: ${version}`);
  }
  return major * 1_000_000 + minor * 1_000 + patch;
}
