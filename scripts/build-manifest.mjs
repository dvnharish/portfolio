/**
 * Scans public/sequence/ and writes lib/sequence-manifest.json.
 *
 * Runs automatically on `npm run dev` (predev) and `npm run build` (prebuild),
 * so whatever exact filenames ezgif produces are picked up without touching
 * any source file. Also reports the total byte weight of the sequence and
 * warns when it exceeds the performance budget.
 *
 * Flags:
 *   --report-only   print the weight report, do not write the manifest
 */
import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SEQUENCE_DIR = join(ROOT, 'public', 'sequence')
const MANIFEST_PATH = join(ROOT, 'lib', 'sequence-manifest.json')

/** Byte budget for the whole sequence. Beyond this, mobile TTI suffers. */
const BUDGET_BYTES = 4 * 1024 * 1024

const VALID_EXT = new Set(['.webp', '.avif', '.jpg', '.jpeg', '.png'])

const reportOnly = process.argv.includes('--report-only')

/**
 * ezgif emits `frame_00_delay-0.067s.webp`, `frame_01_...`, `frame_100_...`.
 * A plain lexicographic sort would put frame_100 before frame_20, so sort by
 * the first integer run in the name and fall back to locale compare.
 */
function frameOrder(a, b) {
  const na = Number(a.match(/\d+/)?.[0] ?? Number.NaN)
  const nb = Number(b.match(/\d+/)?.[0] ?? Number.NaN)
  if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b)
  if (na !== nb) return na - nb
  return a.localeCompare(b)
}

function human(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}

function collect() {
  if (!existsSync(SEQUENCE_DIR)) return { frames: [], sizes: [] }
  const frames = readdirSync(SEQUENCE_DIR)
    .filter((f) => VALID_EXT.has(extname(f).toLowerCase()))
    .sort(frameOrder)
  const sizes = frames.map((f) => statSync(join(SEQUENCE_DIR, f)).size)
  return { frames, sizes }
}

const { frames, sizes } = collect()
const totalBytes = sizes.reduce((sum, n) => sum + n, 0)

if (frames.length === 0) {
  console.warn(
    '\n  [sequence]  public/sequence/ is empty.\n' +
      '              Run `npm run gen:sequence` for a placeholder sequence,\n' +
      '              or drop your frame_*.webp files in and re-run.\n'
  )
} else {
  const avg = Math.round(totalBytes / frames.length)
  console.log(
    `\n  [sequence]  ${frames.length} frames · ${human(totalBytes)} total · ${human(avg)} avg`
  )

  if (totalBytes > BUDGET_BYTES) {
    const over = totalBytes / BUDGET_BYTES
    const targetFrames = Math.floor(frames.length / over)
    const targetPerFrame = Math.floor(BUDGET_BYTES / frames.length)
    console.warn(
      `\n  ⚠  OVER BUDGET by ${human(totalBytes - BUDGET_BYTES)} (${human(BUDGET_BYTES)} budget).\n` +
        `     Re-export from ezgif with EITHER of:\n` +
        `       a) same ${frames.length} frames, WebP quality tuned so each frame is\n` +
        `          under ${human(targetPerFrame)} (ezgif "video to webp" → Quality ~55-65),\n` +
        `       b) drop to ~${targetFrames} frames (ezgif → "Split WebP" → keep every\n` +
        `          ${Math.ceil(over)}${Math.ceil(over) === 2 ? 'nd' : 'rd'} frame), keeping current quality.\n` +
        `     Also set ezgif output width to 1600px max — 1920 buys nothing on canvas.\n`
    )
  } else {
    console.log(
      `              within the ${human(BUDGET_BYTES)} budget (${Math.round(
        (totalBytes / BUDGET_BYTES) * 100
      )}% used)\n`
    )
  }
}

if (reportOnly) process.exit(0)

/**
 * Content hash across the whole sequence, appended to every frame URL as `?v=`.
 *
 * Frame filenames are stable (`frame_00_...webp`) but their CONTENT changes
 * whenever the sequence is re-exported. Without this, the long-lived `immutable`
 * cache header in next.config.mjs would pin returning visitors to the old
 * artwork essentially forever. The hash makes the URL genuinely
 * content-addressed, so `immutable` is true rather than merely convenient.
 */
const hash = createHash('sha1')
for (const frame of frames) {
  hash.update(frame)
  hash.update(readFileSync(join(SEQUENCE_DIR, frame)))
}
const version = frames.length > 0 ? hash.digest('hex').slice(0, 10) : 'empty'

const manifest = { version, frames, totalBytes }
const next = JSON.stringify(manifest, null, 2) + '\n'
const prev = existsSync(MANIFEST_PATH) ? readFileSync(MANIFEST_PATH, 'utf8') : ''

// Avoid a needless write so the dev-server file watcher does not churn.
if (prev !== next) {
  writeFileSync(MANIFEST_PATH, next, 'utf8')
  console.log(`  [sequence]  manifest written → lib/sequence-manifest.json\n`)
}
