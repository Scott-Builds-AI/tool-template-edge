import { redirect } from "next/navigation";
import { getSession, hubUrl } from "@/lib/session";
import { DemoFetchButton } from "./demo-fetch-button";

/**
 * Tool home page.
 *
 * Out of the box this is a stand-in: it confirms the JWT round-trip works,
 * shows the user's claims, and exposes a "Fetch a key" button that calls
 * the hub's key-fetch endpoint via the SDK and proves the SecureKey path.
 *
 * Replace the body of this file with your tool's actual UI. Keep the
 * session check at the top — every page that needs the user should call
 * `getSession()` and bounce unauthenticated visitors to the hub.
 */
export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect(hubUrl());
  }

  return (
    <main className="tool-shell">
      <div className="tool-card">
        <h1 style={{ marginTop: 0, fontSize: 24 }}>It works.</h1>
        <p className="tool-muted">
          You&apos;re signed in via OpenKey AI. The JWT round-trip (hub →{" "}
          <code>/start</code> → cookie → server component → render) just
          succeeded.
        </p>

        <h2 style={{ marginTop: 32, fontSize: 16 }}>Your claims</h2>
        <pre className="tool-result">
          {JSON.stringify(
            {
              sub: session.sub,
              aud: session.aud,
              scopes: session.scopes,
              subscription_active: session.subscription_active,
              exp: new Date(session.exp * 1000).toISOString(),
            },
            null,
            2,
          )}
        </pre>

        <h2 style={{ marginTop: 32, fontSize: 16 }}>SecureKey demo</h2>
        <p className="tool-muted">
          Click below to fetch your OpenAI key via the hub and use it once
          inside a SecureKey callback. Nothing is shown — by design — but
          the network call proves the end-to-end path works.
        </p>
        <DemoFetchButton />

        <hr
          style={{
            margin: "40px 0 24px",
            border: 0,
            borderTop: "1px solid var(--okai-color-border)",
          }}
        />
        <p className="tool-muted">
          Replace this page with your tool. Keep <code>getSession()</code>{" "}
          at the top of any route that needs the user.
        </p>
      </div>
    </main>
  );
}
