/**
 * Draw the hand-labelling sample for `content/trap-gold.json`.
 *
 * The gold set exists so the trap classifier's *precision* can be measured
 * rather than asserted. Coverage is trivially gamed — a rule that returns
 * "content_gap" for every sentence scores 100% — so the only number that
 * defends a widening is how often the label it assigns is the right one.
 *
 * Two properties matter and both are enforced here rather than left to
 * discipline:
 *
 *   PROPORTIONAL  the sample is allocated across subtopics in proportion to
 *                 how many trap sentences each one actually has (largest
 *                 remainder), so precision measured on it estimates
 *                 precision on the bank rather than on an even spread of
 *                 chapters.
 *   BLIND         a draw marked `test` is hand-labelled *before* the
 *                 classifier is run over it, and the rules are never edited
 *                 afterwards. Round 1 is why this matters: rules tuned on
 *                 150 sentences scored 86.8% on those and 69.3% on a blind
 *                 150, so the training number overstates by ~17 points and
 *                 cannot be the one that is gated.
 *
 * Deterministic in the seed, so a draw can be reproduced and audited.
 * Re-running preserves labels already assigned to sentences still in the
 * draw — relabelling by hand on every run would guarantee drift.
 *
 * Usage:
 *   node --experimental-strip-types scripts/sample-traps.ts            # report
 *   node --experimental-strip-types scripts/sample-traps.ts --write
 *   node --experimental-strip-types scripts/sample-traps.ts \
 *        --draw=r2-test --split=test --size=150 --seed=4242 --write
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { mulberry32, shuffle } from "../lib/generators/rng.ts";

const ROOT = path.join(import.meta.dirname, "..");
const BANK = path.join(ROOT, "scripts", "seed-bank.json");
const GOLD = path.join(ROOT, "content", "trap-gold.json");

const num = (name: string, fallback: number) => {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? Number(found.split("=")[1]) : fallback;
};
const str = (name: string, fallback: string) => {
  const found = process.argv.find((a) => a.startsWith(`--${name}=`));
  return found ? found.split("=").slice(1).join("=") : fallback;
};
const SIZE = num("size", 150);
const SEED = num("seed", 4242);
const DRAW = str("draw", "r2-test");
const SPLIT = str("split", "test") as "train" | "test";
const write = process.argv.includes("--write");

type BankQuestion = {
  subtopic: string;
  difficulty: number;
  correct_index: number;
  trap_map: Record<string, string>;
};

type Sample = {
  text: string;
  subtopic: string;
  difficulty: number;
  /** An error type, `null` for "no single type fits", `"unlabelled"` for not
   *  yet read by a human. The audit skips the last kind. */
  label: string | null;
  /** Which draw this sentence came from, kept so the rounds stay legible. */
  draw: string;
  /** `train` may be read while writing rules; `test` may not. */
  split: "train" | "test";
};

const bank = JSON.parse(readFileSync(BANK, "utf8")) as { questions: BankQuestion[] };

const existing: Sample[] = existsSync(GOLD)
  ? (JSON.parse(readFileSync(GOLD, "utf8")).samples as Sample[])
  : [];
const alreadyDrawn = new Set(existing.filter((s) => s.draw !== DRAW).map((s) => s.text));

// Every trap sentence in the bank, grouped by subtopic. Sentences already in
// another draw are excluded: a test set that repeats the training set measures
// nothing.
const pool = new Map<string, { text: string; subtopic: string; difficulty: number }[]>();
let total = 0;
let eligible = 0;
for (const q of bank.questions) {
  for (const [index, text] of Object.entries(q.trap_map ?? {})) {
    if (Number(index) === q.correct_index) continue;
    total++;
    if (alreadyDrawn.has(text)) continue;
    const list = pool.get(q.subtopic) ?? [];
    list.push({ text, subtopic: q.subtopic, difficulty: q.difficulty });
    pool.set(q.subtopic, list);
    eligible++;
  }
}

// Proportional allocation, largest remainder — the same rule the daily plan
// uses for its per-skill counts, so the two cannot disagree about rounding.
const subtopics = [...pool.keys()].sort();
const exact = subtopics.map((s) => ({
  subtopic: s,
  want: (pool.get(s)!.length / eligible) * SIZE,
}));
const alloc = new Map(exact.map((e) => [e.subtopic, Math.floor(e.want)]));
let remaining = SIZE - [...alloc.values()].reduce((a, b) => a + b, 0);
for (const e of [...exact].sort(
  (a, b) => b.want - Math.floor(b.want) - (a.want - Math.floor(a.want)),
)) {
  if (remaining <= 0) break;
  alloc.set(e.subtopic, alloc.get(e.subtopic)! + 1);
  remaining--;
}

const rng = mulberry32(SEED);
const drawn: Sample[] = [];
for (const subtopic of subtopics) {
  const want = alloc.get(subtopic) ?? 0;
  if (want === 0) continue;
  // Distinct sentences only: the same phrasing twice would count twice in the
  // precision denominator without adding evidence.
  const seen = new Set<string>();
  const unique = pool
    .get(subtopic)!
    .filter((t) => (seen.has(t.text) ? false : (seen.add(t.text), true)));
  for (const item of shuffle(unique, rng).slice(0, want)) {
    drawn.push({ ...item, label: "unlabelled", draw: DRAW, split: SPLIT });
  }
}

// Preserve labels already assigned by hand, in this draw or a previous one.
const priorLabels = new Map(existing.map((s) => [s.text, s]));
let kept = 0;
for (const s of drawn) {
  const before = priorLabels.get(s.text);
  if (before && before.draw === DRAW) {
    s.label = before.label;
    if (before.label != null && before.label !== "unlabelled") kept++;
  }
}

const merged = [...existing.filter((s) => s.draw !== DRAW), ...drawn].sort((a, b) =>
  a.draw === b.draw
    ? a.subtopic === b.subtopic
      ? a.text.localeCompare(b.text)
      : a.subtopic.localeCompare(b.subtopic)
    : a.draw.localeCompare(b.draw),
);

const byDraw = new Map<string, number>();
for (const s of merged) byDraw.set(s.draw, (byDraw.get(s.draw) ?? 0) + 1);

console.log(
  `${total} trap sentences in the bank; ${eligible} eligible for draw "${DRAW}" ` +
    `(${total - eligible} already in another draw).\n` +
    `Drew ${drawn.length} into split "${SPLIT}". ${kept} existing labels preserved.\n` +
    `Gold set now: ${[...byDraw.entries()].map(([d, n]) => `${d} ${n}`).join(", ")} = ${merged.length}.`,
);

if (write) {
  const doc = {
    note: "Hand-labelled trap sentences. Rubric: content/TRAP-VOCABULARY.md. Draws: scripts/sample-traps.ts. `split: test` rows were labelled before the classifier was run over them and the rules were not touched afterwards — that is the number `pnpm check:traps` gates on.",
    draws: {
      "r1-dev": { seed: 8686, size: 300, note: "first draw, dev half — rules were written against these" },
      "r1-holdout": { seed: 8686, size: 300, note: "first draw, blind half — folded into training for round 2" },
      "r2-test": { seed: 4242, size: 150, note: "second draw, blind — the gate" },
    },
    samples: merged,
  };
  writeFileSync(GOLD, JSON.stringify(doc, null, 1) + "\n");
  console.log(`→ ${path.relative(ROOT, GOLD)}`);
} else {
  console.log("(dry run — pass --write to update content/trap-gold.json)");
}
