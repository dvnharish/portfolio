'use client'

import { useEffect, useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { SceneCanvas } from '../SceneCanvas'
import { Reveal } from '../Reveal'
import { TechPillRow } from '../TechPill'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { useTheme } from '@/hooks/useTheme'
import { sceneFor } from '@/lib/scenes'
import type { Role } from '@/lib/content'

interface ExperienceChapterProps {
  role: Role
  /** 1-based position, rendered as the chapter number. */
  ordinal: number
}

/**
 * One role, as a chapter.
 *
 * From `md` up, both the scene and the copy are pinned for the chapter's full
 * scroll length: the visitor reads the complete role while the scene behind it
 * animates from start to finish. Below `md` nothing is pinned — the scene
 * becomes a fixed backdrop for the chapter and the copy flows normally, because
 * a tall card cannot be pinned inside a short viewport without clipping.
 */
export function ExperienceChapter({ role, ordinal }: ExperienceChapterProps) {
  // Resolved here rather than passed in: a Scene carries a render function, and
  // functions cannot cross the server→client component boundary.
  const scene = sceneFor(role.company)
  const trackRef = useRef<HTMLElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  // With motion reduced the scene is a single still, so reserving 200vh of
  // pinned scroll would mean two screens of scrolling past something that never
  // changes. Collapse the chapter to its content height instead.
  const reduced = usePrefersReducedMotion() === true
  const { theme } = useTheme()

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Chapter progress bar. Mutated directly — this fires on every scroll tick.
  const applyProgress = (value: number) => {
    if (progressRef.current) {
      progressRef.current.style.transform = `scaleX(${Math.max(0, Math.min(1, value)).toFixed(4)})`
    }
  }
  useMotionValueEvent(scrollYProgress, 'change', applyProgress)
  useEffect(() => {
    applyProgress(scrollYProgress.get())
  }, [scrollYProgress])

  // The scene accent has a distinct value per theme — a colour that carries on
  // near-black is too pale to read on paper, and vice versa.
  const accentRgb = scene?.accent[theme ?? 'light']
  const accent = accentRgb
    ? `${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]}`
    : 'var(--ink-subtle)'

  return (
    <section
      ref={trackRef}
      // `relative` is load-bearing: framer's useScroll resolves the target's
      // offset through its positioned ancestor chain.
      className={`relative ${reduced ? '' : 'md:tall:h-[200vh]'}`}
      style={{ ['--accent' as string]: accent }}
      aria-labelledby={`chapter-${ordinal}`}
    >
      <div
        className={
          reduced
            ? 'relative'
            : 'md:tall:sticky md:tall:top-0 md:tall:flex md:tall:h-screen md:tall:items-center'
        }
      >
        {scene && <SceneCanvas scene={scene} trackRef={trackRef} />}

        <div
          className={`relative z-10 mx-auto w-full max-w-content px-6 py-24 sm:px-10 ${
            reduced ? '' : 'md:tall:py-0'
          }`}
        >
          <Reveal className="block w-full md:max-w-2xl">
            {/* Opaque-ish panel: the scene animates directly behind this copy,
                so the backdrop has to guarantee contrast in either theme. */}
            <article className="rounded-2xl border border-line/12 bg-paper/90 p-6 shadow-lift-hover backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="h-px w-8 shrink-0"
                  style={{ backgroundColor: 'rgb(var(--accent))' }}
                />
                <span
                  className="font-mono text-[0.6875rem] uppercase tracking-[0.3em]"
                  style={{ color: 'rgb(var(--accent))' }}
                >
                  Ch. {String(ordinal).padStart(2, '0')}
                </span>
              </div>

              <h3
                id={`chapter-${ordinal}`}
                className="mt-4 text-balance text-xl font-semibold tracking-[-0.02em] text-ink sm:text-3xl"
              >
                {role.company}
              </h3>
              <p className="mt-1.5 text-base text-ink sm:text-lg">{role.title}</p>
              <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-wider text-ink-subtle">
                {role.period} · {role.location}
              </p>

              {scene && (
                <p
                  className="mt-5 border-l-2 pl-4 text-[0.8125rem] italic leading-relaxed text-ink-muted"
                  style={{ borderColor: `rgb(${accent} / 0.5)` }}
                >
                  {scene.caption}
                </p>
              )}

              <ul className="mt-6 space-y-2.5">
                {role.bullets.map((bullet, index) => (
                  <li key={bullet.slice(0, 40)}>
                    <Reveal delay={Math.min(index * 0.05, 0.3)}>
                      <span className="relative block pl-5 text-[0.8125rem] leading-[1.6] text-ink-muted sm:text-sm">
                        <span
                          aria-hidden
                          className="absolute left-0 top-[0.55em] h-1 w-1 rounded-full"
                          style={{ backgroundColor: 'rgb(var(--accent))' }}
                        />
                        {bullet}
                      </span>
                    </Reveal>
                  </li>
                ))}
              </ul>

              <div className="mt-7">
                <TechPillRow items={role.stack} />
              </div>

              {/* Chapter progress — how far through this scene's story we are. */}
              <div aria-hidden className="mt-7 h-px w-full overflow-hidden bg-line/12">
                <div
                  ref={progressRef}
                  className="h-full w-full origin-left"
                  style={{ backgroundColor: 'rgb(var(--accent))', transform: 'scaleX(0)' }}
                />
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
