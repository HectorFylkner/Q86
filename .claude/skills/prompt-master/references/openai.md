Verified: 2026-08-12 against the linked live primary sources.

# OpenAI route

Use after confirming the target is an OpenAI API or ChatGPT model surface. Re-fetch under the freshness rule in `SKILL.md`.

## Primary sources

- [Using GPT-5.6 and prompting best practices](https://developers.openai.com/api/docs/guides/latest-model)
- [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [Reasoning models](https://developers.openai.com/api/docs/guides/reasoning) - [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices)
- [API changelog](https://developers.openai.com/api/docs/changelog) - [Deprecations](https://developers.openai.com/api/docs/deprecations)
- [Fast mode](https://developers.openai.com/api/docs/guides/fast-mode) - [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching)
- [Programmatic tool calling](https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) - [Tool search](https://developers.openai.com/api/docs/guides/tools-tool-search) - [Compaction](https://developers.openai.com/api/docs/guides/compaction)

The current model-specific prompting guidance lives at `guides/latest-model#prompting-best-practices`. Earlier per-model prompting URLs are no longer listed in the docs navigation; check the link resolves before citing it.

## Verified facts

- The GPT-5.6 family became generally available on 2026-07-09. Sol is the flagship tier, Terra balances capability and cost, Luna targets efficient high-volume work. API IDs are `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna`; `gpt-5.6` aliases Sol. The release added Programmatic Tool Calling, explicit prompt caching controls, persisted reasoning, `max` reasoning effort, Pro mode, and Responses API multi-agent in beta. [Changelog](https://developers.openai.com/api/docs/changelog)
- Sol has a 1,050,000-token context window and 128,000 maximum output tokens. Requests over 272,000 input tokens bill the whole request at 2x input and 1.5x output. Re-verify against the model page before quoting. [Sol model page](https://developers.openai.com/api/docs/models/gpt-5.6-sol)
- On 2026-07-30, Fast mode replaced Priority Processing. For Sol it delivers up to 2.5x standard speed at twice the price, and requests tagged `priority` automatically use Fast mode. On 2026-08-05, Fast mode gained long-context support so prompts above 272K tokens can run in it. [Changelog](https://developers.openai.com/api/docs/changelog)
- On 2026-07-30, GPT-5.6 Luna pricing fell by 80% and Terra by 20%. Re-check pricing before any cost claim. [Changelog](https://developers.openai.com/api/docs/changelog)
- `reasoning.effort` supports `none`, `low`, `medium` (default), `high`, `xhigh`, and `max`. Use `low` for latency-sensitive work, `high` or `xhigh` only for measured gains, and `max` only for hardest quality-first workloads. Before raising effort, check for missing success criteria, dependency rules, tool-routing rules, or verification loops.
- Reasoning mode is `standard` by default; set `reasoning.mode: "pro"` for hard Responses API tasks. Mode and effort are independent. Do not switch to a separate Pro model slug and do not instruct the model to "use pro mode" or generate candidate answers in prose.
- `text.verbosity` accepts `low`, `medium`, or `high` as a request-level default. Put task-specific length, structure, and required content in the prompt.
- GPT-5.6 is more concise by default than GPT-5.5. Re-evaluate inherited brevity instructions and state what a short response must preserve.
- Store production prompts in application code, not in vendor-hosted prompt objects. Reusable prompt objects are deprecated: creation was de-emphasized from 2026-06-03 and `v1/prompts` is scheduled to shut down on 2026-11-30. Use the [prompt object migration guide](https://developers.openai.com/api/docs/guides/prompting/migrate-from-prompt-object) for existing integrations. [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- The Evals platform and Agent Builder were announced for deprecation on 2026-06-03 and now sit under Legacy APIs. Do not design a new measurement workflow around them; see [references/evals.md](evals.md). [Changelog](https://developers.openai.com/api/docs/changelog)
- The `instructions` parameter takes priority over `input`, and `developer` messages outrank `user` messages. `instructions` applies only to the current request and is not carried by `previous_response_id`. [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- In OpenAI's sample internal coding-agent eval runs, leaner system prompts improved scores by roughly 10-15%, reduced tokens by 41-66%, and reduced cost by 33-67%. Treat as directional and workload-dependent.
- Review contradictions before adding detail: conflicting rules destabilize GPT-5-class prompt contracts more than missing detail. Reserve ALWAYS, NEVER, must, and only for true invariants; use decision rules for judgment calls.
- Use Programmatic Tool Calling only for a bounded reduction stage such as filter/join/sort/rank/dedupe/aggregate, batching similar records, repeated deterministic validation, or collapsing large structured results. Multiple, parallel, or dependent calls alone do not justify it. Name the stage, eligible tools, output schema, retry cap, stop condition, and handoff to direct calls. Test `program_output` and the final assistant message separately.
- Explicit cache writes cost 1.25x uncached input; cache reads retain the 90% cached-input discount. Keep reusable prefixes stable and add explicit breakpoints only when measured behavior justifies them. For organizations without ZDR, `prompt_cache_retention` defaults to `24h`.
- Persisted reasoning helps when objectives, assumptions, and priorities stay stable. Use current-turn behavior when prior reasoning is stale; persistence is not an always-on optimization.
- `phase` labels an assistant message as intermediate `commentary` or `final_answer`. Use it instead of prompting the model to mark its own preambles.
- Real-time cyber and biology classifiers can pause generation or refuse requests, including some legitimate dual-use work. Send a stable, privacy-preserving `safety_identifier` for each end user. Authorized security work now routes through the Daybreak program, with `daybreak-blue-latest` for general defensive work and separately approved `gpt-5.6-cyber` under Daybreak Red. [Changelog](https://developers.openai.com/api/docs/changelog)

## Compose and migrate

For complex prompts, start with short Role, Personality, Goal, Success criteria, Constraints, Tools, Output, and Stop rules sections; add detail only when it changes behavior.

For migration: switch the model, preserve the current reasoning effort as the baseline, run representative evals, remove obsolete or repeated scaffolding, add only the smallest instruction that fixes a measured regression, and re-evaluate after every change.
