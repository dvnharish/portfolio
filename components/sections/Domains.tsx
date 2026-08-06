'use client'

import { FiArrowRight, FiPlus } from 'react-icons/fi'
import { Section } from './Section'
import { Modal } from '../Modal'
import { Reveal } from '../Reveal'
import { SpotlightCard } from '../SpotlightCard'
import { TechPillRow } from '../TechPill'
import { useDialog } from '@/hooks/useDialog'
import { useTheme } from '@/hooks/useTheme'
import { DOMAINS, DOMAINS_EXPLANATION, projectFor, roleFor } from '@/lib/content'
import { sceneFor } from '@/lib/scenes'

/**
 * Industry domains, each opening a detail dialog.
 *
 * Built on the native <dialog> element rather than a hand-rolled overlay, so the
 * focus trap, Escape handling, background inertness and focus restoration to the
 * triggering card all come from the platform. Re-implementing those correctly is
 * a surprising amount of code to get subtly wrong.
 *
 * One dialog instance is reused for all four cards — four mounted dialogs would
 * put four copies of the same markup in the DOM for no benefit.
 */
export function Domains() {
  // Payload is the domain index; all the <dialog> mechanics live in the hook.
  const dialog = useDialog<number>('domain-dialog')
  const { theme } = useTheme()

  const active = dialog.payload
  const domain = active === null ? undefined : DOMAINS[active]
  const role = domain ? roleFor(domain.company) : undefined
  const project = domain ? projectFor(domain.project) : undefined

  const accentRgb = domain ? sceneFor(domain.company)?.accent[theme ?? 'light'] : undefined
  const accent = accentRgb ? `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}` : 'var(--ink-subtle)'

  return (
    <Section
      id="domains"
      eyebrow="03 / Domains"
      heading="Where these systems run."
      explanation={DOMAINS_EXPLANATION}
    >
      <Reveal className="mb-8 block">
        <p className="max-w-xl text-pretty text-base leading-relaxed text-ink-muted">
          Four industries, each with its own failure modes. Open one for the role, the case study
          and what it returned.
        </p>
      </Reveal>

      <ul className="grid gap-5 sm:grid-cols-2">
        {DOMAINS.map((item, index) => (
          <Reveal as="li" key={item.name} delay={Math.min(index * 0.08, 0.32)} className="flex">
            <SpotlightCard className="flex w-full flex-col p-6 sm:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-base font-medium tracking-[-0.01em] text-ink sm:text-lg">
                  {item.name}
                </h3>
                <p className="shrink-0 font-mono text-[0.625rem] uppercase tracking-wider text-ink-subtle">
                  {item.years}
                </p>
              </div>
              <p className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.22em] text-ink-subtle">
                {item.org}
              </p>
              <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted">{item.what}</p>

              <span className="mt-6 inline-flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
                <FiPlus
                  aria-hidden
                  className="h-3 w-3 transition-transform duration-500 ease-weightless group-hover:rotate-90"
                />
                Detail
              </span>

              {/* Stretched trigger: keeps the whole card clickable while the
                  accessible name stays on a real button. Pointer events still
                  bubble to the card, so spotlight tracking is unaffected. */}
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => dialog.open(index)}
                className="absolute inset-0 z-10 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/50"
              >
                <span className="sr-only">{item.name} — open detail</span>
              </button>
            </SpotlightCard>
          </Reveal>
        ))}
      </ul>

      <Modal
        dialogRef={dialog.ref}
        onBackdropClick={dialog.onBackdropClick}
        onClose={dialog.close}
        labelledBy="domain-dialog-title"
        accent={accent}
      >
        {domain && (
          <>
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="h-px w-8 shrink-0"
                style={{ backgroundColor: 'rgb(var(--accent))' }}
              />
              <span
                className="font-mono text-[0.625rem] uppercase tracking-[0.28em]"
                style={{ color: 'rgb(var(--accent))' }}
              >
                {domain.org} · {domain.years}
              </span>
            </div>

            <h3
              id="domain-dialog-title"
              className="mt-4 max-w-[calc(100%-3rem)] text-balance text-xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl"
            >
              {domain.name}
            </h3>

            <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
              {domain.what}
            </p>

            {role && (
              <dl className="mt-7 grid gap-x-8 gap-y-4 border-t border-line/10 pt-6 sm:grid-cols-2">
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
                    Role
                  </dt>
                  <dd className="mt-1.5 text-sm text-ink">{role.title}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
                    Based
                  </dt>
                  <dd className="mt-1.5 text-sm text-ink-muted">{role.location}</dd>
                </div>
              </dl>
            )}

            {project && (
              <div className="mt-7 border-t border-line/10 pt-6">
                <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
                  Case study
                </p>
                <p className="mt-2 text-sm font-medium text-ink sm:text-base">{project.name}</p>
                <p className="mt-3 text-pretty text-sm leading-relaxed text-ink-muted">
                  {project.summary}
                </p>

                <div
                  className="mt-5 border-l-2 pl-4"
                  style={{ borderColor: 'rgb(var(--accent) / 0.5)' }}
                >
                  <p className="font-mono text-[0.625rem] uppercase tracking-[0.22em] text-ink-subtle">
                    Outcome
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink">{project.outcome}</p>
                </div>

                <div className="mt-6">
                  <TechPillRow items={project.stack} />
                </div>
              </div>
            )}

            <a
              href="#experience"
              onClick={dialog.close}
              className="group mt-8 inline-flex items-center gap-2.5 border-t border-line/10 pt-6 text-sm text-ink outline-none transition-colors duration-300 hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-ink/50"
            >
              See the animated chapter
              <FiArrowRight
                aria-hidden
                className="h-4 w-4 text-ink-subtle transition-transform duration-500 ease-weightless motion-safe:group-hover:translate-x-1"
              />
            </a>
          </>
        )}
      </Modal>
    </Section>
  )
}
