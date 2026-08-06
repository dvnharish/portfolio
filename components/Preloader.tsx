'use client'

import { useEffect, useRef, useState } from 'react'
import { lockScroll, unlockScroll } from '@/lib/scroll-lock'
import { NAME } from '@/lib/site'

/** How long the fade-out runs before the loader is removed from the tree. */
const FADE_MS = 700

/**
 * Hard cap on how long the loader may hold the page. A stalled or partially
 * failed sequence must never trap the visitor behind a spinner — the canvas
 * degrades to its base wash and the content below is fully readable.
 */
const MAX_HOLD_MS = 10_000

interface PreloaderProps {
  /** Frames that have finished decoding. */
  settled: number
  total: number
  /** All frames decoded (or nothing to decode). */
  ready: boolean
}

/**
 * Full-screen loader driven by real decode counts — no timers, no fake easing.
 * The bar is the honest ratio of decoded frames to total frames; it reaches
 * 100% exactly when the canvas is safe to scrub.
 */
export function Preloader({ settled, total, ready }: PreloaderProps) {
  const [mounted, setMounted] = useState(true)
  const [leaving, setLeaving] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const percent = total === 0 ? (ready ? 100 : 0) : Math.round((settled / total) * 100)

  // Two independent triggers for the exit: real completion, and the safety cap.
  useEffect(() => {
    if (ready) setLeaving(true)
  }, [ready])

  useEffect(() => {
    const timer = window.setTimeout(() => setLeaving(true), MAX_HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [])

  // Whichever trigger fired, retire the loader once the fade has run.
  useEffect(() => {
    if (!leaving) return
    const timer = window.setTimeout(() => setMounted(false), FADE_MS)
    return () => window.clearTimeout(timer)
  }, [leaving])

  // Hold the scroll position at the top while loading so the visitor cannot
  // scrub past frames that have not decoded yet.
  useEffect(() => {
    if (!mounted) return
    lockScroll('preloader')
    return () => unlockScroll('preloader')
  }, [mounted])

  // Width is mutated directly: this element updates on every decoded frame and
  // has no business triggering React reconciliation that often.
  useEffect(() => {
    if (barRef.current) barRef.current.style.width = `${percent}%`
  }, [percent])

  if (!mounted) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Loading, ${percent} percent`}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-paper transition-opacity duration-700 ease-weightless"
      style={{ opacity: leaving ? 0 : 1, pointerEvents: leaving ? 'none' : 'auto' }}
    >
      <p className="mb-8 text-[0.6875rem] font-medium uppercase tracking-[0.35em] text-ink-subtle">
        {NAME}
      </p>

      <div className="h-px w-56 overflow-hidden bg-line/12 sm:w-72">
        <div
          ref={barRef}
          className="h-full bg-ink transition-[width] duration-200 ease-linear"
          style={{ width: 0 }}
        />
      </div>

      <p className="mt-6 font-mono text-[0.6875rem] tabular-nums tracking-widest text-ink-subtle">
        {String(percent).padStart(3, '0')}
      </p>

      {total > 0 && (
        <p className="mt-8 max-w-xs px-6 text-center text-[0.75rem] leading-relaxed text-ink-subtle">
          Decoding {total} frames so the scroll feels expensive.
        </p>
      )}
    </div>
  )
}
