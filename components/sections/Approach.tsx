import { Section } from './Section'
import { Reveal } from '../Reveal'
import { APPROACH } from '@/lib/content'

export function Approach() {
  return (
    <Section id="approach" eyebrow="04 / Approach" heading="How the work gets done.">
      <ol className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {APPROACH.map((step, index) => (
          <Reveal as="li" key={step.title} delay={Math.min(index * 0.06, 0.3)}>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.6875rem] tabular-nums text-ink-subtle">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span aria-hidden className="h-px flex-1 bg-line/12" />
            </div>
            <h3 className="mt-4 text-base font-medium tracking-[-0.01em] text-ink">
              {step.title}
            </h3>
            <p className="mt-2.5 text-pretty text-sm leading-relaxed text-ink-muted">
              {step.detail}
            </p>
            <p className="mt-3 text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
              {step.evidence}
            </p>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
