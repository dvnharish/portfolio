import manifest from './portrait-manifest.json'

export interface PortraitSource {
  /** Intrinsic width of this derivative, in px. */
  w: number
  avif: string
  webp: string
}

export interface Portrait {
  /** Intrinsic size of the source, for aspect-ratio and CLS prevention. */
  width: number
  height: number
  /** Inline blur placeholder, used as a CSS background behind the image. */
  blurDataURL: string
  /** JPEG for engines without AVIF or WebP. */
  fallback: string
  /** Responsive derivatives, ascending by width. */
  sources: readonly PortraitSource[]
}

/**
 * Portrait slots discovered in public/portrait/ by scripts/build-images.mjs.
 * A missing slot is `undefined` and every consumer renders without it, so the
 * site is complete with zero, one, or all three photos present.
 */
const PORTRAITS: Partial<Record<string, Portrait>> = manifest.portraits

export type PortraitSlot = 'hero' | 'about' | 'contact'

export function portrait(slot: PortraitSlot): Portrait | undefined {
  return PORTRAITS[slot]
}

/** `srcset` string for one encoded format. */
export function srcSet(photo: Portrait, format: 'avif' | 'webp'): string {
  return photo.sources.map((s) => `${s[format]} ${s.w}w`).join(', ')
}
