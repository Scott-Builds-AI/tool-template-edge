import "./globals.css";
import type { Metadata } from "next";
import { HubHeader } from "@openkeyai/ui";
import { getSession, hubUrl } from "@/lib/session";

/**
 * Root layout — mandatory per the tool contract.
 *
 * What MUST be here:
 *   1. `import "@openkeyai/ui/css"` (via `./globals.css`) — loads design tokens
 *   2. `<HubHeader />` mounted as the first child of `<body>` — the shared
 *      brand surface every tool has to render
 *
 * The Phase 9 `okai-scan` linter enforces both. Don't remove them.
 *
 * The user object passed to <HubHeader /> currently shows only the user_id
 * (sub) from the verified JWT — that's all we have client-side until the
 * hub ships a `/api/me` endpoint (tracked under SDK module `user.profile`).
 * For now we display a friendly "User …<last 8 of uuid>" so the chip isn't
 * empty.
 */

// PLACEHOLDER — replace with your actual tool name.
const TOOL_NAME = "Your Tool Name";

export const metadata: Metadata = {
  title: {
    default: TOOL_NAME,
    template: `%s · ${TOOL_NAME}`,
  },
  description: "Built on OpenKey AI.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user =
    session != null
      ? {
          displayName: `User …${session.sub.slice(-8)}`,
          avatarUrl: null,
          email: undefined,
        }
      : null;

  return (
    <html lang="en">
      <body>
        <HubHeader toolName={TOOL_NAME} user={user} hubUrl={hubUrl()} />
        {children}
      </body>
    </html>
  );
}
