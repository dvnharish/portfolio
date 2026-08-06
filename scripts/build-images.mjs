/**
 * Scans public/portrait/ and builds responsive derivatives + lib/portrait-manifest.json.
 *
 * This project deploys as a static export to Apache hosting, where Next's image
 * optimizer does not exist. Rather than shipping full-size originals with
 * `images.unoptimized`, every portrait is pre-encoded here into AVIF and WebP at
 * several widths plus a JPEG fallback, and `components/Photo.tsx` serves them
 * through a plain <picture> element. Same bytes-on-the-wire as an optimizer,
 * with no runtime.
 *
 * Recognised slots — name the file after the slot, any common extension:
 *   hero.*     cinematic wide portrait: full-bleed band + OG image
 *   about.*    portrait for the About section
 *   contact.*  portrait for the Contact section
 *
 * Drop originals into assets/portrait/ (NOT public/) — see DIR below.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, dirname, extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
/**
 * Sources live OUTSIDE public/ on purpose. Anything under public/ is copied
 * verbatim into the static export, so keeping originals there shipped a 414 KB
 * photo that nothing referenced — only the derivatives are ever requested.
 */
const DIR = join(ROOT, 'assets', 'portrait')
const DERIVED = join(ROOT, 'public', 'portrait')
const MANIFEST = join(ROOT, 'lib', 'portrait-manifest.json')

const SLOTS = ['hero', 'about', 'contact']
const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])

/** Candidate widths. Never upscaled past the source. */
const WIDTHS = [480, 768, 1024, 1440, 1920]

/** Width of the placeholder inlined as a data URI for CSS blur-up. */
const BLUR_WIDTH = 16

function human(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

const files = existsSync(DIR)
  ? readdirSync(DIR).filter((f) => VALID_EXT.has(extname(f).toLowerCase()))
  : []

// Rebuilt from scratch each run so removing a photo cannot leave orphans behind.
if (existsSync(DERIVED)) rmSync(DERIVED, { recursive: true })
mkdirSync(DERIVED, { recursive: true })

const portraits = {}
let derivedBytes = 0

for (const slot of SLOTS) {
  const match = files.find((f) => basename(f, extname(f)).toLowerCase() === slot)
  if (!match) continue

  const path = join(DIR, match)
  const meta = await sharp(path).metadata()
  if (!meta.width || !meta.height) {
    console.warn(`  [portrait]  ${match} has no readable dimensions — skipped`)
    continue
  }

  const widths = WIDTHS.filter((w) => w <= meta.width)
  // Always include the intrinsic width so the largest display is not softened.
  if (!widths.includes(meta.width)) widths.push(meta.width)

  const sources = []
  for (const w of widths) {
    const base = `${slot}-${w}`
    const avifName = `${base}.avif`
    const webpName = `${base}.webp`

    const resized = () => sharp(path).resize(w, null, { withoutEnlargement: true })
    const avif = await resized().avif({ quality: 52, effort: 4 }).toBuffer()
    const webp = await resized().webp({ quality: 74, effort: 5 }).toBuffer()

    writeFileSync(join(DERIVED, avifName), avif)
    writeFileSync(join(DERIVED, webpName), webp)
    derivedBytes += avif.length + webp.length

    sources.push({
      w,
      avif: `/portrait/${avifName}`,
      webp: `/portrait/${webpName}`,
    })
  }

  // Fallback for engines without AVIF or WebP. Mid-width is the right trade.
  const fallbackWidth = widths[Math.floor(widths.length / 2)] ?? widths[0]
  const fallbackName = `${slot}-fallback.jpg`
  const fallback = await sharp(path)
    .resize(fallbackWidth, null, { withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true, mozjpeg: true })
    .toBuffer()
  writeFileSync(join(DERIVED, fallbackName), fallback)
  derivedBytes += fallback.length

  const blur = await sharp(path)
    .resize(BLUR_WIDTH, Math.max(1, Math.round((BLUR_WIDTH * meta.height) / meta.width)))
    .webp({ quality: 40 })
    .toBuffer()

  portraits[slot] = {
    width: meta.width,
    height: meta.height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
    fallback: `/portrait/${fallbackName}`,
    sources,
  }

  console.log(
    `  [portrait]  ${slot.padEnd(8)} ${meta.width}×${meta.height} · ${human(
      readFileSync(path).length
    )} source → ${widths.length} widths (avif+webp)`
  )
}

const missing = SLOTS.filter((s) => !portraits[s])
if (missing.length > 0) {
  console.log(
    `  [portrait]  empty slots: ${missing.join(', ')} — drop <slot>.jpg into public/portrait/ to fill`
  )
}
if (derivedBytes > 0) console.log(`  [portrait]  derivatives total ${human(derivedBytes)}`)

const next = JSON.stringify({ portraits }, null, 2) + '\n'
const prev = existsSync(MANIFEST) ? readFileSync(MANIFEST, 'utf8') : ''
if (prev !== next) writeFileSync(MANIFEST, next, 'utf8')
