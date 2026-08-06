'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

/** Cap DPR: beyond 2x the extra pixels cost fill-rate and buy nothing visible. */
const MAX_DPR = 2

/** Debounce window for resize-driven canvas re-measurement. */
const RESIZE_DEBOUNCE_MS = 150

/**
 * Keeps a canvas' backing store in sync with its CSS box × devicePixelRatio,
 * invoking `onResize` whenever the surface actually changed so the caller can
 * repaint. Returns `resync` for callers that need to force a re-measure.
 *
 * Shared by the hero scrubber and the per-role scenes so there is exactly one
 * implementation of the retina / resize / DPR-change handling.
 */
export function useCanvasSurface(
  /** Element whose client box defines the canvas size. */
  boxRef: RefObject<HTMLElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  onResize: () => void
): { resync: () => void } {
  // Held in a ref so a changing callback identity never re-subscribes observers.
  const onResizeRef = useRef(onResize)
  onResizeRef.current = onResize

  const resync = useCallback(() => {
    const canvas = canvasRef.current
    const box = boxRef.current
    if (!canvas || !box) return

    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const width = Math.round(box.clientWidth * dpr)
    const height = Math.round(box.clientHeight * dpr)
    if (width === 0 || height === 0) return
    if (canvas.width === width && canvas.height === height) return

    canvas.width = width
    canvas.height = height
    onResizeRef.current()
  }, [boxRef, canvasRef])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return

    resync()

    let timer: number | undefined
    const schedule = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(resync, RESIZE_DEBOUNCE_MS)
    }

    const observer = new ResizeObserver(schedule)
    observer.observe(box)

    // A DPR change with no CSS box change — dragging the window to a monitor of
    // different density, or browser zoom — never trips the ResizeObserver, and
    // would otherwise leave the canvas rendering at the old resolution. The
    // query must be re-armed after each match because it tests for the DPR we
    // have just moved away from.
    let dprQuery: MediaQueryList | null = null
    const onDprChange = () => {
      watchDpr()
      schedule()
    }
    function watchDpr() {
      dprQuery?.removeEventListener('change', onDprChange)
      dprQuery = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
      dprQuery.addEventListener('change', onDprChange)
    }
    watchDpr()

    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
      dprQuery?.removeEventListener('change', onDprChange)
    }
  }, [boxRef, resync])

  return { resync }
}
