/**
 * Authoring gate for seed-bank questions.
 *
 * Every candidate question carries a `check` function that recomputes the
 * answer from the stem's raw data — brute force, enumeration, simulation —
 * independent of the written solution. Items enter scripts/seed-bank.json
 * only if every structural assertion AND the independent check pass. This
 * gate caught ~15 authoring errors during the original bank build and, run
 * as an audit, exposed 22 defective questions that the LLM-only pipeline
 * gate had passed. Do not add questions to the bank any other way.
 *
 * check() returns either
 *   { kind: "value", value: number }  — compared against the keyed choice
 *     (and asserted to differ from every other parseable choice), or
 *   { kind: "index", index: number }  — for DS / expression-choice items,
 *     the check itself must derive the correct index programmatically.
 *
 * Usage: write a batch file next to this one (see example-batch.mjs),
 * then run it with `node --experimental-strip-types scripts/author/your-batch.mjs`
 * (the flag is needed below Node 22.18 — this file imports the app's .ts
 * modules). After appending, run the same way: scripts/verify-bank.ts,
 * then `pnpm seed` to load the DB.
 */
import fs from "node:fs";
import path from "node:path";
import {
  latexChoiceToExpression,
  evaluateExpression,
  numbersAgree,
} from "../../lib/ai/verify.ts";
import { DS_CHOICES } from "../../lib/taxonomy.ts";

const BANK = path.join(import.meta.dirname, "..", "seed-bank.json");

export function verifyAndAppend(items, { dryRun = false } = {}) {
  const failures = [];
  const fail = (i, msg) => failures.push(`[${i}] ${items[i].subtopic ?? "?"}: ${msg}`);

  items.forEach((q, i) => {
    // structural
    for (const f of ["format","content_domain","context","fundamental_skill","subtopic","difficulty","stem_md","choices","correct_index","solution_md","fastest_path_md","trap_map"]) {
      if (q[f] === undefined) fail(i, `missing field ${f}`);
    }
    if (!q.choices || q.choices.length !== 5) return fail(i, "needs exactly 5 choices");
    if (new Set(q.choices.map((c) => c.trim())).size !== 5) fail(i, "choices not distinct");
    if (q.correct_index < 0 || q.correct_index > 4) fail(i, "bad correct_index");
    const wrong = [0,1,2,3,4].filter((x) => x !== q.correct_index);
    for (const w of wrong) if (!q.trap_map[String(w)]) fail(i, `trap_map missing ${w}`);
    for (const h of ["**Formal path**","**Trigger cue**","**Takeaway**"])
      if (!q.solution_md.includes(h)) fail(i, `solution missing ${h}`);
    const takeaway = (q.solution_md.split("**Takeaway**")[1] ?? "").trim();
    if (takeaway.split(/\s+/).filter(Boolean).length >= 15) fail(i, `takeaway ${takeaway.split(/\s+/).length} words`);
    if (q.format === "data_sufficiency") {
      if (q.choices.join("|") !== DS_CHOICES.join("|")) fail(i, "DS choices not canonical");
      if (q.numeric_check != null) fail(i, "DS must have null numeric_check");
      if (!/\(1\)/.test(q.stem_md) || !/\(2\)/.test(q.stem_md)) fail(i, "DS stem missing statements");
    }
    // currency hygiene: any bare $ immediately followed by a digit outside math is suspicious
    if (/(?<!\\)\$\d/.test(q.stem_md.replace(/\$[^$]*\$/g, ""))) fail(i, "possible unescaped currency $ in stem");

    // the independent check
    if (typeof q.check !== "function") return fail(i, "missing check()");
    let result;
    try { result = q.check(q); } catch (e) { return fail(i, `check threw: ${e}`); }
    if (result.kind === "value") {
      const keyedExpr = latexChoiceToExpression(q.choices[q.correct_index]);
      const keyed = keyedExpr == null ? null : evaluateExpression(keyedExpr);
      if (keyed == null) return fail(i, `keyed choice unparseable: ${q.choices[q.correct_index]}`);
      if (!numbersAgree(result.value, keyed)) return fail(i, `check computed ${result.value}, keyed choice = ${keyed}`);
      for (const w of wrong) {
        const expr = latexChoiceToExpression(q.choices[w]);
        const v = expr == null ? null : evaluateExpression(expr);
        if (v != null && numbersAgree(result.value, v)) fail(i, `distractor ${w} equals computed answer`);
      }
      if (q.numeric_check != null) {
        const nc = evaluateExpression(q.numeric_check);
        if (nc == null || !numbersAgree(nc, result.value)) fail(i, `numeric_check ${q.numeric_check} = ${nc} != ${result.value}`);
      }
    } else if (result.kind === "index") {
      if (result.index !== q.correct_index) return fail(i, `check derived index ${result.index}, keyed ${q.correct_index}`);
    } else fail(i, "check() must return {kind:value|index}");
  });

  if (failures.length) {
    console.error(`✗ ${failures.length} failures:`);
    for (const f of failures) console.error("  " + f);
    process.exit(1);
  }

  const bank = JSON.parse(fs.readFileSync(BANK, "utf8"));
  const stems = new Set(bank.questions.map((q) => q.stem_md));
  let added = 0, dupes = 0;
  for (const q of items) {
    if (stems.has(q.stem_md)) { dupes++; continue; }
    const fields = { ...q, provenance: q.provenance ?? "authored + brute-force programmatic verification" };
    delete fields.check;
    bank.questions.push(fields);
    stems.add(q.stem_md);
    added++;
  }
  if (!dryRun) fs.writeFileSync(BANK, JSON.stringify(bank, null, 1));
  console.log(`✓ all ${items.length} items verified — ${added} appended${dupes ? `, ${dupes} duplicates skipped` : ""}${dryRun ? " (dry run)" : ""}. Bank total: ${bank.questions.length}`);
}
