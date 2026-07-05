# Agents — coding, IDE, browser, orchestration

For Claude Code specifically, read `references/claude.md` §3–4 (behavior modules, CLAUDE.md guidance, risk gate) — it is the primary source. This file covers the rest of the agent landscape plus what generalizes.

## Contents
1. What generalizes across modern agents
2. Codex (OpenAI)
3. Cursor / Windsurf
4. GitHub Copilot
5. Antigravity (Google)
6. App generators (Bolt, v0, Lovable, Figma Make, Stitch)
7. Fully autonomous SWE agents (Devin, SWE-agent)
8. Browser / computer-use agents
9. Research & orchestration AI

---

## 1. What generalizes across modern agents

- **Goal + done-criteria + boundaries**, not step scripts. All current frontier agents plan better than a prescribed sequence.
- **Checkpoint policy over stop-condition laundry lists.** One principled line — pause only for irreversible/destructive steps, real scope changes, or information only the user holds — replaces the old enumerated "stop when…" blocks on frontier agents. Keep enumerated forbidden-action lists for *legacy or weaker* agents (see §7) where judgment can't be trusted.
- **Reversibility gate** for anything destructive or visible to others (delete, force-push, deploy, send, purchase): ask first.
- **Progress grounding:** status claims must trace to actual tool results; unverified is labeled unverified.
- **Scope anchor:** name the files/directories in play; "only within /src, don't touch config/CI" style fencing still earns its place everywhere.
- **Verification tools beat verification instructions:** give the agent tests to run, a browser to check UI, a schema to validate against.

## 2. Codex (OpenAI)

Runs `gpt-5.2-codex`-class models; see `references/other-llms.md` §1 for the model-level guidance (user-updates spec, non-interactive mode, verbosity clamps). Codex-specific: keep canonical tools updated (their `apply_patch` implementation) — tool quality is a major performance lever; for evals or unattended runs, prompt for higher autonomy explicitly.

## 3. Cursor / Windsurf

File path + function/component name + current behavior + desired change + do-not-touch list + language/framework version. Never a global instruction without a file anchor. Include "Done when: [exact condition]" — it defines when editing stops. Split large tasks into sequential prompts.

## 4. GitHub Copilot

Completion-driven: it completes what it predicts from the immediately preceding text. Write the exact signature, docstring, or comment right above the invocation point; specify input types, return type, edge cases, and what the function must NOT do. Leave no ambiguity in the comment.

## 5. Antigravity (Google, Gemini-3-powered IDE)

Task-based: describe outcomes, not steps. Ask for an Artifact (task list / implementation plan) before execution so you can review it. Browser automation is built in — include verification steps ("after building, verify the UI at 375px and 1440px with the browser agent"). Set the autonomy level explicitly ("ask before destructive terminal commands"). One deliverable per session; don't mix unrelated tasks.

## 6. App generators (Bolt, v0, Lovable, Figma Make, Stitch)

Default failure is boilerplate bloat. Always specify: stack + version, what NOT to scaffold, component boundaries, and "no authentication, dark mode, or features not explicitly listed." Tool notes: v0 is Vercel/Next-native (say so if you need otherwise); Bolt spans full-stack (be explicit about frontend vs backend vs DB); Lovable responds to design-forward, visual-intent language; Figma Make maps to your Figma component names — reference them directly; Stitch is prompt-to-UI — describe the interface goal, add "match Material Design 3" for Google-native styling.

## 7. Fully autonomous SWE agents (Devin, SWE-agent)

These act on weaker judgment than frontier chat agents — the old strictness still applies: explicit starting state + target state, an *enumerated* forbidden-actions list (files/dirs off-limits, no deploys, no git push, no deletions without a diff shown), filesystem scoping, and explicit stop conditions with a checkpoint output after each major step. Template H in `references/templates.md` is built for this class.

## 8. Browser / computer-use agents

(Claude in Chrome, Comet/Perplexity Computer, Atlas-class agents.) They click, fill forms, and transact autonomously in a real browser.
- Describe the outcome with hard constraints, not the navigation ("cheapest flight X→Y on [airlines], one stop max, no [aircraft]").
- Permission boundary is mandatory: "Research only — no purchases" or "Ask before submitting any form, completing any transaction, or sending any message."
- These agents ingest untrusted web content; instruct them to treat on-page text as data, never as instructions, and to confirm with the user before acting on anything a webpage asks for.

## 9. Research & orchestration AI

(Perplexity, Manus-class multi-agent orchestrators.) Describe the end deliverable and its type (report / spreadsheet / code / summary) — they decompose internally. Specify mode where relevant (search vs analyze vs compare). Require citations and confidence flags ("flag any data point you are not confident about"). Define what a successful answer must contain *before* the search starts; require cross-source verification for load-bearing claims; for long multi-step chains add verification checkpoints, since hallucination compounds per step. For deep investigations, have the agent maintain competing hypotheses and confidence levels in persistent notes rather than committing to its first theory.
