import fs from "node:fs";
import { buildCoverageLedger } from "../curriculum/v3/coverage.ts";
import { buildCurriculumV3 } from "../curriculum/v3/graph.ts";

const curriculum = buildCurriculumV3();
const ledger = buildCoverageLedger(curriculum);
const teachingReadyConceptSegments = ledger.concepts.filter(
  (item) => item.lessonStatus === "production_ready",
).length;
const compactSnapshot = {
  schemaVersion: ledger.schemaVersion,
  generatedFrom: ledger.generatedFrom,
  policy: ledger.policy,
  summary: {
    mappedQuestions: ledger.questionMappings.filter((item) => item.status === "mapped").length,
    unresolvedQuestions: ledger.unresolvedQuestionIds.length,
    teachingReadyConceptSegments,
    productionReadyConcepts: ledger.productionReadyConceptIds.length,
    replayablyVerifiedQuestions: new Set(
      ledger.concepts.flatMap((item) => item.replayablyVerifiedQuestionIds),
    ).size,
  },
  concepts: ledger.concepts,
};

if (process.argv.includes("--write-snapshot")) {
  fs.writeFileSync(
    "curriculum/v3/coverage-ledger.json",
    `${JSON.stringify(compactSnapshot)}\n`,
  );
  console.log("Updated curriculum/v3/coverage-ledger.json from the live audit.");
} else if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(ledger, null, 2)}\n`);
} else if (process.argv.includes("--summary-json")) {
  process.stdout.write(`${JSON.stringify(compactSnapshot)}\n`);
} else {
  const byConcept = new Map(
    curriculum.concepts.map((concept) => [concept.id, concept]),
  );
  const dispositionCounts = {
    canonical: curriculum.coreIdeaInventory.filter(
      (item) => item.disposition === "canonical_concept",
    ).length,
    merged: curriculum.coreIdeaInventory.filter(
      (item) => item.disposition === "deliberate_merge",
    ).length,
    outOfScope: curriculum.coreIdeaInventory.filter(
      (item) => item.disposition === "out_of_scope",
    ).length,
  };
  const mapped = ledger.questionMappings.filter((item) => item.status === "mapped");
  const fallback = mapped.filter(
    (item) => item.mappingConfidence === "provisional_fallback",
  );
  const lines: string[] = [];
  const emit = (line = "") => lines.push(line);

  emit("# Curriculum v3 coverage audit");
  emit();
  emit("Generated from the checked-in lesson corpus and `scripts/seed-bank.json`. This report measures evidence, not learning effectiveness.");
  emit();
  emit("## Corpus");
  emit();
  emit(`- Core ideas: ${ledger.generatedFrom.coreIdeaCount} (${dispositionCounts.canonical} canonical concepts, ${dispositionCounts.merged} deliberate merges, ${dispositionCounts.outOfScope} out of scope)`);
  emit(`- Concepts: ${ledger.concepts.length}`);
  emit(`- Bank questions: ${ledger.generatedFrom.bankQuestionCount}`);
  emit(`- Pilot questions leaf-mapped: ${mapped.length} (${fallback.length} provisional fallback)`);
  emit(`- Non-pilot questions explicitly unresolved at leaf level: ${ledger.unresolvedQuestionIds.length}`);
  emit(`- Teaching-complete concept segments: ${teachingReadyConceptSegments}`);
  emit(`- End-to-end production-ready concepts: ${ledger.productionReadyConceptIds.length}`);
  emit("- Replayably verified scored questions: 0 (numeric answer evidence validates a keyed value, not the stem-to-key proof)");
  emit();
  emit("## Evidence floors");
  emit();
  emit(`A production concept needs at least ${ledger.policy.minimumExamples} worked examples, ${ledger.policy.minimumGradedImmediateChecks} graded immediate checks, ${ledger.policy.minimumNamedMisconceptions} named misconceptions, ${ledger.policy.minimumReplayablyVerifiedScoredItems} replayably verified scored items, ${ledger.policy.minimumDifficultyBands} difficulty bands, and ${ledger.policy.minimumSurfaceForms} surface forms.`);
  emit("The no-repeat pilot blueprint raises the scored-item requirement to 7 per concept: diagnostic/test-out, easy, medium, hard, short-delay, long-delay, and timed-transfer slots.");
  emit();
  emit("## Per-concept ledger");
  emit();
  emit("| Parent | Concept | Lesson | Ex | Graded checks | Misconceptions | Raw / replayable / required | Bands | Forms | Eligible | Shortfalls |");
  emit("|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|");
  for (const cell of ledger.concepts) {
    const concept = byConcept.get(cell.conceptId)!;
    const bands = Object.keys(cell.countsByDifficulty).length;
    const forms = Object.keys(cell.countsBySurfaceForm).filter(
      (key) => key !== "unclassified",
    ).length;
    const shortfalls = cell.shortfalls.join("; ").replace(/\|/g, "\\|");
    emit(`| ${concept.parentSubtopic} | \`${cell.conceptId}\` | ${cell.lessonStatus} | ${cell.exampleIds.length} | ${cell.gradedCheckIds.length} | ${cell.misconceptionIds.length} | ${cell.rawScoredQuestionIds.length} / ${cell.replayablyVerifiedQuestionIds.length} / ${cell.scoredItemRequirement} | ${bands} | ${forms} | ${cell.assessmentEligible ? "yes" : "no"} | ${shortfalls} |`);
  }
  emit();
  emit("## Interpretation");
  emit();
  emit(`All concepts remain unpublished for mastery certification. ${teachingReadyConceptSegments} pilot leaves meet the structured teaching contract, but the bank still lacks replayable proof specifications and therefore cannot fill any certification blueprint. Non-pilot bank questions are dispositioned—not orphaned—but deliberately remain unresolved at leaf level until their chapters receive curated question mapping.`);
  const report = `${lines.join("\n")}\n`;
  if (process.argv.includes("--write-report")) {
    fs.writeFileSync("docs/curriculum-v3-coverage.md", report);
    console.log("Updated docs/curriculum-v3-coverage.md from the live audit.");
  } else {
    process.stdout.write(report);
  }
}
