import { NextResponse } from "next/server";
import {
  keys,
  KeyNotFoundError,
  ProviderNotGrantedError,
  RateLimitedError,
  SubscriptionInactiveError,
} from "@openkeyai/sdk";
import { getSessionToken, hubUrl } from "@/lib/session";

/**
 * `POST /api/demo-fetch` — server-side handler that proves the SecureKey
 * path actually works against a live hub.
 *
 * Production tool code should:
 *   1. Verify the session at the top of the request (the JWT cookie is sent
 *      automatically because `/api/*` is same-origin).
 *   2. Decide which provider it needs.
 *   3. Call `keys.get(jwt, provider)`.
 *   4. Use the SecureKey inside a `.use()` callback to make the upstream
 *      API call.
 *
 * This route is wired for OpenAI as the demo. Delete it once you have your
 * real handler — the template's `getSession()` helper covers the
 * verification step from `/app/page.tsx` and other handlers can do the
 * same.
 */
export const dynamic = "force-dynamic";

export async function POST() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json(
      { ok: false, message: "Not signed in. Re-launch from the hub." },
      { status: 401 },
    );
  }

  try {
    const k = await keys.get(token, "openai", { hubUrl: hubUrl() });

    // Use it once. Demo: we just measure the plaintext length so we can
    // prove the fetch returned without actually sending the key anywhere.
    const length = await k.use((apiKey) => apiKey.length);

    return NextResponse.json({
      ok: true,
      message: `fetched, used inside a SecureKey callback, plaintext length=${length}`,
    });
  } catch (err) {
    if (err instanceof SubscriptionInactiveError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Your subscription is not active. Visit /settings/billing on the hub.",
        },
        { status: 402 },
      );
    }
    if (err instanceof ProviderNotGrantedError) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "You haven't granted this tool access to OpenAI keys. Update your tool subscription on the hub.",
        },
        { status: 403 },
      );
    }
    if (err instanceof KeyNotFoundError) {
      return NextResponse.json(
        {
          ok: false,
          message: "Add an OpenAI key in your hub /settings/api-keys page.",
        },
        { status: 404 },
      );
    }
    if (err instanceof RateLimitedError) {
      return NextResponse.json(
        {
          ok: false,
          message: `Too many requests. Retry after ${err.retryAfter}s.`,
        },
        {
          status: 429,
          headers: { "retry-after": String(err.retryAfter) },
        },
      );
    }
    return NextResponse.json(
      {
        ok: false,
        message: err instanceof Error ? err.message : "Unknown error.",
      },
      { status: 500 },
    );
  }
}
