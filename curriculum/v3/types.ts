import type {
  ContentDomain,
  QuestionFormat,
  Subtopic,
} from "../../lib/taxonomy.ts";

export type CurriculumSection = "quant" | "data_insights_ds_bridge" | "strategy";
export type EvidenceStatus = "none" | "source_only" | "draft" | "production_ready";
export type AssessmentStatus = "unmapped" | "insufficient" | "eligible";
export type ConceptKind = "assessable_leaf" | "inventory_candidate";

export type SourceRef = {
  kind: "q86_lesson" | "q86_bank" | "curriculum_decision";
  path: string;
  section?: string;
  anchor?: string;
  checkedOn: "2026-07-21";
};

export type ConceptMethod = {
  id: string;
  title: string;
  procedure: readonly string[];
  decisionCues: readonly string[];
  unsafeWhen: readonly string[];
};

export type ConceptRecord = {
  id: string;
  kind: ConceptKind;
  applicableSections: readonly CurriculumSection[];
  officialDomains: readonly ContentDomain[];
  parentSubtopic: Subtopic | "data_sufficiency_discipline" | "choosing_fastest_path";
  title: string;
  objective: string;
  prerequisiteConceptIds: readonly string[];
  canonicalOwner: string;
  boundaries: readonly string[];
  edgeCases: readonly string[];
  confusableConceptIds: readonly string[];
  methods: readonly ConceptMethod[];
  misconceptionIds: readonly string[];
  archetypeIds: readonly string[];
  surfaceFormIds: readonly string[];
  intendedDifficulty: readonly [number, number];
  lessonStatus: EvidenceStatus;
  assessmentStatus: AssessmentStatus;
  productionReady: boolean;
  provenance: readonly SourceRef[];
  contentVersion: string;
  sourceCoreIdeaIds: readonly string[];
};

export type CoreIdeaDisposition = {
  sourceIdeaId: string;
  chapter: ConceptRecord["parentSubtopic"];
  semanticAnchor: string;
  sourceText: string;
  sourceFingerprint: string;
  disposition: "canonical_concept" | "deliberate_merge" | "out_of_scope";
  canonicalConceptId: string | null;
  rationale: string;
};

export type MisconceptionRecord = {
  id: string;
  conceptId: string;
  title: string;
  whyItFeelsPlausible: string;
  detectionCue: string;
  correction: string;
  source: SourceRef;
};

export type ArchetypeRecord = {
  id: string;
  conceptId: string;
  title: string;
  decisionCue: string;
  response: string;
  surfaceFormIds: readonly string[];
  source: SourceRef;
};

export type ExampleRecord = {
  id: string;
  chapter: Subtopic;
  conceptIds: readonly string[];
  authoredDifficulty: 1 | 2 | 3 | 4 | 5;
  role: "foundation" | "application" | "transfer_or_boundary";
  sourceQuestionNeedle: string;
  source: SourceRef;
};

export type CheckRecord = {
  id: string;
  chapter: Subtopic;
  conceptIds: readonly string[];
  evidenceKind: "self_report_prompt" | "graded_retrieval";
  isGraded: boolean;
  sourceTextNeedle: string;
  source: SourceRef;
};

export type QuestionMapping = {
  questionUid: string;
  questionContentVersion: number;
  bankIndex: number;
  parentSubtopic: Subtopic;
  status: "mapped" | "unresolved";
  primaryConceptId: string | null;
  secondaryConceptIds: readonly string[];
  archetypeId: string | null;
  surfaceFormId: string | null;
  mappingConfidence: "curated_rule" | "provisional_fallback" | "unresolved";
  verificationStatus: "numeric_answer_alignment" | "structural_only";
  replayableVerification: false;
  reason: string;
};

export type CoverageCell = {
  conceptId: string;
  prerequisites: readonly string[];
  lessonStatus: EvidenceStatus;
  productionReady: boolean;
  exampleIds: readonly string[];
  gradedCheckIds: readonly string[];
  selfReportCheckIds: readonly string[];
  misconceptionIds: readonly string[];
  rawScoredQuestionIds: readonly string[];
  replayablyVerifiedQuestionIds: readonly string[];
  countsByDifficulty: Readonly<Record<string, number>>;
  countsByFormat: Readonly<Partial<Record<QuestionFormat, number>>>;
  countsByContext: Readonly<Record<string, number>>;
  countsByArchetype: Readonly<Record<string, number>>;
  countsBySurfaceForm: Readonly<Record<string, number>>;
  assessmentEligible: boolean;
  shortfalls: readonly string[];
};

export type CoverageLedger = {
  schemaVersion: "3.0.0";
  generatedFrom: {
    bankPath: "scripts/seed-bank.json";
    bankQuestionCount: number;
    lessonPath: "content/lessons/*.md";
    coreIdeaCount: number;
  };
  policy: {
    minimumExamples: 3;
    minimumGradedImmediateChecks: 6;
    minimumNamedMisconceptions: 3;
    minimumReplayablyVerifiedScoredItems: 6;
    minimumDifficultyBands: 3;
    minimumSurfaceForms: 2;
  };
  questionMappings: readonly QuestionMapping[];
  concepts: readonly CoverageCell[];
  unresolvedQuestionIds: readonly string[];
  productionReadyConceptIds: readonly string[];
};
