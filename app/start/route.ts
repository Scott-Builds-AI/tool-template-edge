import { NextResponse } from "next/server";
import { session as hubSession } from "@openkeyai/sdk";
import { SESSION_COOKIE, TOOL_SLUG, hubUrl } from "@/lib/session";

/**
 * `GET /start?token=<jwt>` — the hub's redirect target.
 *
 * Flow:
 *   1. Read `token` from the query string.
 *   2. Verify the token against the hub's JWKS. This catches signed-by-the-wrong-key,
 *      expired, wrong-audience, bad-claim-shape — anything an attacker might forge.
 *   3. Compute the cookie's Max-Age from the JWT's own `exp` so the cookie can't
 *      outlive the token.
 *   4. Set an HTTP-only `okai_token` cookie carrying the (already-signed) JWT.
 *   5. Redirect to `/` (or to a `next` query param if provided).
 *
 * Security notes:
 *   - The token in the query string is visible to access logs (Cloudflare,
 *     reverse proxies) for the duration of THIS request. We accept that for
 *     the simpler-to-build redirect handoff; if the tool author cares, they
 *     can change to a POST flow with the token in the body.
 *   - We never persist the raw token outside the cookie — no DB row, no
 *     local storage. If the cookie is wiped the user re-launches from the
 *     hub.
 *   - SameSite=Lax is required so the redirect FROM the hub TO this route
 *     carries no cookie (it's not needed) but cookies we set HERE are
 *     visible to subsequent same-site navigations.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const next = url.searchParams.get("next") ?? "/";

  if (!token) {
    // No token = direct hit. Send the user back to the hub to launch.
    return NextResponse.redirect(`${hubUrl()}/dashboard`, { status: 302 });
  }

  let claims;
  try {
    claims = await hubSession.verify(token, {
      hubUrl: hubUrl(),
      expectedAudience: TOOL_SLUG,
    });
  } catch {
    // Invalid token: bounce back to the hub. We don't reveal *why* the token
    // was bad — that's between the hub and the user.
    return NextResponse.redirect(`${hubUrl()}/dashboard?launch_error=1`, {
      status: 302,
    });
  }

  // Compute the cookie's lifetime from the JWT's own expiry. Subtracting a
  // small safety margin (5s) avoids edge cases where the cookie outlives the
  // token by a heartbeat.
  const ttl = Math.max(0, claims.exp - Math.floor(Date.now() / 1000) - 5);
  if (ttl === 0) {
    return NextResponse.redirect(`${hubUrl()}/dashboard?launch_error=expired`, {
      status: 302,
    });
  }

  // Only allow internal redirects. Reject `next=https://evil.example`.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const response = NextResponse.redirect(new URL(safeNext, request.url), {
    status: 302,
  });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ttl,
  });
  return response;
}
