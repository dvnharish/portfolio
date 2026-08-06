/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Static HTML export — the deploy target is Hostinger shared hosting
   * (Apache/LiteSpeed), which has no Node runtime. `next build` writes a
   * self-contained `out/` directory that is uploaded to `public_html`.
   *
   * Consequences, all handled:
   *  - `headers()` is not supported here and would be silently ignored, so all
   *    caching, compression and security rules live in `public/.htaccess`, which
   *    Next copies into the export verbatim.
   *  - Next's image optimizer does not run. Rather than shipping originals via
   *    `images.unoptimized`, portraits are pre-encoded to AVIF/WebP at several
   *    widths by scripts/build-images.mjs and served through a plain <picture>
   *    (components/Photo.tsx). `unoptimized` below is therefore a safety net for
   *    any stray next/image usage, not the strategy.
   *  - No middleware, route handlers, ISR or server actions. This site uses none.
   */
  output: 'export',

  images: {
    unoptimized: true,
  },

  // Emit `about.html` rather than `about/index.html`. Fewer directories to
  // upload and cleaner URLs on Apache without extra rewrite rules.
  trailingSlash: false,
}

export default nextConfig
