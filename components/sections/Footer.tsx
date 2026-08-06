import { FiArrowUpRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import { Photo } from '../Photo'
import { Reveal } from '../Reveal'
import { AVAILABILITY } from '@/lib/content'
import { portrait } from '@/lib/images'
import { EMAIL, GITHUB_URL, HEADLINE, LINKEDIN_URL, LOCATION, NAME } from '@/lib/site'

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ink/60 focus-visible:ring-offset-4 focus-visible:ring-offset-paper rounded-sm'

export function Footer() {
  const year = new Date().getFullYear()
  const photo = portrait('contact')

  return (
    <footer
      id="contact"
      className="relative scroll-mt-28 border-t border-line/8 px-6 py-24 sm:px-10 sm:py-32"
    >
      <div className="mx-auto max-w-content">
        <div className="grid gap-12 lg:grid-cols-[1fr_16rem] lg:gap-16">
          <div>
            <Reveal>
              <p className="mb-4 text-[0.6875rem] font-medium uppercase tracking-[0.35em] text-ink-subtle">
                10 / Contact
              </p>

              <h2 className="text-balance text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-5xl">
                Let&rsquo;s talk architecture.
              </h2>

              <p className="mt-5 text-base text-ink-muted sm:text-lg">{AVAILABILITY}</p>
            </Reveal>

            <Reveal delay={0.1}>
              <a
                href={`mailto:${EMAIL}`}
                className={`group mt-10 inline-flex items-center gap-3 text-lg text-ink transition-colors duration-300 hover:text-ink-muted sm:text-2xl ${focusRing}`}
              >
                <FiMail aria-hidden className="h-5 w-5 shrink-0 text-ink-subtle" />
                <span className="break-all border-b border-line/25 pb-1 transition-colors duration-300 group-hover:border-line/60">
                  {EMAIL}
                </span>
                <FiArrowUpRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-ink-subtle transition-transform duration-500 ease-weightless motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:translate-x-1"
                />
              </a>
            </Reveal>

            <ul className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <li>
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className={`inline-flex items-center gap-2 text-ink-muted transition-colors duration-300 hover:text-ink ${focusRing}`}
                >
                  <FiLinkedin aria-hidden className="h-4 w-4" />
                  LinkedIn
                </a>
              </li>
              {GITHUB_URL && (
                <li>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`inline-flex items-center gap-2 text-ink-muted transition-colors duration-300 hover:text-ink ${focusRing}`}
                  >
                    <FiGithub aria-hidden className="h-4 w-4" />
                    GitHub
                  </a>
                </li>
              )}
            </ul>
          </div>

          {photo && (
            <Reveal delay={0.15}>
              <Photo
                photo={photo}
                alt={`${NAME}, ${HEADLINE}`}
                sizes="(min-width: 1024px) 16rem, 60vw"
                className="max-w-[16rem] rounded-2xl object-cover"
              />
            </Reveal>
          )}
        </div>

        <dl className="mt-20 grid gap-6 border-t border-line/10 pt-10 text-[0.75rem] sm:grid-cols-3">
          <div>
            <dt className="uppercase tracking-[0.22em] text-ink-subtle">Location</dt>
            <dd className="mt-1.5 text-ink-muted">{LOCATION}</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.22em] text-ink-subtle">Timezone</dt>
            <dd className="mt-1.5 text-ink-muted">Eastern Time (Toronto)</dd>
          </div>
          <div>
            <dt className="uppercase tracking-[0.22em] text-ink-subtle">Built with</dt>
            <dd className="mt-1.5 text-ink-muted">
              Next.js · TypeScript · Canvas · Framer Motion
            </dd>
          </div>
        </dl>

        <p className="mt-10 text-xs text-ink-subtle">
          © {year} {NAME}
        </p>
        {/* Accurate, deliberately: the site sets no cookies and makes no
            third-party requests. The one thing it does persist is the theme. */}
        <p className="mt-2 text-xs text-ink-subtle">
          No analytics, no trackers, no newsletter. The only thing stored on your device is
          whether you prefer the lights on.
        </p>
      </div>
    </footer>
  )
}
