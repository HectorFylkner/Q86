# Claude models — Fable 5, Mythos 5, Opus 4.x, Sonnet, Haiku

Source basis: Anthropic's "Prompting Claude Fable 5" and "Prompting best practices" (platform.claude.com, current as of June 2026). Central shift with Fable 5: **it is a delegation target, not an autocomplete.** Give it a goal, context, boundaries, and a way to verify — not a script. Prompts over-specified for older models actively degrade it; Anthropic cut Claude Code's own system prompt ~80% for this model family.

## Contents
1. Model lineup & effort
2. Core Claude techniques
3. Behavior modules (agents & long-running work)
4. Claude Code & CLAUDE.md
5. Safeguards & refusal handling
6. Migration checklist
7. Capability notes

---

## 1. Model lineup & effort

| Model | Use for |
|---|---|
| Fable 5 (`claude-fable-5`) | Hardest, longest, most ambiguous work; hours-to-days agent runs; $10/$50 per M tokens |
| Mythos 5 | Same base model, cyber safeguards removed; approved orgs only |
| Opus 4.8 | Strong general flagship; the refusal-fallback target for Fable 5 |
| Sonnet 4.6 / Haiku 4.5 | Cost/latency tiers; Haiku for high-volume glue |

`effort` (low/medium/high/xhigh) is the primary intelligence–latency–cost dial on Fable 5; thinking is always on and adaptive, `budget_tokens` is a 400 error. Default `high`; `xhigh` for capability-critical work; `medium`/`low` for routine or interactive — low effort on Fable 5 still frequently beats max settings on pre-Fable models. If output is right but slow, lower effort before adding brevity rules. Single high-effort turns can run minutes and autonomous runs hours: fix client timeouts and prefer async check-ins before deploying.

## 2. Core Claude techniques

- **Clarity golden rule:** model the reader as a brilliant new hire with zero context on your norms. Explicit beats implied; if you want above-and-beyond output, ask for it ("go beyond the basics; include as many relevant features as possible").
- **Motivation:** attach the because — "this goes to a client tomorrow", "output feeds a parser" — and the model generalizes intent.
- **XML tags** for anything mixing instructions, context, examples, input: `<instructions>`, `<context>`, `<input>`, `<constraints>`, `<output_format>`; nested `<documents>` → `<document index>` → `<source>` + content.
- **Examples:** 3–5 in `<example>` tags inside `<examples>`; relevant, diverse enough that no accidental pattern is learnable, edge cases included. The single most reliable lever for format and tone.
- **Long context:** 20k+ token inputs at the top, query at the bottom (up to ~30% quality gain on multi-document tasks). For long-document work, instruct: first extract relevant quotes into a tagged block, then answer grounded in them.
- **Positive framing + style mirroring:** say what to do, not what to avoid; the prompt's own formatting leaks into output — a bullet-heavy prompt begets bullet-heavy answers.
- **Format blocks when needed:**
  - Prose lock: "Write long-form content as flowing paragraphs. Reserve markdown for code and simple headings; fold enumerations into sentences; never emit runs of one-line bullets."
  - Plain-math lock: "Plain text only — no LaTeX. Use /, *, ^ for division, multiplication, exponents."
- **No prefills:** prefilled assistant turns return a 400 on Claude ≥4.6 and Fable/Mythos. Replace with format instructions, tags, or examples.
- **Tool-use steering:** models follow literally — "suggest changes" yields suggestions, "make the changes" yields edits. Bias-to-action block: "Default to implementing rather than proposing; under ambiguity infer the most useful action and use tools to resolve unknowns." Advisory block: "Don't modify anything unless clearly instructed; default to research and recommendations." De-escalate legacy "CRITICAL: you MUST use X" to "Use X when…" — the old phrasing now overtriggers.
- **Parallel tool calls** are near-default; to guarantee, instruct that independent calls be issued simultaneously while dependent calls stay sequential and parameters are never guessed.
- **Reasoning:** prefer general instructions ("weigh the tradeoffs carefully before choosing") over hand-written step plans. Anti-thrash: "Pick an approach and see it through; revisit only if new information directly contradicts your reasoning." Close with a concrete self-check: "Before finishing, verify against [tests/criteria]."

