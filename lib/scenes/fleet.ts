import {
  TAU,
  backdrop,
  glow,
  grade,
  lerp,
  node,
  pick,
  pulse,
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
  light: [166, 92, 0],
  dark: [255, 176, 92],
}

/** Secondary: telemetry uplinks and the ingest cloud. */
const TELEMETRY: ThemedRgb = {
  light: [11, 105, 163],
  dark: [110, 214, 255],
}

const LANE_COUNT = 5

/**
 * Robert Bosch — connected-vehicle IoT orchestration and fleet management.
 *
 * A road plane recedes to a horizon with vehicles moving along lanes. Each
 * vehicle emits telemetry upward to the ingest cloud; a safety-critical
 * diagnostic event fires amber and is detected serverlessly. Past the midpoint
 * the stream forks into the CQRS split — writes descending into the ingest
 * store, reads rising to the fleet-analytics dashboards.
 */
function render({ ctx, width, height, min, t, time, density, reduced, palette }: SceneFrame): void {
  const p = palette
  const telemetry = pick(TELEMETRY, p)
  backdrop(ctx, p, width, height, 0.75)

  const horizonY = height * 0.42
  const vanishX = width * 0.5
  const cqrs = smoothstep(span(t, 0.5, 0.9))

  // ── Road plane: lanes converging on the vanishing point ───────────────────
  for (let i = 0; i <= LANE_COUNT; i++) {
    const spread = (i / LANE_COUNT - 0.5) * 2
    const baseX = vanishX + spread * width * 0.95
    segment(
      ctx,
      p,
      baseX,
      height,
      vanishX + spread * width * 0.045,
      horizonY,
      p.accent,
      Math.max(1, min * 0.0016),
      0.13
    )
  }

  // ── Perspective cross-ties, scrolling toward the viewer ───────────────────
  const tieCount = Math.max(6, Math.round(14 * density))
  for (let i = 0; i < tieCount; i++) {
    const raw = (i / tieCount + (reduced ? 0 : time * 0.11)) % 1
    // Cubic falloff approximates perspective foreshortening.
    const depth = Math.pow(raw, 3)
    const y = lerp(horizonY, height, depth)
    const halfW = lerp(width * 0.045, width * 0.95, depth)
    segment(
      ctx,
      p,
      vanishX - halfW,
      y,
      vanishX + halfW,
      y,
      p.accent,
      Math.max(1, min * 0.0014),
      0.05 + depth * 0.1
    )
  }

  // Horizon band — the edge, where devices live.
  const horizon = ctx.createLinearGradient(0, horizonY - min * 0.1, 0, horizonY + min * 0.03)
  horizon.addColorStop(0, rgba(p.accent, 0))
  horizon.addColorStop(1, rgba(p.accent, p.glowMode === 'tint' ? 0.1 : 0.2))
  ctx.fillStyle = horizon
  ctx.fillRect(0, horizonY - min * 0.1, width, min * 0.13)
  segment(ctx, p, 0, horizonY, width, horizonY, p.accent, Math.max(1, min * 0.002), 0.3)

  // ── The fleet ─────────────────────────────────────────────────────────────
  const rand = seeded(7723)
  const vehicleCount = Math.max(5, Math.round(11 * density))
  const cloudY = height * 0.16

  for (let i = 0; i < vehicleCount; i++) {
    const lane = (rand() - 0.5) * 1.7
    const speed = 0.055 + rand() * 0.07
    const offset = rand()
    // One vehicle raises a diagnostic fault, deterministically.
    const faulty = i === 2

    const raw = (offset + (reduced ? 0.55 : time * speed)) % 1
    const depth = Math.pow(raw, 2.6)
    const y = lerp(horizonY, height * 1.02, depth)
    const x = vanishX + lane * lerp(width * 0.045, width * 0.9, depth)
    const size = lerp(min * 0.0025, min * 0.014, depth)

    const faultPhase = faulty ? pulse((raw * 2) % 1) : 0
    const color = faulty ? p.accent : p.ink

    node(ctx, p, x, y, size, color, 0.5 + depth * 0.5)
    if (faulty) glow(ctx, p, x, y, size * 9, p.accent, 0.3 * faultPhase)

    // Telemetry uplink: a rising beam, gated so the sky is not a solid wall.
    const beat = (time * 0.9 + offset * 4) % 1
    if (!reduced && beat < 0.42 && depth > 0.12) {
      const climb = beat / 0.42
      const beamTop = lerp(y, cloudY, climb)
      const beam = ctx.createLinearGradient(x, y, x, beamTop)
      beam.addColorStop(0, rgba(telemetry, 0))
      beam.addColorStop(1, rgba(telemetry, 0.32 * (1 - climb * 0.5)))
      ctx.strokeStyle = beam
      ctx.lineWidth = Math.max(1, min * 0.0018)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x, beamTop)
      ctx.stroke()

      ctx.fillStyle = rgba(telemetry, 0.75)
      ctx.beginPath()
      ctx.arc(x, beamTop, min * 0.0035, 0, TAU)
      ctx.fill()
    }
  }

  // ── Ingest cloud ──────────────────────────────────────────────────────────
  glow(ctx, p, vanishX, cloudY, min * 0.2, telemetry, 0.16)
  stroke(
    ctx,
    p,
    () => ctx.ellipse(vanishX, cloudY, min * 0.13, min * 0.045, 0, 0, TAU),
    telemetry,
    Math.max(1, min * 0.0025),
    0.32
  )
  node(ctx, p, vanishX, cloudY, min * 0.008, telemetry, 0.85)

  // ── CQRS fork: writes down to the store, reads up to analytics ────────────
  if (cqrs > 0.01) {
    const reach = min * 0.3 * cqrs
    for (const dir of [-1, 1]) {
      const label = dir < 0 ? telemetry : p.accent
      stroke(
        ctx,
        p,
        () => {
          ctx.moveTo(vanishX, cloudY)
          ctx.quadraticCurveTo(
            vanishX + dir * reach * 0.7,
            cloudY - min * 0.02,
            vanishX + dir * reach,
            cloudY + dir * min * 0.055
          )
        },
        label,
        Math.max(1, min * 0.0028),
        0.34 * cqrs
      )
      node(ctx, p, vanishX + dir * reach, cloudY + dir * min * 0.055, min * 0.0065, label, 0.8 * cqrs)
      // Packets travelling each side of the split.
      if (!reduced) {
        const q = (time * 0.55 + (dir > 0 ? 0.5 : 0)) % 1
        const px = vanishX + dir * reach * q
        const py = cloudY + dir * min * 0.055 * q * q
        ctx.fillStyle = rgba(label, 0.9 * cqrs)
        ctx.beginPath()
        ctx.arc(px, py, min * 0.0032, 0, TAU)
        ctx.fill()
      }
    }
  }

  grade(ctx, p, width, height)
}

export const fleetScene: Scene = {
  id: 'fleet',
  render,
  accent: ACCENT,
  caption:
    'A vehicle fleet on a receding road plane, each unit beaming telemetry to an ingest cloud, ' +
    'a diagnostic fault flaring, and the stream forking into separate read and write paths.',
}
