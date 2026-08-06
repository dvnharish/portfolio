'use client'

import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '@/hooks/useTheme'

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

/** Light/dark switch. Light is the default. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()

  // Until the attribute is read, render the icon for the document default so
  // the button never flips on hydration.
  const isDark = theme === 'dark'
  const next = isDark ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle transition-colors duration-300 hover:text-ink ${focusRing}`}
    >
      {isDark ? (
        <FiSun aria-hidden className="h-[0.9375rem] w-[0.9375rem]" />
      ) : (
        <FiMoon aria-hidden className="h-[0.9375rem] w-[0.9375rem]" />
      )}
    </button>
  )
}
