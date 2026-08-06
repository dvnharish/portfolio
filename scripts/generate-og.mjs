/**
 * Builds public/og.jpg (1200x630) from the real hero portrait:
 * cover-crop → darkening scrim → name + title typeset via libvips/pango.
 *
 * Also emits app/apple-icon.png from the monogram in app/icon.svg so the
 * favicon set is complete without checking a binary blob into source.
 *
 * Runs in `prebuild`. Regenerate anytime with `npm run gen:og`.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SEQUENCE_DIR = join(ROOT, 'public', 'sequence')
const PORTRAIT_DIR = join(ROOT, 'assets', 'portrait')
/**
 * JPEG, not PNG. The card is a photograph — as PNG it was 936 KB, the single
 * heaviest file in the deploy, for no visible gain over a quality-84 JPEG.
 */
const OG_PATH = join(ROOT, 'public', 'og.jpg')
const ICON_SVG = join(ROOT, 'app', 'icon.svg')
const APPLE_ICON = join(ROOT, 'app', 'apple-icon.png')

const OG_W = 1200
const OG_H = 630

/** Frame to use as the OG backdrop — a third in, where the composition lands. */
const HERO_FRACTION = 0.33

const VALID_EXT = new Set(['.webp', '.avif', '.jpg', '.jpeg', '.png'])

function heroFrame() {
  if (!existsSync(SEQUENCE_DIR)) return null
  const frames = readdirSync(SEQUENCE_DIR)
    .filter((f) => VALID_EXT.has(extname(f).toLowerCase()))
    .sort((a, b) => {
      const na = Number(a.match(/\d+/)?.[0] ?? Number.NaN)
      const nb = Number(b.match(/\d+/)?.[0] ?? Number.NaN)
      if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b)
      return na - nb
    })
  if (frames.length === 0) return null
  return join(SEQUENCE_DIR, frames[Math.floor(frames.length * HERO_FRACTION)])
}

/** Fallback backdrop if the sequence folder is still empty. */
function fallbackBackdrop() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
      <defs><radialGradient id="g" cx="30%" cy="35%" r="80%">
        <stop offset="0%" stop-color="#1c3a5e"/><stop offset="100%" stop-color="#06070a"/>
      </radialGradient></defs>
      <rect width="${OG_W}" height="${OG_H}" fill="url(#g)"/>
    </svg>`
  )
}

/**
 * A real photograph of the person beats generated artwork on a social card, so
 * assets/portrait/hero.* wins when present. Falls back to a sequence frame.
 */
function heroPortrait() {
  if (!existsSync(PORTRAIT_DIR)) return null
  const match = readdirSync(PORTRAIT_DIR).find(
    (f) => f.replace(/\.[^.]+$/, '').toLowerCase() === 'hero' && VALID_EXT.has(extname(f).toLowerCase())
  )
  return match ? join(PORTRAIT_DIR, match) : null
}

const hero = heroPortrait() ?? heroFrame()

const base = await sharp(hero ?? fallbackBackdrop())
  // Bias the crop upward: on a portrait the face sits above centre.
  .resize(OG_W, OG_H, { fit: 'cover', position: 'top' })
  .toColorspace('srgb')
  .png()
  .toBuffer()

// Left-weighted scrim: guarantees AA contrast for the text block regardless of
// what the underlying frame happens to be doing.
const scrim = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_W}" height="${OG_H}">
    <defs>
      <linearGradient id="s" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#05060a" stop-opacity="0.94"/>
        <stop offset="55%" stop-color="#05060a" stop-opacity="0.72"/>
        <stop offset="100%" stop-color="#05060a" stop-opacity="0.34"/>
      </linearGradient>
    </defs>
    <rect width="${OG_W}" height="${OG_H}" fill="url(#s)"/>
    <rect x="80" y="${OG_H / 2 - 96}" width="3" height="192" fill="#7fd4ff" opacity="0.85"/>
  </svg>`
)

const FONT = 'Segoe UI, Inter, DejaVu Sans, Arial, sans-serif'

async function textLayer(markup, width) {
  return sharp({
    text: { text: markup, font: FONT, fontfile: undefined, width, rgba: true, dpi: 300 },
  })
    .png()
    .toBuffer()
}

const nameLayer = await textLayer(
  '<span foreground="#ffffff" weight="600" letter_spacing="-1200">Harish Duddupudi</span>',
  880
)
const titleLayer = await textLayer(
  '<span foreground="#a3b4c9" weight="400">Software Architect · Cloud-Native Platforms</span>',
  880
)
const metaLayer = await textLayer(
  '<span foreground="#6b7c91" weight="400">Ontario, Canada · AWS Certified Solutions Architect</span>',
  880
)

const nameMeta = await sharp(nameLayer).metadata()
const titleMeta = await sharp(titleLayer).metadata()

const nameH = nameMeta.height ?? 0
const titleH = titleMeta.height ?? 0
const blockTop = Math.round(OG_H / 2 - (nameH + titleH + 96) / 2)

await sharp(base)
  .composite([
    { input: scrim, top: 0, left: 0 },
    { input: nameLayer, top: blockTop, left: 128 },
    { input: titleLayer, top: blockTop + nameH + 28, left: 128 },
    { input: metaLayer, top: blockTop + nameH + titleH + 68, left: 128 },
  ])
  .jpeg({ quality: 84, progressive: true, mozjpeg: true })
  .toFile(OG_PATH)

console.log(
  `  [og]  public/og.jpg ${OG_W}x${OG_H} ← ${hero ? hero.split(/[\\/]/).slice(-2).join('/') : 'generated fallback'}`
)

// Apple touch icon from the monogram SVG.
if (existsSync(ICON_SVG)) {
  const svg = readFileSync(ICON_SVG)
  await sharp(svg, { density: 384 }).resize(180, 180).png().toFile(APPLE_ICON)
  console.log('  [og]  app/apple-icon.png 180x180 ← app/icon.svg')
}

// Minimal web manifest so Android installs get the right name/colours.
writeFileSync(
  join(ROOT, 'public', 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'Harish Duddupudi — Software Architect',
      short_name: 'Harish D.',
      start_url: '/',
      display: 'browser',
      background_color: '#0a0a0a',
      theme_color: '#0a0a0a',
      icons: [{ src: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    },
    null,
    2
  ) + '\n',
  'utf8'
)
