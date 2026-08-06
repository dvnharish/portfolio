import {
  TAU,
  backdrop,
  glow,
  grade,
  lerp,
  node,
  rgba,
  seeded,
  segment,
  smoothstep,
  span,
  stroke,
} from './draw'
import type { Rgb, Scene, SceneFrame } from './types'

const ACCENT: { light: Rgb; dark: Rgb } = {
  light: [26, 95, 208],
  dark: [96, 178, 255],
}

/** Payment lanes crossing the gateway. */
const LANE_COUNT = 7

/**
 * U.S. Bank — merchant lending platform.
 *
 * Reads left-to-right as the request path: transactions stream in, meet the
 * APIGEE gateway perimeter, and either pass through into the service mesh or
 * get deflected. Threats are refused at the boundary (secure SDLC / threat
 * modelling), one lane trips its circuit breaker and reroutes (chaos-tested
 * recovery), and the concentric rings tighten as the scene progresses —
 * governance hardening around the core.
 */
function render({ ctx, width, height, min, t, time, density, reduced, palette }: SceneFrame): void {
  const p = palette
  backdrop(ctx, p, width, height, 1)

  const gateX = width * 0.5
  const coreR = min * 0.13
  const hardening = smoothstep(span(t, 0.1, 0.85))

  // ── Gateway perimeter ──────────────────────────────────────────────────────
  stroke(
    ctx,
    p,
    () => {
      ctx.moveTo(gateX, 0)
      ctx.lineTo(gateX, height)
    },
    p.accent,
    Math.max(1, min * 0.0035),
    0.14 + hardening * 0.16
  )

  // ── Concentric governance rings, tightening with progress ─────────────────
  for (let ring = 0; ring < 3; ring++) {
    const phase = (time * 0.16 + ring * 0.33) % 1
    const radius = coreR * lerp(3.4, 1.55, hardening) * (1 + ring * 0.42)
    const breathe = reduced ? 0 : Math.sin(time * 0.8 + ring) * min * 0.006
    stroke(
      ctx,
      p,
      () => ctx.arc(gateX, height * 0.5, radius + breathe, 0, TAU),
      p.accent,
      Math.max(1, min * 0.0022),
      (0.05 + hardening * 0.12) * (1 - ring * 0.22)
    )
    // A slow sweep travelling each ring — active monitoring, not decoration.
    if (!reduced) {
      const angle = phase * TAU
      stroke(
        ctx,
        p,
        () => ctx.arc(gateX, height * 0.5, radius + breathe, angle, angle + 0.5),
        p.ink,
        Math.max(1, min * 0.003),
        0.18 * hardening
      )
    }
  }

  // ── Lanes: inbound transactions, gateway decision, outbound mesh ──────────
  const rand = seeded(9137)
  const lanes = Array.from({ length: LANE_COUNT }, (_, i) => ({
    y: height * (0.16 + (0.68 * i) / (LANE_COUNT - 1)),
    speed: 0.11 + rand() * 0.1,
    offset: rand(),
    // One deterministic lane trips its breaker mid-scene.
    breaker: i === 3,
    threatSlot: 0.25 + rand() * 0.5,
  }))

  const perLane = Math.max(2, Math.round(5 * density))

  for (const lane of lanes) {
    const tripped = lane.breaker && t > 0.45 && t < 0.72
    const laneAlpha = tripped ? 0.06 : 0.12

    segment(ctx, p, 0, lane.y, gateX, lane.y, p.accent, Math.max(1, min * 0.0014), laneAlpha)
    segment(
      ctx,
      p,
      gateX,
      lane.y,
      width,
      lane.y,
      p.accent,
      Math.max(1, min * 0.0014),
      tripped ? 0.03 : laneAlpha * 0.75
    )

    if (tripped) {
      // Rerouted around the failed lane — the request still completes.
      const detour = lane.y + height * 0.075
      stroke(
        ctx,
        p,
        () => {
          ctx.moveTo(gateX, lane.y)
          ctx.quadraticCurveTo(gateX + width * 0.12, detour, gateX + width * 0.26, detour)
          ctx.lineTo(width, detour)
        },
        p.accent,
        Math.max(1, min * 0.002),
        0.2
      )
      glow(ctx, p, gateX, lane.y, min * 0.05, p.danger, 0.22)
    }

    for (let i = 0; i < perLane; i++) {
      const raw = (time * lane.speed + lane.offset + i / perLane) % 1
      // Threat packets are refused: they stall at the boundary and fade.
      const isThreat = Math.abs(raw - lane.threatSlot) < 0.02 && !tripped
      const passed = raw > 0.5
      if (isThreat && passed) continue

      const x = raw * width
      const y = tripped && passed ? lane.y + height * 0.075 : lane.y
      const size = min * (isThreat ? 0.0075 : 0.005)
      const color = isThreat ? p.danger : passed ? p.ink : p.accent

      // Motion trail.
      const trail = min * 0.05
      const tail = ctx.createLinearGradient(x - trail, y, x, y)
      tail.addColorStop(0, rgba(color, 0))
      tail.addColorStop(1, rgba(color, 0.5))
      ctx.strokeStyle = tail
      ctx.lineWidth = Math.max(1, min * 0.0022)
      ctx.beginPath()
      ctx.moveTo(x - trail, y)
      ctx.lineTo(x, y)
      ctx.stroke()

      ctx.fillStyle = rgba(color, isThreat ? 0.95 : 0.8)
      ctx.beginPath()
      ctx.arc(x, y, size, 0, TAU)
      ctx.fill()

      if (isThreat) glow(ctx, p, x, y, min * 0.045, p.danger, 0.4)
    }
  }

  // ── The vault core: what all of this protects ─────────────────────────────
  glow(ctx, p, gateX, height * 0.5, coreR * 3.2, p.accent, 0.2 + hardening * 0.2)
  stroke(
    ctx,
    p,
    () => ctx.arc(gateX, height * 0.5, coreR, 0, TAU),
    p.ink,
    Math.max(1, min * 0.004),
    0.35 + hardening * 0.4
  )
  // Vault dial marks.
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU + (reduced ? 0 : time * 0.25)
    const r0 = coreR * 0.62
    const r1 = coreR * 0.86
    segment(
      ctx,
      p,
      gateX + Math.cos(a) * r0,
      height * 0.5 + Math.sin(a) * r0,
      gateX + Math.cos(a) * r1,
      height * 0.5 + Math.sin(a) * r1,
      p.ink,
      Math.max(1, min * 0.0022),
      0.2 + hardening * 0.25
    )
  }
  node(ctx, p, gateX, height * 0.5, min * 0.008, p.accent, 0.6 + hardening * 0.4)

  grade(ctx, p, width, height)
}

export const bankingScene: Scene = {
  id: 'banking',
  render,
  accent: ACCENT,
  caption:
    'Transactions streaming an API gateway perimeter: threats refused at the boundary, ' +
    'a tripped circuit breaker rerouting around failure, governance rings tightening on the core.',
}
