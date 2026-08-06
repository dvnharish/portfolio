import {
  TAU,
  backdrop,
  glow,
  grade,
  lerp,
  node,
  pick,
  rgba,
  seeded,
  segment,
  smoothstep,
  span,
  stroke,
  type ThemedRgb,
} from './draw'
import type { Rgb, Scene, SceneFrame } from './types'

const ACCENT: { light: Rgb; dark: Rgb } = {
  light: [104, 58, 205],
  dark: [176, 138, 255],
}

/** Secondary: the research-data helix and the identity ring. */
const TEAL: ThemedRgb = {
  light: [13, 122, 110],
  dark: [104, 224, 208],
}

/** Services the monolith decomposes into. */
const SERVICE_COUNT = 12

/**
 * GSK — global life-sciences enterprise platform.
 *
 * The monolith at centre fractures into independently deployable services that
 * settle into orbit. Dependency chords between them thin out as the migration
 * proceeds (the 60% dependency reduction, made visual), while a helix of
 * research data threads the background — the life-sciences domain the platform
 * serves. The ring that closes around the cluster at the end is centralized
 * OAuth2 / Azure AD identity binding the services back together.
 */
function render({ ctx, width, height, min, t, time, density, reduced, palette }: SceneFrame): void {
  const p = palette
  const teal = pick(TEAL, p)
  backdrop(ctx, p, width, height, 0.9)

  const cx = width * 0.5
  const cy = height * 0.5
  const decompose = smoothstep(span(t, 0.08, 0.62))
  const identity = smoothstep(span(t, 0.66, 0.94))

  // ── Background helix: research data threading the platform ────────────────
  const helixTurns = 2.6
  const helixAmp = width * 0.13
  for (const strand of [0, Math.PI]) {
    stroke(
      ctx,
      p,
      () => {
        for (let i = 0; i <= 120; i++) {
          const q = i / 120
          const y = q * height
          const phase = q * helixTurns * TAU + strand + (reduced ? 0 : time * 0.35)
          const x = width * 0.5 + Math.sin(phase) * helixAmp
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
      },
      teal,
      Math.max(1, min * 0.0022),
      0.1
    )
  }
  // Base pairs.
  const rungs = Math.max(8, Math.round(22 * density))
  for (let i = 0; i < rungs; i++) {
    const q = i / rungs
    const y = q * height
    const phase = q * helixTurns * TAU + (reduced ? 0 : time * 0.35)
    const x1 = width * 0.5 + Math.sin(phase) * helixAmp
    const x2 = width * 0.5 + Math.sin(phase + Math.PI) * helixAmp
    segment(ctx, p, x1, y, x2, y, teal, Math.max(1, min * 0.0014), 0.055)
  }

  // ── The monolith: one block, shrinking as it decomposes ──────────────────
  const monoW = lerp(min * 0.3, min * 0.05, decompose)
  const monoH = lerp(min * 0.42, min * 0.05, decompose)
  const monoAlpha = 1 - decompose
  if (monoAlpha > 0.01) {
    ctx.fillStyle = rgba(p.accent, (p.glowMode === 'tint' ? 0.05 : 0.07) * monoAlpha)
    ctx.fillRect(cx - monoW / 2, cy - monoH / 2, monoW, monoH)
    stroke(
      ctx,
      p,
      () => ctx.rect(cx - monoW / 2, cy - monoH / 2, monoW, monoH),
      p.accent,
      Math.max(1, min * 0.0035),
      0.4 * monoAlpha
    )
    // Internal seams — the tangled modules about to be pulled apart.
    for (let i = 1; i < 4; i++) {
      const y = cy - monoH / 2 + (monoH * i) / 4
      segment(
        ctx,
        p,
        cx - monoW / 2,
        y,
        cx + monoW / 2,
        y,
        p.accent,
        Math.max(1, min * 0.0014),
        0.22 * monoAlpha
      )
    }
  }

  // ── Services, easing out of the monolith into orbit ───────────────────────
  const rand = seeded(4471)
  const orbitR = min * 0.34
  const services = Array.from({ length: SERVICE_COUNT }, (_, i) => {
    const angle = (i / SERVICE_COUNT) * TAU + rand() * 0.18
    // Staggered release, so decomposition reads as a process not a snap.
    const release = smoothstep(span(t, 0.08 + (i / SERVICE_COUNT) * 0.34, 0.66))
    const wobble = reduced ? 0 : Math.sin(time * 0.6 + i) * min * 0.012
    const radius = lerp(min * 0.02, orbitR + wobble, release)
    const spin = reduced ? 0 : time * 0.09
    return {
      x: cx + Math.cos(angle + spin) * radius,
      y: cy + Math.sin(angle + spin) * radius * 0.82,
      release,
    }
  })

  // ── Dependency chords: dense at first, pruned as services decouple ────────
  const chordAlpha = (1 - decompose) * 0.3
  if (chordAlpha > 0.01) {
    for (let i = 0; i < services.length; i++) {
      for (let j = i + 1; j < services.length; j++) {
        // Keep only a deterministic subset, and drop most of them over time.
        if ((i * 7 + j * 13) % 5 !== 0) continue
        const a = services[i]
        const b = services[j]
        if (!a || !b) continue
        segment(ctx, p, a.x, a.y, b.x, b.y, p.accent, Math.max(1, min * 0.001), chordAlpha)
      }
    }
  }

  // ── Spokes to the platform core: independent deployability ────────────────
  for (const service of services) {
    if (service.release <= 0.01) continue
    segment(
      ctx,
      p,
      cx,
      cy,
      service.x,
      service.y,
      p.accent,
      Math.max(1, min * 0.0014),
      0.1 * service.release
    )
    node(ctx, p, service.x, service.y, min * 0.0075, p.accent, 0.35 + service.release * 0.55)
  }

  // ── Identity ring: OAuth2 + Azure AD closing around the cluster ───────────
  if (identity > 0.01) {
    stroke(
      ctx,
      p,
      () =>
        ctx.ellipse(
          cx,
          cy,
          orbitR * 1.24,
          orbitR * 1.02,
          0,
          -Math.PI / 2,
          -Math.PI / 2 + TAU * identity
        ),
      teal,
      Math.max(1, min * 0.004),
      0.5
    )
    glow(ctx, p, cx, cy, orbitR * 1.5, teal, 0.06 * identity)
  }

  glow(ctx, p, cx, cy, min * 0.16, p.accent, 0.16 + decompose * 0.14)
  node(ctx, p, cx, cy, min * 0.009, p.accent, 0.5 + decompose * 0.5)

  grade(ctx, p, width, height)
}

export const lifeSciencesScene: Scene = {
  id: 'lifesciences',
  render,
  accent: ACCENT,
  caption:
    'A monolith fracturing into independently deployable services: dependency chords thinning ' +
    'as they decouple, a centralized identity ring closing around the cluster.',
}
