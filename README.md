# `tool-template-edge`

GitHub template repository for OpenKey AI tools running on **Cloudflare Workers** (the edge tier).

Click **"Use this template"** at the top of the GitHub page to spawn a new tool repo from this one. The auto-scaffolder ([hub Phase 13](https://github.com/Scott-Builds-AI/hub/blob/main/BUILD_PLAN.md)) does the same thing automatically for tool ideas that pass the vote threshold.

## When to use the edge tier

Pick edge when your tool is mostly:
- HTTP routing
- LLM provider calls (via `@openkeyai/sdk`'s `keys.get`)
- Lightweight transforms
- Stateless or near-stateless

If you need long execution (> 30s CPU), large memory, ffmpeg, headless browsers, or ML libraries — use [`tool-template-container`](https://github.com/Scott-Builds-AI/tool-template-container) instead.

## What's in the box

| File | Purpose |
|---|---|
| `app/layout.tsx` | Mounts `@openkeyai/ui` CSS + `<HubHeader />`. **Required** — the `okai-scan` linter blocks PRs that remove either. |
| `app/page.tsx` | Stand-in home page. Shows the verified JWT claims + a "Fetch & use OpenAI key" demo button. **Replace with your tool's actual UI.** |
| `app/start/route.ts` | Receives the JWT from the hub's redirect, verifies it, stores it in an HTTP-only cookie. |
| `app/api/demo-fetch/route.ts` | Demo handler showing the `SecureKey` round-trip. Delete it once you have your real handlers. |
| `lib/session.ts` | `getSession()` / `getSessionToken()` helpers — wrappers around `@openkeyai/sdk`'s `session.verify`. |
| `tool.json` | Manifest. Schema is enforced by `@openkeyai/tool-manifest`. |
| `wrangler.jsonc` | Cloudflare deploy config. Placeholders marked `your-tool-slug`. |
| `.github/workflows/ci.yml` | Calls the shared CI workflow + runs `okai-scan`. |

## First-time setup (after cloning)

```bash
# 1. Install
pnpm install

# 2. Find-replace the placeholders. The auto-scaffolder does this for you;
#    if you cloned by hand, do it now:
#
#      your-tool-slug    → your slug (lowercase kebab-case, e.g. yt-thumbnails)
#      your-tool.example.com → your custom domain
#      Your Tool Name    → the display name shown in HubHeader + catalog
#      Your Name         → owner.name in tool.json
#      your-github-handle → owner.github in tool.json
#
#    A quick sed pass (replace YOUR_SLUG / YOUR_NAME / YOUR_DOMAIN / YOUR_HANDLE):
#    sed -i '' \
#      -e 's/your-tool-slug/YOUR_SLUG/g' \
#      -e 's/Your Tool Name/YOUR_NAME/g' \
#      -e 's/your-tool.example.com/YOUR_DOMAIN/g' \
#      -e 's/your-github-handle/YOUR_HANDLE/g' \
#      package.json wrangler.jsonc tool.json app/layout.tsx

# 3. Run the scan to confirm the template still passes the contract
pnpm scan
# expect: "okai-scan: clean (N source files scanned)"

# 4. Local dev
pnpm dev
# Visit http://localhost:3000/start?token=<paste-a-test-jwt> to seed the cookie.
# A JWT can be minted from the hub browser console — see "Smoke testing" below.

# 5. One-time Cloudflare setup
#  - Create the R2 ISR cache bucket:
#      npx wrangler r2 bucket create YOUR_SLUG-cache
#  - Push runtime vars:
#      npx wrangler secret put HUB_URL   # https://openkeyai.com (or staging)
#  - Make sure CLOUDFLARE_API_TOKEN + CLOUDFLARE_ACCOUNT_ID secrets are
#    available to this repo (set them once at the org level — see the
#    Scott-Builds-AI/.github README for the gh secret set commands).

# 6. Deploy
#  - Auto: every push to `main` triggers .github/workflows/deploy.yml,
#    which uses the shared tool-deploy.yml workflow (Phase 11) to run
#    okai-scan → opennextjs-cloudflare build → wrangler deploy.
#  - Manual / staging: `pnpm cf:deploy` from your laptop.
```

## Smoke testing locally

1. In your browser, sign in to https://staging.openkeyai.com (or production)
2. DevTools console — mint a token for your tool:
   ```js
   const t = await (await fetch('/api/tools/YOUR_SLUG/token', { method: 'POST' })).json();
   console.log(t.token);
   ```
3. Open `http://localhost:3000/start?token=<paste>` — you'll be redirected to `/` and your claims will render.
4. Click **Fetch & use OpenAI key** to exercise the `SecureKey` round-trip.

Add a `demo` (or your real slug) row to `public.tools` + `public.tool_subscriptions` on the hub Supabase before step 2 — see [hub Phase 5 docs](https://github.com/Scott-Builds-AI/hub/blob/main/docs/phases/05-tools-keyfetch.md) for the SQL.

## Required SDK API surface (today)

This template uses only:

- `session.verify(jwt, { hubUrl, expectedAudience })` — verifies the JWT
- `keys.get(jwt, provider, { hubUrl })` → `SecureKey` — fetches a credential
- The typed error classes (`SubscriptionInactiveError` etc.) for friendly UX

Everything else in `@openkeyai/sdk` is either deferred (`user`, `billing`, `webhooks`) or internal. Don't import from `@openkeyai/sdk/_internal/*` — the `okai-scan` linter blocks PRs that do.

## What you must not change

Per the [hub TOOL_CONTRACT](https://github.com/Scott-Builds-AI/hub/blob/main/docs/TOOL_CONTRACT.md):

- Don't remove the `<HubHeader />` mount from `app/layout.tsx` — the scanner catches that
- Don't strip the `@openkeyai/ui/css` import — the header won't render
- Don't import from `@openkeyai/sdk/_internal/*` — same scanner check
- Don't log the plaintext value of a `SecureKey` (template never does this — keep it that way)

Everything else is yours to shape.

## License

MIT — see [LICENSE](./LICENSE). Tools cloned from this template own their own copyright and choose their own license.
