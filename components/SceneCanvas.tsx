'use client'

import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'
import { useScroll } from 'framer-motion'
import { useCanvasSurface } from '@/hooks/useCanvasSurface'
import { useIsMobileViewport, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { useTheme } from '@/hooks/useTheme'
import { scenePalette, type Scene } from '@/lib/scenes'

/** Element budget multiplier per device class. */
const DENSITY_MOBILE = 0.45
const DENSITY_DESKTOP = 1

/** Progress to freeze at when motion is reduced — mid-narrative, most legible. */
const STILL_PROGRESS = 0.55

interface SceneCanvasProps {
  scene: Scene
  /** The chapter element whose scroll position drives the scene. */
  trackRef: RefObject<HTMLElement>
}

/**
 * Renders one generative scene behind a chapter.
 *
 * The animation loop runs only while the chapter intersects the viewport, so N
 * chapters cost one rAF loop, not N. Scroll progress drives narrative state
 * (`t`) while a wall clock drives ambient motion (`time`) — that keeps the scene
 * alive when the visitor stops scrolling without decoupling the story beats
 * from the scroll position.
 *
 * With reduced motion the loop never starts: one still frame is drawn at the
 * most legible point of the narrative, and redrawn on resize or theme change.
 */
export function SceneCanvas({ scene, trackRef }: SceneCanvasProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobile = useIsMobileViewport()
  const { theme } = useTheme()
  const reduced = prefersReducedMotion === true

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startedAtRef = useRef<number | null>(null)
  const rafRef = useRef<number | null>(null)
  const visibleRef = useRef(false)

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start end', 'end start'],
  })

  const density = isMobile ? DENSITY_MOBILE : DENSITY_DESKTOP

  // `theme` is null until the DOM attribute is read; light is the document
  // default, so painting light first matches what the page already shows.
  const palette = useMemo(() => scenePalette(theme ?? 'light', scene.accent), [theme, scene.accent])

  const paint = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || canvas.width === 0 || canvas.height === 0) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    if (startedAtRef.current === null) startedAtRef.current = performance.now()
    const elapsed = (performance.now() - startedAtRef.current) / 1000

    scene.render({
      ctx,
      width: canvas.width,
      height: canvas.height,
      min: Math.min(canvas.width, canvas.height),
      t: reduced ? STILL_PROGRESS : scrollYProgress.get(),
      time: reduced ? 0 : elapsed,
      density,
      reduced,
      palette,
    })
  }, [scene, reduced, density, scrollYProgress, palette])

  useCanvasSurface(containerRef, canvasRef, paint)

  // A theme flip must repaint even when the loop is stopped (reduced motion, or
  // the chapter sitting offscreen) — otherwise the canvas keeps the old palette.
  useEffect(() => {
    paint()
  }, [palette, paint])

  useEffect(() => {
    if (reduced) return

    const container = containerRef.current
    if (!container) return

    const tick = () => {
      if (!visibleRef.current) {
        rafRef.current = null
        return
      }
      paint()
      rafRef.current = requestAnimationFrame(tick)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        visibleRef.current = entry.isIntersecting
        if (entry.isIntersecting && rafRef.current === null) {
          rafRef.current = requestAnimationFrame(tick)
        }
      },
      // Start a little before it scrolls in so the first visible frame is warm.
      { rootMargin: '20% 0px' }
    )
    observer.observe(container)

    return () => {
      observer.disconnect()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [reduced, paint])

  return (
    <div ref={containerRef} aria-hidden className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="h-full w-full" style={{ contain: 'strict' }} />
      {/* Readability floor for the copy layered on top. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-paper via-paper/55 to-paper/80" />
    </div>
  )
}
