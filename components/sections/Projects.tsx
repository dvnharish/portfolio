import { Section } from './Section'
import { Reveal } from '../Reveal'
import { SpotlightCard } from '../SpotlightCard'
import { TechPillRow } from '../TechPill'
import { PROJECTS } from '@/lib/content'

export function Projects() {
  return (
    <Section id="projects" eyebrow="07 / Projects" heading="Selected case studies.">
      <ul className="grid gap-5 md:grid-cols-2">
        {PROJECTS.map((project, index) => (
          <Reveal
            as="li"
            key={project.name}
            delay={Math.min(index * 0.09, 0.36)}
            className="flex"
          >
            <SpotlightCard className="flex w-full flex-col p-6 sm:p-8">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.25em] text-ink-subtle">
                  {project.org}
                </p>
                <h3 className="mt-3 text-balance text-lg font-medium tracking-[-0.01em] text-ink sm:text-xl">
                  {project.name}
                </h3>

                <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted">
                  {project.summary}
                </p>

                <div className="mt-5 rounded-lg border border-line/10 bg-ink/[0.02] px-4 py-3">
                  <p className="text-[0.6875rem] uppercase tracking-[0.2em] text-ink-subtle">
                    Outcome
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">
                    {project.outcome}
                  </p>
                </div>

                <div className="mt-auto pt-7">
                  <TechPillRow items={project.stack} />
                </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </ul>
    </Section>
  )
}
