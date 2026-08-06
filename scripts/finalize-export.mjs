/**
 * Post-export step for the Hostinger static deploy.
 *
 * 1. Copies deploy/.htaccess into out/. Next does not reliably carry dotfiles
 *    from public/ into the export, and without this file every caching,
 *    compression and security rule is missing on the server.
 * 2. Audits the bundle: total size, heaviest files, and a check that no
 *    localhost URL leaked into the HTML (which would break in production while
 *    looking fine locally).
 *
 * Runs automatically as `postbuild`.
 */
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'out')
const HTACCESS_SRC = join(ROOT, 'deploy', '.htaccess')

if (!existsSync(OUT)) {
  console.error('\n  [export]  out/ does not exist — did `next build` run with output: "export"?\n')
  process.exit(1)
}

// ── 1. .htaccess ────────────────────────────────────────────────────────────
if (!existsSync(HTACCESS_SRC)) {
  console.error('\n  [export]  deploy/.htaccess is missing — the upload would have no server rules\n')
  process.exit(1)
}
copyFileSync(HTACCESS_SRC, join(OUT, '.htaccess'))
console.log('  [export]  .htaccess -> out/.htaccess')

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
