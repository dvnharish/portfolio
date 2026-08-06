import {
  TAU,
  backdrop,
  glow,
  grade,
  lerp,
  node,
  pulse,
  rgba,
  seeded,
  segment,
  smoothstep,
  span,
  stroke,
} from './draw'
import type { Rgb, Scene, SceneFrame } from './types'

const ACCENT: { light: Rgb; dark: Rgb } = {
  light: [21, 112, 74],
  dark: [122, 226, 168],
}

const FEEDER_COUNT = 4
const NODES_PER_FEEDER = 5

interface GridNode {
  x: number
  y: number
  feeder: number
  index: number
}

/**
 * Fluentgrid — electricity distribution utility tooling.
 *
 * A substation on the left energises feeders that branch out to distribution
 * nodes, with power pulses travelling the lines. Mid-scene an outage takes down
 * one branch (it darkens and drops offline); a SCADA sweep then crosses the
 * network, detects the fault, and restoration propagates back down the feeder —
 * the outage-management loop these tools existed to run.
 */
function render({ ctx, width, height, min, t, time, density, reduced, palette }: SceneFrame): void {
  const p = palette
  backdrop(ctx, p, width, height, 0.8)

  const subX = width * 0.12
  const subY = height * 0.5

  const outage = span(t, 0.34, 0.46)
  const detect = span(t, 0.5, 0.62)
  const restore = smoothstep(span(t, 0.66, 0.9))
  /** Which feeder loses power. Deterministic. */
  const FAULTED_FEEDER = 2

  const rand = seeded(3319)
  const nodes: GridNode[] = []

  for (let f = 0; f < FEEDER_COUNT; f++) {
    const spread = (f / (FEEDER_COUNT - 1) - 0.5) * 2
    for (let n = 0; n < NODES_PER_FEEDER; n++) {
      const progress = (n + 1) / NODES_PER_FEEDER
      nodes.push({
        x: subX + progress * (width - subX * 1.35),
        y: subY + spread * height * 0.34 * progress + (rand() - 0.5) * height * 0.05,
        feeder: f,
        index: n,
      })
    }
  }

  const faultAt = 2
  /** Downstream of the fault and not yet restored → dark. */
  const isDark = (n: GridNode): boolean =>
    n.feeder === FAULTED_FEEDER &&
    n.index >= faultAt &&
    outage > 0.5 &&
    restore < (n.index - faultAt + 1) / (NODES_PER_FEEDER - faultAt)

  // ── Feeder lines ──────────────────────────────────────────────────────────
  for (let f = 0; f < FEEDER_COUNT; f++) {
    const feeder = nodes.filter((n) => n.feeder === f)
    let prevX = subX
    let prevY = subY

    for (const target of feeder) {
      const dark = isDark(target)
      segment(
        ctx,
        p,
        prevX,
        prevY,
        target.x,
        target.y,
        p.accent,
        Math.max(1, min * 0.002),
        dark ? 0.04 : 0.16
      )
      prevX = target.x
      prevY = target.y
    }

    // Energy pulses travelling the feeder, stopped short by an active fault.
    if (!reduced) {
      const pulses = Math.max(1, Math.round(3 * density))
      for (let i = 0; i < pulses; i++) {
        const raw = (time * 0.22 + i / pulses + f * 0.17) % 1
        const stopAt = outage > 0.5 && restore < 0.05 ? (faultAt + 0.5) / NODES_PER_FEEDER : 1
        if (f === FAULTED_FEEDER && raw > stopAt) continue

        const seg = Math.min(NODES_PER_FEEDER - 1, Math.floor(raw * NODES_PER_FEEDER))
        const local = raw * NODES_PER_FEEDER - seg
        const from = seg === 0 ? { x: subX, y: subY } : feeder[seg - 1]
        const to = feeder[seg]
        if (!from || !to) continue

        const x = lerp(from.x, to.x, local)
        const y = lerp(from.y, to.y, local)
        glow(ctx, p, x, y, min * 0.035, p.highlight, 0.5)
        ctx.fillStyle = rgba(p.highlight, 0.95)
        ctx.beginPath()
        ctx.arc(x, y, min * 0.0035, 0, TAU)
        ctx.fill()
      }
    }
  }

  // ── Fault marker ──────────────────────────────────────────────────────────
  const faultNode = nodes.find((n) => n.feeder === FAULTED_FEEDER && n.index === faultAt)
  if (faultNode && outage > 0.5 && restore < 0.98) {
    const flash = reduced ? 0.6 : 0.35 + pulse((time * 0.7) % 1) * 0.45
    glow(ctx, p, faultNode.x, faultNode.y, min * 0.09, p.danger, flash * (1 - restore))
    stroke(
      ctx,
      p,
      () => ctx.arc(faultNode.x, faultNode.y, min * 0.03, 0, TAU),
      p.danger,
      Math.max(1, min * 0.0028),
      (0.5 + flash * 0.3) * (1 - restore)
    )
  }

  // ── SCADA sweep: the detection pass across the network ────────────────────
  if (detect > 0.01 && detect < 0.999) {
    const sweepX = lerp(subX, width, detect)
    const band = ctx.createLinearGradient(sweepX - min * 0.09, 0, sweepX + min * 0.02, 0)
    band.addColorStop(0, rgba(p.ink, 0))
    band.addColorStop(1, rgba(p.ink, p.glowMode === 'tint' ? 0.07 : 0.14))
    ctx.fillStyle = band
    ctx.fillRect(sweepX - min * 0.09, 0, min * 0.11, height)
    segment(ctx, p, sweepX, 0, sweepX, height, p.ink, Math.max(1, min * 0.0022), 0.3)
  }

  // ── Distribution nodes ────────────────────────────────────────────────────
  for (const gridNode of nodes) {
    const size = min * (gridNode.index === NODES_PER_FEEDER - 1 ? 0.0055 : 0.0045)
    if (isDark(gridNode)) {
      stroke(
        ctx,
        p,
        () => ctx.arc(gridNode.x, gridNode.y, size * 1.6, 0, TAU),
        p.danger,
        Math.max(1, min * 0.0016),
        0.35
      )
    } else {
      node(ctx, p, gridNode.x, gridNode.y, size, gridNode.index > 2 ? p.highlight : p.accent, 0.75)
    }
  }

  // ── Substation ────────────────────────────────────────────────────────────
  const busH = height * 0.2
  glow(ctx, p, subX, subY, min * 0.17, p.accent, 0.22)
  segment(ctx, p, subX, subY - busH / 2, subX, subY + busH / 2, p.ink, Math.max(1, min * 0.005), 0.5)
  for (const dir of [-1, 1]) {
    segment(
      ctx,
      p,
      subX - min * 0.022,
      subY + (dir * busH) / 2,
      subX + min * 0.022,
      subY + (dir * busH) / 2,
      p.ink,
      Math.max(1, min * 0.0035),
      0.4
    )
  }
  node(ctx, p, subX, subY, min * 0.009, p.highlight, 0.9)

  grade(ctx, p, width, height)
}

export const gridScene: Scene = {
  id: 'grid',
  render,
  accent: ACCENT,
  caption:
    'A substation energising distribution feeders, an outage taking a branch offline, and a ' +
    'SCADA sweep detecting the fault before restoration propagates back down the line.',
}
