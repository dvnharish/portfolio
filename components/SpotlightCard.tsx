'use client'

import { useCallback, useRef, type ReactNode } from 'react'
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion'
import { useHasFinePointer } from '@/hooks/useMediaQuery'

/** Radius of the cursor-tracked highlight. */
const SPOTLIGHT_RADIUS_PX = 400

interface SpotlightCardProps {
  children: ReactNode
  /** Extra classes for the outer card. */
  className?: string
  /** Render as a different element — e.g. `li` inside a list. */
  as?: 'div' | 'li' | 'article'
}

/**
 * Levitating card with a cursor-tracked highlight.
 *
 * The gradient is composed from motion values via `useMotionTemplate`, so
 * pointer tracking never triggers a React re-render. The listener is attached
 * only for hover-capable fine pointers — on touch there is no cursor to track
 * and the `pointermove` handler would just burn battery during scroll.
 *
 * The highlight is drawn from the `--ink` token, so on paper it reads as a soft
 * shadow gathering under the cursor and on dark as a light bloom. A single
 * hardcoded white would vanish in light mode.
 */
export function SpotlightCard({ children, className = '', as = 'div' }: SpotlightCardProps) {
  const hasFinePointer = useHasFinePointer()
  const cardRef = useRef<HTMLElement | null>(null)

  const mouseX = useMotionValue(-SPOTLIGHT_RADIUS_PX)
  const mouseY = useMotionValue(-SPOTLIGHT_RADIUS_PX)

  const background = useMotionTemplate`radial-gradient(${SPOTLIGHT_RADIUS_PX}px circle at ${mouseX}px ${mouseY}px, rgb(var(--ink) / 0.05), transparent 80%)`

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const node = cardRef.current
      if (!node) return
      const rect = node.getBoundingClientRect()
      mouseX.set(event.clientX - rect.left)
      mouseY.set(event.clientY - rect.top)
    },
    [mouseX, mouseY]
  )

  const handlePointerLeave = useCallback(() => {
    // Park the highlight off-card so it fades out instead of freezing mid-hover.
    mouseX.set(-SPOTLIGHT_RADIUS_PX)
    mouseY.set(-SPOTLIGHT_RADIUS_PX)
  }, [mouseX, mouseY])

  const tracking = hasFinePointer === true

  const MotionTag = motion[as]

  return (
    <MotionTag
      ref={cardRef as never}
      onPointerMove={tracking ? handlePointerMove : undefined}
      onPointerLeave={tracking ? handlePointerLeave : undefined}
      className={`group relative isolate overflow-hidden rounded-2xl border border-line/10 bg-surface/60 shadow-lift backdrop-blur-lg transition-[transform,box-shadow] duration-500 ease-weightless hover:shadow-lift-hover motion-safe:hover:-translate-y-2 ${className}`}
    >
      {/* Clipped to the card by the parent's overflow-hidden + isolate. */}
      {tracking && (
        <motion.span
          aria-hidden
          style={{ background }}
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}

      {/* Hairline top edge — reads as light catching a bevel. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-line/12 to-transparent"
      />

      {children}
    </MotionTag>
  )
}
