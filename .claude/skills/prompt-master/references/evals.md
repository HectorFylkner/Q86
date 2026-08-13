Verified: 2026-08-12 - method only; contains no model-specific claims.

# Eval route

Use when the question is whether a prompt change actually helped, when quality is inconsistent, or before a model migration. A prompt edit without a measurement is a guess with formatting.

## Minimum viable eval

1. **Collect real failures first.** Ten to thirty cases drawn from actual traffic beat a hundred invented ones. Include the failure that prompted the work.
2. **Write the assertion before the fix.** State the observable property that must hold: exact schema validity, a required field, a forbidden claim, a tool called or not called, a stopping condition met.
3. **Split graders by cost.** Deterministic checks in code (parse, regex on structure not prose, schema validation, tool-call assertions). Model grading only for judgment properties, with a rubric and a fixed grading model. Human review only for the last mile.
4. **Keep a control.** Run the current prompt and the candidate on the same cases, same parameters, same model snapshot. Pin the snapshot; a floating alias silently changes the experiment.
5. **Change one causal feature at a time** when the eval can isolate it. Bundled edits produce unattributable wins.
6. **Report the failure cases, not just the score.** A score that moves 4 points with three new failure modes is a regression.

## What to hold constant

Model snapshot, reasoning or effort setting, temperature and sampling, tool inventory, system prompt version, and input placement. Changing the model and the prompt in the same run answers nothing.

## Where evals belong

Keep cases, graders, and runs in the repository next to the prompt they test, versioned and runnable in CI. Vendor-hosted eval products come and go; OpenAI's Evals platform is now announced for deprecation. Portable cases survive the vendor.

## Sizing the effort

- One-off chat prompt: one falsifiable check the user can run by hand.
- Recurring internal workflow: 10-30 cases, deterministic graders, run before each prompt change.
- Production or agentic system: representative distribution, held-out set, per-case cost and latency, regression gate in CI, and drift monitoring after deployment.

## Common eval failures

- Cases sampled only from the happy path, so the eval cannot see the regression.
- Grading the prompt author wrote and the grader rubric written by the same person in the same sitting.
- Scoring style when the complaint was correctness.
- Reporting an average over cases with wildly different stakes.
- Treating a vendor's published benchmark delta as a prediction for your workload.
