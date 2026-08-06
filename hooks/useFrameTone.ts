'use client'

import { useEffect, useState } from 'react'
import type { HeroTone } from '@/components/HeroContext'

/** Sampling grid. 8×8 is ample for a mean-luminance decision and costs nothing. */
const SAMPLE = 8

/** Above this mean relative luminance the artwork counts as light. */
const LIGHT_THRESHOLD = 0.42

/**
 * Decides whether hero copy must sit on light or dark artwork, by measuring the
 * frames themselves.
 *
 * The sequence is whatever the site owner exported — it may be a bright studio
 * plate or a near-black star field, and the page theme says nothing about which.
 * Sampling a few frames means the overlay contrast is correct for any input
 * instead of relying on a hardcoded assumption that silently breaks.
 */
export function useFrameTone(
  images: readonly (HTMLImageElement | undefined)[],
  ready: boolean
): HeroTone {
  const [tone, setTone] = useState<HeroTone>('onDark')

  useEffect(() => {
    if (!ready) return

    const loaded = images.filter(
      (image): image is HTMLImageElement => !!image && image.naturalWidth > 0
    )
    if (loaded.length === 0) return

    // Sample across the sequence, not just frame 0 — the copy is legible over
    // all of it or none of it.
    const picks = [0, Math.floor(loaded.length / 2), loaded.length - 1]
      .map((i) => loaded[i])
      .filter((image): image is HTMLImageElement => !!image)

    const canvas = document.createElement('canvas')
    canvas.width = SAMPLE
    canvas.height = SAMPLE
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    let total = 0
    let counted = 0

    for (const image of picks) {
      ctx.clearRect(0, 0, SAMPLE, SAMPLE)
      ctx.drawImage(image, 0, 0, SAMPLE, SAMPLE)
      let data: Uint8ClampedArray
      try {
        data = ctx.getImageData(0, 0, SAMPLE, SAMPLE).data
      } catch {
        // Tainted canvas (cross-origin frames) — keep the safe default.
        return
      }
      for (let i = 0; i < data.length; i += 4) {
        const r = (data[i] ?? 0) / 255
        const g = (data[i + 1] ?? 0) / 255
        const b = (data[i + 2] ?? 0) / 255
        // Rec. 709 relative luminance.
        total += 0.2126 * r + 0.7152 * g + 0.0722 * b
        counted += 1
      }
    }

    if (counted === 0) return
    setTone(total / counted > LIGHT_THRESHOLD ? 'onLight' : 'onDark')
  }, [images, ready])

  return tone
}
