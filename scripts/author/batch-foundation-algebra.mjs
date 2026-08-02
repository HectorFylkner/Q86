/**
 * Foundation batch 4 of 4 — equations, translation, functions.
 *
 * Same brief as batches 1–3. Three chapters in this skill had a foundation
 * band reaching D4 for want of easy items.
 *
 * Checks solve by search over the candidate values rather than by
 * rearranging the equation the solution rearranges. On a translation item
 * that matters more than usual: the failure mode is translating the
 * English wrongly, and a check that starts from the same translation would
 * inherit the mistake. Searching for the value that satisfies the *stated
 * scenario* tests the translation itself.
 *
 * Run: node --experimental-strip-types scripts/author/batch-foundation-algebra.mjs
 */
import { verifyAndAppend } from "./harness.mjs";

/** The single value in [lo, hi], stepped by `step`, that satisfies `holds`.
 *  Throws unless there is exactly one, so an item can never ship with an
 *  ambiguous or unreachable answer. */
function soleValue(lo, hi, step, holds) {
  const found = [];
  for (let k = Math.round(lo / step); k <= Math.round(hi / step); k++) {
    const v = k * step;
    if (holds(v)) found.push(v);
  }
  if (found.length !== 1) {
    throw new Error(`${found.length} values satisfy the scenario`);
  }
  return found[0];
}