## 3. Behavior modules (agents & long-running work)

Include a module only when the task exhibits or risks the failure it addresses — stacking all of them recreates the over-prompting problem this model family was built to escape.

**Symptom → module index:** rambling output → 3a · overplanning → 3b · unwanted refactors → 3c · constant permission-asking → 3d · stops mid-run with "I'll now…" → 3e · unverified status claims → 3f · unrequested actions → 3g · multi-session work → 3h · independent subtasks → 3i · unreadable final summaries → 3j · verbatim mid-run delivery → 3k · proposes "new session" near limits → 3l · high-stakes output → 3m.

### 3a. Brevity & lead-with-outcome
```
Open with the outcome — the first sentence answers what happened or what you found. Detail follows. Be selective rather than compressed: cut what wouldn't change the reader's next action, but keep full sentences — no fragment stacks or invented shorthand. Readable beats short.
```

### 3b. Act-when-ready
```
Once you have enough to act, act. Don't re-establish facts already in the conversation, reopen settled decisions, or survey options you won't pursue. If a choice needs weighing, give one recommendation with reasoning. (Private thinking is exempt.)
```

### 3c. Scope discipline
```
Stay inside the task. No extra features, refactors, or abstractions beyond what was asked. Build the simplest thing that works; don't design for hypothetical futures. No defensive handling for impossible scenarios — trust internal code, validate only at real boundaries (user input, external APIs). If code can simply be changed, change it — no compatibility shims.
```

### 3d. Checkpoint policy
```
Interrupt the user only when the work truly requires them: an irreversible or destructive step, a real scope change, or information only they hold. Then ask and end the turn — never end a turn on a promise of future work.
```

### 3e. Autonomy reminder (unattended pipelines)
```
You are running unattended; "Should I…?" stalls the work — for reversible actions that follow from the original request, proceed. Before ending a turn, reread your final paragraph: if it's a plan, question, or "I'll…", that work isn't done — do it now with tool calls. End only when complete or blocked on input only the user can give.
```
(Interactively, a plain "continue" unblocks a stalled run.)

### 3f. Progress grounding
```
Audit every progress claim against an actual tool result from this session before reporting it. Report only what you can point to evidence for; label anything unverified as unverified. If tests fail, say so with the output; if you skipped a step, say that.
```
Anthropic reports this pattern nearly eliminated fabricated status reports in adversarial testing.

### 3g. Assessment-vs-action boundary
```
If the user is describing a problem, asking a question, or thinking out loud, the deliverable is your assessment — report findings and stop; don't fix until asked. Before any state-mutating command (restart, delete, config edit), confirm the evidence supports that exact action.
```

### 3h. Memory system
```
Keep a lessons directory: one lesson per file, one-line summary at top. Record corrections and confirmed-good approaches with why each mattered. Don't duplicate what the repo or history already holds; update rather than clone notes; delete notes proven wrong.
```
Bootstrap: one-off prompt asking the model to review prior sessions (with subagents), distill lessons into the directory, and note that future sessions consult it. For work spanning context windows: first window sets the framework (tests, setup script, state file); structured state in structured formats (`tests.json`), git as ledger; fresh window beats compaction — start each window by reading state files and git log and re-running a basic test; make explicit that editing or deleting tests to get green is unacceptable; never stop early over token-budget worry.

### 3i. Subagent delegation
```
Delegate independent subtasks to subagents and keep working while they run; step in if one drifts or lacks context. Work directly when a task is simple, strictly sequential, or needs context you'd have to hand off.
```
Prefer async orchestration and long-lived subagents (context reuse → cache savings; no bottleneck on the slowest worker).

### 3j. Final-summary readability
```
Shorthand between tool calls is fine — that's you working. The final message's reader saw none of it: open with the outcome, then the one or two things you need from them, each introduced as if new. Spell out terms, give every file/commit/flag its own plain-language clause, complete sentences. When short and clear conflict, choose clear.
```

