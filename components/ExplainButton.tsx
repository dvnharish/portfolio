'use client'

import { FiInfo } from 'react-icons/fi'
import { Modal } from './Modal'
import { useDialog } from '@/hooks/useDialog'
import type { Explanation } from '@/lib/content'

interface ExplainButtonProps {
  explanation: Explanation
  /** Stable id, so multiple explainers on one page get unique dialog labels. */
  id: string
}

/**
 * Turns a section heading into an explainer trigger.
 *
 * The heading text itself is the button, with an info glyph and a dotted
 * underline so it reads as interactive rather than as decoration a visitor has
 * to discover by hovering.
 */
export function ExplainButton({ explanation, id }: ExplainButtonProps) {
  const dialog = useDialog<true>(`explain-${id}`)
  const titleId = `explain-${id}-title`

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.open(true)}
        className="group inline-flex items-baseline gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ink/60 focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
      >
        <span className="underline decoration-line/25 decoration-dotted underline-offset-[0.3em] transition-colors duration-300 group-hover:decoration-line/60">
          {explanation.title}
        </span>
        <FiInfo
          aria-hidden
          className="h-[0.6em] w-[0.6em] shrink-0 translate-y-[-0.1em] text-ink-subtle transition-colors duration-300 group-hover:text-ink"
        />
        <span className="sr-only">— what this section shows</span>
      </button>

      <Modal
        dialogRef={dialog.ref}
        onBackdropClick={dialog.onBackdropClick}
        onClose={dialog.close}
        labelledBy={titleId}
      >
        {dialog.payload && (
          <>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.28em] text-ink-subtle">
              What this section shows
            </p>

            <h3
              id={titleId}
              className="mt-4 max-w-[calc(100%-3rem)] text-balance text-xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl"
            >
              {explanation.title}
            </h3>

            <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
              {explanation.intro}
            </p>

            <dl className="mt-7 space-y-5 border-t border-line/10 pt-6">
              {explanation.points.map((point) => (
                <div key={point.label} className="border-l-2 border-line/15 pl-4">
                  <dt className="text-sm font-medium text-ink">{point.label}</dt>
                  <dd className="mt-1.5 text-pretty text-sm leading-relaxed text-ink-muted">
                    {point.text}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-7 border-t border-line/10 pt-6 text-sm leading-relaxed text-ink-subtle">
              {explanation.outro}
            </p>
          </>
        )}
      </Modal>
    </>
  )
}
