import { describe, expect, it, vi } from "vitest";

// verify.ts → model.ts → db/index.ts opens a SQLite connection at import
// time; stub model.ts so the pure helpers load without touching the db.
vi.mock("../lib/ai/model.ts", () => ({
  getModel: vi.fn(),
  withRetry: vi.fn(),
}));

import {
  evaluateExpression,
  latexChoiceToExpression,
  numbersAgree,
} from "../lib/ai/verify.ts";

/** Full pipeline the numeric check uses: parse → evaluate → compare. */
function expectParsesTo(choice: string, expected: number) {
  const expr = latexChoiceToExpression(choice);
  expect(expr, `latexChoiceToExpression(${JSON.stringify(choice)})`).not.toBeNull();
  const value = evaluateExpression(expr!);
  expect(value, `evaluateExpression(${JSON.stringify(expr)})`).not.toBeNull();
  expect(
    numbersAgree(expected, value!),
    `${JSON.stringify(choice)} → ${value}, expected ${expected}`,
  ).toBe(true);
}

describe("latexChoiceToExpression", () => {
  it("passes plain numbers through, with or without math delimiters", () => {
    expectParsesTo("42", 42);
    expectParsesTo("$0.75$", 0.75);
    expectParsesTo("  $3$  ", 3);
  });

  it("strips currency dollars and thousands separators", () => {
    expectParsesTo("\\$1{,}200", 1200);
    expectParsesTo("$1,234$", 1234);
    expectParsesTo("12,345,678", 12345678);
    expectParsesTo("1\\,000", 1000);
  });

  it("normalizes unicode minus and en-dash", () => {
    expectParsesTo("−5", -5);
    expectParsesTo("–7", -7);
  });

  it("converts \\frac and its display variants", () => {
    expectParsesTo("$\\frac{3}{4}$", 0.75);
    expectParsesTo("\\dfrac{7}{8}", 0.875);
    expectParsesTo("\\tfrac{1}{5}", 0.2);
    expectParsesTo("-\\frac{3}{4}", -0.75);
    expectParsesTo("−\\frac{1}{2}", -0.5);
  });

  it("converts nested \\frac", () => {
    expectParsesTo("\\frac{\\frac{1}{2}}{3}", 1 / 6);
    expectParsesTo("\\frac{1}{\\frac{1}{2}}", 2);
  });

  it("converts \\sqrt, nth roots, and nested \\sqrt", () => {
    expectParsesTo("\\sqrt{16}", 4);
    expectParsesTo("$\\sqrt{2}$", Math.SQRT2);
    expectParsesTo("\\sqrt{\\sqrt{16}}", 2);
    expectParsesTo("\\sqrt[3]{27}", 3);
    expectParsesTo("\\sqrt[4]{16}", 2);
  });

  it("converts \\pi, including inside \\frac", () => {
    expectParsesTo("\\pi", Math.PI);
    expectParsesTo("2\\pi", 2 * Math.PI);
    expectParsesTo("\\frac{\\pi}{2}", Math.PI / 2);
  });

  it("converts exponents, \\cdot, \\times, and \\left/\\right", () => {
    expectParsesTo("2^{3}", 8);
    expectParsesTo("2 \\cdot 3", 6);
    expectParsesTo("4\\times5", 20);
    expectParsesTo("\\left(\\frac{1}{2}\\right)", 0.5);
  });

  it("treats a digit before \\frac as a mixed number (addition)", () => {
    expectParsesTo("3\\frac{1}{2}", 3.5);
    expectParsesTo("2 \\dfrac{3}{4}", 2.75);
    expectParsesTo("1\\dfrac{1}{4}", 1.25);
  });

  it("keeps a bare percent sign, which mathjs evaluates as a percentage", () => {
    expectParsesTo("50%", 0.5);
  });

  it("bails to null on the LaTeX percent \\%", () => {
    expect(latexChoiceToExpression("50\\%")).toBeNull();
  });

  it("bails to null on negative mixed numbers", () => {
    expect(latexChoiceToExpression("-3\\frac{1}{2}")).toBeNull();
    expect(latexChoiceToExpression("− 3\\frac{1}{2}")).toBeNull();
  });

  it("bails to null on variables, units, and leftover LaTeX", () => {
    expect(latexChoiceToExpression("x")).toBeNull();
    expect(latexChoiceToExpression("2x + 1")).toBeNull();
    expect(latexChoiceToExpression("12 \\text{ cm}")).toBeNull();
    expect(latexChoiceToExpression("5 km")).toBeNull();
    expect(latexChoiceToExpression("\\frac{a}{b}")).toBeNull();
  });

  it("bails to null on empty input", () => {
    expect(latexChoiceToExpression("")).toBeNull();
    expect(latexChoiceToExpression("  ")).toBeNull();
    expect(latexChoiceToExpression("$$")).toBeNull();
  });

  // Fixed defect: the \frac loop used to run before \sqrt and ^{...}
  // expansion with brace-free-only args, so cross-nested constructs like
  // \frac{\sqrt{2}}{2} bailed to null; expansion is now innermost-first
  // across all three patterns in one loop.
  it("converts \\sqrt and ^{} nested inside \\frac", () => {
    expectParsesTo("\\frac{\\sqrt{2}}{2}", Math.SQRT2 / 2);
    expectParsesTo("\\frac{2^{3}}{4}", 2);
  });
});

