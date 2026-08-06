/** RGB triple, 0-255. Kept numeric so alpha can be applied per draw call. */
export type Rgb = readonly [number, number, number]

/**
 * Resolved drawing palette for the active theme.
 *
 * Light and dark are not inversions of each other. On dark, structure reads from
 * emitted light — additive glows over near-black. On light there is no such
 * thing as a glow: structure has to read from ink on paper, with colour used as
 * a wash rather than a light source. `glowMode` and `lineBoost` are what let one
 * scene renderer express both without branching on every draw call.
 */
export interface ScenePalette {
  /** Canvas background. */
  paper: Rgb
  /** Primary linework colour — near-black on light, near-white on dark. */
  ink: Rgb
  /** Scene accent, already tuned for contrast against `paper`. */
  accent: Rgb
  /** Fault / threat colour. */
  danger: Rgb
  /** Energised / live colour. */
  highlight: Rgb
  /**
   * Multiplier applied to line alphas. A 6% white line reads clearly on black;
   * a 6% black line on paper is invisible, so light themes scale up.
   */
  lineBoost: number
  /** `add` = luminous halo (dark). `tint` = flat colour wash (light). */
  glowMode: 'add' | 'tint'
}

export interface SceneFrame {
  ctx: CanvasRenderingContext2D
  /** Canvas backing-store size, in device pixels. */
  width: number
  height: number
  /** Shortest edge — use for radii so circles stay circular. */
  min: number
  /** Scroll progress through this scene's own track, 0..1. */
  t: number
  /** Seconds since the scene started animating. Ambient motion only. */
  time: number
  /** Particle/element budget: ~0.45 on mobile, 1 on desktop. */
  density: number
  /** True when the visitor asked for reduced motion — render a still. */
  reduced: boolean
  palette: ScenePalette
}

export type SceneRenderer = (frame: SceneFrame) => void

export interface Scene {
  id: string
  render: SceneRenderer
  /** Accent per theme. Light variants are darkened for contrast on paper. */
  accent: { light: Rgb; dark: Rgb }
  /** Short description of what the visual depicts, for the caption + a11y. */
  caption: string
}
