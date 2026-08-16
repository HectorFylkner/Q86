import type { Subtopic } from "./taxonomy.ts";

/**
 * Prerequisite map: chapters whose ideas a chapter leans on. Used by the
 * miss-to-prescription loop — a content gap in, say, mixtures is usually a
 * ratios or percent gap wearing a costume, and sending the student to the
 * chapter they actually failed beats sending them back to the one they
 * just read. Kept deliberately shallow (one hop, no cycles): these are
 * "you need this first", not a full dependency graph.
 */
export const LESSON_PREREQS: Partial<Record<Subtopic, Subtopic[]>> = {
  // Value / order / factors
  divisibility_gcf_lcm: ["prime_factorization"],
  remainders_units_digits: ["divisibility_gcf_lcm"],
  consecutive_evenly_spaced: ["parity_signs"],
  must_be_true_testing: ["parity_signs", "abs_value_number_line_decimals"],
  exponents_roots_properties: ["prime_factorization"],

  // Equalities / inequalities / algebra
  quadratics_factoring: ["algebraic_translation"],
  linear_systems: ["algebraic_translation"],
  inequalities: ["algebraic_translation", "parity_signs"],
  functions_sequences: ["algebraic_translation"],
  min_max_optimization: ["inequalities", "statistics_mean_median_sd"],

  // Rates / ratio / percent
  ratios_proportions: ["algebraic_translation"],
  percent_change_chains: ["ratios_proportions"],
  interest_profit_discount: ["percent_change_chains"],
  mixtures_weighted_avg: ["ratios_proportions", "statistics_mean_median_sd"],
  rates_speed_work: ["ratios_proportions", "algebraic_translation"],

  // Counting / sets / series / probability / statistics
  probability: ["combinatorics"],
  overlapping_sets: ["algebraic_translation"],
  series_patterns: ["consecutive_evenly_spaced"],
  statistics_mean_median_sd: ["consecutive_evenly_spaced"],
};

/** The chapters to revisit before this one, in reading order. */
export function prereqsFor(subtopic: Subtopic): Subtopic[] {
  return LESSON_PREREQS[subtopic] ?? [];
}
