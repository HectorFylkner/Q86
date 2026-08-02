/**
 * The solution-strategy dimension.
 *
 * Q86's taxonomy mirrors the official score report, which is entirely
 * *content*: domains, contexts, skills, subtopics. That is the right
 * spine for analytics, but it leaves out the thing the strongest prep
 * curricula spend most of their time on — *technique*. Target Test Prep
 * teaches each concept in an isolated lesson and then drills the
 * approach; GMAT Ninja's central claim is that treating the section as
 * "math" and reaching for algebra by reflex is what ruins timing, and
 * that flexible thinking across multiple solution paths is what separates
 * a good score from a great one.
 *
 * Nothing in this platform measured that. A student could be doing every
 * question the long way, scoring adequately, and running out of clock,
 * and every chart here would have said "you know this material".
 *
 * So: six named strategies, and a classifier that reads each item's
 * *fastest path* — the path the bank says was available — and reports
 * which techniques it used, with the phrase that produced the call.
 * Conservative by construction: an unrecognized path is `structural`
 * (direct setup and algebra), never a guess at something more exotic,
 * because a wrong technique label would teach the wrong habit.
 *
 * Note what this can and cannot see. It knows which technique was
 * *available*, not which one the user chose. That is still the diagnostic
 * that matters: if the questions whose fastest path is backsolving take
 * you 3:10 and 40%, while the algebraic ones take 1:50 and 72%, you are
 * not reaching for backsolving — regardless of what you would say if
 * asked.
 */

export const SOLUTION_STRATEGIES = [
  "structural",
  "backsolve",
  "pick_numbers",
  "estimate",
  "pattern",
  "eliminate",
] as const;

export type SolutionStrategy = (typeof SOLUTION_STRATEGIES)[number];

export function isSolutionStrategy(value: string): value is SolutionStrategy {
  return (SOLUTION_STRATEGIES as readonly string[]).includes(value);
}

export const STRATEGY_LABELS: Record<SolutionStrategy, string> = {
  structural: "Set up and solve",
  backsolve: "Backsolve",
  pick_numbers: "Pick numbers",
  estimate: "Estimate & bound",
  pattern: "Find the pattern",
  eliminate: "Eliminate",
};

export const STRATEGY_SHORT: Record<SolutionStrategy, string> = {
  structural: "Structural",
  backsolve: "Backsolve",
  pick_numbers: "Pick numbers",
  estimate: "Estimate",
  pattern: "Pattern",
  eliminate: "Eliminate",
};

export const STRATEGY_NOTES: Record<SolutionStrategy, string> = {
  structural:
    "Translate the stem, build the relationship, solve it. The default, and the right call when the algebra is short — but the reflex to reach here first is what most timing problems are made of.",
  backsolve:
    "Work backwards from the answer choices. Available whenever the choices are specific numbers and substituting one is cheaper than solving for it. Start at the middle choice so a miss tells you which direction to go.",
  pick_numbers:
    "Replace the variables with concrete values that satisfy the constraints, then read the answer off the arithmetic. Available when the choices are expressions rather than numbers, or when the stem is true for all values of something.",
  estimate:
    "Round, bound, or compare rather than compute. Available whenever the choices are far enough apart that an exact value is more precision than the question needs.",
  pattern:
    "Find the cycle, the telescoping, or the symmetry, and use it instead of computing every term. Available on units digits, remainders, long sums and long products — where the direct computation is not merely slow but impossible in the time.",
  eliminate:
    "Rule choices out on a property — sign, parity, magnitude, units digit — rather than working the question forward. Often finishes a question you cannot fully solve, which is exactly when it is worth the most.",
};

/** A technique drill is a full drill block, not a test — long enough to
 *  build the reflex, short enough to finish in a sitting. Every strategy
 *  with a chapter must have at least this many bank items behind it, or
 *  the chapter's "prove it" button leads somewhere too thin to prove
 *  anything; `tests/technique-coverage.test.ts` enforces that. */
export const STRATEGY_DRILL_SIZE = 10;

/**
 * The technique chapter that teaches each strategy, where one exists.
 * Single source of truth: lib/lessons.ts inverts this rather than keeping
 * a second copy, and the analytics panel links through it.
 *
 * `pattern` and `eliminate` are deliberately unchaptered — they are
 * taught inside the content chapters that own them (series & patterns,
 * remainders & units digits, must-be-true testing), and a chapter
 * restating that material would be duplication rather than coverage.
 */
