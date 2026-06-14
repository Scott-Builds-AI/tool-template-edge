/**
 * Phase 23 — per-tool R2 helpers.
 *
 * R2 buckets declared in your tool.json's `resources.r2` array are
 * auto-provisioned by the hub's scaffolder and bound as
 * `<UPPERCASE_NAME>_BUCKET` (with hyphens converted to underscores).
 *
 * Usage:
 *
 *   // tool.json: { "resources": { "r2": ["personas"] } }
 *   // Worker env: env.PERSONAS_BUCKET
 *
 *   import { getBucket } from "@/lib/storage";
 *   const bucket = getBucket(env, "personas");
 *   if (!bucket) throw new Error("personas bucket not bound — re-deploy");
 *   await bucket.put(key, body);
 */

/**
 * Returns the R2 bucket bound under the conventional binding name
 * `<UPPERCASE_NAME>_BUCKET`. Returns null when the binding isn't
 * present so tools can gracefully degrade during dev.
 */
export function getBucket(
  env: Record<string, unknown>,
  name: string,
): R2Bucket | null {
  const bindingName = `${name.toUpperCase().replace(/-/g, "_")}_BUCKET`;
  const bucket = env[bindingName];
  return (bucket as R2Bucket | null | undefined) ?? null;
}

/**
 * Build a per-user R2 key path. Convention: every blob lives under
 * `<bucket-prefix>/<user_id>/...` so even if a query forgets to scope
 * by user_id, the key path can't be guessed across users.
 *
 *   userKey("personas", claims.sub, persona.id, "jpg")
 *     → "personas/abc-123-user/persona-id.jpg"
 */
export function userKey(
  prefix: string,
  userId: string,
  ...segments: string[]
): string {
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, "");
  return [safe(prefix), safe(userId), ...segments.map(safe)]
    .filter(Boolean)
    .join("/");
}
