# Diagnostic patterns

Failure patterns that waste tokens and cause re-prompts. Read when the user pastes an underperforming prompt, or as the sweep before delivering your own draft. Fix silently; flag only fixes that change the user's intent. Patterns marked ⚠ are the 2026 additions — legacy habits that now actively hurt on frontier models.

## Task & scope

| # | Pattern | Bad | Fix |
|---|---|---|---|
| 1 | Vague task verb | "help me with my code" | "Refactor `getUserData()` to async/await; handle null returns" |
| 2 | Two unrelated tasks in one prompt | "explain AND rewrite this" | Split; deliver as Prompt 1 and Prompt 2 |
| 3 | No success criteria | "make it better" | "Done when existing unit tests pass and null input doesn't throw" |
| 4 | Emotional fault description | "it's totally broken" | "Uncaught TypeError on line 43 when `user` is null" |
| 5 | No scope fence for code agents | "fix my app" | "Only the login validation in `src/auth.js`; touch nothing else" |
| 6 | No file anchor for IDE AI | "update the login function" | "`handleLogin()` in `src/pages/Login.tsx` only" |
| 7 | Entire codebase pasted as context | full repo every prompt | Scope to the relevant file/function; let agentic tools read the rest |
| 8 | ⚠ Over-scaffolding a frontier model | ten numbered micro-steps | Goal + constraints + done-criteria; steps only where path matters |
| 9 | ⚠ Underspecifying a small model | terse goal to a mini/nano/open-weight tier | Longer, explicit, flat structure, worked examples |

## Context & grounding

| # | Pattern | Bad | Fix |
|---|---|---|---|
| 10 | Assumed prior knowledge | "continue where we left off" | Memory block with all prior decisions, stack, failures |
| 11 | No audience | "write something for users" | "Non-technical B2B buyers, decision-maker level" |
| 12 | Hallucination invite | "what do experts say about X?" | Grounding rule: state only verifiable info; mark uncertainty explicitly |
| 13 | Prior failures omitted | (blank) | "Already tried X; failed because Y. Don't suggest X." |
| 14 | No motivation | bare instruction list | Add the because — audience, downstream use, stakes |
| 15 | Counterfactual context on Gemini | "assume crabs are fictional…" | Don't build on context that contradicts world facts; it reverts to training data |

## Format & structure

| # | Pattern | Bad | Fix |
|---|---|---|---|
| 16 | Missing output contract | "explain this concept" | Format + length pinned ("3 bullets, ≤20 words each, summary line on top") |
| 17 | Implicit length | "write a summary" | Exact sentence/word count |
| 18 | Vague aesthetic adjectives | "make it look professional" | Concrete specs: palette, type scale, spacing, no decorative elements |
| 19 | ⚠ Mixed delimiter systems | XML and Markdown headers interleaved | One system per prompt |
| 20 | ⚠ Constraints placed early (Gemini 3) | word counts / negatives at the top of a complex prompt | Core ask + format locks + negative constraints as the final lines |
| 21 | Ask-before-data in long context | question, then 200 pages | Data first, question last, anchored ("Based on the material above…") |
| 22 | ⚠ Prefilled assistant turn (Claude) | seeding the reply | 400 error on Claude ≥4.6/Fable — use format instructions, tags, examples |

## Reasoning & model handling

| # | Pattern | Bad | Fix |
|---|---|---|---|
| 23 | ⚠ CoT scaffolding on reasoning-native models | "think step by step" to Fable 5 / GPT-5.x / Gemini 3 / R1 / Qwen-thinking | Delete; set effort / reasoning_effort / thinking_level instead |
| 24 | No reasoning nudge on a small non-reasoning model | logic task, zero guidance | "Think through both approaches before recommending" is still fine here |
| 25 | ⚠ Reasoning-echo demand (Fable 5) | "show your thinking in the response" | Strip — triggers reasoning_extraction refusals; ask for conclusion + key reasons |
| 26 | ⚠ Verification without a target | "double-check your work" | Name the check: tests, schema, acceptance criteria, reference output |
| 27 | ⚠ MUST/NEVER/CRITICAL escalation | caps-lock on every rule | Plain conditions; reserve absolutes for the one or two true absolutes |
| 28 | ⚠ Lowered temperature on Gemini 3 | temp 0.2 "for determinism" | Default 1.0 — lowering causes looping/degraded reasoning |
| 29 | Expecting inter-session memory | "you already know my project" | Re-provide the memory block every session (unless a real memory system exists) |
| 30 | ⚠ Prompt stack carried across model generations | GPT-5.2 stack pasted onto 5.5; Opus prompt onto Fable | Fresh baseline; smallest prompt preserving the contract; re-tune settings |

## Agentic

| # | Pattern | Bad | Fix |
|---|---|---|---|
| 31 | No starting/target state | "add authentication" | Name current state and the exact artifacts that must exist when done |
| 32 | Over-permissive mandate | "do whatever it takes" | Boundaries: reversibility gate + scope fence + checkpoint policy |
| 33 | ⚠ Stop-condition laundry list on a frontier agent | five enumerated "pause when…" rules | One checkpoint principle: irreversible steps, scope changes, user-only info. (Keep enumerated lists for Devin-class agents.) |
| 34 | Silent agent | no progress output | User-updates spec: brief updates at phase changes, each with a concrete outcome |
| 35 | ⚠ Unverified status claims | "all tests passing" with no run | Progress grounding: every claim traces to a tool result; unverified is labeled |
| 36 | ⚠ Assessment/action blur | agent "fixes" while user was only asking | "When the user is describing or asking, deliver the assessment and stop" |
| 37 | ⚠ Token countdown surfaced to the model | remaining-budget ticker in harness | Hide it; if unavoidable, add context reassurance so it doesn't wrap up early |
| 38 | Unlocked filesystem / no review trigger on weak agents | Devin with free rein | Explicit forbidden-actions list, diff-before-delete, dir scoping |
