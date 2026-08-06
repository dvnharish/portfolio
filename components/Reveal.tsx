'use client'

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react'
import { motion, useInView } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

/** Distance travelled on entry, in px. Small — this is a settle, not a slide. */
const TRAVEL = 22

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Hard deadline for revealing regardless of the observer.
 *
 * Content must never be permanently invisible. If the IntersectionObserver
 * never fires — a throttled or non-compositing tab, a background render, an
 * observer that misses because of an unusual layout — this releases the content
 * anyway. A late fade-in is a cosmetic miss; an empty portfolio is not.
 */
const FAILSAFE_MS = 1200

interface RevealProps {
  children: ReactNode
  /** Seconds of delay, for staggering siblings. */
  delay?: number
  /** Entry direction. */
  from?: 'below' | 'left' | 'right'
  as?: ElementType
  className?: string
}

/**
 * Scroll-triggered entrance: opacity + a short travel + a blur that resolves.
 *
 * Fires once, as the element clears the lower fifth of the viewport. With
 * reduced motion the children render at their resting state with no motion
 * props at all, so the page is fully readable without ever animating.
 *
 * The ref is attached unconditionally and on every branch: `useInView` binds its
 * observer in a mount effect, and refs are not reactive, so a ref attached only
 * after the media query resolves would never be observed — the element would
 * stay invisible forever.
 */
export function Reveal({
  children,
  delay = 0,
  from = 'below',
  as = 'div',
  className,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = usePrefersReducedMotion()
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })

  const [failsafe, setFailsafe] = useState(false)
  useEffect(() => {
    const timer = window.setTimeout(() => setFailsafe(true), FAILSAFE_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const visible = inView || failsafe

  const MotionTag = motion[as as 'div']

  // `null` means the query has not resolved yet — stay at rest rather than
  // risk animating for someone who asked us not to.
  const animated = reduced === false

  const offset =
    from === 'below'
      ? { y: TRAVEL, x: 0 }
      : from === 'left'
        ? { x: -TRAVEL, y: 0 }
        : { x: TRAVEL, y: 0 }

  const hidden = { opacity: 0, filter: 'blur(6px)', ...offset }
  const shown = { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 }

  const motionProps = animated
    ? {
        initial: hidden,
        animate: visible ? shown : hidden,
        transition: { duration: 0.9, delay, ease: EASE },
      }
    : {}

  return (
    <MotionTag ref={ref} className={className} {...motionProps}>
      {children}
    </MotionTag>
  )
}
