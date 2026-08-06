'use client'

import { createContext, useContext } from 'react'
import type { MotionValue } from 'framer-motion'

/**
 * Which way the hero copy has to be coloured.
 *
 * Derived from the actual luminance of the frame sequence, not from the theme:
 * the visitor's frames are arbitrary artwork and may be bright or dark
 * regardless of which theme the page is in.
 */
export type HeroTone = 'onLight' | 'onDark'

export interface HeroState {
  /**
   * The scrolly track's 0→1 progress. `null` means the track is not scrubbing
   * (reduced motion, or an empty sequence) and consumers must render statically.
   */
  progress: MotionValue<number> | null
  tone: HeroTone
}

const HeroContext = createContext<HeroState>({ progress: null, tone: 'onDark' })

export const HeroProvider = HeroContext.Provider

export function useHero(): HeroState {
  return useContext(HeroContext)
}
