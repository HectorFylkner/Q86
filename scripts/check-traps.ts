/**
 * Trap-vocabulary audit.
 *
 * Every wrong choice in the bank carries a sentence naming the mistake that
 * produces it, and `classifyTrap()` maps that sentence onto one of the six
 * error types. That label is the strongest single signal in
 * `lib/error-inference.ts` — a direct observation of which mistake was made,
 * where everything else the inference has is circumstantial. It is also what
 * files a trap into a chapter's trap gallery and what routes a miss through
 * `lib/miss-bridge.ts`.
 *
 * Three numbers matter, and the first two pull against each other:
 *
 *   COVERAGE   what share of trap sentences get a label at all. An
 *              unclassified trap contributes nothing to the diagnosis.
 *   PRECISION  of the sentences that get a label, what share get the *right*
 *              one. A wrong error-type label trains the wrong repair, which
 *              is worse than no label at all.
 *   TIER       precision split by what the rule actually read. A `named`
 *              rule matched a phrase that names the mistake's category
 *              ("sign slip", "answers with … instead of", "granting (2)").
 *              An `inferred` rule matched only the operation being described
 *              and inferred the category from it. The two are not equally
 *              trustworthy and the inference weights them differently, so
 *              they are measured separately.
 *
 * Precision is measured against `content/trap-gold.json`. Rows in the
 * `train` split were read while the rules were written; rows in `test` were
 * hand-labelled *before* the classifier was run over them, and the rules were
 * not touched afterwards. Only `test` is gated. Round 1 is why: rules tuned
 * on 150 sentences scored 86.8% on those and 69.3% on a blind 150.
 *
 * Usage: node --experimental-strip-types scripts/check-traps.ts [--json]
 *        [--unclassified]  list every sentence that still gets no label
 *        [--errors]        list every gold sentence the classifier gets wrong
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  classifyTrap,
  classifyTrapRule,
  ruleTier,
  type TrapRuleTier,
} from "../lib/trap-classify.ts";
import { ERROR_TYPES, type ErrorType, type Subtopic } from "../lib/taxonomy.ts";

const ROOT = path.join(import.meta.dirname, "..");
const BANK = path.join(ROOT, "scripts", "seed-bank.json");
const GOLD = path.join(ROOT, "content", "trap-gold.json");

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const listUnclassified = argv.includes("--unclassified");
const listErrors = argv.includes("--errors");

/**
 * Floors, all gated on the blind `test` split. The named-tier floor is the
 * important one: those labels carry full weight in the diagnosis, so they
 * have to be right. The overall floor stops the inferred tier decaying into
 * noise, and the coverage floor stops precision being bought by declining to
 * label anything.
 */
const COVERAGE_FLOOR = 0.85;
const PRECISION_FLOOR = 0.7;
const NAMED_PRECISION_FLOOR = 0.85;

type BankQuestion = {
  subtopic: Subtopic;
  difficulty: number;
  correct_index: number;
  trap_map: Record<string, string>;
};

type Split = "train" | "test";
type GoldRow = {
  text: string;
  subtopic: string;
  /** The hand-assigned type; null when the rubric fits no single one. */
  label: ErrorType | null;
  draw: string;
  split: Split;
};

const bank = JSON.parse(readFileSync(BANK, "utf8")) as { questions: BankQuestion[] };

// --- coverage over the whole bank -----------------------------------------

const bySubtopic = new Map<string, { subtopic: string; traps: number; classified: number }>();
const byType = new Map<string, number>();
const byTier = new Map<TrapRuleTier, number>();
const unclassified: string[] = [];
let traps = 0;
let classified = 0;

for (const q of bank.questions) {
  const row = bySubtopic.get(q.subtopic) ?? { subtopic: q.subtopic, traps: 0, classified: 0 };
  for (const [index, text] of Object.entries(q.trap_map ?? {})) {
    if (Number(index) === q.correct_index) continue;
    traps++;
    row.traps++;
    const type = classifyTrap(text);
    if (type) {
      classified++;
      row.classified++;
      byType.set(type, (byType.get(type) ?? 0) + 1);
      const tier = ruleTier(classifyTrapRule(text));
      if (tier) byTier.set(tier, (byTier.get(tier) ?? 0) + 1);
    } else {
      unclassified.push(text);
    }
  }
  bySubtopic.set(q.subtopic, row);
}

const coverage = traps > 0 ? classified / traps : 0;

