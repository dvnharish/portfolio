'use client'

import { useEffect, useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'framer-motion'
import { Photo } from './Photo'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { portrait } from '@/lib/images'
import { HEADLINE, LOCATION, NAME } from '@/lib/site'

/**
 * Total vertical travel of the image inside its frame, in percent.
 *
 * Must stay within the over-scale slack below (the image is 114% tall, anchored
 * at -7%, so there is 7% of headroom each way) or parallax would drag a hard
 * edge into frame.
 */
const PARALLAX_RANGE = 12

/**
 * Full-bleed cinematic portrait band.
 *
 * The image is over-scaled and translated against the scroll so it drifts
 * within a fixed frame — depth without a second asset. The transform is written
 * straight to the node, never through React state.
 *
 * Renders nothing when the `hero` portrait slot is empty.
 */
export function PortraitBand() {
  const photo = portrait('hero')
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const apply = (value: number) => {
    if (!imageRef.current) return
    // Map 0..1 onto +half..-half so the image is centred mid-viewport.
    const shift = (0.5 - value) * PARALLAX_RANGE
    imageRef.current.style.transform = `translate3d(0, ${shift.toFixed(2)}%, 0)`
  }

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (reduced === false) apply(value)
  })

  useEffect(() => {
    if (reduced === false) apply(scrollYProgress.get())
  }, [reduced, scrollYProgress])

  if (!photo) return null

  return (
    <section
      ref={sectionRef}
      aria-label="Portrait"
      className="relative overflow-hidden border-y border-line/10"
    >
      {/* Frame tracks the source's 16:9 aspect: forcing a wide portrait into a
          near-square band would crop so hard that only the subject's chin
          survives. `max-h` keeps it from dominating tall viewports, `min-h`
          keeps it from collapsing on narrow ones. */}
      <div className="relative aspect-[16/9] max-h-[86vh] min-h-[300px] w-full overflow-hidden">
        <div
          ref={imageRef}
          // Over-scaled so parallax travel never exposes an edge.
          className="absolute inset-x-0 -top-[7%] h-[114%] will-change-transform"
        >
          <Photo
            photo={photo}
            alt={`${NAME}, ${HEADLINE}`}
            fill
            sizes="100vw"
            // Bias upward: the head sits above centre in the source frame.
            className="object-cover object-[50%_30%]"
          />
        </div>

        {/* This band is a deliberately dark moment inside a light page, so the
            scrim and copy are FIXED rather than themed. The photograph is dark
            in both themes — `text-ink` would put near-black type on a near-black
            image the instant the page is in light mode. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#07070a] via-[#07070a]/20 to-[#07070a]/45"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(88%_74%_at_50%_42%,transparent_38%,rgba(7,7,10,0.7)_100%)]"
        />

        <div className="absolute inset-x-0 bottom-0 px-6 pb-10 sm:px-10 sm:pb-14">
          <div className="mx-auto max-w-content">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.35em] text-neutral-300">
              {LOCATION}
            </p>
            <p className="mt-3 max-w-2xl text-balance text-xl font-light leading-tight tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
              Fifteen years of shipping systems other people depend on.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
