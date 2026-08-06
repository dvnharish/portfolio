'use client'

import { useCallback, useEffect, useState } from 'react'
import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from '@/lib/theme'

/** Custom event so every consumer re-reads the attribute from one source. */
const THEME_EVENT = 'hd-themechange'

function currentTheme(): Theme {
  if (typeof document === 'undefined') return DEFAULT_THEME
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

/**
 * Reads and writes the active theme.
 *
 * The DOM attribute is the source of truth — it is set by the inline script in
 * <head> before hydration, so React must never render a guess of its own.
 * `theme` is `null` until the first client effect, which lets callers that
 * paint (the canvas scenes) wait for the real value instead of flashing.
 */
export function useTheme(): { theme: Theme | null; toggle: () => void; set: (next: Theme) => void } {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(currentTheme())
    const onChange = () => setTheme(currentTheme())
    window.addEventListener(THEME_EVENT, onChange)
    return () => window.removeEventListener(THEME_EVENT, onChange)
  }, [])

  const set = useCallback((next: Theme) => {
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Private browsing or blocked storage — the attribute still applies for
      // this session, which is the part that matters visually.
    }
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  const toggle = useCallback(() => {
    set(currentTheme() === 'dark' ? 'light' : 'dark')
  }, [set])

  return { theme, toggle, set }
}
