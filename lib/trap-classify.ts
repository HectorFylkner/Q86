import { ERROR_TYPE_LABELS, type ErrorType } from "./taxonomy.ts";

/**
 * Map a trap sentence onto the platform's six-error vocabulary.
 *
 * Every wrong choice in the bank carries a sentence naming the mistake it
 * encodes — and since the quality pass, that sentence is *proved* to
 * produce that choice (see `trap_values` in scripts/author/harness.mjs).
 * So the distractor a user actually picked is direct evidence about the
 * error they actually made, which is far better than inferring from
 * timing alone.
 *
 * The classification is keyword-driven and deliberately conservative: a
 * trap that does not clearly belong to one bucket returns null rather
 * than being mislabelled, because a wrong label teaches the wrong repair.
 * Order matters — the first pattern that matches wins, so the most
 * specific phrasings are listed first.
 */
const TRAP_SIGNATURES: Array<[ErrorType, RegExp]> = [
  [
    "misread",
    /\b(answers? with|reports?|instead of the|rather than the|mis-?reads?|asked for|one step early|the wrong quantity|stops? one step)\b/i,
  ],
  [
    "calculation_error",
    /\b(arithmetic|slips?|off by|drops? (a|the) (sign|factor|term|constant|decimal)|misplaces|sign flip|flips the sign|careless|decimal)\b/i,
  ],
  [
    "setup_error",
    /\b(sets? up|treats?|assumes?|ignor(es|ing)|forgets? (that|to|the)|applies|backwards?|inverts?|reversed?|upside down|wrong base|omits|splices|counts? only|restarts?|splits? the)\b/i,
  ],
  [
    "content_gap",
    /\b(adds? the percents|does not know|never|formula|identity|property|distinctness|complement|reads .* as|mis-?converts?|confuses)\b/i,
  ],
];

export function classifyTrap(text: string): ErrorType | null {
  for (const [type, pattern] of TRAP_SIGNATURES) {
    if (pattern.test(text)) return type;
  }
  return null;
}

export function trapLabel(type: ErrorType | null): string {
  return type ? ERROR_TYPE_LABELS[type] : "Unclassified";
}
