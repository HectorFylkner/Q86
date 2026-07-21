import { eq } from "drizzle-orm";
import { buildQuestionMappings } from "../../curriculum/v3/coverage.ts";
import { buildCurriculumV3 } from "../../curriculum/v3/graph.ts";
import { db } from "./index.ts";
import { questionConceptMappings, questions } from "./schema.ts";

export const CURRICULUM_MAPPING_VERSION = 1;

type DesiredMapping = typeof questionConceptMappings.$inferInsert;

function mappingKey(
  row: Pick<
    DesiredMapping,
    | "questionUid"
    | "questionContentVersion"
    | "conceptId"
    | "mappingVersion"
  >,
): string {
  return [
    row.questionUid,
    row.questionContentVersion,
    row.conceptId,
    row.mappingVersion,
  ].join("\u0000");
}

/**
 * Materialize reviewed pilot mappings beside the installed question rows.
 *
 * The source-controlled graph remains authoritative. This sync only appends a
 * missing version; it refuses to overwrite or reinterpret an existing mapping
 * version, so historical attempts keep the exact taxonomy that scored them.
 */
export async function syncCurriculumV3Mappings(): Promise<{
  mappedQuestions: number;
  desiredRows: number;
  insertedRows: number;
}> {
  const curriculum = buildCurriculumV3();
  const conceptById = new Map(
    curriculum.concepts.map((concept) => [concept.id, concept]),
  );
  const curated = buildQuestionMappings(curriculum).filter(
    (mapping) =>
      mapping.status === "mapped" &&
      mapping.mappingConfidence === "curated_rule" &&
      mapping.primaryConceptId != null,
  );
  const installedQuestions = await db
    .select({
      id: questions.id,
      uid: questions.uid,
      contentVersion: questions.contentVersion,
    })
    .from(questions)
    .where(eq(questions.source, "seed"))
    .all();
  const installedByUid = new Map(
    installedQuestions
      .filter((question) => question.uid != null)
      .map((question) => [question.uid!, question]),
  );

  const desired: DesiredMapping[] = [];
  for (const mapping of curated) {
    const question = installedByUid.get(mapping.questionUid);
    if (!question) {
      throw new Error(
        `Cannot sync concept mapping: question ${mapping.questionUid} is not installed.`,
      );
    }
    if (question.contentVersion !== mapping.questionContentVersion) {
      throw new Error(
        `Cannot sync concept mapping: ${mapping.questionUid} is installed at v${question.contentVersion}, not v${mapping.questionContentVersion}.`,
      );
    }
    const roles = [
      { conceptId: mapping.primaryConceptId!, role: "primary" as const },
      ...mapping.secondaryConceptIds.map((conceptId) => ({
        conceptId,
        role: "secondary" as const,
      })),
    ];
    for (const role of roles) {
      const concept = conceptById.get(role.conceptId);
      const archetypeId = concept?.archetypeIds[0];
      const surfaceFormId = concept?.surfaceFormIds[0];
      if (!concept || !archetypeId || !surfaceFormId) {
        throw new Error(
          `Cannot sync ${mapping.questionUid}: concept ${role.conceptId} lacks an archetype or surface form.`,
        );
      }
      desired.push({
        questionId: question.id,
        questionUid: mapping.questionUid,
        questionContentVersion: mapping.questionContentVersion,
        conceptId: role.conceptId,
        role: role.role,
        archetypeId,
        surfaceFormId,
        mappingVersion: CURRICULUM_MAPPING_VERSION,
        editorialState: "reviewed",
      });
    }
  }

  const existing = await db.select().from(questionConceptMappings).all();
  const existingByKey = new Map(existing.map((row) => [mappingKey(row), row]));
  const existingPrimary = new Map(
    existing
      .filter(
        (row) =>
          row.role === "primary" &&
          row.mappingVersion === CURRICULUM_MAPPING_VERSION,
      )
      .map((row) => [
        `${row.questionUid}\u0000${row.questionContentVersion}`,
        row,
      ]),
  );
  const missing: DesiredMapping[] = [];
  for (const row of desired) {
    const primary = existingPrimary.get(
      `${row.questionUid}\u0000${row.questionContentVersion}`,
    );
    if (
      row.role === "primary" &&
      primary != null &&
      primary.conceptId !== row.conceptId
    ) {
      throw new Error(
        `Mapping v${CURRICULUM_MAPPING_VERSION} already assigns ${row.questionUid} to ${primary.conceptId}; increment the mapping version instead of rewriting history.`,
      );
    }
    const prior = existingByKey.get(mappingKey(row));
    if (!prior) {
      missing.push(row);
      continue;
    }
    if (
      prior.questionId !== row.questionId ||
      prior.role !== row.role ||
      prior.archetypeId !== row.archetypeId ||
      prior.surfaceFormId !== row.surfaceFormId ||
      prior.editorialState !== row.editorialState
    ) {
      throw new Error(
        `Mapping v${CURRICULUM_MAPPING_VERSION} for ${row.questionUid} and ${row.conceptId} differs from its stored history.`,
      );
    }
  }
  if (missing.length > 0) {
    await db.insert(questionConceptMappings).values(missing).run();
  }
  return {
    mappedQuestions: curated.length,
    desiredRows: desired.length,
    insertedRows: missing.length,
  };
}
