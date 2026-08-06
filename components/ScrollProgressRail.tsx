'use client'

import { useEffect, useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/**
 * Hairline document-progress rail, pinned to the right edge.
 *
 * Height is mutated directly from the scroll motion value — this updates on
 * every scroll tick and must never re-render React. Hidden entirely for
 * reduced-motion visitors and on narrow viewports, where it is only clutter.
 */
export function ScrollProgressRail() {
  const reduced = usePrefersReducedMotion()
  const fillRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const apply = (value: number) => {
    if (fillRef.current) fillRef.current.style.transform = `scaleY(${value.toFixed(4)})`
  }

  useMotionValueEvent(scrollYProgress, 'change', apply)

  useEffect(() => {
    apply(scrollYProgress.get())
  }, [scrollYProgress])

  if (reduced !== false) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-5 top-1/2 z-40 hidden h-40 w-px -translate-y-1/2 bg-line/12 lg:block"
    >
      <div
        ref={fillRef}
        className="h-full w-full origin-top bg-ink"
        style={{ transform: 'scaleY(0)' }}
      />
    </div>
  )
}
