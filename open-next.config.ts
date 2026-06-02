import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * OpenNext for Cloudflare configuration.
 *
 * R2 holds the ISR/SSG render cache. Bucket binding `NEXT_INC_CACHE_R2_BUCKET`
 * is declared in wrangler.jsonc — create it once with:
 *
 *   npx wrangler r2 bucket create your-tool-slug-cache
 *
 * The defaults for fetch cache, queue, and tag cache are fine until your
 * tool hits real volume. Override here when you need to.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
