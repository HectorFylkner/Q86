import { createHash } from "node:crypto";
import { parseLesson } from "../../lib/lesson-parse.ts";
import { listLessons, readLesson } from "../../lib/lessons.ts";
import type { ContentDomain } from "../../lib/taxonomy.ts";
import { conceptId, semanticSlug, sourceIdeaId } from "./ids.ts";
import {
  PILOT_CANONICAL_SOURCE_IDS,
  PILOT_SOURCE_ASSIGNMENTS,
} from "./pilot-concepts.ts";
import type { ConceptRecord, CoreIdeaDisposition } from "./types.ts";

function semanticAnchor(idea: string): string {
  const bold = idea.match(/^\*\*(.+?)\*\*/s)?.[1];
  const candidate = bold ?? idea.split(/:\s|\.\s|—\s/)[0];
  return candidate
    .replace(/[.:;,]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(text: string): string {
  return createHash("sha256")
    .update(text.replace(/\s+/g, " ").trim())
    .digest("hex")
    .slice(0, 20);
}

const deliberateMerges = new Map<string, { conceptId: string; rationale: string }>([
  [
    sourceIdeaId("prime_factorization", "GCD and LCM by exponents"),
    {
      conceptId: conceptId(
        "divisibility_gcf_lcm",
        "GCF takes minimum exponents LCM takes maximum exponents",
      ),
      rationale: "The same min/max prime-exponent operation is taught more completely in the divisibility, GCF, and LCM chapter.",
    },
  ],
  [
    sourceIdeaId(
      "prime_factorization",
      "Divisible by a and by b means divisible by lcm a b",
    ),
    {
      conceptId: conceptId(
        "divisibility_gcf_lcm",
        "Divisible by both means divisible by the LCM",
      ),
      rationale: "This is the same LCM translation; divisibility_gcf_lcm is the canonical owner.",
    },
  ],
  [
    sourceIdeaId("functions_sequences", "Arithmetic sequence explicit form"),
    {
      conceptId: conceptId("consecutive_evenly_spaced", "The n th term"),
      rationale: "Both statements teach the same constant-gap nth-term formula; the evenly-spaced chapter owns the arithmetic-sequence leaf.",
    },
  ],
  [
    sourceIdeaId("series_patterns", "Arithmetic sequence nth term"),
    {
      conceptId: conceptId("consecutive_evenly_spaced", "The n th term"),
      rationale: "This repeats the constant-gap nth-term capability already owned by consecutive_evenly_spaced.",
    },
  ],
  [
    sourceIdeaId("functions_sequences", "Arithmetic sum"),
    {
      conceptId: conceptId("series_patterns", "Arithmetic series sum"),
      rationale: "The finite arithmetic-series sum is canonically owned by series_patterns; the functions chapter remains a supporting appearance.",
    },
  ],
  [
    sourceIdeaId("series_patterns", "Periodicity"),
    {
      conceptId: conceptId("functions_sequences", "Periodicity"),
      rationale: "Both ideas teach recurrence-cycle detection and modular index reduction; functions_sequences owns the general recurrence form.",
    },
  ],
  [
    sourceIdeaId("series_patterns", "Telescoping"),
    {
      conceptId: conceptId("functions_sequences", "Telescoping"),
      rationale: "The partial-fraction cancellation capability is duplicated verbatim enough to share one owner.",
    },
  ],
  [
    sourceIdeaId("statistics_mean_median_sd", "Evenly spaced sets"),
    {
      conceptId: conceptId("consecutive_evenly_spaced", "Mean equals median"),
      rationale: "Mean equals median for an evenly spaced set is already canonically taught in consecutive_evenly_spaced.",
    },
  ],
  [
    sourceIdeaId("quadratics_factoring", "Never divide by a variable that could be zero"),
    {
      conceptId: conceptId("exponents_roots_properties", "preserve zero solutions"),
      rationale: "The invariant failure mode is loss of a zero solution during cancellation; one cross-subtopic remediation leaf should own it.",
    },
  ],
  [
    sourceIdeaId("must_be_true_testing", "Factor never divide by something that could be zero"),
    {
      conceptId: conceptId("exponents_roots_properties", "preserve zero solutions"),
      rationale: "This is the same cancellation/zero-solution failure mode applied to must-be-true testing.",
    },
  ],
  [
    sourceIdeaId("parity_signs", "Even exponents erase sign odd keep it"),
    {
      conceptId: conceptId("exponents_roots_properties", "sign of integer powers"),
      rationale: "Exponent parity and sign are owned by the exponent leaf; parity_signs supplies a prerequisite appearance.",
    },
  ],
]);

const domainsByChapter: Readonly<
  Record<ConceptRecord["parentSubtopic"], readonly ContentDomain[]>
> = {
  prime_factorization: ["arithmetic"],
  divisibility_gcf_lcm: ["arithmetic"],
  remainders_units_digits: ["arithmetic", "algebra"],
  parity_signs: ["arithmetic", "algebra"],
  consecutive_evenly_spaced: ["arithmetic", "algebra"],
  exponents_roots_properties: ["arithmetic", "algebra"],
  abs_value_number_line_decimals: ["arithmetic", "algebra"],
  must_be_true_testing: ["arithmetic", "algebra"],
  linear_systems: ["algebra"],
  quadratics_factoring: ["algebra"],
  inequalities: ["algebra"],
  functions_sequences: ["algebra"],
  algebraic_translation: ["algebra"],
  min_max_optimization: ["arithmetic", "algebra"],
  percent_change_chains: ["arithmetic", "algebra"],
  ratios_proportions: ["arithmetic", "algebra"],
  rates_speed_work: ["arithmetic", "algebra"],
  mixtures_weighted_avg: ["arithmetic", "algebra"],
  interest_profit_discount: ["arithmetic", "algebra"],
  overlapping_sets: ["arithmetic", "algebra"],
  combinatorics: ["arithmetic", "algebra"],
  probability: ["arithmetic", "algebra"],
  statistics_mean_median_sd: ["arithmetic", "algebra"],
  series_patterns: ["arithmetic", "algebra"],
  data_sufficiency_discipline: ["arithmetic", "algebra"],
  choosing_fastest_path: ["arithmetic", "algebra"],
};

export function buildCoreIdeaInventory(): CoreIdeaDisposition[] {
  const out: CoreIdeaDisposition[] = [];
  for (const lessonMeta of listLessons()) {
    const lesson = readLesson(lessonMeta.subtopic);
    if (!lesson) throw new Error(`Missing lesson for ${lessonMeta.subtopic}`);
    const parsed = parseLesson(lesson.body);
    if (!parsed) throw new Error(`Lesson parser rejected ${lessonMeta.subtopic}`);

    for (const idea of parsed.ideas) {
      const anchor = semanticAnchor(idea);
      const sourceId = sourceIdeaId(lessonMeta.subtopic, anchor);
      const pilotConceptId = PILOT_SOURCE_ASSIGNMENTS[sourceId];
      const explicitMerge = deliberateMerges.get(sourceId);

      if (pilotConceptId) {
        const canonical = PILOT_CANONICAL_SOURCE_IDS.has(sourceId);
        out.push({
          sourceIdeaId: sourceId,
          chapter: lessonMeta.subtopic,
          semanticAnchor: anchor,
          sourceText: idea,
          sourceFingerprint: fingerprint(idea),
          disposition: canonical ? "canonical_concept" : "deliberate_merge",
          canonicalConceptId: pilotConceptId,
          rationale: canonical
            ? "Curated into a pilot assessable leaf."
            : "Deliberately merged with a closely coupled pilot idea that shares one decision procedure and remediation path.",
        });
        continue;
      }

      if (explicitMerge) {
        out.push({
          sourceIdeaId: sourceId,
          chapter: lessonMeta.subtopic,
          semanticAnchor: anchor,
          sourceText: idea,
          sourceFingerprint: fingerprint(idea),
          disposition: "deliberate_merge",
          canonicalConceptId: explicitMerge.conceptId,
          rationale: explicitMerge.rationale,
        });
        continue;
      }

      out.push({
        sourceIdeaId: sourceId,
        chapter: lessonMeta.subtopic,
        semanticAnchor: anchor,
        sourceText: idea,
        sourceFingerprint: fingerprint(idea),
        disposition: "canonical_concept",
        canonicalConceptId: conceptId(lessonMeta.subtopic, anchor),
        rationale: "Retained as an unpublished inventory leaf pending full objective and evidence curation.",
      });
    }
  }
  return out;
}

function objectiveFromIdea(disposition: CoreIdeaDisposition): string {
  const plain = disposition.sourceText
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return `Explain and correctly apply this existing curriculum claim: ${plain}`;
}

export function buildInventoryConcepts(
  inventory = buildCoreIdeaInventory(),
): ConceptRecord[] {
  return inventory
    .filter((item) => item.disposition === "canonical_concept")
    .filter((item) => !PILOT_CANONICAL_SOURCE_IDS.has(item.sourceIdeaId))
    .map((item) => {
      const id = item.canonicalConceptId!;
      const strategy = item.chapter === "data_sufficiency_discipline" || item.chapter === "choosing_fastest_path";
      return {
        id,
        kind: "inventory_candidate",
        applicableSections: strategy
          ? (["strategy"] as const)
          : (["quant", "data_insights_ds_bridge"] as const),
        officialDomains: domainsByChapter[item.chapter],
        parentSubtopic: item.chapter,
        title: item.semanticAnchor,
        objective: objectiveFromIdea(item),
        prerequisiteConceptIds: [],
        canonicalOwner: id,
        boundaries: [],
        edgeCases: [],
        confusableConceptIds: [],
        methods: [],
        misconceptionIds: [],
        archetypeIds: [],
        surfaceFormIds: [],
        intendedDifficulty: [1, 5] as const,
        lessonStatus: "source_only" as const,
        assessmentStatus: "unmapped" as const,
        productionReady: false,
        provenance: [
          {
            kind: "q86_lesson" as const,
            path: `content/lessons/${item.chapter}.md`,
            section: "The core ideas",
            anchor: item.semanticAnchor,
            checkedOn: "2026-07-21" as const,
          },
        ],
        contentVersion: "3.0.0-inventory.1",
        sourceCoreIdeaIds: [item.sourceIdeaId],
      };
    });
}

export function stableIdeaSlugForAudit(idea: string): string {
  return semanticSlug(semanticAnchor(idea));
}

export const CURATED_MERGE_SOURCE_IDS = new Set(deliberateMerges.keys());
