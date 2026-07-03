/**
 * Template for authoring new seed-bank questions. Copy this file, replace
 * the example item, and run `node scripts/author/your-batch.mjs`. The item
 * is appended to scripts/seed-bank.json only if every assertion and the
 * brute-force check() pass. Then run `node scripts/verify-bank.ts` and
 * `pnpm seed` to load it into the database.
 *
 * This example runs as a dry run so it never touches the bank.
 */
import { verifyAndAppend } from "./harness.mjs";

const items = [
  {
    format: "problem_solving",            // or "data_sufficiency" (canonical DS choices required)
    content_domain: "arithmetic",         // arithmetic | algebra
    context: "pure",                      // pure | real
    fundamental_skill: "value_order_factors", // see lib/taxonomy.ts
    subtopic: "divisibility_gcf_lcm",
    difficulty: 2,                        // 2–5
    stem_md: "What is the greatest common divisor of $84$ and $126$?",
    choices: ["6", "14", "21", "42", "63"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nFactor: $84 = 2^2 \\cdot 3 \\cdot 7$ and $126 = 2 \\cdot 3^2 \\cdot 7$. Take the minimum power of each shared prime: $2 \\cdot 3 \\cdot 7 = 42$.\n\n**Trigger cue**\nA gcd of two concrete numbers: factor both, take minimum exponents.\n\n**Takeaway**\nThe gcd takes each prime at its smaller exponent.",
    fastest_path_md: "$126 - 84 = 42$, and $42$ divides both. Done.",
    trap_map: {
      "0": "Takes only the shared primes without the factor of 7.",
      "1": "Uses $2 \\cdot 7$, dropping the shared factor of 3.",
      "2": "Uses $3 \\cdot 7$, dropping the shared factor of 2.",
      "4": "Takes half of 126 instead of computing the gcd.",
    },
    numeric_check: "42",
    // The independent gate: recompute the answer from raw data, never by
    // transcribing the solution's algebra. Enumerate, simulate, brute-force.
    check() {
      const gcd = (a, b) => (b ? gcd(b, a % b) : a);
      return { kind: "value", value: gcd(84, 126) };
    },
  },
];

verifyAndAppend(items, { dryRun: true });
