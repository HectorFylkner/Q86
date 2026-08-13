Verified: 2026-08-12 against the linked live primary sources.

# Anthropic route

Use only after confirming the target is Claude or an Anthropic API surface. Re-fetch under the freshness rule in `SKILL.md`.

## Primary sources

- [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
- [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- [Thinking](https://platform.claude.com/docs/en/build-with-claude/thinking)
- Model-specific pages: [Fable 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-fable-5) - [Sonnet 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5) - [Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5) - [Opus 4.8](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-4-8)
- [What's new in Claude Opus 5](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5) - [Migration guide](https://platform.claude.com/docs/en/about-claude/models/migration-guide)
- [Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

Read the model-specific page before recommending anything model-specific. The general page covers Claude Fable 5, Mythos 5, Opus 5, Opus 4.8, Opus 4.7, Opus 4.6, Sonnet 5, Sonnet 4.6, and Haiku 4.5, and behavior differs materially between them.

## Reasoning controls

- `effort` is the primary intelligence/latency/cost control, set in `output_config`, for example `output_config={"effort": "high"}`. Documented levels are `low`, `medium`, `high`, `xhigh`, `max`; availability differs by model. The API default on current models is `high`.
- Anthropic's stated starting points: for Claude Opus 4.8, start at `xhigh` for coding and agentic work and `high` for other intelligence-sensitive work; for Claude Fable 5, start at the `high` default and use `xhigh` for the most capability-sensitive workloads. Step down only when evals hold quality, and use `max` only when evals show headroom at `xhigh`. Set a large `max_tokens` at `xhigh` or `max`. [Effort](https://platform.claude.com/docs/en/build-with-claude/effort)
- Adaptive thinking (`thinking: {"type": "adaptive"}`) is used by Claude 4.6 and later models and by Claude Mythos Preview. The model decides when and how much to think, calibrated by `effort` and query complexity.
- Thinking defaults differ by model. On Claude Opus 4.6 through 4.8 and Sonnet 4.6, thinking is off when the `thinking` parameter is omitted. On Claude Opus 5 and Sonnet 5 it is on. On Claude Fable 5 and Mythos 5 thinking is always on and adaptive is the only mode. On Opus 5, thinking can be disabled only at effort `high` or lower.
- `budget_tokens` is deprecated on Opus 4.6 and Sonnet 4.6 and returns a 400 error on Claude 4.7 and later. Migrate the budget to `effort` and use `max_tokens` as the hard ceiling.
- Prefilled responses on the final assistant turn are unsupported from Claude 4.6 models and Mythos Preview onward and return 400. Replace prefill with explicit format instructions, XML output tags, or tool-enforced structure.

Source for this section unless noted: [Prompting best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices), fetched 2026-08-12.

## Compose

- Be explicit about the desired output, format, and constraints, and state "above and beyond" behavior rather than expecting it to be inferred. Give the reason behind an instruction when the model needs to generalize it.
- Use 3-5 relevant, diverse examples wrapped in `<example>` tags inside `<examples>`. Separate instructions, context, and variable input with consistent, descriptive XML tags.
- Long context (20k+ tokens): put documents at the top and the query and final instruction at the end. The docs report up to roughly 30% quality improvement in tests on complex multidocument inputs. Wrap each document in `<document>` with `<document_content>` and `<source>` subtags, and ask for grounding quotes before the task when precision matters.
- State what to do instead of what to avoid. Match prompt style to the desired output style; markdown in the prompt increases markdown in the output.
- Set a role only to convey relevant domain focus.

## Behavioral tuning by symptom

| Symptom | Fix |
|---|---|
| Responses too long, especially Claude Opus 5 | Prompt for conciseness explicitly. `effort` changes thinking volume, not visible length. |
| Too much agentic narration | Describe the cadence you want (one line before the first tool call, updates on material change, outcome-first close) rather than forbidding narration. |
| Over-verification and wasted tokens on Opus 5 | Delete inherited "verify", "double-check", and "use a subagent to verify" instructions. Opus 5 self-verifies. |
| Excessive subagent spawning | State when subagents are warranted (parallelizable, isolated context, independent workstreams) and when to work directly. |
| Tool overtriggering | Dial back emphatic language: "Use this tool when..." instead of "CRITICAL: You MUST...". Remove "if in doubt, use the tool." |
| Tool undertriggering | Instruct action explicitly and add a `<default_to_action>` block. Use `<do_not_act_before_instructions>` for the opposite failure. |
| Sequential calls that could be parallel | Add an explicit parallel-tool-call block. Dependent calls stay sequential and must never use placeholder arguments. |
| Overengineering, extra files, speculative abstractions | Add a scope-limiting block covering scope, documentation, defensive coding, and abstractions. |
| Hardcoding to pass tests | Require a general solution and give permission to report that a task or test is wrong. |
| Claims about unread code | Require reading referenced files before answering. |
| Runaway exploration at high effort | Replace blanket defaults with conditional guidance, remove over-prompting, then lower `effort`. |

## Agentic and long-horizon work

- Context awareness, where the model tracks its remaining token budget, is available on Sonnet 5, Sonnet 4.6, Sonnet 4.5, and Haiku 4.5. In a compacting harness, tell the model that context will be compacted, that it must save state before a refresh, and that it must not stop early for budget reasons.
- Prefer durable external state: structured JSON for test and task status, freeform notes for progress, git for checkpoints. Starting a fresh context window from filesystem state is often better than compaction.
- The memory tool pairs with context awareness for context transitions.
- For destructive-action safety, enumerate the categories that require confirmation rather than relying on general caution.

## Caching and cost

- The minimum cacheable prompt length on Claude Opus 5 is 512 tokens, down from 1,024 on Opus 4.8. Per-model minimums are in the prompt caching docs. [What's new in Opus 5](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5)
- Fast mode is a research preview for Opus 5 on the Claude API only, not on Amazon Bedrock, Google Cloud, or Microsoft Foundry, priced at $10 per million input tokens and $50 per million output tokens. Confirm availability and price before quoting them. [What's new in Opus 5](https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5)

## Model identity in built products

When an application must state its own model, supply the string explicitly in the system prompt rather than relying on the model to know it, for example: "The current model is Claude Opus 5. The exact model string is `claude-opus-5`."
