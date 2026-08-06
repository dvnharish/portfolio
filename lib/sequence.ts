import manifest from './sequence-manifest.json'

/**
 * Frame filenames, naturally sorted, generated from public/sequence/ by
 * scripts/build-manifest.mjs on every dev/build.
 */
export const SEQUENCE_FRAMES: readonly string[] = manifest.frames

export const SEQUENCE_BYTES: number = manifest.totalBytes

/**
 * Content hash of the whole sequence. Appended to every frame URL so the
 * long-lived `immutable` cache header is safe: re-exporting the sequence changes
 * this value and therefore every URL, instead of silently serving returning
 * visitors the previous artwork from cache.
 */
export const SEQUENCE_VERSION: string = manifest.version

export function frameSrc(filename: string): string {
  return `/sequence/${encodeURIComponent(filename)}?v=${SEQUENCE_VERSION}`
}

/**
 * Frame list for a given device profile.
 * - `full`   — every frame (desktop scrub)
 * - `sparse` — every 3rd frame (mobile: ~1/3 the bytes, still reads as motion)
 * - `hero`   — a single representative frame (reduced motion / static fallback)
 */
export type SequenceProfile = 'full' | 'sparse' | 'hero'

/** Where in the sequence the strongest single still lives. */
const HERO_FRACTION = 0.33

export function framesFor(profile: SequenceProfile): readonly string[] {
  if (SEQUENCE_FRAMES.length === 0) return []
  switch (profile) {
    case 'full':
      return SEQUENCE_FRAMES
    case 'sparse':
      return SEQUENCE_FRAMES.filter((_, i) => i % 3 === 0)
    case 'hero': {
      const index = Math.floor(SEQUENCE_FRAMES.length * HERO_FRACTION)
      const frame = SEQUENCE_FRAMES[index]
      return frame ? [frame] : []
    }
  }
}

/** Scroll-track height per profile. Keeps the CSS and the JS in agreement. */
export const TRACK_HEIGHT: Record<SequenceProfile, string> = {
  full: '500vh',
  sparse: '200vh',
  hero: '100vh',
}
