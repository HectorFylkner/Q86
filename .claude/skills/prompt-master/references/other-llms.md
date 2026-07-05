# Other LLMs — GPT-5.x, Gemini 3, open-weight, local

Verified against OpenAI's GPT-5.5 guides and Google's Gemini 3 prompting guide (both current as of mid-2026). The universal doctrine in SKILL.md applies; below are the per-family deltas.

## Contents
1. GPT-5.x / ChatGPT (OpenAI)
2. Legacy OpenAI reasoning models (o-series)
3. Gemini 3.x (Google)
4. Qwen
5. Llama / Mistral / open-weight
6. DeepSeek-R1
7. Ollama / local deployment

---

## 1. GPT-5.x / ChatGPT (OpenAI)

Current flagship: **GPT-5.5** (April 2026); GPT-5.4 remains in production; `gpt-5.2-codex` powers Codex. OpenAI's own migration stance: treat each 5.x as a new family — fresh baseline, smallest prompt that preserves the product contract, then tune `reasoning_effort`, verbosity, tool descriptions, and output format against representative examples.

- **Outcome-first, explicitly:** describe expected outcome, success criteria, allowed side effects, evidence rules, and output shape; avoid step-by-step process guidance unless the exact path matters.
- **`reasoning_effort` by task shape, not intuition** — higher is not always better; many workflows run consistently at medium or low.
- **Verbosity contracts:** GPT-5.x is prompt-sensitive on length; pin it ("3–6 sentences default; ≤2 for simple yes/no + explanation"). There's also a dedicated verbosity parameter — set both when consistency matters.
- **User-updates spec** for agents (prevents both silence and narration):
```
Send brief updates (1–2 sentences) only when starting a new major phase or when a discovery changes the plan. Don't narrate routine tool calls. Every update includes at least one concrete outcome ("Found X", "Confirmed Y"). Don't expand the task beyond what was asked; flag new work as optional.
```
- **Long-task UX:** before the first tool call of a multi-step task, send a one-to-two-sentence user-visible acknowledgment stating the first step — makes slow reasoning feel alive.
- **Tool discipline:** describe each tool in 1–2 crisp sentences; make prerequisites and execution order explicit when side effects matter ("do not rely on 'you MUST' alone" is OpenAI's own phrasing); critical rules first in the prompt.
- **Persona/style:** highly steerable; define a clear agent persona for customer-facing work, and explicitly suppress filler acknowledgments ("got it", "thank you") if unwanted. By default it may keep conversations going with follow-up questions — suppress explicitly for non-interactive/eval runs ("non-interactive mode: make reasonable assumptions, don't ask").
- **API:** prefer the Responses API; `previous_response_id` for multi-turn state; prompt caching and compaction for long-running sessions.
- **Small tiers (`-mini`, `-nano`):** highly steerable but weak at inferring missing steps or resolving ambiguity — prompts get longer and more explicit, closer to the old style.

## 2. Legacy OpenAI reasoning models (o-series)

o3-class models still appear in some stacks. Short, clean instructions only; zero CoT scaffolding; state the goal and what done looks like; keep system prompts brief. Anything longer degrades them.

## 3. Gemini 3.x (Google)

Current: Gemini 3 Pro / Flash, with 3.1 variants rolling out. Direct, concise, structured — it may over-analyze verbose legacy prompt engineering.

- **Leave sampling parameters alone.** Keep temperature at the default 1.0 (and default top_p/top_k); lowering temperature causes looping and degraded reasoning on 3.x. This inverts the old "temp 0.1 for deterministic tasks" habit.
- **Constraint placement:** on complex requests it drops constraints that appear early — put the core ask, format locks, word counts, and especially negative constraints as the *final* lines of the instruction.
- **Long context:** data first, question last, bridged with an anchor ("Based on the entire document above…"). 2M-token window on Pro makes this the workhorse for book/codebase/video-scale inputs.
- **Terse by default:** wants to give direct, efficient answers; explicitly steer for a conversational persona if you need one.
- **Persona adherence is strong to a fault** — it will sometimes ignore instructions to stay in character. Keep personas unambiguous and don't let persona and task rules conflict.
- **Hallucination-prone queries:** two-step verify-then-answer pattern — "Verify with high confidence that [capability/source] is available. If you cannot verify, output 'No Info' and stop. If verified, proceed: [query]."
- **One delimiter system:** XML or Markdown, never mixed in a prompt.
- **Reasoning:** `thinking_level: "high"` plus a simplified prompt replaces old CoT scaffolds. Self-review close ("check the output against the original constraints; flag assumptions made on missing data") works well.
- **Dense documents:** test `media_resolution_high` for PDF-heavy parsing when migrating from 2.5.
- **Grounding conflict:** given context contradicting real-world facts, it may revert to training data — don't build prompts that depend on counterfactual context holding.

## 4. Qwen

- **Instruct variants (2.5/3 non-thinking):** excellent instruction following and JSON/structured output. Clear system-prompt role, explicit format specs (JSON schemas welcome), tightly scoped short prompts over long complex ones.
- **Thinking mode (Qwen3, `/think` or `enable_thinking=True`):** treat like a reasoning model — short clean instructions, no CoT, no scaffolding.

## 5. Llama / Mistral / open-weight

Weaker instruction following than frontier closed models: be more explicit, keep structure flat (no deep nesting), shorter prompts, always include a role in the system prompt, and lean on 2–5 worked examples for anything format-sensitive.

## 6. DeepSeek-R1

Reasoning-native: no CoT instructions, short clean goal + output format. Emits `<think>` blocks by default — append "Output only the final answer, no reasoning" if the consumer shouldn't see them.

## 7. Ollama / local deployment

Always ask which model is running before writing — behavior varies more across local models than across cloud tiers. The system prompt (Modelfile) is the highest-leverage element; include it in your delivered output. Simpler, shorter prompts; explicit sampling guidance is still appropriate here (unlike Gemini 3): low temperature (~0.1) for deterministic/coding tasks, ~0.7–0.8 for creative. For coding, prefer a code-specialized model over a general one.