const items = [
  // ══ algebraic_translation — 3 items ═════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 2,
    stem_md:
      "The sum of a number and twice that number is $42$. What is the number?",
    choices: ["$14$", "$21$", "$28$", "$42$", "$84$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nLet the number be $n$. \"The sum of a number and twice that number\" is $n + 2n = 3n$, so $3n = 42$ and $n = 14$.\n\n**Trigger cue**\nTranslate phrase by phrase and collect like terms before solving. Every mention of the same unknown is the same $n$ — the word \"twice\" adds a second copy, it does not replace the first.\n\n**Takeaway**\nCollect the copies of the unknown before dividing.",
    fastest_path_md:
      "$n + 2n = 3n = 42 \\Rightarrow n = 14$.",
    trap_map: {
      "1": "Divides by $2$, reading \"twice the number\" as the whole sum.",
      "2": "Solves correctly and then reports twice the number instead of the number.",
      "3": "Reports the given sum.",
      "4": "Multiplies by $2$ rather than dividing by $3$.",
    },
    numeric_check: "42/3",
    check() {
      return {
        kind: "value",
        value: soleValue(-500, 500, 1, (n) => n + 2 * n === 42),
      };
    },
    trap_values() {
      const n = 14;
      return { "1": 42 / 2, "2": 2 * n, "3": 42, "4": 42 * 2 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 2,
    stem_md:
      "The length of a rectangle is $3$ greater than its width, and the perimeter of the rectangle is $38$. What is the width of the rectangle?",
    choices: ["$8$", "$9.5$", "$11$", "$16$", "$19$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nWith width $w$, the length is $w + 3$ and the perimeter is $2w + 2(w+3) = 4w + 6$. Setting $4w + 6 = 38$ gives $4w = 32$ and $w = 8$.\n\n**Trigger cue**\nTwo dimensions related by \"greater than\" — name the *smaller* one $w$ so the other is $w + 3$ with no negative signs to lose, then write the perimeter in that single letter.\n\n**Takeaway**\nName the smaller quantity; the relation builds the other.",
    fastest_path_md:
      "Half the perimeter is $19 = w + (w+3)$, so $2w = 16$ and $w = 8$.",
    trap_map: {
      "1": "Divides the perimeter by $4$ and never accounts for the $3$.",
      "2": "Solves correctly and reports the length.",
      "3": "Reports twice the width.",
      "4": "Reports half the perimeter, which is length plus width rather than the width.",
    },
    numeric_check: "(38-6)/4",
    check() {
      return {
        kind: "value",
        value: soleValue(0.5, 100, 0.5, (w) => 2 * w + 2 * (w + 3) === 38),
      };
    },
    trap_values() {
      const w = 8;
      return { "1": 38 / 4, "2": w + 3, "3": 2 * w, "4": 38 / 2 };
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "real",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "algebraic_translation",
    difficulty: 3,
    stem_md:
      "Ann is $4$ years older than Bob. In $6$ years, the sum of their ages will be $48$. How old is Bob now?",
    choices: ["$16$", "$18$", "$20$", "$22$", "$26$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nLet Bob be $b$ now, so Ann is $b + 4$. In six years they are $b + 6$ and $b + 10$, and $(b+6) + (b+10) = 48$ gives $2b + 16 = 48$, so $b = 16$. Check: Bob $16$ and Ann $20$ become $22$ and $26$, which sum to $48$.\n\n**Trigger cue**\nAge problems shift *every* person by the same amount, so a sum of two ages grows by twice the number of years. Anchor on the present, add the shift once per person, and answer the tense the question actually asked.\n\n**Takeaway**\nA future sum of two ages is today's sum plus twice the years.",
    fastest_path_md:
      "Six years adds $12$ to the sum, so today they total $36$. Ann is $4$ more, so Bob is $(36-4)/2 = 16$.",
    trap_map: {
      "1": "Splits the future sum evenly, ignoring the four-year gap.",
      "2": "Reports Ann's age now.",
      "3": "Reports Bob's age in six years.",
      "4": "Reports Ann's age in six years.",
    },
    numeric_check: "(48-12-4)/2",
    check() {
      return {
        kind: "value",
        value: soleValue(0, 120, 1, (b) => b + 6 + (b + 4 + 6) === 48),
      };
    },
    trap_values() {
      const b = 16;
      return { "1": 48 / 2 - 6, "2": b + 4, "3": b + 6, "4": b + 4 + 6 };
    },
  },

  // ══ functions_sequences — 2 items ═══════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 2,
    stem_md: "If $f(x) = 2x^{2} - 5$, what is the value of $f(3)$?",
    choices: ["$1$", "$13$", "$18$", "$23$", "$31$"],
    correct_index: 1,
    solution_md:
      "**Formal path**\nSubstitute $3$ wherever $x$ appears: $2(3^{2}) - 5 = 2(9) - 5 = 18 - 5 = 13$.\n\n**Trigger cue**\nFunction notation is substitution and nothing more. Order of operations still applies inside: the exponent binds to $x$ alone, so square before multiplying by $2$.\n\n**Takeaway**\nSquare first, then multiply, then subtract.",
    fastest_path_md:
      "$2 \\cdot 9 - 5 = 13$.",
    trap_map: {
      "0": "Multiplies before squaring in a way that skips the exponent: $2(3) - 5$.",
      "2": "Computes $2(3^{2})$ and forgets the $-5$.",
      "3": "Adds $5$ instead of subtracting it.",
      "4": "Squares the whole product, $(2 \\cdot 3)^{2} - 5$, as though the coefficient were inside the exponent.",
    },
    numeric_check: "2*3^2-5",
    check() {
      // Square by repeated addition so the check shares no operator with
      // the trap it is guarding against.
      const square = (v) => {
        let out = 0;
        for (let i = 0; i < v; i++) out += v;
        return out;
      };
      return { kind: "value", value: 2 * square(3) - 5 };
    },
    trap_values() {
      const square = (v) => {
        let out = 0;
        for (let i = 0; i < v; i++) out += v;
        return out;
      };
      return {
        "0": 2 * 3 - 5,
        "2": 2 * square(3),
        "3": 2 * square(3) + 5,
        "4": square(2 * 3) - 5,
      };
    },
  },
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "functions_sequences",
    difficulty: 3,
    stem_md: "If $f(x) = 4x + 5$, for what value of $x$ does $f(x) = 29$?",
    choices: ["$6$", "$8.5$", "$24$", "$34$", "$121$"],
    correct_index: 0,
    solution_md:
      "**Formal path**\nSet the rule equal to the output: $4x + 5 = 29$, so $4x = 24$ and $x = 6$.\n\n**Trigger cue**\n\"$f(x) = 29$\" gives the *output* and asks for the input, which is the reverse of a substitution question. Undo the rule in reverse order — subtract the $5$ that was added last, then divide by the $4$.\n\n**Takeaway**\nGiven the output, undo the operations in reverse.",
    fastest_path_md:
      "$29 - 5 = 24$, and $24/4 = 6$.",
    trap_map: {
      "1": "Adds the $5$ instead of subtracting, then divides: $34/4$.",
      "2": "Solves down to $4x = 24$ and reports $4x$ rather than $x$.",
      "3": "Adds $5$ to $29$ and stops.",
      "4": "Evaluates $f(29)$ — substitutes the output as though it were the input.",
    },
    numeric_check: "(29-5)/4",
    check() {
      return {
        kind: "value",
        value: soleValue(-200, 200, 0.5, (x) => 4 * x + 5 === 29),
      };
    },
    trap_values() {
      return { "1": (29 + 5) / 4, "2": 29 - 5, "3": 29 + 5, "4": 4 * 29 + 5 };
    },
  },

  // ══ linear_systems — 1 item ═════════════════════════════════════════════
  {
    format: "problem_solving",
    content_domain: "algebra",
    context: "pure",
    fundamental_skill: "equal_unequal_alg",
    subtopic: "linear_systems",
    difficulty: 2,
    stem_md: "If $x + y = 10$ and $x - y = 4$, what is the value of $x$?",
    choices: ["$2$", "$3$", "$5$", "$7$", "$14$"],
    correct_index: 3,
    solution_md:
      "**Formal path**\nAdd the two equations: the $y$ terms cancel and $2x = 14$, so $x = 7$. (Then $y = 3$.)\n\n**Trigger cue**\nA sum and a difference of the same two unknowns: adding kills $y$, subtracting kills $x$. Choose whichever elimination removes the variable you were *not* asked about.\n\n**Takeaway**\nAdd to kill the subtracted variable; halve what is left.",
    fastest_path_md:
      "$(x+y) + (x-y) = 2x = 14 \\Rightarrow x = 7$.",
    trap_map: {
      "0": "Halves the difference instead of the sum.",
      "1": "Solves for $y$ and reports that.",
      "2": "Splits the sum evenly, using only the first equation.",
      "4": "Adds the equations and forgets to halve.",
    },
    numeric_check: "(10+4)/2",
    check() {
      // Search the pair, not the eliminated equation: x and y move
      // independently so both equations are genuinely tested.
      const found = [];
      for (let a = -400; a <= 400; a++) {
        for (let b = -400; b <= 400; b++) {
          const x = a / 2;
          const y = b / 2;
          if (x + y === 10 && x - y === 4) found.push(x);
        }
      }
      if (found.length !== 1) throw new Error(`${found.length} solutions`);
      return { kind: "value", value: found[0] };
    },
    trap_values() {
      return { "0": 4 / 2, "1": 10 - 7, "2": 10 / 2, "4": 10 + 4 };
    },
  },
];

verifyAndAppend(items, { requireTrapValues: true });
