import "server-only";
import { cookies } from "next/headers";
import { session, type ToolJwtClaims } from "@openkeyai/sdk";

/**
 * Hub session helpers.
 *
 * The flow:
 *
 *   1. User on hub clicks "Open <your tool>" → hub server-action mints a
 *      tool-JWT and redirects to `https://your-tool/start?token=<jwt>`
 *   2. The /start route handler in this template reads the token, verifies
 *      it against the hub's JWKS, stores it in an HTTP-only cookie, and
 *      redirects to `/`.
 *   3. Every server component / route handler that needs the user calls
 *      `getSession()` from this module. The returned claims are typed.
 *
 * Cookie shape:
 *
 *   Name:      okai_token
 *   Value:     the raw JWT (the JWT is itself signed by the hub — no extra
 *              integrity wrapping needed)
 *   HttpOnly:  true
 *   Secure:    true
 *   SameSite:  Lax (so the hub→tool redirect can land on `/start`)
 *   Path:      /
 *   Max-Age:   the JWT's `exp - iat` (typically 900s = 15 min). Once it
 *              expires the user is bounced back to the hub for a fresh one.
 */

/** Name of the cookie we stash the JWT in. */
export const SESSION_COOKIE = "okai_token";

/** Where the hub lives. Defaults to production. */
export function hubUrl(): string {
  return process.env.HUB_URL ?? "https://openkeyai.com";
}

/** This tool's slug — must match the `aud` claim of any valid token. */
export const TOOL_SLUG = process.env.TOOL_SLUG ?? "your-tool-slug";

/**
 * Read the JWT from the session cookie. Returns `null` when there's no
 * cookie at all — the caller usually wants to redirect to `${hubUrl()}/launch?tool=...`
 * (or equivalent) in that case.
 */
export async function getSessionToken(): Promise<string | null> {
  const jar = await cookies();
  const value = jar.get(SESSION_COOKIE)?.value;
  return value && value.length > 0 ? value : null;
}

/**
 * Read + verify the JWT, returning typed claims.
 *
 * Returns `null` if:
 *   - No cookie present (user hasn't completed the /start handoff)
 *   - JWT is malformed / expired / signed by an unknown key (`session.verify` throws)
 *
 * Anything else propagates — that's a hub outage, not a normal expiry.
 */
export async function getSession(): Promise<ToolJwtClaims | null> {
  const token = await getSessionToken();
  if (!token) return null;
  try {
    return await session.verify(token, {
      hubUrl: hubUrl(),
      expectedAudience: TOOL_SLUG,
    });
  } catch {
    // Treat any verification failure as "no session" — caller will bounce
    // to the hub for a fresh token. We don't want a stale cookie to wedge
    // the page.
    return null;
  }
}
