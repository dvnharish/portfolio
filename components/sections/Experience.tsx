import { ExperienceChapter } from './ExperienceChapter'
import { Reveal } from '../Reveal'
import { INTERSTITIAL_ROLE, ROLES } from '@/lib/content'

export function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-28 border-t border-line/8">
      <div className="mx-auto max-w-content px-6 pb-4 pt-24 sm:px-10 sm:pt-32">
        <Reveal>
          <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.35em] text-ink-subtle">
            05 / Experience
          </p>
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">
            Four domains, one discipline.
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
            Each chapter below animates what the platform actually did — payments crossing a
            gateway, a monolith decomposing, a vehicle fleet reporting in, a grid recovering from
            an outage.
          </p>
          <p className="mt-3 max-w-xl text-pretty text-[0.8125rem] leading-relaxed text-ink-subtle">
            Yes, those are real animations rather than screenshots. No, it was not the fastest
            way to write a CV.
          </p>
        </Reveal>
      </div>

      {ROLES.map((role, index) => (
        <ExperienceChapter key={role.company} role={role} ordinal={index + 1} />
      ))}

      <div className="mx-auto max-w-content px-6 pb-24 sm:px-10 sm:pb-32">
        <Reveal>
          <p className="border-l border-line/12 pl-5 text-[0.8125rem] leading-relaxed text-ink-subtle">
            {INTERSTITIAL_ROLE}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
