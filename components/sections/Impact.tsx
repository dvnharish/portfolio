import { Section } from './Section'
import { Reveal } from '../Reveal'
import { IMPACT } from '@/lib/content'

export function Impact() {
  return (
    <Section id="impact" eyebrow="06 / Impact" heading="Measured outcomes.">
      <ul className="grid gap-px overflow-hidden rounded-2xl border border-line/10 bg-ink/[0.06] sm:grid-cols-2 lg:grid-cols-4">
        {IMPACT.map((metric, index) => (
          <Reveal
            as="li"
            key={metric.what}
            delay={Math.min(index * 0.05, 0.3)}
            className="bg-paper p-6"
          >
            <p className="text-balance text-2xl font-semibold tracking-[-0.03em] text-ink">
              {metric.figure}
            </p>
            <p className="mt-3 text-pretty text-[0.8125rem] leading-snug text-ink-muted">
              {metric.what}
            </p>
            <p className="mt-3 text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
              {metric.org}
            </p>
          </Reveal>
        ))}
      </ul>

      <p className="mt-6 text-[0.75rem] leading-relaxed text-ink-subtle">
        Every figure above is drawn from the role it is attributed to. None of them were rounded
        up in their own favour.
      </p>
    </Section>
  )
}
