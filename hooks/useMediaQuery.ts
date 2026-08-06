'use client'

import { useEffect, useState } from 'react'

/**
 * SSR-safe matchMedia subscription.
 *
 * Returns `null` until the first client effect runs, so callers can distinguish
 * "not measured yet" from a real false and avoid rendering the wrong device
 * branch on the server (which would cause a hydration mismatch and CLS).
 */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null)

  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)

    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True when the visitor has asked the OS to reduce motion. */
export function usePrefersReducedMotion(): boolean | null {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Tailwind's `md` breakpoint, in JS. Below this we never load the full sequence. */
export function useIsMobileViewport(): boolean | null {
  return useMediaQuery('(max-width: 767px)')
}

/** True only for real hover-capable pointers — gates the spotlight listener. */
export function useHasFinePointer(): boolean | null {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}
