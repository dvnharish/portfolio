import type { Theme } from '@/lib/theme'
import type { Rgb, ScenePalette } from './types'

/**
 * Per-theme constants shared by every scene.
 *
 * Light values are deliberately not lightened versions of the dark ones. On
 * paper a colour has to be *darker* to carry the same weight, so each is picked
 * for contrast against the light canvas rather than for luminosity.
 */
const THEME_BASE: Record<Theme, Omit<ScenePalette, 'accent'>> = {
  light: {
    paper: [246, 245, 242],
    ink: [17, 17, 16],
    danger: [178, 42, 32],
    highlight: [150, 100, 0],
    // A 6% black line on paper is invisible; scale line alphas up to compensate.
    lineBoost: 2.6,
    glowMode: 'tint',
  },
  dark: {
    paper: [6, 7, 10],
    ink: [245, 245, 245],
    danger: [239, 108, 92],
    highlight: [244, 226, 138],
    lineBoost: 1,
    glowMode: 'add',
  },
}

export function scenePalette(theme: Theme, accent: { light: Rgb; dark: Rgb }): ScenePalette {
  return { ...THEME_BASE[theme], accent: accent[theme] }
}

/** Page background per theme, for canvases that must match the surrounding page. */
export function scenePaper(theme: Theme): Rgb {
  return THEME_BASE[theme].paper
}
