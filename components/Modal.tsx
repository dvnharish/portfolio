'use client'

import type { ReactNode, RefObject, MouseEvent } from 'react'
import { FiX } from 'react-icons/fi'

interface ModalProps {
  dialogRef: RefObject<HTMLDialogElement>
  onBackdropClick: (event: MouseEvent<HTMLDialogElement>) => void
  onClose: () => void
  /** Id of the element naming the dialog. Must exist inside `children`. */
  labelledBy: string
  /** Accent as an `R G B` triple string, exposed to children as `--accent`. */
  accent?: string
  children: ReactNode
}

/**
 * Presentational shell for a native <dialog>: panel styling, backdrop, close
 * button. All behaviour lives in `useDialog`.
 *
 * Rendered even when closed so the element is always in the DOM for
 * `showModal()` to act on; the caller conditionally renders the contents.
 */
export function Modal({
  dialogRef,
  onBackdropClick,
  onClose,
  labelledBy,
  accent,
  children,
}: ModalProps) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={labelledBy}
      // No onClose prop: React 18 has no synthetic close event for <dialog>.
      // useDialog attaches a native listener instead.
      onClick={onBackdropClick}
      className="w-[min(100vw-2rem,44rem)] max-h-[85vh] overflow-y-auto rounded-2xl border border-line/12 bg-paper p-0 shadow-lift-hover backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      style={accent ? ({ ['--accent' as string]: accent } as React.CSSProperties) : undefined}
    >
      {children && (
        <div className="relative p-6 sm:p-9">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-subtle outline-none transition-colors duration-300 hover:bg-ink/[0.05] hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/50"
          >
            <FiX aria-hidden className="h-4 w-4" />
          </button>
          {children}
        </div>
      )}
    </dialog>
  )
}
