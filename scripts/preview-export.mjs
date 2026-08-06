/**
 * Serves out/ as plain static files, the way Hostinger will.
 *
 * Dependency-free on purpose: `npx serve` needs a network fetch, and the point
 * of this script is to prove the export works with no toolchain behind it.
 * Mirrors the .htaccess behaviour that affects correctness — directory index,
 * extensionless -> .html, and a real 404 status.
 *
 *   npm run preview
 */
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'out')
const PORT = Number(process.env.PORT ?? 4300)

if (!existsSync(ROOT)) {
  console.error('\n  out/ does not exist — run `npm run build` first.\n')
  process.exit(1)
}

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.ico': 'image/x-icon',
}

function resolve(urlPath) {
  // Strip the query string — frame URLs carry ?v=<content hash>.
  const clean = decodeURIComponent(urlPath.split('?')[0] ?? '/')
  // Keep the resolved path inside ROOT.
  const safe = normalize(clean).replace(/^(\.\.[/\\])+/, '')
  let file = join(ROOT, safe)

  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  if (existsSync(file) && statSync(file).isFile()) return file

  const asHtml = `${join(ROOT, safe)}.html`
  return existsSync(asHtml) ? asHtml : null
}

createServer((req, res) => {
  const file = resolve(req.url ?? '/')

  if (!file) {
    const notFound = join(ROOT, '404.html')
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    if (existsSync(notFound)) createReadStream(notFound).pipe(res)
    else res.end('404')
    return
  }

  res.writeHead(200, {
    'Content-Type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': statSync(file).size,
  })
  createReadStream(file).pipe(res)
}).listen(PORT, () => {
  console.log(`\n  static preview: http://localhost:${PORT}\n  serving: ${ROOT}\n`)
})
