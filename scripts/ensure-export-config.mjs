/**
 * Guards `output: 'export'` against hosted build pipelines that substitute the
 * Next config with their own template.
 *
 * Hostinger's "Next.js" framework preset does exactly this: its Output directory
 * defaults to `.next`, i.e. it expects a SERVER build, and the config it builds
 * with does not contain `output: 'export'` even though the committed one does.
 * Confirmed from its own build log — the checkout contained this repository's
 * scripts (so it was current code) while reporting the export key absent.
 *
 * The result is a build that "succeeds" and produces no `out/` at all. This runs
 * first in `prebuild`, so if the config was replaced between checkout and build
 * it is restored before `next build` reads it.
 *
 * A no-op when the config is already correct, which is the normal case locally
 * and in GitHub Actions.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONFIG = join(ROOT, 'next.config.mjs')

/** Canonical config. Kept here so a replaced file can be fully reconstructed. */
const CANONICAL = `/** @type {import('next').NextConfig} */
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
`

const EXPORT_PATTERN = /output\s*:\s*['"]export['"]/

if (!existsSync(CONFIG)) {
  writeFileSync(CONFIG, CANONICAL, 'utf8')
  console.warn('  [config]  next.config.mjs was MISSING - wrote canonical static-export config')
} else {
  const current = readFileSync(CONFIG, 'utf8')
  if (EXPORT_PATTERN.test(current)) {
    console.log("  [config]  output: 'export' present")
  } else {
    writeFileSync(CONFIG, CANONICAL, 'utf8')
    console.warn(
      "\n  [config]  next.config.mjs did NOT contain output: 'export'.\n" +
        '            The build platform appears to have replaced it. Restored the\n' +
        '            canonical static-export config so out/ is actually produced.\n'
    )
  }
}
