'use client'

import { useRef, useState } from 'react'
import { Section } from './Section'
import { Reveal } from '../Reveal'
import {
  AGENT_ROLES,
  AI_PRACTICE,
  AUTOMATION_PLATFORMS,
  HARNESS_LEAD,
  PDLC_STAGES,
  USBANK_HARNESSES,
} from '@/lib/content'

/**
 * Agentic engineering practice, as an interactive orchestration board.
 *
 * Deliberately a different pattern from the rest of the page: no cards, no
 * pills. A stage rail, a role selector, and a datasheet-style panel — the
 * content is a pipeline of cooperating roles, so it is presented as one.
 *
 * Implemented as a WAI-ARIA tablist with automatic activation (selection follows
 * focus, since rendering a panel is cheap): roving tabindex, arrow keys wrapping
 * at both ends, Home/End. Keyboard users get the same affordance as pointer
 * users rather than a div that only responds to clicks.
 */
export function AgenticEngineering() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const role = AGENT_ROLES[active] ?? AGENT_ROLES[0]

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = AGENT_ROLES.length - 1
    let next = active

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        next = active === last ? 0 : active + 1
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        next = active === 0 ? last : active - 1
        break
      case 'Home':
        next = 0
        break
      case 'End':
        next = last
        break
      default:
        return
    }

    event.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  if (!role) return null

  return (
    <Section
      id="agents"
      eyebrow="02 / Agentic Engineering"
      heading="I automate the work, not just the deploys."
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_18rem] lg:gap-16">
        <div className="space-y-6">
          {AI_PRACTICE.map((paragraph, index) => (
            <Reveal key={paragraph.slice(0, 40)} delay={index * 0.1}>
              <p className="text-pretty text-base leading-relaxed text-ink-muted sm:text-lg sm:leading-[1.7]">
                {paragraph}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Platforms as a definition list — deliberately not cards. */}
        <Reveal delay={0.2}>
          <dl className="space-y-5 border-l border-line/12 pl-6 text-sm">
            {AUTOMATION_PLATFORMS.map((platform) => (
              <div key={platform.name}>
                <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-ink-subtle">
                  {platform.name}
                </dt>
                <dd className="mt-1.5 text-pretty leading-relaxed text-ink-muted">
                  {platform.what}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {/* ── Harness ledger: shipped work, inside the bank ───────────────── */}
      <Reveal className="mt-16 block">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h3 className="text-lg font-medium tracking-[-0.01em] text-ink sm:text-xl">
            Harnesses in the delivery pipeline
          </h3>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.24em] text-ink-subtle">
            U.S. Bank
          </p>
        </div>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-ink-muted sm:text-base">
          {HARNESS_LEAD}
        </p>
      </Reveal>

      {/* A framed ledger with divided rows — deliberately not cards again. */}
      <Reveal className="mt-7 block">
        <ul className="divide-y divide-line/10 overflow-hidden rounded-2xl border border-line/12">
          {USBANK_HARNESSES.map((harness) => (
            <li
              key={harness.name}
              className="grid gap-x-8 gap-y-2 p-5 transition-colors duration-300 hover:bg-ink/[0.02] sm:p-6 lg:grid-cols-[16rem_1fr]"
            >
              <div>
                <p className="text-sm font-medium text-ink">{harness.name}</p>
                <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-subtle">
                  {harness.surface}
                </p>
              </div>
              <div>
                <p className="text-pretty text-[0.8125rem] leading-relaxed text-ink-muted">
                  {harness.what}
                </p>
                <p className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-line/[0.09] bg-ink/[0.02] px-2.5 py-0.5 font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-ink-subtle">
                  {harness.platform}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-subtle">
        The Product Development Life Cycle below is where this goes next: the same idea, but the
        roles themselves become the agents.
      </p>

      {/* ── The orchestration board ─────────────────────────────────────── */}
      <Reveal className="mt-16 block">
        <div
          className="relative overflow-hidden rounded-2xl border border-line/12 bg-surface/50"
          // Blueprint grid: a drafting surface, distinct from every other
          // section's flat background.
          style={{
            backgroundImage:
              'linear-gradient(rgb(var(--line) / 0.045) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--line) / 0.045) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        >
          <div className="border-b border-line/10 px-5 py-4 sm:px-7">
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.28em] text-ink-subtle">
              Product Development Life Cycle · agent per role
            </p>

            {/* Stage rail */}
            <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
              {PDLC_STAGES.map((stage, index) => {
                const current = stage === role.stage
                return (
                  <li key={stage} className="flex items-center gap-2">
                    <span
                      aria-current={current ? 'step' : undefined}
                      className={`rounded-full border px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.16em] transition-colors duration-300 ${
                        current
                          ? 'border-line/25 bg-ink text-paper'
                          : 'border-line/12 text-ink-subtle'
                      }`}
                    >
                      {stage}
                    </span>
                    {index < PDLC_STAGES.length - 1 && (
                      <span aria-hidden className="h-px w-4 bg-line/15 sm:w-6" />
                    )}
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="grid md:grid-cols-[15rem_1fr]">
            {/* Role selector */}
            <div
              role="tablist"
              aria-label="Product development roles"
              aria-orientation="vertical"
              onKeyDown={handleKeyDown}
              className="flex overflow-x-auto border-b border-line/10 md:flex-col md:overflow-visible md:border-b-0 md:border-r"
            >
              {AGENT_ROLES.map((item, index) => {
                const selected = index === active
                return (
                  <button
                    key={item.name}
                    ref={(node) => {
                      tabRefs.current[index] = node
                    }}
                    type="button"
                    role="tab"
                    id={`agent-tab-${index}`}
                    aria-selected={selected}
                    aria-controls="agent-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(index)}
                    className={`relative shrink-0 px-5 py-3.5 text-left outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/50 md:px-6 ${
                      selected ? 'bg-ink/[0.04]' : 'hover:bg-ink/[0.02]'
                    }`}
                  >
                    {/* Active marker: left edge on desktop, underline on mobile. */}
                    <span
                      aria-hidden
                      className={`absolute transition-opacity duration-300 ${
                        selected ? 'opacity-100' : 'opacity-0'
                      } inset-x-5 bottom-0 h-px bg-ink md:inset-x-auto md:bottom-auto md:left-0 md:top-2 md:h-[calc(100%-1rem)] md:w-px`}
                    />
                    <span
                      className={`block text-sm font-medium transition-colors duration-300 ${
                        selected ? 'text-ink' : 'text-ink-muted'
                      }`}
                    >
                      {item.name}
                    </span>
                    <span className="mt-0.5 block font-mono text-[0.5625rem] uppercase tracking-[0.2em] text-ink-subtle">
                      {item.stage}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Datasheet panel */}
            <div
              role="tabpanel"
              id="agent-panel"
              aria-labelledby={`agent-tab-${active}`}
              tabIndex={0}
              className="px-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ink/40 sm:px-7 sm:py-7"
            >
              <p className="max-w-2xl text-pretty text-[0.9375rem] leading-relaxed text-ink">
                {role.persona}
              </p>

              <div className="mt-7 grid gap-7 sm:grid-cols-2">
                <div>
                  <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.24em] text-ink-subtle">
                    Skills composed
                  </p>
                  <ol className="space-y-1.5">
                    {role.skills.map((skill, index) => (
                      <li
                        key={skill}
                        className="flex gap-3 text-[0.8125rem] leading-relaxed text-ink-muted"
                      >
                        <span
                          aria-hidden
                          className="shrink-0 font-mono text-[0.6875rem] tabular-nums text-ink-subtle"
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {skill}
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.24em] text-ink-subtle">
                    Hands off
                  </p>
                  <ul className="space-y-1.5">
                    {role.outputs.map((output) => (
                      <li
                        key={output}
                        className="flex gap-3 text-[0.8125rem] leading-relaxed text-ink-muted"
                      >
                        <span aria-hidden className="shrink-0 font-mono text-ink-subtle">
                          →
                        </span>
                        {output}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-8 border-t border-line/10 pt-4 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-ink-subtle">
                Composed from persona + rules + skills
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <p className="mt-4 text-[0.75rem] leading-relaxed text-ink-subtle">
        Arrow keys move between roles. Six of them, one pipeline, and not one has ever asked to
        move the standup.
      </p>
    </Section>
  )
}
