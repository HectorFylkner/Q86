import { buildCoverageLedger } from "../curriculum/v3/coverage.ts";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";

const curriculum = buildCurriculumV3();
const ledger = buildCoverageLedger(curriculum);

if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(ledger, null, 2)}\n`);
} else if (process.argv.includes("--summary-json")) {
  process.stdout.write(`${JSON.stringify({
    schemaVersion: ledger.schemaVersion,
    generatedFrom: ledger.generatedFrom,
    policy: ledger.policy,
    summary: {
      mappedQuestions: ledger.questionMappings.filter((item) => item.status === "mapped").length,
      unresolvedQuestions: ledger.unresolvedQuestionIds.length,
      productionReadyConcepts: ledger.productionReadyConceptIds.length,
      replayablyVerifiedQuestions: new Set(
        ledger.concepts.flatMap((item) => item.replayablyVerifiedQuestionIds),
      ).size,
    },
    concepts: ledger.concepts,
  })}\n`);
} else {

const byConcept = new Map(curriculum.concepts.map((concept) => [concept.id, concept]));
const dispositionCounts = {
  canonical: curriculum.coreIdeaInventory.filter((item) => item.disposition === "canonical_concept").length,
  merged: curriculum.coreIdeaInventory.filter((item) => item.disposition === "deliberate_merge").length,
  outOfScope: curriculum.coreIdeaInventory.filter((item) => item.disposition === "out_of_scope").length,
};
const mapped = ledger.questionMappings.filter((item) => item.status === "mapped");
const fallback = mapped.filter((item) => item.mappingConfidence === "provisional_fallback");

console.log("# Curriculum v3 coverage audit\n");
console.log("Generated from the checked-in lesson corpus and `scripts/seed-bank.json`. This report measures evidence, not learning effectiveness.\n");
console.log("## Corpus\n");
console.log(`- Core ideas: ${ledger.generatedFrom.coreIdeaCount} (${dispositionCounts.canonical} canonical concepts, ${dispositionCounts.merged} deliberate merges, ${dispositionCounts.outOfScope} out of scope)`);
console.log(`- Concepts: ${ledger.concepts.length}`);
console.log(`- Bank questions: ${ledger.generatedFrom.bankQuestionCount}`);
console.log(`- Pilot questions leaf-mapped: ${mapped.length} (${fallback.length} provisional fallback)`);
console.log(`- Non-pilot questions explicitly unresolved at leaf level: ${ledger.unresolvedQuestionIds.length}`);
console.log(`- Production-ready concepts: ${ledger.productionReadyConceptIds.length}`);
console.log("- Replayably verified scored questions: 0 (legacy numeric checks validate a keyed value, not the stem-to-key proof)\n");
console.log("## Evidence floors\n");
console.log(`A production concept needs at least ${ledger.policy.minimumExamples} worked examples, ${ledger.policy.minimumGradedImmediateChecks} graded immediate checks, ${ledger.policy.minimumNamedMisconceptions} named misconceptions, ${ledger.policy.minimumReplayablyVerifiedScoredItems} replayably verified scored items, ${ledger.policy.minimumDifficultyBands} difficulty bands, and ${ledger.policy.minimumSurfaceForms} surface forms.\n`);
console.log("## Per-concept ledger\n");
console.log("| Parent | Concept | Lesson | Ex | Graded checks | Misconceptions | Raw / replayable | Bands | Forms | Eligible | Shortfalls |");
console.log("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|");
for (const cell of ledger.concepts) {
  const concept = byConcept.get(cell.conceptId)!;
  const bands = Object.keys(cell.countsByDifficulty).length;
  const forms = Object.keys(cell.countsBySurfaceForm).filter((key) => key !== "unclassified").length;
  const shortfalls = cell.shortfalls.join("; ").replace(/\|/g, "\\|");
  console.log(`| ${concept.parentSubtopic} | \`${cell.conceptId}\` | ${cell.lessonStatus} | ${cell.exampleIds.length} | ${cell.gradedCheckIds.length} | ${cell.misconceptionIds.length} | ${cell.rawScoredQuestionIds.length} / ${cell.replayablyVerifiedQuestionIds.length} | ${bands} | ${forms} | ${cell.assessmentEligible ? "yes" : "no"} | ${shortfalls} |`);
}

console.log("\n## Interpretation\n");
console.log("All concepts remain unpublished for mastery certification. The three pilots have curated objectives and mappings, but the old chapter prose does not satisfy the micro-lesson contract, the current checklist lines are self-report prompts rather than graded retrieval, and the bank lacks replayable proof specifications. Non-pilot bank questions are dispositioned—not orphaned—but deliberately remain unresolved at leaf level until their chapters receive curated question mapping.");
}