export const STRATEGY_CHAPTER: Record<SolutionStrategy, string | null> = {
  structural: null,
  backsolve: "technique-backsolve",
  pick_numbers: "technique-pick-numbers",
  estimate: "technique-estimate",
  pattern: null,
  eliminate: null,
};

/**
 * Signatures over a fastest path. The first match per strategy wins and
 * carries its own phrase as evidence; a path can use several strategies
 * and gets credited for each.
 *
 * These patterns are written against the bank's actual prose, and the
 * classifier is checked by `pnpm test` against real fastest paths from
 * the shipped bank — not against invented examples.
 */
const SIGNATURES: Array<[SolutionStrategy, RegExp]> = [
  [
    "backsolve",
    /\b(back-?solv\w*|test(?:ing)? the (?:answer )?choices?|try the choices?|plug(?:ging)? (?:in )?the (?:answer )?choices?|work(?:ing)? backwards? from the choices?|start (?:at|with) (?:the )?(?:middle|choice [A-E])|choice [A-E] (?:works|settles|balances)|from choice [A-E])\b/i,
  ],
  [
    "pick_numbers",
    /\b(pick(?:ing)? (?:a |simple |smart |convenient )?numbers?|smart numbers?|test(?:ing)? \(|test(?:ing)? (?:the )?(?:standard |sample )?(?:cases?|values?|pairs?|set|numbers?|[a-z] ?=)|try \(|let (?:[a-z] )?= ?\d|set [a-z] = \d|start (?:at|from) 100|take 100|on a base of|choose (?:a )?(?:value|number))\b/i,
  ],
  [
    "estimate",
    /\b(estimat\w+|approximat\w+|round(?:ing|s|ed)? (?:to|up|down|off)|to the nearest|ballpark|roughly|on sight|close enough|bound(?:ing|s)? (?:it|the|above|below)|order of magnitude)\b/i,
  ],
  [
    "pattern",
    /\b(cycl\w+|period(?: \d+|icity)?|repeats?|telescop\w+|(?:each|every) pair|pair(?:ing)? (?:the |up )?(?:terms|adjacent)|pairs? cancel|cancels? to|every (?:sixth|fourth|third|second) term|symmetr\w+|the block|difference of squares)\b/i,
  ],
  [
    "eliminate",
    /\b(eliminat\w+|rules? out|kills? |survives?\b|only .{0,30}(?:is positive|works|fits)|discard\w*|cross(?:es)? off|leaves? only)\b/i,
  ],
];

/**
 * Strip the LaTeX scaffolding before matching. The bank writes maths
 * inline, so "Test $(x, y) = (-1, 2)$" reaches a naive matcher as
 * `Test $(`, and a signature written against readable prose silently
 * never fires. Normalizing first is the difference between measuring
 * the bank and measuring its delimiters.
 */
function normalize(text: string): string {
  return text
    .replace(/\\[a-zA-Z]+/g, " ") // \frac, \times, \le …
    .replace(/[${}\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type StrategyHit = {
  strategy: SolutionStrategy;
  /** The phrase in the fastest path that produced the call. */
  evidence: string;
};

/**
 * Which techniques the fastest path uses. Always returns at least one:
 * a path matching nothing is `structural`, which is a real answer, not
 * a failure to classify.
 */
export function strategiesFor(fastestPath: string): StrategyHit[] {
  const text = normalize(fastestPath);
  const hits: StrategyHit[] = [];
  for (const [strategy, pattern] of SIGNATURES) {
    const match = text.match(pattern);
    if (match) hits.push({ strategy, evidence: match[0] });
  }
  if (hits.length === 0) {
    return [{ strategy: "structural", evidence: "no shortcut signalled" }];
  }
  return hits;
}

/** The single technique the item is best used to practise. */
export function primaryStrategy(fastestPath: string): SolutionStrategy {
  const hits = strategiesFor(fastestPath);
  // Ranked by how much reaching for it saves when it applies, and by how
  // reliably the phrasing identifies it.
  const priority: SolutionStrategy[] = [
    "backsolve",
    "pick_numbers",
    "pattern",
    "estimate",
    "eliminate",
    "structural",
  ];
  for (const s of priority) {
    if (hits.some((h) => h.strategy === s)) return s;
  }
  return "structural";
}
