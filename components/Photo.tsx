import { srcSet, type Portrait } from '@/lib/images'

interface PhotoProps {
  photo: Portrait
  alt: string
  /** Responsive sizes hint, e.g. "100vw" or "(min-width: 1024px) 20rem, 100vw". */
  sizes: string
  className?: string
  /**
   * Absolutely fill the nearest positioned ancestor instead of flowing at its
   * intrinsic aspect ratio.
   */
  fill?: boolean
  /** Set for anything above the fold; everything else stays lazy. */
  priority?: boolean
}

/**
 * Responsive image built on a plain <picture>.
 *
 * Replaces `next/image` because this project ships as a static export to Apache
 * hosting, where Next's image optimizer does not run — `next/image` there would
 * serve the full-size original. The derivatives are pre-encoded at build time by
 * scripts/build-images.mjs, so the browser still picks an AVIF/WebP at the right
 * width, with a JPEG fallback.
 *
 * The blur placeholder is a CSS background rather than a JS-driven fade, so
 * there is no hydration cost and no flash if scripting is unavailable. `width`
 * and `height` (or an explicit aspect ratio) are always set, so the image
 * reserves its box before it loads and contributes nothing to CLS.
 */
export function Photo({ photo, alt, sizes, className = '', fill, priority }: PhotoProps) {
  const blurStyle = {
    backgroundImage: `url("${photo.blurDataURL}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } as const

  if (fill) {
    return (
      <picture className="absolute inset-0 block" style={blurStyle}>
        <source type="image/avif" srcSet={srcSet(photo, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(photo, 'webp')} sizes={sizes} />
        <img
          src={photo.fallback}
          alt={alt}
          width={photo.width}
          height={photo.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : undefined}
          className={`absolute inset-0 h-full w-full ${className}`}
        />
      </picture>
    )
  }

  return (
    <picture
      className="block overflow-hidden"
      // Reserves the exact box before the image arrives.
      style={{ ...blurStyle, aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <source type="image/avif" srcSet={srcSet(photo, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(photo, 'webp')} sizes={sizes} />
      <img
        src={photo.fallback}
        alt={alt}
        width={photo.width}
        height={photo.height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        className={`h-full w-full ${className}`}
      />
    </picture>
  )
}
