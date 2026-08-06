'use client'

import { forwardRef, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useMotionValue, useMotionValueEvent } from 'framer-motion'
import { useHero, type HeroTone } from './HeroContext'
import { BLOCK_TIMINGS, blockStyleAt } from '@/lib/overlay-timing'
import { NAME, TITLE } from '@/lib/site'

const STATEMENT_ONE = 'I architect platforms that carry millions of transactions.'
const STATEMENT_TWO = 'Cloud-native systems, and the teams that build them.'

/**
 * Scroll-driven hero copy.
 *
 * Deliberately does NOT use `useTransform`: motion values feeding React render
 * output are a hydration hazard and force a reconcile on every scroll tick.
 * Each block gets a ref and its `opacity`/`transform` are mutated directly
 * inside `useMotionValueEvent`, so scrubbing never re-renders React at all.
 *
 * With no scroll progress in context (reduced motion, or no sequence) the same
 * copy renders as ordinary stacked, fully-visible content.
 */
export function Overlay() {
  const { progress, tone } = useHero()
  const isStatic = progress === null

  // Hooks must run unconditionally; this stand-in never emits when static.
  const idle = useMotionValue(0)
  const source = progress ?? idle

  const blockRefs = useRef<(HTMLDivElement | null)[]>([])

  const setBlockRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      blockRefs.current[index] = node
    },
    []
  )

  const apply = useCallback((value: number) => {
    for (let i = 0; i < BLOCK_TIMINGS.length; i++) {
      const node = blockRefs.current[i]
      const timing = BLOCK_TIMINGS[i]
      if (!node || !timing) continue

      const { opacity, translateVh, scale, visible } = blockStyleAt(timing, value)

      node.style.opacity = visible ? opacity.toFixed(3) : '0'
      node.style.transform = `translate3d(0, ${translateVh.toFixed(2)}vh, 0) scale(${scale.toFixed(4)})`
      node.style.visibility = visible ? 'visible' : 'hidden'
      node.style.pointerEvents = visible ? 'auto' : 'none'
    }
  }, [])

  useMotionValueEvent(source, 'change', apply)

  // Seed styles on mount so nothing flashes at full opacity before first scroll.
  useEffect(() => {
    if (isStatic) return
    apply(source.get())
  }, [isStatic, source, apply])

  if (isStatic) {
    return (
      <div className="relative z-10 mx-auto flex min-h-screen max-w-content flex-col justify-center gap-14 px-6 py-28 sm:gap-20 sm:px-10">
        <HeroCopy tone={tone} />
        <StatementCopy align="left" tone={tone}>
          {STATEMENT_ONE}
        </StatementCopy>
        <StatementCopy align="right" tone={tone}>
          {STATEMENT_TWO}
        </StatementCopy>
      </div>
    )
  }

  return (
    <>
      <Block ref={setBlockRef(0)} align="center">
        <HeroCopy tone={tone} />
      </Block>

      <Block ref={setBlockRef(1)} align="left">
        <StatementCopy align="left" tone={tone}>
          {STATEMENT_ONE}
        </StatementCopy>
      </Block>

      <Block ref={setBlockRef(2)} align="right">
        <StatementCopy align="right" tone={tone}>
          {STATEMENT_TWO}
        </StatementCopy>
      </Block>
    </>
  )
}

const ALIGNMENT = {
  left: 'items-start text-left',
  center: 'items-center text-center',
  right: 'items-end text-right',
} as const

type Align = keyof typeof ALIGNMENT

const Block = forwardRef<HTMLDivElement, { align: Align; children: ReactNode }>(
  function Block({ align, children }, ref) {
    return (
      <div
        ref={ref}
        style={{ opacity: 0, visibility: 'hidden', willChange: 'opacity, transform' }}
        className={`absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24 ${ALIGNMENT[align]}`}
      >
        {children}
      </div>
    )
  }
)

/** Text colours per artwork tone. Both sides clear WCAG AA over their scrim. */
const TONE = {
  onDark: { title: 'text-white', body: 'text-neutral-200', scrim: '6,7,10' },
  onLight: { title: 'text-[#101010]', body: 'text-[#2b2b28]', scrim: '250,249,247' },
} as const satisfies Record<HeroTone, { title: string; body: string; scrim: string }>

/**
 * Local radial scrim. The canvas grade already softens the frame, but the
 * sequence is arbitrary artwork — this guarantees the copy clears WCAG AA
 * (>= 4.5:1) over any frame rather than hoping the artwork cooperates.
 */
function Scrim({ align, tone }: { align: Align; tone: HeroTone }) {
  const origin = align === 'left' ? '20% 50%' : align === 'right' ? '80% 50%' : '50% 50%'
  const rgb = TONE[tone].scrim
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute -inset-x-8 -inset-y-16 -z-10"
      style={{
        background: `radial-gradient(58% 50% at ${origin}, rgba(${rgb},0.88) 0%, rgba(${rgb},0.6) 45%, rgba(${rgb},0) 78%)`,
      }}
    />
  )
}

function HeroCopy({ tone }: { tone: HeroTone }) {
  const t = TONE[tone]
  return (
    <div className="relative mx-auto max-w-4xl">
      <Scrim align="center" tone={tone} />
      <h1
        className={`text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-6xl lg:text-7xl ${t.title}`}
      >
        {NAME}.
      </h1>
      <p
        className={`mt-3 text-lg font-light tracking-[-0.01em] sm:mt-5 sm:text-2xl lg:text-3xl ${t.body}`}
      >
        {TITLE}.
      </p>
    </div>
  )
}

function StatementCopy({
  align,
  tone,
  children,
}: {
  align: Align
  tone: HeroTone
  children: ReactNode
}) {
  const t = TONE[tone]
  return (
    <div className={`relative max-w-2xl ${align === 'right' ? 'ml-auto' : ''}`}>
      <Scrim align={align} tone={tone} />
      <p
        className={`text-pretty text-2xl font-light leading-[1.22] tracking-[-0.02em] sm:text-4xl lg:text-5xl ${t.title}`}
      >
        {children}
      </p>
    </div>
  )
}