// --- precision against the hand-labelled gold set --------------------------

type Scored = {
  labelled: number;
  agree: number;
  missed: number;
  ambiguous: number;
  total: number;
};
const blank = (): Scored => ({ labelled: 0, agree: 0, missed: 0, ambiguous: 0, total: 0 });

let gold: GoldRow[] = [];
try {
  gold = (JSON.parse(readFileSync(GOLD, "utf8")).samples as GoldRow[]).filter(
    (r) => (r.label as unknown) !== "unlabelled",
  );
} catch {
  gold = [];
}

const splits: Record<Split, Scored> = { train: blank(), test: blank() };
/** Precision by rule tier, on the gated split only. */
const tierScores: Record<TrapRuleTier, Scored> = { named: blank(), inferred: blank() };
const perRule = new Map<string, { fired: number; agree: number }>();
const goldErrors: {
  split: Split;
  text: string;
  gold: ErrorType | null;
  got: ErrorType | null;
  rule: string | null;
}[] = [];
const confusion = new Map<string, Map<string, number>>();

for (const row of gold) {
  const score = splits[row.split];
  if (!score) continue;
  score.total++;
  const got = classifyTrap(row.text);
  const rule = classifyTrapRule(row.text);
  const tier = ruleTier(rule);

  const inner = confusion.get(row.label ?? "none") ?? new Map<string, number>();
  inner.set(got ?? "none", (inner.get(got ?? "none") ?? 0) + 1);
  confusion.set(row.label ?? "none", inner);

  const agreed = got != null && got === row.label;
  if (got != null) {
    const tally = perRule.get(rule ?? "—") ?? { fired: 0, agree: 0 };
    tally.fired++;
    if (agreed) tally.agree++;
    perRule.set(rule ?? "—", tally);
    if (row.split === "test" && tier) {
      tierScores[tier].total++;
      tierScores[tier].labelled++;
      if (agreed) tierScores[tier].agree++;
    }
  }

  if (row.label == null) {
    score.ambiguous++;
    // A sentence no human could bucket is not a precision failure when the
    // classifier also declines it; it is one when the classifier insists.
    if (got != null) {
      score.labelled++;
      goldErrors.push({ split: row.split, text: row.text, gold: null, got, rule });
    }
    continue;
  }
  if (got == null) {
    score.missed++;
    continue;
  }
  score.labelled++;
  if (agreed) score.agree++;
  else goldErrors.push({ split: row.split, text: row.text, gold: row.label, got, rule });
}

const precision = (s: Scored) => (s.labelled > 0 ? s.agree / s.labelled : 0);
const recall = (s: Scored) => {
  const labelable = s.total - s.ambiguous;
  return labelable > 0 ? s.agree / labelable : 0;
};

// --- report ----------------------------------------------------------------

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

