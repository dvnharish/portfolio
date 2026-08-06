import { Section } from './Section'
import { Reveal } from '../Reveal'
import { EDUCATION, TIMELINE } from '@/lib/content'

const KIND_LABEL: Record<string, string> = {
  role: 'Role',
  education: 'Education',
  certification: 'Certification',
}

export function Timeline() {
  return (
    <Section id="timeline" eyebrow="09 / Trajectory" heading="Fifteen years, in order.">
      <ol className="relative border-l border-line/14 pl-6 sm:pl-8">
        {TIMELINE.map((entry, index) => (
          <Reveal
            as="li"
            key={`${entry.org}-${entry.period}`}
            delay={Math.min(index * 0.06, 0.3)}
            className="relative block pb-9 last:pb-0"
          >
            <span
              aria-hidden
              className="absolute -left-[1.8125rem] top-[0.45rem] h-[7px] w-[7px] rounded-full bg-ink-subtle ring-4 ring-paper sm:-left-[2.3125rem]"
            />
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink-subtle">
              {entry.period}
            </p>
            <h3 className="mt-2 text-pretty text-base font-medium text-ink sm:text-lg">
              {entry.title}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {entry.org}
              <span className="ml-2 text-[0.625rem] uppercase tracking-[0.2em] text-ink-subtle">
                {KIND_LABEL[entry.kind]}
              </span>
            </p>
          </Reveal>
        ))}
      </ol>

      <Reveal className="mt-14 block border-t border-line/10 pt-10">
        <h3 className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.25em] text-ink-subtle">
          Education &amp; Certification
        </h3>
        <ul className="space-y-2">
          {EDUCATION.map((item) => (
            <li key={item} className="text-sm leading-relaxed text-ink-muted">
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
