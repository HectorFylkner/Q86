import { generateObject, type LanguageModel } from "ai";
import { evaluate } from "mathjs";
import { getModel, withRetry } from "./model.ts";
import { verifierResultSchema } from "./schemas.ts";
import { verifierSystem, verifierUser } from "./prompts.ts";

/**
 * Convert a KaTeX-flavored answer choice like "$\frac{3}{4}$" or "\$1{,}200"
 * into a mathjs-evaluable string. Returns null when the choice is not a
 * plain numeric value.
 */
export function latexChoiceToExpression(choice: string): string | null {
  let s = choice.trim();
  s = s.replaceAll("\\$", ""); // currency dollars
  s = s.replaceAll("$", ""); // math delimiters
  s = s.replaceAll("{,}", "").replace(/(\d),(?=\d{3}\b)/g, "$1");
  s = s.replaceAll("−", "-").replaceAll("–", "-");
  s = s.replace(/\\left|\\right|\\,|\\;|\\!|~/g, "");
  s = s.replace(/\\(cdot|times)/g, "*");
  s = s.replaceAll("\\pi", "pi");
  // Mixed numbers: a digit directly before \frac means addition by
  // convention ("3 1/2" = 3.5), not implicit multiplication. A negative
  // mixed number would need distribution — bail out instead of guessing.
  if (/-\s*\d+\s*\\[dt]?frac/.test(s)) return null;
  s = s.replace(/(\d)\s*(\\[dt]?frac)/g, "$1+$2");
  // Innermost-first expansion: each pattern matches only brace-free
  // arguments, so iterating resolves any nesting order — \frac{\sqrt{2}}{2},
  // \sqrt{\frac{1}{2}}, 2^{\frac{1}{2}} — where sequential single passes
  // used to bail to null on cross-nested constructs.
  for (
    let i = 0;
    i < 8 && /\\[dt]?frac|\\sqrt|\^\{/.test(s);
    i++
  ) {
    s = s
      .replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, "(($1)/($2))")
      .replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, "(($2)^(1/$1))")
      .replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)")
      .replace(/\^\{([^{}]*)\}/g, "^($1)");
  }
  s = s.replaceAll("{", "(").replaceAll("}", ")");
  s = s.trim();
  if (s.length === 0 || /\\|[a-df-oq-z]/i.test(s.replace(/sqrt|pi|abs/g, ""))) {
    // leftover LaTeX or stray letters (units, variables) → not a plain number
    return null;
  }
  return s;
}

export function evaluateExpression(expr: string): number | null {
  try {
    const value: unknown = evaluate(expr);
    const n =
      typeof value === "number"
        ? value
        : typeof (value as { valueOf?: () => unknown })?.valueOf === "function"
          ? Number((value as { valueOf: () => unknown }).valueOf())
          : NaN;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

export function numbersAgree(a: number, b: number): boolean {
  const scale = Math.max(1, Math.abs(a), Math.abs(b));
  return Math.abs(a - b) / scale < 1e-9;
}

export type VerificationOutcome = {
  passed: boolean;
  solverIndex: number;
  solverReason: string;
  numericCheckRan: boolean;
  detail: string | null;
};

/**
 * §8.2 hard gate. The verifier receives ONLY the stem and choices — never
 * the intended key. If numeric_check exists, mathjs must also agree with
 * the numeric value of the intended correct choice.
 */
export async function verifyCandidate(
  candidate: {
    stem_md: string;
    choices: string[];
    correct_index: number;
    numeric_check: string | null;
  },
  model?: LanguageModel,
): Promise<VerificationOutcome> {
  const { object } = await withRetry(async () =>
    generateObject({
      model: model ?? (await getModel()),
      temperature: 0,
      schema: verifierResultSchema,
      system: verifierSystem(),
      prompt: verifierUser(candidate.stem_md, candidate.choices),
    }),
  );

  if (object.answer_index !== candidate.correct_index) {
    return {
      passed: false,
      solverIndex: object.answer_index,
      solverReason: object.one_line_reason,
      numericCheckRan: false,
      detail: `Independent solver picked index ${object.answer_index} (intended ${candidate.correct_index}): ${object.one_line_reason}`,
    };
  }

  // The solver flagging "no exact match" means the question is defective
  // even when its closest pick coincides with the intended key.
  if (/^\s*NO[\s-]?MATCH/i.test(object.one_line_reason)) {
    return {
      passed: false,
      solverIndex: object.answer_index,
      solverReason: object.one_line_reason,
      numericCheckRan: false,
      detail: `Independent solver found no exactly matching choice: ${object.one_line_reason}`,
    };
  }

  if (candidate.numeric_check) {
    const expected = evaluateExpression(candidate.numeric_check);
    if (expected == null) {
      return {
        passed: false,
        solverIndex: object.answer_index,
        solverReason: object.one_line_reason,
        numericCheckRan: true,
        detail: `numeric_check "${candidate.numeric_check}" is not evaluable by mathjs`,
      };
    }
    const choiceExpr = latexChoiceToExpression(
      candidate.choices[candidate.correct_index],
    );
    const actual = choiceExpr == null ? null : evaluateExpression(choiceExpr);
    if (actual == null || !numbersAgree(expected, actual)) {
      return {
        passed: false,
        solverIndex: object.answer_index,
        solverReason: object.one_line_reason,
        numericCheckRan: true,
        detail: `numeric_check disagrees with the correct choice (${candidate.numeric_check} = ${expected}, choice parses to ${actual})`,
      };
    }
    return {
      passed: true,
      solverIndex: object.answer_index,
      solverReason: object.one_line_reason,
      numericCheckRan: true,
      detail: null,
    };
  }

  return {
    passed: true,
    solverIndex: object.answer_index,
    solverReason: object.one_line_reason,
    numericCheckRan: false,
    detail: null,
  };
}
