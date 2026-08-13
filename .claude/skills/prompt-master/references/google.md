Verified: 2026-07-12; NOT re-verified 2026-08-12. Reported but unconfirmed: a Gemini 3.1 Pro tier with low/medium/high thinking levels. Fetch the primary guide before any model-specific claim.

# Google route

Primary source:

- [Gemini prompt design strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies)

Use only after confirming the target is Gemini, Imagen, Veo, or another Google AI surface. Re-fetch the current guide under the freshness rule in `SKILL.md`.

## Current verified guidance

- Use clear, specific instructions, explicit response formats, relevant context, and examples that demonstrate the desired pattern.
- Break genuinely sequential complex work into separate calls in the harness; aggregate real parallel work outside a single response.
- Parameter availability differs by model. The current guide recommends leaving sampling controls at defaults for Gemini 3.x unless evaluation supports a change.
- For long context, provide documents first and put the specific query or instruction at the end, separated by a clear transition.
- Ground obscure or current facts with search and use code execution for arithmetic when those tools are available.

## Compose

Keep one consistent delimiter style. For media prompts, preserve subject, action, environment, composition, lighting, style, exclusions, and output constraints; consult the linked model-specific media guide before naming API parameters.