describe("evaluateExpression", () => {
  it("evaluates arithmetic expressions", () => {
    expect(evaluateExpression("2+3")).toBe(5);
    expect(evaluateExpression("((3)/(4))")).toBe(0.75);
  });

  it("unwraps valueOf-bearing results like fractions", () => {
    expect(evaluateExpression("fraction(1,3)")).toBeCloseTo(1 / 3, 12);
  });

  it("returns null for non-finite results", () => {
    expect(evaluateExpression("1/0")).toBeNull();
  });

  it("returns null for complex results", () => {
    expect(evaluateExpression("sqrt(-4)")).toBeNull();
  });

  it("returns null for unparseable input and unknown symbols", () => {
    expect(evaluateExpression("((")).toBeNull();
    expect(evaluateExpression("x")).toBeNull();
  });
});

describe("numbersAgree", () => {
  it("accepts exact equality and float noise", () => {
    expect(numbersAgree(0.75, 0.75)).toBe(true);
    expect(numbersAgree(0.1 + 0.2, 0.3)).toBe(true);
    expect(numbersAgree(3, (27) ** (1 / 3))).toBe(true);
  });

  it("scales the tolerance for large magnitudes", () => {
    expect(numbersAgree(1e12, 1e12 + 1)).toBe(true);
    expect(numbersAgree(1e12, 1e12 + 1e4)).toBe(false);
    expect(numbersAgree(-1e6, -1e6 - 1e-4)).toBe(true);
  });

  it("uses an absolute floor of 1 near zero", () => {
    expect(numbersAgree(0, 1e-10)).toBe(true);
    expect(numbersAgree(1e-10, 2e-10)).toBe(true);
    expect(numbersAgree(0, 2e-9)).toBe(false);
  });

  it("rejects genuinely different numbers", () => {
    expect(numbersAgree(1, 2)).toBe(false);
    expect(numbersAgree(-5, 5)).toBe(false);
    expect(numbersAgree(0.749, 0.75)).toBe(false);
  });

  it("is symmetric", () => {
    const pairs: [number, number][] = [
      [0, 1e-10],
      [1e12, 1e12 + 1],
      [1, 2],
      [-5, 5],
      [0.1 + 0.2, 0.3],
    ];
    for (const [a, b] of pairs) {
      expect(numbersAgree(a, b)).toBe(numbersAgree(b, a));
    }
  });
});
