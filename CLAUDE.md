# `tool-template-edge` · Claude Code instructions

This is a **GitHub template repository.** It gets cloned by tool authors (and by the Phase 13 auto-scaffolder) to start new tools on the Cloudflare Workers edge tier.

## What this means for your changes

Changes here propagate to **every future tool** scaffolded from this template. Existing tools don't automatically pick up changes — they'd need to merge manually. So:

- Treat changes here like API changes: backwards compatibility matters.
- Prefer additive changes (new files, optional config) over breaking ones.
- Update the `Status: skeleton` callout in README when full scaffold lands (Phase 10).

## Cross-repo rules

Read these in the hub repo before touching template structure:
1. [hub/docs/ARCHITECTURE.md](https://github.com/Scott-Builds-AI/hub/blob/main/docs/ARCHITECTURE.md) — what tools are and how they fit
2. [hub/docs/TOOL_CONTRACT.md](https://github.com/Scott-Builds-AI/hub/blob/main/docs/TOOL_CONTRACT.md) — what every tool MUST satisfy
3. [hub/docs/TOOL_SDK.md](https://github.com/Scott-Builds-AI/hub/blob/main/docs/TOOL_SDK.md) — the SDK surface tools call

## What goes here (Phase 10)

A working Cloudflare Worker that:
- Mounts `<HubHeader />` from `@openkeyai/ui` in `app/layout.tsx`
- Pre-wires `@openkeyai/sdk` for session verification and key fetch
- Has a placeholder `app/page.tsx` saying "Replace me with your tool"
- Includes a `tool.json` with `{{SLUG}}`, `{{NAME}}` placeholders the scaffolder fills in
- Has a `wrangler.toml` template
- Has CI calling `Scott-Builds-AI/.github/.github/workflows/tool-ci.yml@v1`

## What never to do

- Add code that fetches a provider URL directly (Anthropic, OpenAI, etc.) — use the SDK
- Bundle a sample API key in the template, even a fake one
- Make `<HubHeader />` mount conditional or removable
- Add dependencies that aren't strictly necessary — every byte ships to every tool
