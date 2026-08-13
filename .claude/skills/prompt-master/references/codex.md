Verified: 2026-07-12; NOT re-verified 2026-08-12. Codex docs are now also served from learn.chatgpt.com; confirm URLs resolve before citing.

# Codex and Agent Skills route

Use for Codex prompts, local skill authoring, installation, discovery, and invocation behavior.

## Primary sources

- [Build skills in Codex](https://developers.openai.com/codex/build-skills)
- [Models in Codex](https://developers.openai.com/codex/models)
- [Agent Skills specification](https://agentskills.io/specification)
- [Anthropic Agent Skills overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)

## Verified facts

- Codex skills build on the open Agent Skills standard. The core format is a directory containing `SKILL.md` with `name` and `description`; Claude Code also discovers filesystem skill directories with `SKILL.md`. [Codex](https://developers.openai.com/codex/build-skills) · [specification](https://agentskills.io/specification) · [Claude Code](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
- Codex scans repository `.agents/skills` directories from the current working directory up to the repository root, then `$HOME/.agents/skills`, `/etc/codex/skills`, and bundled system skills. [Codex](https://developers.openai.com/codex/build-skills)
- Skills sharing a `name` are not merged; both may appear in selectors. [Codex](https://developers.openai.com/codex/build-skills)
- The initial skills list uses at most 2% of the model context window, or 8,000 characters when the window is unknown. Codex shortens descriptions first when crowded, so front-load trigger terms and scope. [Codex](https://developers.openai.com/codex/build-skills)
- Skills are available in the ChatGPT desktop app, Codex CLI, and the Codex IDE extension. Plugins distribute reusable skills and connectors to ChatGPT Work on the web and to Work and Codex in the desktop app. [Codex](https://developers.openai.com/codex/build-skills)
- In the interactive Codex CLI selector for `gpt-5.6-sol`, Ultra is selectable and uses subagents for automatic task delegation; Max instead gives the selected model more time to reason about one task. [Codex models](https://developers.openai.com/codex/models)
- Codex labels the lowest effort “Light” in the Codex app, ChatGPT Work, and IDE extension, but “Low” in the CLI. [Codex models](https://developers.openai.com/codex/models)
- Use `$skill-creator` to author a skill and `$skill-installer` to install curated or repository-hosted skills. [Codex](https://developers.openai.com/codex/build-skills)
- `agents/openai.yaml` can set UI metadata, invocation policy, and tool dependencies. `policy.allow_implicit_invocation` defaults to `true`; setting it to `false` leaves explicit invocation available. [Codex](https://developers.openai.com/codex/build-skills)

## Spec checks

- Match `name` to the parent directory; use 1–64 lowercase letters, digits, and single hyphens with no leading, trailing, or consecutive hyphens.
- Keep `description` non-empty and at most 1,024 characters; describe what the skill does and when to use it.
- Keep `SKILL.md` under 500 lines and approximately 5,000 tokens. Put depth in directly linked, one-level-deep reference files.
- Validate with `skills-ref validate <skill-directory>` when available; otherwise script the constraints above. [Specification](https://agentskills.io/specification)
