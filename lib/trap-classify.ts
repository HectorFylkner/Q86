import { ERROR_TYPE_LABELS, type ErrorType } from "./taxonomy.ts";

/**
 * Map a trap sentence onto the platform's six-error vocabulary.
 *
 * Every wrong choice in the bank carries a sentence naming the mistake it
 * encodes — and since the quality pass, that sentence is *proved* to
 * produce that choice (see `trap_values` in scripts/author/harness.mjs).
 * So the distractor a user actually picked is direct evidence about the
 * error they actually made, which is far better than inferring from
 * timing alone. It is also what files a trap into a chapter's trap
 * gallery and what routes a miss through `lib/miss-bridge.ts`.
 *
 * The rules below are ordered, and the first that matches wins. The order
 * is the rubric in `content/TRAP-VOCABULARY.md`, which asks one question
 * of every sentence — *what would have to change for this mistake to stop
 * happening?* — and reads the four bands from most to least specific:
 *
 *   1. the clock, and choices with no derivation at all (rare, explicit,
 *      and invisible if anything else gets to look first)
 *   2. an execution slip inside a correct method (a small, high-precision
 *      vocabulary: "sign slip", "off by one", "misplaces a decimal")
 *   3. answering a different question than the one asked
 *   4. a wrong reading of what a *statement* gives, on the two-statement
 *      and must-be-true items, where the repair is the sufficiency
 *      procedure and not a missing fact
 *   5. a false general belief — a rule, identity or property
 *   6. a wrong model built from facts the solver does hold
 *
 * Still deliberately conservative: a sentence that matches nothing returns
 * null rather than being bucketed, because a wrong label routes the reader
 * to the wrong repair, which is worse than routing them nowhere.
 * `pnpm check:traps` measures both halves — coverage over the whole bank
 * and precision against a hand-labelled holdout — and gates on each, so
 * coverage cannot be bought by loosening a rule.
 */

/**
 * How much of the mistake the rule actually read.
 *
 * `named` — the phrase it matched names the mistake's category out loud: a
 *   sign slip, a misreading, a reporting verb contrasted with what was asked,
 *   a verdict on a statement. On the blind test split these labels are right
 *   ~9 times in 10, so the inference gives them full weight.
 * `inferred` — the phrase it matched only describes the operation performed,
 *   and the category is deduced from it. Right closer to 2 times in 3, so the
 *   inference discounts them rather than treating them as observation.
 *
 * Both numbers are measured by `pnpm check:traps`, not asserted here.
 */
export type TrapRuleTier = "named" | "inferred";

type Rule = {
  /** Stable id, printed by the audit when a rule and a hand label disagree. */
  id: string;
  type: ErrorType;
  tier: TrapRuleTier;
  pattern: RegExp;
  /** A second pattern that must also match, for rules that need context. */
  also?: RegExp;
};

/** The two-statement / must-be-true frame, referenced by the rules below. */
const SUFFICIENCY_CONTEXT =
  /\((1|2)\)|\bstatements?\b|\b(I|II|III)\b[ ,.;]|\bsufficien|\bboth pieces\b|\beach alone\b|\balone\b|\bpins?\b|\bpinned\b|\bby itself\b|\bon its own\b/;

