import type { Metadata } from 'next'
import { FiArrowLeft } from 'react-icons/fi'
import { NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: `404 — ${NAME}`,
  description: 'That page does not exist.',
  robots: { index: false, follow: true },
}

/**
 * Custom 404. Static export renders this to out/404.html, which
 * deploy/.htaccess wires up via `ErrorDocument 404 /404.html`.
 */
export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center px-6 sm:px-10">
      <div className="mx-auto w-full max-w-content">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.35em] text-ink-subtle">
          Error · 404
        </p>

        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-6xl">
          This route was never in the contract.
        </h1>

        <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
          The page you asked for does not exist. I would blame a stale cache, but I wrote the
          cache headers on this site myself, so that excuse is unavailable.
        </p>

        <a
          href="/"
          className="group mt-10 inline-flex items-center gap-3 text-base text-ink outline-none transition-colors duration-300 hover:text-ink-muted focus-visible:ring-2 focus-visible:ring-ink/60 focus-visible:ring-offset-4 focus-visible:ring-offset-paper sm:text-lg"
        >
          <FiArrowLeft
            aria-hidden
            className="h-4 w-4 shrink-0 text-ink-subtle transition-transform duration-500 ease-weightless motion-safe:group-hover:-translate-x-1"
          />
          <span className="border-b border-line/25 pb-1 transition-colors duration-300 group-hover:border-line/60">
            Back to something that resolves
          </span>
        </a>
      </div>
    </main>
  )
}
