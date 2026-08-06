'use client'

import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from './useMediaQuery'

const DURATION_MS = 1400

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * Counts from 0 to `target` once `active` turns true.
 *
 * Returns the target immediately when motion is reduced — a number ticking up
 * is decorative, and the figure itself is the information.
 */
export function useCountUp(target: number, active: boolean): number {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    if (reduced !== false) {
      setValue(target)
      return
    }
    if (!active || doneRef.current) return
    doneRef.current = true

    const start = performance.now()
    const tick = () => {
      const elapsed = performance.now() - start
      const progress = Math.min(1, elapsed / DURATION_MS)
      setValue(Math.round(easeOutQuart(progress) * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else rafRef.current = null
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [active, target, reduced])

  return value
}
