'use client'

import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { lockScroll, unlockScroll } from '@/lib/scroll-lock'

export interface DialogController<T> {
  ref: React.RefObject<HTMLDialogElement>
  /** Payload the dialog is currently open for, or `null` when closed. */
  payload: T | null
  open: (payload: T) => void
  close: () => void
  /** Attach to the dialog's `onClick` to close on backdrop clicks. */
  onBackdropClick: (event: MouseEvent<HTMLDialogElement>) => void
}

/**
 * Native <dialog> controller.
 *
 * Centralised because getting a modal right involves three non-obvious traps,
 * and every dialog on the site would otherwise have to re-solve them:
 *
 *  1. React 18 has no synthetic `onClose` for <dialog> — that arrived in React
 *     19 — so an `onClose` prop silently never fires. Without a native listener
 *     the element closes (Escape, backdrop) while React still thinks it is open,
 *     which strands the payload: the scroll lock never releases and re-opening
 *     the same item does nothing because state has not changed.
 *  2. Page scroll must be locked on the DOCUMENT ELEMENT. `html` is the
 *     scrolling element by default, so `body { overflow: hidden }` is silently a
 *     no-op and the background keeps scrolling behind the modal.
 *  3. `showModal()` cannot be expressed declaratively, so the element has to be
 *     driven from an effect that mirrors state onto it.
 *
 * `owner` is the scroll-lock identity token — pass something stable and unique
 * per dialog.
 */
export function useDialog<T>(owner: string): DialogController<T> {
  const ref = useRef<HTMLDialogElement>(null)
  const [payload, setPayload] = useState<T | null>(null)

  // Mirror state onto the element. showModal() is the only way to get modal
  // semantics (top layer, focus trap, inert background, Escape).
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (payload !== null && !dialog.open) dialog.showModal()
    else if (payload === null && dialog.open) dialog.close()
  }, [payload])

  // See trap 1. `close` also covers Escape, which fires `cancel` then `close`.
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => setPayload(null)
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  useEffect(() => {
    if (payload === null) return
    lockScroll(owner)
    return () => unlockScroll(owner)
  }, [payload, owner])

  const open = useCallback((next: T) => setPayload(next), [])

  // Clears state directly as well as closing the element: the paths we trigger
  // ourselves should not depend on an event round-trip to stay consistent.
  const close = useCallback(() => {
    ref.current?.close()
    setPayload(null)
  }, [])

  const onBackdropClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      // A backdrop click targets the dialog element itself; clicks inside the
      // panel target its children. So this closes on outside-click only.
      if (event.target === ref.current) close()
    },
    [close]
  )

  return { ref, payload, open, close, onBackdropClick }
}
