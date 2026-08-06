'use client'

import { useRef } from 'react'
import { useInView } from 'framer-motion'
import { useCountUp } from '@/hooks/useCountUp'
import { STATS, type Stat } from '@/lib/content'

/** Headline figures, counting up once they scroll into view. */
export function StatStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-line/10 py-8 lg:grid-cols-4"
    >
      {STATS.map((stat) => (
        <StatCell key={stat.label} stat={stat} active={inView} />
      ))}
    </div>
  )
}

function StatCell({ stat, active }: { stat: Stat; active: boolean }) {
  const value = useCountUp(stat.value, active)

  return (
    <div>
      <p className="text-3xl font-semibold tabular-nums tracking-[-0.03em] text-ink sm:text-4xl">
        {value}
        <span className="text-ink-subtle">{stat.suffix}</span>
      </p>
      <p className="mt-2 text-[0.8125rem] leading-snug text-ink-muted">{stat.label}</p>
      <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-subtle">
        {stat.source}
      </p>
    </div>
  )
}
