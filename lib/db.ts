import { db as sdkDb, ScopedQueryError } from "@openkeyai/sdk";

/**
 * Phase 23 — per-tool D1 helpers.
 *
 * Every OpenKey AI tool gets its own D1 database (provisioned by the
 * hub's scaffolder on accept) bound as `env.DB`. Use the SDK's
 * `scoped*` helpers to query it — they refuse to operate on SQL
 * without a WHERE clause, so cross-user leaks are impossible.
 *
 * Usage:
 *
 *   import { getDb, scopedQuery } from "@/lib/db";
 *   import { getSession } from "@/lib/session";
 *
 *   const session = await getSession();
 *   if (!session) redirect(hubUrl());
 *
 *   const env = getCloudflareContext().env;
 *   const { results } = await scopedQuery<MyRow>(
 *     getDb(env), session,
 *     "SELECT * FROM my_table WHERE 1=1 ORDER BY created_at DESC LIMIT 20",
 *   );
 */

type EnvWithDb = { DB?: unknown };

/**
 * Returns the tool's D1 database from the Worker env. Throws clearly
 * when the binding is missing (helpful during local dev or when the
 * scaffolder's auto-provisioning failed and the binding wasn't wired).
 */
export function getDb(env: EnvWithDb): D1Database {
  if (!env.DB) {
    throw new Error(
      "D1 binding 'DB' missing on env. Check wrangler.jsonc and that the scaffolder provisioned a database for this tool.",
    );
  }
  return env.DB as D1Database;
}

// Re-export the SDK helpers so tool authors only import from one place.
export const { scopedQuery, scopedFirst, scopedInsert, scopedExec } = sdkDb;
export { ScopedQueryError };
