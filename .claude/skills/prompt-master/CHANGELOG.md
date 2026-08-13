# Changelog

## 4.0.0 - 2026-08-12

Fixes
- `scripts/check_skill.py` crashed with an unhandled `FileNotFoundError`: it required `evals/evals.json`, which was never shipped. The suite now exists (12 cases) and every missing-path case fails cleanly with a message.
- The validator now also rejects orphaned reference files, empty `references/`, and malformed eval JSON, and warns when the verification stamp is over 30 days old.

Content
- `references/anthropic.md` rewritten and verified against live primary sources. Adds `effort` levels and `output_config` placement, per-model thinking defaults, the `budget_tokens` 400 error on Claude 4.7+, the prefill removal on 4.6+, Opus 5 verbosity/verification/subagent behavior, tool over- and undertriggering, context awareness, and Opus 5 cache minimums. Previously 12 lines with a self-declared stale stamp.
- `references/openai.md` updated with the July-August 2026 delta: Fast mode replacing Priority Processing, long-context Fast mode, Luna/Terra price cuts, the reusable-prompt-object deprecation and `v1/prompts` shutdown date, the Evals platform and Agent Builder moving to legacy, `phase`, `instructions` precedence, and Daybreak routing for security work.
- New `references/evals.md`. The triage table pointed at evals and nothing explained how to build one.
- New `references/voice.md`. The description advertised voice surfaces with no route behind it.
- Stamps on the remaining references restated honestly: principle-only files are marked as such; `google.md` and `codex.md` are explicitly marked NOT re-verified.

Structure
- Freshness window tightened from 90 to 30 days for vendor and model facts, plus an explicit instruction to confirm that cited doc URLs still resolve.
- Removed the hardcoded single-model paragraph from `SKILL.md` and replaced it with a vendor-neutral "Set the controls before adding words" section.
- New "Remove inherited scaffolding" section: current models regress on the anti-laziness and verification prompting written for their predecessors.
- Triage table gains rows for reasoning-parameter failures and for length/narration failures.
- Deliverable now includes one falsifiable check or the smallest isolating eval case.
- `description` updated to the current model lineup, `evals` and `voice` added as triggers, and the unsupported "3D" claim dropped. 1020/1024 characters.
