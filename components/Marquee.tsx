import { MARQUEE_SKILLS } from '@/lib/content'

/**
 * Edge-to-edge skill ticker.
 *
 * The list is rendered twice and the track translated by -50%, so the loop is
 * seamless. `motion-safe:` gates the animation: with reduced motion the same
 * tags simply wrap as a static, fully readable list rather than freezing
 * mid-scroll at an arbitrary offset.
 */
export function Marquee() {
  return (
    <div
      className="relative overflow-hidden border-y border-line/10 py-4"
      // Fade both edges so tags dissolve rather than getting chopped.
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        WebkitMaskImage:
          'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
      }}
    >
      <ul
        aria-label="Core technologies"
        className="flex flex-wrap justify-center gap-x-8 gap-y-2 motion-safe:w-max motion-safe:flex-nowrap motion-safe:animate-marquee"
      >
        {MARQUEE_SKILLS.map((skill) => (
          <MarqueeItem key={skill} label={skill} />
        ))}
        {/* Duplicate: makes the -50% translation loop seamlessly. Hidden from
            assistive tech so the list is not announced twice. */}
        {MARQUEE_SKILLS.map((skill) => (
          <MarqueeItem key={`dup-${skill}`} label={skill} duplicate />
        ))}
      </ul>
    </div>
  )
}

function MarqueeItem({ label, duplicate = false }: { label: string; duplicate?: boolean }) {
  return (
    <li
      aria-hidden={duplicate || undefined}
      className={`shrink-0 text-[0.6875rem] font-medium uppercase tracking-[0.28em] text-ink-subtle ${
        duplicate ? 'hidden motion-safe:block' : ''
      }`}
    >
      {label}
    </li>
  )
}
