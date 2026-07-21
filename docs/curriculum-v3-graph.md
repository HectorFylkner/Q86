# Curriculum v3 graph contract

Checked against the local Q86 lesson corpus and 603-question bank on 2026-07-21.

## Identity and ownership

- Existing `Subtopic` values remain the official-report and analytics parents.
- Assessable concept IDs use `c.q86.quant.<subtopic>.<semantic-slug>`; strategy IDs use `c.q86.strategy.<chapter>.<semantic-slug>`.
- Source-idea IDs use `idea.q86.<chapter>.<semantic-slug>`. They are derived from semantic headings rather than list positions, so reordering a lesson does not change them.
- Question identity is the immutable first-class `uid` committed with each bank item. A content hash remains available only as a compatibility audit for pre-identity fixtures; it is not a competing source of truth.
- A repeated idea maps to one canonical owner through a `deliberate_merge` disposition; it does not create two mastery truths.

## Current vertical slice

The graph contains 43 curated pilot leaves:

- 14 exponent/root records (13 topic-owned leaves plus the cross-owned “preserve zero solutions” leaf);
- 13 algebraic-translation records;
- 16 probability records, including the bank-introduced exact-k, occupancy/collision, matching/fixed-point, inverse-composition, and finite stopping-time families.

Every pilot record declares its observable objective, prerequisites, official domain and applicable exam section, canonical owner, boundaries, edge cases, confusables, method, decision cues, unsafe conditions, misconception/archetype/surface references, difficulty intent, provenance, and version. The Data Sufficiency bridge is explicitly labeled `data_insights_ds_bridge`, not Quant.

All 279 current `## The core ideas` entries across 24 content chapters and two strategy chapters have a disposition. Non-pilot canonical records are intentionally `inventory_candidate` and unpublished; they are not represented as fully decomposed or production-ready.

## Evidence policy

A concept cannot be marked production-ready unless it has at least:

- three worked examples;
- six graded immediate retrieval checks;
- three named misconceptions;
- six replayably verified scored items;
- three difficulty bands; and
- two surface forms.

The source lesson checklist lines are recorded as stable self-report prompts and do not count as graded checks. Current `numeric_check` values establish at most that a stored expression agrees with the keyed choice; they do not replay the proof from stem to key. Consequently this snapshot truthfully reports zero production-ready concepts.

## Question disposition

All 603 bank questions receive a stable disposition. The 78 questions in the three pilots are leaf-mapped by reviewed semantic rules; the remaining 525 are explicitly `unresolved` rather than guessed into broad leaves. An explicit unresolved disposition is a coverage shortfall, not an orphan. A question absent from the disposition list, or a mapping to a missing concept/archetype/surface, is an integrity error.

## Commands

```bash
node --experimental-strip-types scripts/validate-curriculum-v3.ts
node --experimental-strip-types scripts/audit-curriculum-coverage.ts
node --experimental-strip-types scripts/audit-curriculum-coverage.ts --json
node --experimental-strip-types scripts/audit-curriculum-coverage.ts --summary-json
node --experimental-strip-types scripts/audit-curriculum-coverage.ts --write-snapshot
node --experimental-strip-types --test tests/curriculum-v3.test.ts
```

`curriculum/v3/coverage-ledger.json` is the compact machine-readable per-concept snapshot. `docs/curriculum-v3-coverage.md` is the corresponding human-readable report. The test suite fails when either snapshot drifts from the live 603-question audit.
