import { divisibilityRules } from "./divisibility-rules.ts";
import { factorCounts } from "./factor-counts.ts";
import { fractionPercentPairs } from "./fraction-percent-pairs.ts";
import { mustBeTrueSnap } from "./must-be-true-snap.ts";
import { paritySignLogic } from "./parity-sign-logic.ts";
import { remainderArithmetic } from "./remainder-arithmetic.ts";
import { squaresCubesPowers } from "./squares-cubes-powers.ts";
import { trailingZerosFactorials } from "./trailing-zeros-factorials.ts";
import { unitsDigitCycles } from "./units-digit-cycles.ts";
import type { PatternGenerator, PatternItem } from "./types.ts";

export type { PatternGenerator, PatternItem };

export const PATTERN_CATEGORIES = [
  { key: "units_digit_cycles", label: "Units-digit cycles", generate: unitsDigitCycles },
  { key: "trailing_zeros_factorials", label: "Trailing zeros of n!", generate: trailingZerosFactorials },
  { key: "factor_counts", label: "Factor counts", generate: factorCounts },
  { key: "remainder_arithmetic", label: "Remainder arithmetic", generate: remainderArithmetic },
  { key: "divisibility_rules", label: "Divisibility rules", generate: divisibilityRules },
  { key: "parity_sign_logic", label: "Parity & sign logic", generate: paritySignLogic },
  { key: "fraction_percent_pairs", label: "Fraction–percent pairs", generate: fractionPercentPairs },
  { key: "squares_cubes_powers", label: "Squares, cubes & powers", generate: squaresCubesPowers },
  { key: "must_be_true_snap", label: "Must-be-true snap", generate: mustBeTrueSnap },
] as const;

export type PatternCategoryKey = (typeof PATTERN_CATEGORIES)[number]["key"];

export const PATTERN_CATEGORY_KEYS: PatternCategoryKey[] =
  PATTERN_CATEGORIES.map((c) => c.key);

export const PATTERN_CATEGORY_LABELS: Record<PatternCategoryKey, string> =
  Object.fromEntries(PATTERN_CATEGORIES.map((c) => [c.key, c.label])) as Record<
    PatternCategoryKey,
    string
  >;

export function generateFor(
  key: PatternCategoryKey,
  rng: () => number,
): PatternItem {
  const category = PATTERN_CATEGORIES.find((c) => c.key === key);
  if (!category) throw new Error(`Unknown pattern category: ${key}`);
  return category.generate(rng);
}
