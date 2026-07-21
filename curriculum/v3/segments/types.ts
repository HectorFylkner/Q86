export type SegmentDifficulty = 1 | 2 | 3 | 4 | 5;
export type SegmentExampleRole =
  | "foundation"
  | "application"
  | "transfer_or_boundary";
export type CheckIndependence = "guided" | "independent";
export type HintKind = "goal" | "trigger" | "setup" | "next_move";

export type AnswerSpec =
  | {
      kind: "exact";
      acceptedAnswers: readonly string[];
      caseSensitive?: boolean;
    }
  | {
      kind: "numeric";
      value: number;
      tolerance?: number;
    }
  | {
      kind: "multiple_choice";
      choices: readonly string[];
      correctIndex: number;
    };

export type ProgressiveHint = {
  id: string;
  kind: HintKind;
  textMd: string;
};

export type PrerequisiteCheck = {
  id: string;
  prerequisiteConceptIds: readonly string[];
  promptMd: string;
  answer: AnswerSpec;
  explanationMd: string;
};

export type SegmentExample = {
  id: string;
  conceptIds: readonly string[];
  authoredDifficulty: SegmentDifficulty;
  role: SegmentExampleRole;
  questionMd: string;
  intendedMethod: string;
  answer: AnswerSpec;
  answerLabelMd: string;
  solutionMd: string;
  hints: readonly ProgressiveHint[];
};

export type SegmentMisconception = {
  id: string;
  title: string;
  whyItFeelsPlausible: string;
  detectionCue: string;
  correctionMd: string;
};

export type RetrievalCheck = {
  id: string;
  conceptIds: readonly string[];
  authoredDifficulty: SegmentDifficulty;
  independence: CheckIndependence;
  promptMd: string;
  intendedMethod: string;
  answer: AnswerSpec;
  explanationMd: string;
  hints: readonly ProgressiveHint[];
};

export type ConceptSegment = {
  conceptId: string;
  contentVersion: string;
  sourcePath: `curriculum/v3/segments/${string}.ts`;
  objective: string;
  prerequisiteChecks: readonly PrerequisiteCheck[];
  intuitiveModelMd: string;
  formalRuleMd: string;
  procedure: readonly string[];
  examples: readonly SegmentExample[];
  contrastPair: {
    id: string;
    caseAMd: string;
    caseBMd: string;
    explanationMd: string;
  };
  misconceptions: readonly SegmentMisconception[];
  checks: readonly RetrievalCheck[];
  speedMethod: {
    methodMd: string;
    safeWhen: readonly string[];
    unsafeWhen: readonly string[];
  };
  recapMd: string;
  retrievalPrompts: readonly string[];
};
