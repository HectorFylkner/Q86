Verified: 2026-08-12 - routing and register only. Fetch the vendor realtime guide before naming any parameter.

# Realtime and voice route

Use for speech-to-speech agents, live transcription, and phone or SIP agents. Do not reuse a text system prompt unchanged; the failure modes are different.

Primary source when the target is OpenAI: [Realtime prompting guide](https://developers.openai.com/api/docs/guides/realtime-models-prompting) and [Voice agents](https://developers.openai.com/api/docs/guides/voice-agents). For other vendors, fetch the vendor's realtime guide. Realtime model families and their configuration change faster than text models; treat every parameter name as `UNVERIFIED` until fetched.

## Register

- Write for the ear: short sentences, one idea per turn, no markdown, no lists read aloud, no URLs or long identifiers unless spelled deliberately.
- Specify pronunciation for names, currencies, dates, and alphanumerics that matter, including how to read back an account or order number.
- Define turn-taking: when to yield, how to handle interruption, what to do on silence, and what to say while a tool call is pending.
- Define the language policy: which language to open in, whether to follow the caller's language, and what to do with mixed-language input.
- Define escalation: the exact condition for handing off to a human and the sentence used to do it.

## Structure

State identity, one-sentence goal, tone in three adjectives, hard rules, tool-use decision rules, and a short sample exchange. Keep it shorter than an equivalent text prompt; latency is a product feature and every token in the prompt is paid on every turn.

## Move to the harness

Barge-in handling, voice activity detection thresholds, timeouts, DTMF handling, retry on transcription failure, and recording or consent requirements are configuration and code, not prose.
