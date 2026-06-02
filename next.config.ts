import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Tools that don't need Next's built-in image optimisation can leave this on
  // — Workers will route image requests through Cloudflare Images if you've
  // configured the `IMAGES` binding in wrangler.jsonc. Set `unoptimized: true`
  // here if you'd rather opt out entirely.
  images: {
    unoptimized: false,
  },
};

// Hook Cloudflare bindings (KV, R2, Images, rate-limit, secrets) into
// `next dev` so local development uses the same env shape as the deployed
// Worker. No-op outside dev. See:
// https://opennext.js.org/cloudflare/howtos/bindings
initOpenNextCloudflareForDev();

export default nextConfig;
