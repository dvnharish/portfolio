/**
 * Pure timing model for the scroll-driven hero copy.
 *
 * Deliberately dependency-free — no React, no DOM, no relative imports — so
 * the timing contract from the design brief can be asserted in isolation by
 * scripts/verify-overlay-timing.mjs.
 */

function clamp(value: number, min = 0, max = 1): number {
  return value < min ? min : value > max ? max : value
}

/**
 * Normalised position of `value` inside [from, to], clamped to 0..1.
 * A zero-width range resolves to 1 once reached, which lets a block start
 * already-visible (from === to === 0).
 */
function progressIn(value: number, from: number, to: number): number {
  if (to <= from) return value >= to ? 1 : 0
  return clamp((value - from) / (to - from))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Gentle deceleration — the "weightless" feel. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Keyframe window for one overlay text block, in track progress (0..1).
 *
 * `fadeIn`/`fadeOut` are the opacity ramps; the drift runs across the whole
 * span from `fadeIn[0]` to `fadeOut[1]` so a block is always travelling while
 * visible — that continuous motion is what reads as weightless.
 */
export interface BlockTiming {
  fadeIn: readonly [number, number]
  fadeOut: readonly [number, number]
  /** Vertical travel in vh: entry offset → exit offset. */
  driftVh: readonly [number, number]
}

/** Sequential, zero-overlap windows. Order matches the rendered blocks. */
export const BLOCK_TIMINGS: readonly BlockTiming[] = [
  // Hero: already on screen at rest, gone by 10%.
  { fadeIn: [0, 0], fadeOut: [0.0, 0.1], driftVh: [0, -20] },
  // Statement one: in from 15%, fully pinned at 35%, gone by 45%.
  { fadeIn: [0.15, 0.24], fadeOut: [0.35, 0.45], driftVh: [15, -20] },
  // Statement two: in from 50%, pinned through 75%, gone by 85%.
  { fadeIn: [0.5, 0.59], fadeOut: [0.75, 0.85], driftVh: [15, -20] },
]

/** Below this opacity a block leaves hit-testing and the accessibility tree. */
export const VISIBILITY_EPSILON = 0.012

export interface BlockStyle {
  opacity: number
  translateVh: number
  scale: number
  visible: boolean
}

/** Resolve one block's visual state at a given track progress. */
export function blockStyleAt(timing: BlockTiming, progress: number): BlockStyle {
  const enter = progressIn(progress, timing.fadeIn[0], timing.fadeIn[1])
  const exit = progressIn(progress, timing.fadeOut[0], timing.fadeOut[1])
  const opacity = enter * (1 - exit)

  const span = easeOutCubic(progressIn(progress, timing.fadeIn[0], timing.fadeOut[1]))

  return {
    opacity,
    translateVh: lerp(timing.driftVh[0], timing.driftVh[1], span),
    // Recede a touch on the way out — parallax depth without a z-axis.
    scale: lerp(1.025, 0.985, span),
    visible: opacity > VISIBILITY_EPSILON,
  }
}
