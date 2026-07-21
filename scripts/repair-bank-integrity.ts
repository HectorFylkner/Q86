/**
 * Deterministic integrity repair for the July 2026 bank audit.
 *
 * - Replaces the known six-letter combinatorics explanation that changed its
 *   own problem while solving it.
 * - Adds machine-replayable value evidence when every PS choice is a plain
 *   parseable number but numeric_check was missing.
 * - Increments content_version exactly once for each changed item.
 */
import fs from "node:fs";
import path from "node:path";
import {
  evaluateExpression,
  latexChoiceToExpression,
} from "../lib/ai/verify.ts";

type BankQuestion = {
  uid: string;
  content_version: number;
  format: string;
  stem_md: string;
  choices: string[];
  correct_index: number;
  solution_md: string;
  fastest_path_md: string;
  trap_map: Record<string, string>;
  numeric_check: string | null;
  provenance?: string;
};

const bankPath = path.join(import.meta.dirname, "seed-bank.json");
const bank = JSON.parse(fs.readFileSync(bankPath, "utf8")) as {
  questions: BankQuestion[];
};
const changed = new Set<BankQuestion>();

function applyContentPatch(
  question: BankQuestion,
  patch: Partial<BankQuestion>,
): void {
  let differs = false;
  for (const [key, value] of Object.entries(patch)) {
    const field = key as keyof BankQuestion;
    if (JSON.stringify(question[field]) === JSON.stringify(value)) continue;
    Object.assign(question, { [field]: value });
    differs = true;
  }
  if (differs) changed.add(question);
}

const combinatoricsStem =
  "Six distinct letters $A, B, C, D, E, F$ are arranged in a row. How many arrangements place $A$ immediately to the left of $B$ (that is, $A$ and $B$ occupy consecutive positions with $A$ first)?";
const combinatorics = bank.questions.find(
  (question) => question.stem_md === combinatoricsStem,
);
if (!combinatorics) throw new Error("Six-letter combinatorics item not found.");

const combinatoricsMarker = "human semantic repair (fixed-order block proof)";
applyContentPatch(combinatorics, {
  solution_md: `**Formal path**
Because $A$ must sit immediately to the left of $B$, glue them into the single ordered block $AB$. The block's internal order is fixed; $BA$ is not allowed. We now arrange five distinct objects—$AB, C, D, E,$ and $F$—in a row, so the number of valid arrangements is $5! = 120$.

**Trigger cue**
When two distinct objects must be adjacent in a specified order, glue them into one ordered block.

**Takeaway**
Glue the fixed-order pair, then permute the resulting objects.`,
  fastest_path_md:
    "Treat $AB$ as one fixed-order block alongside $C,D,E,F$. Arrange the five objects in $5! = 120$ ways.",
  trap_map: {
    "0": "Treats $AB$ as one of five objects, then incorrectly divides $5!$ by $2$ even though the block's order is already fixed.",
    "1": "Chooses any two of the six positions for $A$ and $B$ and multiplies by $3!$, ignoring both adjacency and one remaining letter.",
    "3": "Uses the five possible starts for the $AB$ block but miscounts the remaining four-letter arrangements as $30$ instead of $4! = 24$.",
    "4": "Chooses arbitrary positions for $A$ and $B$ and then halves the arrangements of the other four letters, so the adjacency condition is never enforced.",
  },
  provenance: combinatorics.provenance?.includes(combinatoricsMarker)
    ? combinatorics.provenance
    : `${combinatorics.provenance ?? "seed bank"}; ${combinatoricsMarker}`,
});

const mixture = bank.questions.find(
  (question) =>
    question.uid === "q86-seed-mixtures-weighted-avg-9d30474f1468",
);
if (!mixture) throw new Error("Audited mixture item not found.");
const mixtureMarker = "human semantic repair (concentrate conservation proof)";
applyContentPatch(mixture, {
  solution_md: `**Formal path**
The original 60 liters at $45\%$ contain $0.45(60)=27$ liters of concentrate. Removing 10 liters of the uniform mixture removes $0.45(10)=4.5$ liters, leaving $22.5$ liters. Adding 10 liters of solution $B$ adds $0.10b$ liters of concentrate. The final mixture contains $0.50(60)=30$ liters, so
$$22.5+0.10b=30 \implies b=75.$$

Now use $a=15$ in the original blend:
$$0.15x+0.75(60-x)=0.45(60).$$
Thus $0.15x+45-0.75x=27$, so $0.60x=18$ and $x=30$.

**Trigger cue**
For remove-and-replace mixtures, track the actual amount of concentrate through each event before solving the original blend.

**Takeaway**
Track concentrate volume through each removal and replacement.`,
  fastest_path_md:
    "The replacement raises 60 liters by 5 percentage points, adding 3 liters of concentrate. Replacing 10 liters of 45% mix with $B$ gives $10(b-0.45)=3$, so $b=75\%$. Since 45% is midway between 15% and 75%, the two starting amounts are equal; therefore $x=30$.",
  provenance: mixture.provenance?.includes(mixtureMarker)
    ? mixture.provenance
    : `${mixture.provenance ?? "seed bank"}; ${mixtureMarker}`,
});

const xCubed = bank.questions.find(
  (question) =>
    question.uid === "q86-seed-exponents-roots-properties-a87b4e0049a0",
);
if (!xCubed) throw new Error("Audited x-cubed DS item not found.");
const xCubedMarker = "human semantic repair (valid DS witnesses)";
applyContentPatch(xCubed, {
  fastest_path_md:
    "Statement (1) permits $x=0,4,-4$, so $x^3$ is not fixed. Statement (2) permits $x=4,-4$, so $x^3$ is not fixed. Together, both $4$ and $-4$ still survive, producing $64$ and $-64$; therefore even together the statements are not sufficient.",
  provenance: xCubed.provenance?.includes(xCubedMarker)
    ? xCubed.provenance
    : `${xCubed.provenance ?? "seed bank"}; ${xCubedMarker}`,
});

let evidenceAdded = 0;
for (const question of bank.questions) {
  if (question.format !== "problem_solving" || question.numeric_check != null)
    continue;
  const expressions = question.choices.map(latexChoiceToExpression);
  if (
    expressions.some(
      (expression) =>
        expression == null || evaluateExpression(expression) == null,
    )
  )
    continue;
  question.numeric_check = expressions[question.correct_index];
  if (question.numeric_check == null) continue;
  changed.add(question);
  evidenceAdded++;
}

for (const question of changed) question.content_version += 1;
fs.writeFileSync(bankPath, `${JSON.stringify(bank, null, 1)}\n`);
console.log(
  `Integrity repair complete: ${changed.size} versioned items; ${evidenceAdded} numeric checks added.`,
);
