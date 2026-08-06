/**
 * Generates a placeholder frame sequence into public/sequence/ so the scroll
 * engine is testable before the real Whisk frames land.
 *
 * The light variant is drifting topographic contour linework on warm paper — an
 * architectural drawing that resolves as you scrub. It deliberately matches the
 * site's ink-on-paper language rather than fighting it.
 *
 *   node scripts/generate-placeholder-sequence.mjs [frameCount] [light|dark]
 */
import { mkdirSync, rmSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'sequence')

const FRAME_COUNT = Number(process.argv[2] ?? 89)
const VARIANT = process.argv[3] === 'dark' ? 'dark' : 'light'
const W = 1600
const H = 900
const DELAY = '0.067s'
const TAU = Math.PI * 2

const THEME = {
  light: {
    paper: '#f6f5f2',
    ink: '#111110',
    wash: ['#1a5fd0', '#683acd', '#15704a'],
    washOpacity: 0.05,
    lineOpacity: 0.16,
    ridgeOpacity: 0.3,
    dust: '#111110',
    dustOpacity: 0.16,
    edge: '#f6f5f2',
  },
  dark: {
    paper: '#06070a',
    ink: '#dce9ff',
    wash: ['#1c3a5e', '#3b2050', '#0d4f4a'],
    washOpacity: 0.42,
    lineOpacity: 0.12,
    ridgeOpacity: 0.34,
    dust: '#dce9ff',
    dustOpacity: 0.55,
    edge: '#06070a',
  },
}[VARIANT]

/** Deterministic PRNG so every frame shares the same field. */
function lcg(seed) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000)
}

const rand = lcg(20260805)

/** Motes of dust catching the light — parallax depth, sparse enough to be quiet. */
const DUST = Array.from({ length: 90 }, () => ({
  x: rand(),
  y: rand(),
  r: 0.5 + rand() * 1.6,
  depth: 0.25 + rand() * 1,
  phase: rand() * TAU,
}))

/**
 * One contour line of a slowly-evolving height field. Summed sines rather than
 * real noise: cheap, smooth, and loops coherently across the sequence.
 */
function contour(level, t) {
  const points = []
  const steps = 96
  for (let i = 0; i <= steps; i++) {
    const x = i / steps
    const y =
      level +
      Math.sin(x * TAU * 1.3 + t * TAU + level * 6) * 0.045 +
      Math.sin(x * TAU * 2.7 - t * TAU * 0.7 + level * 11) * 0.026 +
      Math.sin(x * TAU * 5.1 + t * TAU * 1.4) * 0.011
    points.push([(x * W).toFixed(1), (y * H).toFixed(1)])
  }
  return points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
}

function frameSvg(t) {
  const washes = THEME.wash
    .map((color, i) => {
      const cx = 0.3 + 0.22 * Math.sin(TAU * t * (0.6 + i * 0.3) + i * 2)
      const cy = 0.4 + 0.18 * Math.cos(TAU * t * (0.5 + i * 0.25) + i)
      return `<ellipse cx="${(cx * W).toFixed(1)}" cy="${(cy * H).toFixed(1)}" rx="${(
        W * 0.5
      ).toFixed(0)}" ry="${(H * 0.55).toFixed(0)}" fill="url(#w${i})"/>`
    })
    .join('')

  const washDefs = THEME.wash
    .map(
      (color, i) => `<radialGradient id="w${i}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color}" stop-opacity="${THEME.washOpacity}"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </radialGradient>`
    )
    .join('')

  // 22 contours; every fourth is a "ridge" drawn heavier, like an index contour.
  const lines = Array.from({ length: 22 }, (_, i) => {
    const level = 0.1 + (i / 21) * 0.8
    const ridge = i % 4 === 0
    const opacity = ridge ? THEME.ridgeOpacity : THEME.lineOpacity
    const width = ridge ? 1.6 : 0.9
    return `<path d="${contour(level, t)}" fill="none" stroke="${THEME.ink}" stroke-opacity="${opacity}" stroke-width="${width}"/>`
  }).join('')

  const dust = DUST.map((d) => {
    const x = (((d.x - t * 0.1 * d.depth) % 1) + 1) % 1
    const y = d.y + Math.sin(TAU * t + d.phase) * 0.005 * d.depth
    const twinkle = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(TAU * t * 2 + d.phase))
    return `<circle cx="${(x * W).toFixed(1)}" cy="${(y * H).toFixed(1)}" r="${(
      d.r * d.depth
    ).toFixed(2)}" fill="${THEME.dust}" opacity="${(twinkle * THEME.dustOpacity).toFixed(2)}"/>`
  }).join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    ${washDefs}
    <radialGradient id="edge" cx="50%" cy="50%" r="74%">
      <stop offset="52%" stop-color="${THEME.edge}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${THEME.edge}" stop-opacity="0.9"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${THEME.paper}"/>
  ${washes}
  ${lines}
  ${dust}
  <rect width="${W}" height="${H}" fill="url(#edge)"/>
</svg>`
}

if (existsSync(OUT_DIR)) {
  for (const f of readdirSync(OUT_DIR).filter((n) => n.endsWith('.webp'))) {
    rmSync(join(OUT_DIR, f))
  }
}
mkdirSync(OUT_DIR, { recursive: true })

const pad = String(FRAME_COUNT - 1).length

for (let i = 0; i < FRAME_COUNT; i++) {
  const name = `frame_${String(i).padStart(pad, '0')}_delay-${DELAY}.webp`
  await sharp(Buffer.from(frameSvg(i / FRAME_COUNT)))
    .webp({ quality: 66, effort: 5 })
    .toFile(join(OUT_DIR, name))
}

console.log(`  [placeholder]  wrote ${FRAME_COUNT} ${VARIANT} frames → public/sequence/`)
