import type { Rgb, ScenePalette } from './types'

/** Deterministic PRNG — scenes must look identical on every load. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0x100000000)
}

export const TAU = Math.PI * 2

export function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Normalised, clamped position of `value` within [from, to]. */
export function span(value: number, from: number, to: number): number {
  if (to <= from) return value >= to ? 1 : 0
  return clamp01((value - from) / (to - from))
}

export function smoothstep(t: number): number {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp01(t), 3)
}

/** Triangle wave 0→1→0 across [0,1]. Useful for one-shot pulses. */
export function pulse(t: number): number {
  return 1 - Math.abs(clamp01(t) * 2 - 1)
}

export function rgba(color: Rgb, alpha: number): string {
  return `rgba(${color[0]},${color[1]},${color[2]},${clamp01(alpha).toFixed(3)})`
}

/** A colour that needs a distinct value per theme. */
export interface ThemedRgb {
  light: Rgb
  dark: Rgb
}

/** Resolve a themed colour for the palette in play. */
export function pick(pair: ThemedRgb, p: ScenePalette): Rgb {
  return p.glowMode === 'tint' ? pair.light : pair.dark
}

/**
 * Soft radial field.
 *
 * On dark this is a luminous halo. On light an additive halo would just wash the
 * paper grey, so it becomes a flat, much weaker colour tint — enough to suggest
 * a field of influence without muddying the linework on top of it.
 */
export function glow(
  ctx: CanvasRenderingContext2D,
  p: ScenePalette,
  x: number,
  y: number,
  radius: number,
  color: Rgb,
  alpha: number
): void {
  if (alpha <= 0.002 || radius <= 0) return

  const tint = p.glowMode === 'tint'
  const peak = tint ? alpha * 0.4 : alpha

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
  gradient.addColorStop(0, rgba(color, peak))
  gradient.addColorStop(tint ? 0.6 : 0.45, rgba(color, peak * 0.24))
  gradient.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, TAU)
  ctx.fill()
}

/**
 * A discrete point in the system.
 *
 * Dark: bright core over a halo — it emits. Light: solid ink dot ringed in paper
 * so it stays crisp where lines cross beneath it — it is drawn, not lit.
 */
export function node(
  ctx: CanvasRenderingContext2D,
  p: ScenePalette,
  x: number,
  y: number,
  radius: number,
  color: Rgb,
  alpha = 1
): void {
  if (p.glowMode === 'tint') {
    // Paper ring first: separates the node from whatever passes underneath.
    ctx.fillStyle = rgba(p.paper, alpha * 0.95)
    ctx.beginPath()
    ctx.arc(x, y, radius * 2.1, 0, TAU)
    ctx.fill()

    glow(ctx, p, x, y, radius * 6, color, alpha * 0.5)

    ctx.fillStyle = rgba(color, alpha)
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, TAU)
    ctx.fill()
    return
  }

  glow(ctx, p, x, y, radius * 5, color, alpha * 0.5)
  ctx.fillStyle = rgba(p.ink, alpha)
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, TAU)
  ctx.fill()
}

/** Stroke a path with theme-corrected alpha. */
export function stroke(
  ctx: CanvasRenderingContext2D,
  p: ScenePalette,
  path: () => void,
  color: Rgb,
  width: number,
  alpha: number
): void {
  const corrected = clamp01(alpha * p.lineBoost)
  if (corrected <= 0.002) return
  ctx.strokeStyle = rgba(color, corrected)
  ctx.lineWidth = width
  ctx.beginPath()
  path()
  ctx.stroke()
}

export function segment(
  ctx: CanvasRenderingContext2D,
  p: ScenePalette,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: Rgb,
  width: number,
  alpha: number
): void {
  stroke(
    ctx,
    p,
    () => {
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
    },
    color,
    width,
    alpha
  )
}

/** Base wash shared by every scene, so chapters feel like one system. */
export function backdrop(
  ctx: CanvasRenderingContext2D,
  p: ScenePalette,
  width: number,
  height: number,
  intensity: number
): void {
  ctx.fillStyle = rgba(p.paper, 1)
  ctx.fillRect(0, 0, width, height)

  const strength = p.glowMode === 'tint' ? 0.05 : 0.16
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.45,
    0,
    width * 0.5,
    height * 0.45,
    Math.max(width, height) * 0.75
  )
  gradient.addColorStop(0, rgba(p.accent, strength * intensity))
  gradient.addColorStop(0.55, rgba(p.accent, strength * 0.3 * intensity))
  gradient.addColorStop(1, rgba(p.accent, 0))
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}

/**
 * Final grade, applied last.
 *
 * Dark gets a vignette that sinks the edges to black. Light gets the opposite
 * instinct: edges fade *toward* paper so the drawing dissolves into the page
 * rather than sitting in a darkened box.
 */
export function grade(
  ctx: CanvasRenderingContext2D,
  p: ScenePalette,
  width: number,
  height: number
): void {
  const gradient = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.2,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.72
  )

  if (p.glowMode === 'tint') {
    gradient.addColorStop(0, rgba(p.paper, 0))
    gradient.addColorStop(1, rgba(p.paper, 0.86))
  } else {
    gradient.addColorStop(0, rgba(p.paper, 0))
    gradient.addColorStop(1, rgba(p.paper, 0.82))
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
}