if (asJson) {
  console.log(
    JSON.stringify(
      {
        traps,
        classified,
        coverage,
        byType: Object.fromEntries(byType),
        byTier: Object.fromEntries(byTier),
        bySubtopic: [...bySubtopic.values()],
        gold: {
          train: { ...splits.train, precision: precision(splits.train) },
          test: {
            ...splits.test,
            precision: precision(splits.test),
            recall: recall(splits.test),
          },
          testByTier: {
            named: { ...tierScores.named, precision: precision(tierScores.named) },
            inferred: { ...tierScores.inferred, precision: precision(tierScores.inferred) },
          },
        },
      },
      null,
      2,
    ),
  );
} else {
  console.log("Trap vocabulary — coverage by subtopic\n");
  console.log("subtopic                          traps  labelled   share");
  for (const r of [...bySubtopic.values()].sort(
    (a, b) => a.classified / a.traps - b.classified / b.traps,
  )) {
    console.log(
      `${r.subtopic.padEnd(32)}  ${String(r.traps).padStart(5)}  ${String(r.classified).padStart(8)}  ${pct(
        r.classified / r.traps,
      ).padStart(6)}`,
    );
  }
  console.log(
    `\n${"TOTAL".padEnd(32)}  ${String(traps).padStart(5)}  ${String(classified).padStart(8)}  ${pct(
      coverage,
    ).padStart(6)}`,
  );

  console.log("\nLabels assigned, by error type");
  for (const t of ERROR_TYPES) {
    const n = byType.get(t) ?? 0;
    console.log(
      `  ${t.padEnd(20)} ${String(n).padStart(5)}  ${pct(classified > 0 ? n / classified : 0).padStart(6)} of labelled`,
    );
  }
  console.log(`  ${"(unclassified)".padEnd(20)} ${String(traps - classified).padStart(5)}`);
  console.log(
    `\nBy rule tier: named ${byTier.get("named") ?? 0} · inferred ${byTier.get("inferred") ?? 0}`,
  );

  if (gold.length === 0) {
    console.log("\nNo gold set at content/trap-gold.json — precision unmeasured.");
  } else {
    console.log("\nPrecision against the hand-labelled gold set");
    console.log("split    n   labelable  classifier said  correct  precision  recall");
    for (const key of ["train", "test"] as Split[]) {
      const s = splits[key];
      if (s.total === 0) continue;
      console.log(
        `${key.padEnd(7)} ${String(s.total).padStart(3)}  ${String(s.total - s.ambiguous).padStart(9)}  ${String(
          s.labelled,
        ).padStart(15)}  ${String(s.agree).padStart(7)}  ${pct(precision(s)).padStart(9)}  ${pct(
          recall(s),
        ).padStart(6)}`,
      );
    }

    console.log("\nTest-split precision by rule tier");
    for (const tier of ["named", "inferred"] as TrapRuleTier[]) {
      const s = tierScores[tier];
      console.log(
        `  ${tier.padEnd(10)} ${String(s.labelled).padStart(4)} labels  ${String(s.agree).padStart(4)} correct  ${pct(
          precision(s),
        ).padStart(7)}`,
      );
    }

    console.log("\nPer-rule precision over every labelled gold row");
    console.log("rule                       fired  correct  precision");
    for (const [rule, t] of [...perRule.entries()].sort(
      (a, b) => a[1].agree / a[1].fired - b[1].agree / b[1].fired,
    )) {
      console.log(
        `${rule.padEnd(24)}  ${String(t.fired).padStart(5)}  ${String(t.agree).padStart(7)}  ${pct(
          t.agree / t.fired,
        ).padStart(9)}`,
      );
    }

    console.log("\nConfusion (rows = hand label, columns = classifier)");
    const cols = [...ERROR_TYPES, "none"];
    console.log(`${"".padEnd(20)}${cols.map((c) => c.slice(0, 8).padStart(9)).join("")}`);
    for (const g of [...ERROR_TYPES, "none"]) {
      const inner = confusion.get(g);
      if (!inner) continue;
      console.log(
        `${g.padEnd(20)}${cols.map((c) => String(inner.get(c) ?? 0).padStart(9)).join("")}`,
      );
    }
  }

  if (listUnclassified) {
    console.log(`\nUnclassified sentences (${unclassified.length}):`);
    for (const s of unclassified) console.log("  · " + s);
  }
  if (listErrors && goldErrors.length > 0) {
    console.log(`\nGold-set disagreements (${goldErrors.length}):`);
    for (const e of goldErrors) {
      console.log(
        `  [${e.split}] gold=${e.gold ?? "none"} got=${e.got ?? "none"} via ${e.rule ?? "—"}\n      ${e.text}`,
      );
    }
  }
}

// --- gates -----------------------------------------------------------------

const failures: string[] = [];
if (coverage < COVERAGE_FLOOR) {
  failures.push(
    `COVERAGE ${pct(coverage)} of ${traps} trap sentences carry a label — floor is ${pct(COVERAGE_FLOOR)}.`,
  );
}
if (splits.test.total === 0) {
  failures.push("PRECISION unmeasured — content/trap-gold.json has no labelled test split.");
} else {
  if (precision(splits.test) < PRECISION_FLOOR) {
    failures.push(
      `PRECISION ${pct(precision(splits.test))} on the blind test split — floor is ${pct(PRECISION_FLOOR)}. Coverage bought with wrong labels is worse than no labels.`,
    );
  }
  if (precision(tierScores.named) < NAMED_PRECISION_FLOOR) {
    failures.push(
      `NAMED-TIER PRECISION ${pct(precision(tierScores.named))} on the blind test split — floor is ${pct(NAMED_PRECISION_FLOOR)}. These labels carry full weight in the diagnosis.`,
    );
  }
}

if (!asJson) {
  if (failures.length === 0) console.log("\nPASS");
  else {
    console.log("");
    for (const f of failures) console.log("FAIL  " + f);
  }
}
process.exit(failures.length === 0 ? 0 : 1);
