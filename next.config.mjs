/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Static HTML export - the deploy target is Apache/LiteSpeed shared hosting
   * with no Node runtime. "next build" writes a self-contained out/ directory.
   *
   * Consequences, all handled:
   *  - headers() is not supported here and would be silently ignored, so all
   *    caching, compression and security rules live in public/.htaccess, which
   *    Next copies into the export verbatim.
   *  - Next's image optimizer does not run. Portraits are pre-encoded to
   *    AVIF/WebP at several widths by scripts/build-images.mjs and served via a
   *    plain picture element (components/Photo.tsx). unoptimized below is a
   *    safety net for any stray next/image usage, not the strategy.
   *  - No middleware, route handlers, ISR or server actions. None are used.
   *
   * RESTORED AUTOMATICALLY: scripts/ensure-export-config.mjs rewrites this file
   * during prebuild if a hosted build platform has substituted it. See that
   * script for the evidence that Hostinger's Next.js preset does exactly that.
   */
  output: 'export',

  images: {
    unoptimized: true,
  },

  // Emit about.html rather than about/index.html - fewer directories to upload
  // and clean URLs on Apache without extra rewrite rules.
  trailingSlash: false,
}

export default nextConfig
