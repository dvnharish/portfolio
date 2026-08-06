'use client'

import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { HeroProvider } from './HeroContext'
import { Preloader } from './Preloader'
import { useCanvasSurface } from '@/hooks/useCanvasSurface'
import { useFrameTone } from '@/hooks/useFrameTone'
import { useImageSequence } from '@/hooks/useImageSequence'
import { useIsMobileViewport, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { framesFor, TRACK_HEIGHT, type SequenceProfile } from '@/lib/sequence'

interface ScrollyCanvasProps {
  /** Overlay content. Rendered inside the sticky viewport, above the canvas. */
  children: ReactNode
}

/**
 * Scroll-linked image-sequence scrubber.
 *
 * A tall track (500vh desktop / 200vh mobile) pins a full-viewport canvas.
 * Scroll progress across the track maps linearly onto the frame list; frames are
 * fully preloaded and decoded before scrubbing is allowed, so there is no
 * flicker and no mid-scroll network stall.
 */
export function ScrollyCanvas({ children }: ScrollyCanvasProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobileViewport()

  // Both queries settle in the same first client effect. Until they do we hold
  // off on loading anything, so a phone never fetches the desktop sequence.
  const measured = prefersReducedMotion !== null && isMobile !== null

  const profile: SequenceProfile = prefersReducedMotion ? 'hero' : isMobile ? 'sparse' : 'full'

  const frames = useMemo(() => framesFor(profile), [profile])
  const { images, settled, total, ready, failed } = useImageSequence(frames, measured)
  const tone = useFrameTone(images, ready)

  const trackRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /** Index the scroll position currently asks for. */
  const targetIndexRef = useRef(0)
  /** Index actually painted. Guards against redundant draws. */
  const paintedIndexRef = useRef(-1)
  const rafRef = useRef<number | null>(null)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  /** Paint one frame, object-cover-scaled into the canvas' device pixels. */
  const paint = useCallback(
    (index: number) => {
      const canvas = canvasRef.current
      const image = images[index]
      if (!canvas || !image || image.naturalWidth === 0) return

      const ctx = canvas.getContext('2d', { alpha: false })
      if (!ctx) return

      const cw = canvas.width
      const ch = canvas.height
      if (cw === 0 || ch === 0) return

      const scale = Math.max(cw / image.naturalWidth, ch / image.naturalHeight)
      const dw = image.naturalWidth * scale
      const dh = image.naturalHeight * scale

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(image, (cw - dw) / 2, (ch - dh) / 2, dw, dh)

      paintedIndexRef.current = index
    },
    [images]
  )

  /** After a resize the backing store is blank — force a repaint of the same frame. */
  const repaintCurrent = useCallback(() => {
    paintedIndexRef.current = -1
    paint(targetIndexRef.current)
  }, [paint])

  const { resync } = useCanvasSurface(stageRef, canvasRef, repaintCurrent)

  /** Coalesce every scroll tick within a frame into a single draw. */
  const schedulePaint = useCallback(() => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const index = targetIndexRef.current
      if (index === paintedIndexRef.current) return
      paint(index)
    })
  }, [paint])

  const clampIndex = useCallback(
    (progress: number): number => {
      const last = frames.length - 1
      if (last < 0) return 0
      const index = Math.round(progress * last)
      return index < 0 ? 0 : index > last ? last : index
    },
    [frames.length]
  )

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (frames.length === 0) return
    targetIndexRef.current = clampIndex(progress)
    schedulePaint()
  })

  // First real paint, once frames exist. Also re-derives the index in case the
  // visitor deep-linked mid-track or the browser restored a scroll position.
  useEffect(() => {
    if (!ready || frames.length === 0) return
    targetIndexRef.current = clampIndex(scrollYProgress.get())
    resync()
    repaintCurrent()
  }, [ready, frames.length, clampIndex, resync, repaintCurrent, scrollYProgress])

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    },
    []
  )

  /**
   * Static layout: no scrub track, no pinning, overlay copy stacks as ordinary
   * flow content. Used for reduced-motion visitors and as the graceful
   * degradation path when the sequence is missing or has a single frame.
   */
  const staticLayout = measured && (prefersReducedMotion === true || frames.length <= 1)

  const hero = useMemo(
    () => ({ progress: staticLayout ? null : scrollYProgress, tone }),
    [staticLayout, scrollYProgress, tone]
  )

  return (
    <>
      {/* `measured &&` matters: before the media queries resolve we have not
          started loading, so `ready` is vacuously false-y — reporting done here
          would dismiss the loader before a single frame had decoded. */}
      <Preloader settled={settled} total={total} ready={measured && ready} />

      <div
        ref={trackRef}
        style={{
          height: staticLayout ? 'auto' : measured ? TRACK_HEIGHT[profile] : TRACK_HEIGHT.full,
        }}
        className="relative w-full"
      >
        <div
          ref={stageRef}
          className={
            staticLayout
              ? 'relative min-h-screen w-full overflow-hidden bg-paper'
              : 'sticky top-0 h-screen w-full overflow-hidden bg-paper'
          }
        >
          {/* Always-present base wash: if the sequence is missing or fails to
              decode, the hero still reads as deliberate rather than broken. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_30%_35%,rgb(var(--ink)/0.07)_0%,rgb(var(--paper))_60%)]"
          />

          <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 h-full w-full"
            style={{ contain: 'strict' }}
          />

          {/* Grade the frame into the page: edges fade to whatever the page
              background is, so this works in either theme and with either
              light or dark artwork. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(78%_68%_at_50%_50%,transparent_42%,rgb(var(--paper)/0.55)_100%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/60 via-transparent to-paper/85"
          />

          <HeroProvider value={hero}>{children}</HeroProvider>
        </div>
      </div>

      {failed > 0 && (
        <p className="sr-only">
          {failed} of {total} background frames could not be loaded. The page content is
          unaffected.
        </p>
      )}
    </>
  )
}
