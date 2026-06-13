import { redirect } from "next/navigation";
import { Badge, Button, Card, Stat } from "@openkeyai/ui";
import { getSession, hubUrl } from "@/lib/session";
import { DemoFetchButton } from "./demo-fetch-button";

/**
 * Tool home page.
 *
 * Out of the box this is a stand-in: it confirms the JWT round-trip
 * works, shows the user's claims, and exposes a "Fetch a key" button
 * that calls the hub's key-fetch endpoint via the SDK and proves the
 * SecureKey path.
 *
 * Replace the body of this file with your tool's actual UI. Keep the
 * session check at the top — every page that needs the user should
 * call `getSession()` and bounce unauthenticated visitors to the hub.
 *
 * **v1 of @openkeyai/ui** ships base components — <Button>, <Card>,
 * <Input>, <Select>, <Textarea>, <Badge>, <Stat>. Use them everywhere
 * to inherit the design system automatically. The page below
 * demonstrates the patterns.
 */
export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect(hubUrl());
  }

  const expiresAt = new Date(session.exp * 1000);
  const expiresInMin = Math.max(
    0,
    Math.round((expiresAt.getTime() - Date.now()) / 60000),
  );

  return (
    <main className="tool-shell">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Badge variant="success">Session live</Badge>
            {session.subscription_active ? (
              <Badge variant="brand">Subscribed</Badge>
            ) : (
              <Badge variant="warning">Trial</Badge>
            )}
          </div>
          <h1
            className="lower"
            style={{
              fontSize: 36,
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 700,
            }}
          >
            it works.
          </h1>
          <p className="tool-muted lower" style={{ margin: 0, fontSize: 13 }}>
            &gt; you&apos;re signed in via openkey ai. the jwt round-trip (hub →{" "}
            <code>/start</code> → cookie → server component → render) just
            succeeded.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          <Card level={2}>
            <Stat label="Scopes" value={String(session.scopes.length)} />
          </Card>
          <Card level={2}>
            <Stat
              label="Expires in"
              value={`${expiresInMin}m`}
              sub={expiresAt.toLocaleTimeString()}
            />
          </Card>
          <Card level={2}>
            <Stat
              label="User"
              value={`…${session.sub.slice(-8)}`}
              sub="from JWT sub claim"
            />
          </Card>
        </div>

        <Card level={1}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>Your claims</h2>
          <pre className="tool-result">
            {JSON.stringify(
              {
                sub: session.sub,
                aud: session.aud,
                scopes: session.scopes,
                subscription_active: session.subscription_active,
                exp: expiresAt.toISOString(),
              },
              null,
              2,
            )}
          </pre>
        </Card>

        <Card level={1}>
          <h2 style={{ marginTop: 0, fontSize: 16 }}>SecureKey demo</h2>
          <p className="tool-muted">
            Click below to fetch your OpenAI key via the hub and use it once
            inside a SecureKey callback. Nothing is shown — by design — but
            the network call proves the end-to-end path works.
          </p>
          <DemoFetchButton />
        </Card>

        <Card level={0}>
          <p className="tool-muted" style={{ margin: 0 }}>
            Replace this page with your tool. Keep <code>getSession()</code>{" "}
            at the top of any route that needs the user. The components
            above come from <code>@openkeyai/ui</code> — full list in
            CHANGELOG.md of that package.
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
            <Button variant="primary" size="md">
              Replace me
            </Button>
            <Button variant="text" size="md">
              Read the docs
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
