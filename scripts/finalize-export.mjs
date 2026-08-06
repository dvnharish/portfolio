/**
 * Post-export audit for the Hostinger static deploy. Runs as `postbuild`.
 *
 * This script is a GATE, not a build step. `.htaccess` lives in `public/`, which
 * Next copies into the export by itself (verified — it does carry dotfiles), so
 * a deploy assembled without ever running this script is still complete. That is
 * deliberate: nothing load-bearing should depend on a lifecycle hook that a
 * future toolchain change might skip.
 *
 * What it does:
 *  1. Verifies the export actually contains the files a deploy cannot work
 *     without, and fails loudly naming any that are missing.
 *  2. Fails if a localhost URL leaked into the HTML — that breaks in production
 *     while looking perfectly fine locally.
 *  3. Prints a size audit, so a regression like a 936 KB PNG social card is
 *     visible instead of silently shipped.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const HTACCESS_SRC = join(ROOT, 'public', '.htaccess')

if (!existsSync(OUT)) {
  // A bare "out/ is missing" is not actionable. The realistic causes are a
  // config that did not apply, a build that wrote somewhere else, or a platform
  // that cleaned between `build` and `postbuild` — so print enough to tell them
  // apart in one shot instead of over a round of guessing.
  const configPath = join(ROOT, 'next.config.mjs')
  let exportConfigured = 'next.config.mjs NOT FOUND'
  if (existsSync(configPath)) {
    const config = readFileSync(configPath, 'utf8')
    exportConfigured = /output\s*:\s*['"]export['"]/.test(config)
      ? "yes — output: 'export' is present"
      : "NO — output: 'export' is missing from next.config.mjs"
  }

  const siblings = existsSync(ROOT)
    ? readdirSync(ROOT).filter((entry) => {
        try {
          return statSync(join(ROOT, entry)).isDirectory()
        } catch {
          return false
        }
      })
    : []

  console.error(`
  [export]  FAILED: ${OUT} does not exist.

  Diagnostics
    expected out/ at   ${OUT}
    project root       ${ROOT}
    process cwd        ${process.cwd()}
    export configured  ${exportConfigured}
    .next present      ${existsSync(join(ROOT, '.next')) ? 'yes' : 'no'}
    dirs at root       ${siblings.join(', ') || '(none)'}
    out/ at cwd        ${existsSync(join(process.cwd(), 'out')) ? 'YES — build wrote it relative to cwd, not to the project root' : 'no'}

  Most likely causes
    1. .next present but no out/  -> the build ran WITHOUT output: 'export'.
    2. out/ exists at cwd         -> build and this script disagree on the root.
    3. Neither present            -> the build output was cleaned or discarded
                                     between 'build' and 'postbuild', which some
                                     hosted build pipelines do. Build locally and
                                     upload out/, or deploy via GitHub Actions.
`)
  process.exit(1)
}

// ── 1. Server rules ─────────────────────────────────────────────────────────
// Next copies public/.htaccess into the export on its own; this only confirms it
// arrived. Without it the site loses HTTPS redirect, cache headers, compression,
// AVIF/WebP MIME types, the security headers and the 404 wiring — all silently.
if (!existsSync(HTACCESS_SRC)) {
  console.error('\n  [export]  public/.htaccess is missing from the repository.\n')
  process.exit(1)
}
if (!existsSync(join(OUT, '.htaccess'))) {
  console.error(
    '\n  [export]  public/.htaccess exists but did not reach out/.\n' +
      '            Next normally copies it. Copy it manually before uploading.\n'
  )
  process.exit(1)
}
console.log('  [export]  .htaccess present in out/')

// ── 2. Audit ────────────────────────────────────────────────────────────────
function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) walk(full, files)
    else files.push(full)
  }
  return files
}

const files = walk(OUT)
const total = files.reduce((sum, f) => sum + statSync(f).size, 0)

function human(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const byExt = new Map()
for (const f of files) {
  const ext = extname(f) || '(none)'
  const entry = byExt.get(ext) ?? { n: 0, bytes: 0 }
  entry.n += 1
  entry.bytes += statSync(f).size
  byExt.set(ext, entry)
}

console.log(`\n  [export]  ${files.length} files · ${human(total)} total\n`)
for (const [ext, { n, bytes }] of [...byExt.entries()].sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`            ${ext.padEnd(14)} ${String(n).padStart(4)} files  ${human(bytes)}`)
}

const heaviest = files
  .map((f) => ({ f, size: statSync(f).size }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 5)

console.log('\n  [export]  heaviest files')
for (const { f, size } of heaviest) {
  console.log(`            ${human(size).padStart(9)}  ${relative(OUT, f).replace(/\\/g, '/')}`)
}

// A localhost reference in shipped HTML means an absolute URL was built from a
// dev-time origin — it fails in production but never locally.
const html = files.filter((f) => f.endsWith('.html'))
const leaks = []
for (const f of html) {
  const text = readFileSync(f, 'utf8')
  if (/https?:\/\/localhost|127\.0\.0\.1|:300\d/.test(text)) leaks.push(relative(OUT, f))
}

if (leaks.length > 0) {
  console.error(`\n  ✗ localhost URLs found in: ${leaks.join(', ')}`)
  console.error('    Set NEXT_PUBLIC_SITE_URL to the production origin and rebuild.\n')
  process.exitCode = 1
} else {
  console.log('\n  ✓ no localhost URLs in exported HTML')
}

// Verify the entry point exists and is not a stub.
const index = join(OUT, 'index.html')
if (!existsSync(index) || statSync(index).size < 2000) {
  console.error('  ✗ out/index.html missing or suspiciously small')
  process.exitCode = 1
} else {
  console.log(`  ✓ out/index.html (${human(statSync(index).size)})`)
}

for (const required of ['robots.txt', 'sitemap.xml', 'og.jpg', '404.html']) {
  console.log(
    existsSync(join(OUT, required)) ? `  ✓ out/${required}` : `  ✗ out/${required} MISSING`
  )
  if (!existsSync(join(OUT, required))) process.exitCode = 1
}

console.log('\n  Upload the CONTENTS of out/ into public_html (including .htaccess).\n')
