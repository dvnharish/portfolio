'use client'

import { useEffect, useRef, useState } from 'react'
import { frameSrc } from '@/lib/sequence'

/**
 * Simultaneous in-flight frame requests.
 *
 * Firing all ~89 at once fragments bandwidth so every frame arrives late and
 * the first paintable frame is no earlier than the last. A bounded pool that
 * walks the list in order gets frame 0 decoded almost immediately, keeps the
 * progress bar honest and monotonic, and caps the waste when a pass is aborted
 * (React StrictMode remounts, or a viewport crossing the mobile breakpoint).
 */
const CONCURRENCY = 8

/**
 * Grace period granted to `decode()` after the image has finished loading.
 *
 * `decode()` is the right signal — it means the bitmap is ready to paint without
 * stalling the main thread. But it is only *specified* to resolve when the image
 * can be rendered, and a throttled or background tab may never decode at all, so
 * awaiting it alone deadlocks every worker in the pool and the sequence never
 * completes. Racing it against `load` + this grace keeps the decode guarantee in
 * the normal case and guarantees forward progress in the pathological one.
 */
const DECODE_GRACE_MS = 150

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export interface ImageSequenceState {
  /** Decoded bitmaps, index-aligned with the `frames` argument. Holes until decoded. */
  images: readonly (HTMLImageElement | undefined)[]
  /** Frames that have finished decoding (or hard-failed). Drives real progress. */
  settled: number
  total: number
  /** Every frame has settled — safe to scrub with zero flicker. */
  ready: boolean
  /** Frames that failed to load. Non-fatal; the canvas holds the last good frame. */
  failed: number
}

/**
 * Preloads and decodes an entire frame list before scrubbing is allowed.
 *
 * Uses `HTMLImageElement.decode()` where available so progress reflects real
 * decode completion rather than just bytes-in — a frame that has loaded but not
 * decoded still costs a main-thread stall on first draw, which is exactly the
 * flicker this preload exists to prevent.
 */
export function useImageSequence(frames: readonly string[], enabled: boolean): ImageSequenceState {
  const [settled, setSettled] = useState(0)
  const [failed, setFailed] = useState(0)
  const [ready, setReady] = useState(false)
  const imagesRef = useRef<(HTMLImageElement | undefined)[]>([])

  // Identity of the work unit: re-run only when the actual frame list changes.
  const key = frames.join('|')
  const total = key.length > 0 ? key.split('|').length : 0

  useEffect(() => {
    if (!enabled) return

    const list = key.length > 0 ? key.split('|') : []
    imagesRef.current = new Array<HTMLImageElement | undefined>(list.length)
    setSettled(0)
    setFailed(0)
    setReady(list.length === 0)
    if (list.length === 0) return

    let cancelled = false
    let done = 0

    /** Load one frame, resolving (never rejecting) once it can be drawn or not. */
    const loadOne = async (index: number, name: string): Promise<void> => {
      const image = new Image()
      image.decoding = 'async'
      image.src = frameSrc(name)

      const usable = () => image.complete && image.naturalWidth > 0

      /** Resolves on load OR error — "the network is done with this image". */
      const settledOnNetwork = usable()
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            image.onload = () => resolve()
            image.onerror = () => resolve()
          })

      // Rejection is not failure here: several engines reject decode() for
      // perfectly good images. Either way we fall through to the network signal.
      const decoded = image.decode().then(
        () => undefined,
        () => undefined
      )

      await Promise.race([decoded, settledOnNetwork.then(() => delay(DECODE_GRACE_MS))])

      if (cancelled) return

      if (usable()) {
        imagesRef.current[index] = image
      } else {
        setFailed((n) => n + 1)
      }

      done += 1
      setSettled(done)
      if (done === list.length) setReady(true)
    }

    // Worker pool: CONCURRENCY walkers pulling from a shared cursor, so frames
    // are requested in order without ever exceeding the connection budget.
    let cursor = 0
    const worker = async (): Promise<void> => {
      while (!cancelled) {
        const index = cursor++
        if (index >= list.length) return
        const name = list[index]
        if (name === undefined) return
        await loadOne(index, name)
      }
    }

    void Promise.all(Array.from({ length: Math.min(CONCURRENCY, list.length) }, worker))

    return () => {
      cancelled = true
    }
  }, [key, enabled])

  return { images: imagesRef.current, settled, total, ready, failed }
}
