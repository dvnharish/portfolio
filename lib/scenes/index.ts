import { bankingScene } from './banking'
import { fleetScene } from './fleet'
import { gridScene } from './grid'
import { lifeSciencesScene } from './lifesciences'
import type { Scene } from './types'

export type { Scene, SceneFrame, SceneRenderer, ScenePalette, Rgb } from './types'
export { scenePalette, scenePaper } from './palette'

/**
 * Scene per employer. Keyed by `Role.company` in lib/content.ts — a role
 * without a scene simply renders without a background animation.
 */
export const SCENES: Readonly<Record<string, Scene>> = {
  'U.S. Bank': bankingScene,
  GSK: lifeSciencesScene,
  'Robert Bosch': fleetScene,
  'Fluentgrid Limited': gridScene,
}

export function sceneFor(company: string): Scene | undefined {
  return SCENES[company]
}
