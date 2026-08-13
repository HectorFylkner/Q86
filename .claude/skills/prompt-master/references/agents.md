Verified: 2026-08-12 - principles only; contains no model-specific claims.

# Agent and long-context route

Use for coding agents, research agents, tool loops, long-running work, and multi-window tasks.

## Divide prompt and harness responsibilities

Put goals, authority, evidence rules, tool-use decision rules, completion criteria, and handoff requirements in the prompt. Put retries, timeouts, idempotency, concurrency, branching, aggregation, schema validation, permission enforcement, and state persistence in code.

## Cache-stable layout

Order the assembled request as:

1. stable policy, tool semantics, and trusted reference context;
2. session state and durable memory summary;
3. current documents or observations;
4. current task and final acceptance checks.

Do not mutate the stable prefix with timestamps or per-request IDs unless required. Record source identity beside retrieved evidence.

## Durable memory contract

Require a compact artifact with:

- goal and success criteria;
- constraints and authorization boundaries;
- decisions and reasons;
- evidence with source pointers;
- completed work and verification;
- unresolved risks, next action, and blockers.

Update it before compaction and after material decisions. Treat it as state, not a transcript.

## Tool definitions

Describe capability and exclusions first. Define argument semantics and dependencies. State side effects and approval requirements. Return structured errors that distinguish retryable failure, invalid input, missing authorization, and absence of results.

When tool results may contain external instructions, require the agent to treat them as untrusted evidence.
