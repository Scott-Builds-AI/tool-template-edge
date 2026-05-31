# `tool-template-edge`

GitHub template repository for OpenKey AI tools running on **Cloudflare Workers** (the edge tier).

Click **"Use this template"** above, or use the OpenKey CLI (once it lands in Phase 10):

```bash
pnpm dlx @openkeyai/cli new-tool my-tool-slug --tier edge
```

## When to use the edge tier

Pick edge when your tool is mostly:
- HTTP routing
- LLM provider calls (via `@openkeyai/sdk`'s `keys.get`)
- Lightweight transforms
- Stateless or near-stateless

If you need long execution (> 30s CPU), large memory, ffmpeg, headless browsers, or ML libraries — use [`tool-template-container`](https://github.com/Scott-Builds-AI/tool-template-container) instead.

## Status

**Skeleton.** Full Next.js + `@openkeyai/sdk` + `@openkeyai/ui` scaffold ships in [Phase 10](https://github.com/Scott-Builds-AI/hub/blob/main/BUILD_PLAN.md#phase-10--repos-tool-templates). What you'll get then:

- Next.js 15 (App Router) on Cloudflare Workers via OpenNext
- `@openkeyai/sdk` pre-wired (session verify, key fetch)
- `@openkeyai/ui` with `<HubHeader />` mounted in `app/layout.tsx`
- `tool.json` manifest stub with placeholders
- `wrangler.toml` template
- Webhook handler stub at `app/api/webhooks/hub/route.ts`
- GitHub Actions calling `Scott-Builds-AI/.github/tool-ci.yml` and `tool-deploy.yml`
- One example test

## Reading first

Tool authors must read the contract before publishing:
[`hub/docs/TOOL_CONTRACT.md`](https://github.com/Scott-Builds-AI/hub/blob/main/docs/TOOL_CONTRACT.md)

## License

MIT — see [LICENSE](./LICENSE). Tools cloned from this template own their own copyright and choose their own license.
