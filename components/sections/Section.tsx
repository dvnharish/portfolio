import type { ReactNode } from 'react'
import { Reveal } from '../Reveal'
import { ExplainButton } from '../ExplainButton'
import type { Explanation } from '@/lib/content'

interface SectionProps {
  id: string
  /** Small uppercase eyebrow, e.g. "01 / About". */
  eyebrow: string
  heading: string
  /**
   * When present the heading becomes a trigger that opens an explainer dialog.
   * `explanation.title` is rendered as the heading text, so it should match.
   */
  explanation?: Explanation
  children: ReactNode
}

/** Shared shell: consistent rhythm, max width, and heading treatment. */
export function Section({ id, eyebrow, heading, explanation, children }: SectionProps) {
  return (
    <section
      id={id}
      // scroll-mt clears the fixed navbar when jumped to via anchor.
      className="relative scroll-mt-28 border-t border-line/8 px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-content">
        <Reveal as="header" className="mb-12 block sm:mb-16">
          <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.35em] text-ink-subtle">
            {eyebrow}
          </p>
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            {explanation ? <ExplainButton explanation={explanation} id={id} /> : heading}
          </h2>
        </Reveal>
        {children}
      </div>
    </section>
  )
}
