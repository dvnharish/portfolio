import { Section } from './Section'
import { Photo } from '../Photo'
import { Reveal } from '../Reveal'
import { Marquee } from '../Marquee'
import { StatStrip } from '../StatStrip'
import { ABOUT, AVAILABILITY } from '@/lib/content'
import { portrait } from '@/lib/images'
import { HEADLINE, LOCATION, NAME } from '@/lib/site'

export function About() {
  const photo = portrait('about')

  return (
    <>
      <Marquee />

      <Section id="about" eyebrow="01 / About" heading={HEADLINE}>
        <Reveal className="mb-10 block">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line/14 bg-ink/[0.03] px-3.5 py-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ink-muted">
            <span aria-hidden className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/70 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            {AVAILABILITY}
          </span>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="space-y-6">
            {ABOUT.map((paragraph, index) => (
              <Reveal key={paragraph.slice(0, 40)} delay={index * 0.12}>
                <p className="text-pretty text-base leading-relaxed text-ink-muted sm:text-lg sm:leading-[1.7]">
                  {paragraph}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="space-y-8">
            {photo && (
              <Reveal>
                <Photo
                  photo={photo}
                  alt={`${NAME}, ${HEADLINE}`}
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="rounded-2xl object-cover grayscale-[15%] transition-[filter] duration-700 hover:grayscale-0"
                />
              </Reveal>
            )}

            <dl className="h-fit space-y-5 border-l border-line/12 pl-6 text-sm lg:pl-8">
              <div>
                <dt className="text-[0.6875rem] uppercase tracking-[0.25em] text-ink-subtle">
                  Based in
                </dt>
                <dd className="mt-1.5 text-ink-muted">{LOCATION}</dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] uppercase tracking-[0.25em] text-ink-subtle">
                  Experience
                </dt>
                <dd className="mt-1.5 text-ink-muted">15+ years</dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] uppercase tracking-[0.25em] text-ink-subtle">
                  Focus
                </dt>
                <dd className="mt-1.5 text-ink-muted">
                  Platform architecture, API governance, DevSecOps
                </dd>
              </div>
              <div>
                <dt className="text-[0.6875rem] uppercase tracking-[0.25em] text-ink-subtle">
                  Certification
                </dt>
                <dd className="mt-1.5 text-ink-muted">AWS Certified Solutions Architect</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-16">
          <StatStrip />
        </div>
      </Section>
    </>
  )
}