### 3k. send_to_user tool
For long async agents whose UX needs verbatim mid-run delivery. Define client-side (single required string `message`), then elicit — without this line Fable 5 rarely calls it:
```
Between tool calls, when you have content the user must read exactly as written (a partial deliverable, a direct answer), send it via send_to_user. Never route narration or reasoning through it.
```
Skip for agents that only narrate routine progress.

### 3l. Context reassurance
Proposing "a new session" or trimming work is usually triggered by a visible remaining-token countdown — hide the countdown first. If the harness must show one: "You have ample context. Do not stop, summarize, or propose a new session because of context limits."

### 3m. Verification cadence
```
Establish a concrete check (tests, schema, acceptance criteria) and run it at every [interval/milestone], using a fresh subagent to verify against the specification rather than reviewing your own reasoning.
```

## 4. Claude Code & CLAUDE.md

- CLAUDE.md and skills: **principles and project facts, not procedures.** Fable 5 updates its approach on the fly; prescriptive step lists written for older models degrade it. Audit existing files for over-specification and delete before adding.
- Coding-agent guards worth including when relevant:
  - Anti-test-gaming: "Write a general, principled solution — no hard-coding to test inputs, no helper-script workarounds. Tests verify correctness; they don't define the solution. If a test is wrong or the task infeasible, say so."
  - Grounding: "Never speculate about code you haven't opened. If a file is referenced, read it before answering."
  - Cleanup: temporary iteration scripts are fine — require removal at task end if a clean tree matters.
- Risk gate for autonomous runs:
```
Weigh reversibility before acting. Local, reversible actions — proceed freely. Ask first for: destructive operations (deleting files/branches, dropping tables), hard-to-reverse git surgery (force-push, hard reset, amending published commits), and anything visible to others (pushing, PR comments, messages, shared infra). Never bypass safety checks or discard unfamiliar files that may be someone's in-progress work.
```
- Frontend output: counter the generic default (Inter-font, purple-gradient sameness) by explicitly demanding distinctive typography, one committed aesthetic with a dominant color plus accent, motion concentrated in a few high-impact moments, and choices designed for the specific context. Ask for animations/interactivity explicitly.

## 5. Safeguards & refusal handling

- Fable 5 runs safety classifiers on **offensive cybersecurity**, **biology/life-sciences methods**, and **extraction of summarized thinking**. Benign work can trip them; production systems should configure fallback to Opus 4.8 on `stop_reason: "refusal"` rather than retry loops.
- The self-inflicted one: any prompt/skill/harness text telling the model to echo, transcribe, or explain its internal reasoning in the response can trigger the `reasoning_extraction` category. Strip "show your thinking"-style instructions; read adaptive-thinking blocks for visibility, use send_to_user for progress.
- An occasional over-refusal on a benign task usually clears with a plain "go ahead and do it end-to-end."

## 6. Migration checklist (older Claude prompts → Fable 5)

1. Remove prefills → format instructions/examples.
2. Remove `budget_tokens` → adaptive thinking + `effort`.
3. Dial back MUST/CRITICAL escalation → plain conditions.
4. Delete micro-step scaffolding → goal + constraints + done-criteria.
5. Strip reasoning-echo requirements (see §5).
6. Remove remaining-token countdowns surfaced to the model.
7. Ask explicitly for richness where wanted — current models don't pad by default.
8. Re-test one difficulty tier *higher* and one effort level *lower* than instinct suggests.

## 7. Capability notes — stop compensating for

Long-horizon autonomy (multi-day runs with instruction retention — stop artificial chunking) · first-shot correctness on well-specified problems (invest in the spec, not iteration scaffolding) · dense-screenshot/technical-image vision · professional-grade documents, spreadsheets, slides · materially better code review and debugging recall · ambiguity handling (hand it the mess and ask for next steps). Test at the top of your difficulty range first — trialing Fable 5 only on easy workloads systematically underrates it.