const RULES: Rule[] = [
  // --- 1. the clock, and choices with no derivation ------------------------
  {
    id: "clock",
    tier: "named",
    type: "time_pressure",
    pattern:
      /\bunder time pressure\b|\bto save time\b|\bshort on time\b|\brunning out of time\b|\bin a hurry\b|\brushes?\b|\brushing\b|\brushed\b/i,
  },
  {
    id: "no-derivation",
    tier: "named",
    type: "guess",
    pattern:
      /\bguess(es|ed|ing)?\b|\bat random\b|\barbitrar(y|ily)\b|\bsplit(s|ting)?[ -]the[ -]difference\b|\bsplitting the difference\b|\bhalfway between\b|\bmid-?range\b|\bpicks? (a |an |the )?(round|nice|convenient|obvious)\b|\beyeball\w*\b|\bwithout (any )?(derivation|computing anything)\b/i,
  },

  // --- 2. execution slipped inside a correct method ------------------------
  // A small vocabulary on purpose. These words name the slip explicitly, so
  // they are the highest-precision signals in the file and get to look
  // before anything that reasons about the method.
  {
    id: "named-slip",
    tier: "named",
    type: "calculation_error",
    pattern:
      /\barithmetic (slip|error|mistake)\b|\bsign (slip|error|flip|confusion)\b|\bslips? (a|an|the|on|in)\b|\bslipping\b|\b(subtraction|addition|division|multiplication) slip\b|\boff.?by.?one\b|\bcarel\w+\b|\bborrow\w+\b|\bmisplac\w+\b|\bdecimal (point|place)\b|\bmis-?(comput|calculat|add|subtract|count|reduce|pair|multipl|divid)\w*\b|\bflips? the sign\b|\bignores? the (minus|negative) sign\b|\bdrop(s|ping|ped)?\b[^.]{0,40}\b(sign|minus|negative|term|factor|constant|decimal|coefficient|digit|fraction)\b|\bdrop(s|ping|ped)? (the|both) shared\b|\bforget(s|ting)? to (divide|halve|multiply|subtract|add|double|square|carry)\b|\bone (too few|too many|extra|doubling too many|term too far|step too far|index)\b|\bone (more|fewer) than\b|\bruns? one [a-z]+ too far\b|\bdrops? the \\?\$?\+ ?1\\?\$?\b|\bdrops? one\b|\bthe fencepost\b|\badds? \\?\$?1\\?\$? twice\b|\badds? (a|an|the) \\?\$?\+ ?1\\?\$? twice\b|\b(subtracts?|subtracting|divides?|dividing) [^.]{0,25}in the wrong order\b/i,
  },
  {
    id: "rounds-wrong-way",
    tier: "named",
    type: "calculation_error",
    pattern: /\brounds?\b[^.]{0,40}\b(up|down)\b|\brounding\b[^.]{0,40}\b(up|down)\b/i,
  },

  // A handful of named identities that are simply false. Specific enough to
  // look before the bands below, which would otherwise read the arithmetic
  // in the sentence rather than the rule being broken.
  {
    id: "known-false-identity",
    tier: "named",
    type: "content_gap",
    pattern:
      /\badds? the (two |three |successive )?(percent|discount|rate|markup|change)s?\b|\bsubtracts? the percents\b|\bmultipl\w+ the exponents\b|\bsquares? term by term\b|\bsquaring term by term\b|\bdistribut\w+ the (exponent|root|square)\b/i,
  },

  // --- 3. answered a different question ------------------------------------
  // The test is that the work would have been correct for some *other*
  // well-posed question. A reporting verb with a contrast is that, said out
  // loud; the rest of this band is the explicit misreading vocabulary.
  {
    id: "reports-other-quantity",
    tier: "named",
    type: "misread",
    pattern:
      /^(answers?|answering|reports?|reporting|returns?|states?)\b|\banswers? with\b|\banswering with\b|\breports? (the|back|only)\b|\breporting the\b|\b(reports?|reporting|gives?|giving)\b[^.]{0,60}\b(instead of|rather than)\b/i,
  },
  {
    id: "other-quantity-computed",
    tier: "named",
    type: "misread",
    pattern:
      /\b(comput\w+|calculat\w+|finds?|finding) the (probability|chance|odds|mean|median|average|mode|fraction|proportion|percentage|share|complement|union|overlap|neither|intersection)\b/i,
  },
  {
    id: "ordinal-answer",
    tier: "named",
    type: "misread",
    pattern:
      /\b(takes?|taking|reports?|reporting|gives?|giving|answers? with|picks?|picking) the (first|second|third|fourth|fifth|last|largest|smallest|greatest|least|middle|next|other|second-smallest|second-largest)\b/i,
  },
  {
    id: "explicit-misread",
    tier: "named",
    type: "misread",
    pattern:
      /\bmis-?read\w*\b|\breads? ["“]|\breads? [^.]{0,60}\bas\b|\breading [^.]{0,60}\bas\b|\bmis-?identif\w+\b|\bthe wrong (quantity|variable|unknown|one|question|person|item|number asked)\b|\bsolv\w+ for the wrong\b|\bfor the wrong (unknown|variable|quantity)\b|\bwhat the question asks?\b|\bthe question actually asks?\b|\bthe variable itself\b|\bthe unknown itself\b|\btreats? the given\b|\btreating the given\b/i,
  },
  {
    id: "stops-elsewhere",
    tier: "named",
    type: "misread",
    pattern:
      /\bone step early\b|\bstops? (one step )?(early|short)\b|\bstopping (one step )?(early|short)\b|\bstops? at the\b|\bstops? one\b/i,
  },

  // Dropping something the *stem* states — a bound, a term, a condition — is
  // answering a different question, not building a wrong model from it. The
  // "…that" forms are deliberately excluded: "ignoring that the ratio forbids
  // using them all" is a conclusion about the model, not an unread condition.
  {
    id: "omits-stated-condition",
    tier: "named",
    type: "misread",
    pattern:
      /\b(forgets?|ignor\w+|drops?|omits?|misses?) the [^.]{0,30}\b(bound|condition|constraint|requirement|restriction|minimum|maximum|limit|floor|ceiling|target|goal|term|clause|word|phrase|question|deadline|window)\b|\buses? only the\b|\busing only the\b|\bconsiders? only\b|\bconsidering only\b/i,
  },

  // --- 4. the sufficiency procedure ---------------------------------------
  // On a two-statement or must-be-true item the mistake is about what a
  // statement *gives*, and the repair is how you test one — not a fact the
  // solver is missing. Requires the frame as well as the verb, so an
  // ordinary sentence containing "alone" is not swept up.
  {
    id: "sufficiency-verdict",
    tier: "named",
    type: "setup_error",
    also: SUFFICIENCY_CONTEXT,
    pattern:
      /\b(accepts?|accepting|grants?|granting|credits?|crediting|trusts?|trusting|doubts?|doubting|rejects?|rejecting|insists?|insisting|believ\w+|assum\w+|thinks?|judges?|judging|confirms?)\b/i,
  },
  {
    id: "sufficiency-combination",
    tier: "named",
    type: "setup_error",
    also: SUFFICIENCY_CONTEXT,
    pattern:
      /\b(both|each|either|neither)\b[^.]{0,60}\b(needed|need|needs|required|sufficient|suffices|settles?|determines?|pins?|fixes|works?|alone)\b|\b(needs?|requires?) (the )?(both|second|other|first) statement\b|\bcombin\w+ out of caution\b|\bcombines? (them )?(out of|from) caution\b|\bcan'?t determine\b|\bcannot determine\b|\bpins? (it )?down\b|\bpinn?ed down\b|\bby itself\b|\bon its own\b|\bunderdetermined\b|\bby symmetry\b|\btransfers by symmetry\b|\bthe combination inconclusive\b|\bconclud\w+ neither\b/i,
  },

  // --- 5. a false general belief ------------------------------------------
  {
    id: "false-belief",
    tier: "named",
    type: "content_gap",
    pattern:
      /\bbeliev\w+\b|\bthinks?\b|\bthinking\b|\bassum\w+\b|\bdoes not know\b|\bdoesn'?t know\b|\bnever learned\b|\bconfus\w+\b|\btakes? .{0,30}for granted\b/i,
  },
  {
    id: "unchecked-rule",
    tier: "named",
    type: "content_gap",
    pattern:
      /\bwithout (checking|considering|knowing)[^.]{0,40}\b(sign|negative|positive|zero|nonzero)\b|\bwithout a sign check\b|\bwithout reversing\b|\bwithout flipping\b|\bwithout (any )?(basis|justification|warrant)\b|\bas if [^ ]{1,8} (were|was) known\b/i,
  },

  // --- 6. a wrong model, built from facts the solver does hold -------------
  // The widest band, and deliberately last: everything above it is a more
  // specific reading of the same sentence.
  {
    id: "wrong-relation",
    tier: "inferred",
    type: "setup_error",
    pattern:
      /\b(instead of|rather than|in place of)\b|\breverses?\b|\breversing\b|\binverts?\b|\binverting\b|\binverted\b|\bswaps?\b|\bswapping\b|\bswapped\b|\btranspos\w+\b|\bthe wrong (base|order|side|direction|divisor|denominator|end|way|branch|pair)\b|\bin the wrong\b|\bupside down\b|\bbackwards?\b/i,
  },
  {
    id: "wrong-model",
    tier: "inferred",
    type: "setup_error",
    pattern:
      /\btreats?\b|\btreating\b|\bappl\w+\b|\bignor\w+\b|\bomits?\b|\bomitting\b|\bsets? up\b|\bsets? the\b|\bweight\w*\b|\bscales?\b|\bscaling\b|\bcounts? only\b|\bcount\w+ (the|every|all|each|triples|pairs)\b|\bsolves? for\b|\bsolving\b|\bcombin\w+\b|\bsplits?\b|\bsplitting\b|\bfails? to\b|\bnever (accounts?|tests?|checks?|adjusts?)\b|\bmisses? that\b|\bmissing that\b|\bforgets? (to|that)\b|\bforgetting\b|\bovercorrect\w*\b|\bdouble-?count\w*\b|\bundercount\w*\b|\binvent\w+\b|\bkeeps? only\b|\bconsiders? only\b|\buses? only\b|\bincludes?\b|\bexcludes?\b|\badds? (the|all|only|one|an|a)\b|\bmultiplies\b|\bdivides\b|\bsubtracts\b|\baverages?\b|\baveraging\b/i,
  },

  // The floor of the setup band. A trap sentence that names an operation
  // performed on the stem's numbers, with no slip word and no contrast, is
  // describing a method that was the wrong one to reach for — which is what
  // a setup error is. It is last on purpose: every band above reads the same
  // sentence more specifically, and this one only sees what they declined.
  {
    id: "wrong-operation",
    tier: "inferred",
    type: "setup_error",
    pattern:
      /^(adds?|adding|subtracts?|subtracting|multipl\w+|divides?|dividing|computes?|computing|takes?|taking|uses?|using|counts?|counting|picks?|picking|choos\w+|chose|sets?|setting|solves?|solving|assigns?|assigning|attaches?|builds?|buys?|calls?|cancels?|carries|charges?|collapses?|compares?|comparing|compounds?|anchors?|allows?|blocks?|balanc\w+|halves|doubles?|doubling|halving|squares?|squaring|scales?|reads?|runs?|repeats?|reuses?|removes?|requires?|places?|puts?|pairs?|matches?|models?)\b/i,
  },
];

export function classifyTrap(text: string): ErrorType | null {
  for (const rule of RULES) {
    if (rule.also && !rule.also.test(text)) continue;
    if (rule.pattern.test(text)) return rule.type;
  }
  return null;
}

/** Which rule fired, for the audit's disagreement listing. */
export function classifyTrapRule(text: string): string | null {
  for (const rule of RULES) {
    if (rule.also && !rule.also.test(text)) continue;
    if (rule.pattern.test(text)) return rule.id;
  }
  return null;
}

/** The tier of the rule that produced a label, or null when nothing fired. */
export function ruleTier(ruleId: string | null): TrapRuleTier | null {
  return RULES.find((r) => r.id === ruleId)?.tier ?? null;
}

/**
 * How much a trap-derived label should be trusted, 0..1.
 *
 * Used by `lib/error-inference.ts` as the weight on the distractor signal.
 * A label from a `named` rule is close to an observation; one from an
 * `inferred` rule is a reading of the sentence's arithmetic and is worth
 * appreciably less than a locked-in confidence or a time sink. The two
 * values are the tiers' measured precision on the blind test split, rounded
 * down — so the weight cannot claim more than the audit can show.
 */
export function trapLabelWeight(text: string): number {
  const tier = ruleTier(classifyTrapRule(text));
  if (tier === "named") return 1;
  if (tier === "inferred") return 0.6;
  return 0;
}

/** Every rule id, so a test can assert the ids are unique and stable. */
export const TRAP_RULE_IDS: string[] = RULES.map((r) => r.id);

export function trapLabel(type: ErrorType | null): string {
  return type ? ERROR_TYPE_LABELS[type] : "Unclassified";
}
