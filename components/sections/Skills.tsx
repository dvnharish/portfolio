import { Section } from './Section'
import { Reveal } from '../Reveal'
import { TechPill } from '../TechPill'
import { SKILL_GROUPS } from '@/lib/content'

export function Skills() {
  return (
    <Section id="skills" eyebrow="08 / Capabilities" heading="What I work with.">
      <dl className="grid gap-x-12 gap-y-8 sm:grid-cols-2">
        {SKILL_GROUPS.map((group, index) => (
          <Reveal key={group.label} delay={Math.min(index * 0.05, 0.3)}>
            <dt className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.25em] text-ink-subtle">
              {group.label}
            </dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {group.items.map((item) => (
                  <li key={item}>
                    <TechPill label={item} />
                  </li>
                ))}
              </ul>
            </dd>
          </Reveal>
        ))}
      </dl>
    </Section>
  )
}
