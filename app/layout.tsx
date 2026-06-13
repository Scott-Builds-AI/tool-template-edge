import "./globals.css";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
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
 * **Mono v2 conventions (Phase 22):**
 *   - JetBrains Mono via next/font/google — wires the `--font-display`
 *     CSS variable that @openkeyai/ui v2 reads for its font stack
 *   - `data-theme="dark"` is unconditional (mono is single-theme;
 *     `[data-theme="light"]` is a no-op selector in v2)
 *   - The user's real display name is read from the JWT `name` claim
 *     (embedded by the hub at mint time as of @openkeyai/sdk 0.3.0) —
 *     friendly `User …<last8>` fallback for older tokens
 */
const jetBrainsMono = JetBrains_Mono({
  variable: "--font-display",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

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
  // Phase 22 — read the user's real display name from the optional
  // JWT `name` claim. Falls back to the friendly UUID-derived form
  // when older hub tokens (pre-Phase 22) are still in flight.
  const rawName = (session as { name?: unknown } | null)?.name;
  const displayName =
    typeof rawName === "string" && rawName.length > 0
      ? rawName
      : session != null
        ? `User …${session.sub.slice(-8)}`
        : null;
  const user =
    session != null
      ? {
          displayName: displayName!,
          avatarUrl: null,
          email: undefined,
        }
      : null;

  return (
    <html lang="en" className={jetBrainsMono.variable} data-theme="dark">
      <body>
        <HubHeader toolName={TOOL_NAME} user={user} hubUrl={hubUrl()} />
        {children}
      </body>
    </html>
  );
}
