import { validateCurrentCurriculum } from "../curriculum/v3/validate.ts";

const { curriculum, ledger, issues } = validateCurrentCurriculum();
const dispositions = Object.fromEntries(
  ["canonical_concept", "deliberate_merge", "out_of_scope"].map((status) => [
    status,
    curriculum.coreIdeaInventory.filter((item) => item.disposition === status).length,
  ]),
);

console.log(
  `Curriculum v3: ${curriculum.concepts.length} concepts; ${curriculum.coreIdeaInventory.length} core ideas `
  + `(${dispositions.canonical_concept} canonical, ${dispositions.deliberate_merge} merged, ${dispositions.out_of_scope} out of scope).`,
);
console.log(
  `Bank dispositions: ${ledger.questionMappings.filter((item) => item.status === "mapped").length} pilot leaf-mapped; `
  + `${ledger.unresolvedQuestionIds.length} explicitly unresolved; ${ledger.generatedFrom.bankQuestionCount} total.`,
);
console.log(
  `Production-ready concepts: ${ledger.productionReadyConceptIds.length}; replayably verified scored items: `
  + `${new Set(ledger.concepts.flatMap((item) => item.replayablyVerifiedQuestionIds)).size}.`,
);

if (issues.length > 0) {
  for (const issue of issues) console.error(`✗ ${issue.code}: ${issue.message}`);
  console.error(`${issues.length} curriculum integrity failure(s).`);
  process.exit(1);
}
console.log("Curriculum graph, dispositions, references, and readiness claims are internally valid.");
