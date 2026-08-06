'use client'

import { FiGithub, FiLinkedin } from 'react-icons/fi'
import { ThemeToggle } from './ThemeToggle'
import { GITHUB_URL, LINKEDIN_URL } from '@/lib/site'

const SECTIONS = [
  { href: '#about', label: 'About' },
  { href: '#agents', label: 'Agents' },
  { href: '#experience', label: 'Experience' },
  { href: '#impact', label: 'Impact' },
  { href: '#projects', label: 'Projects' },
] as const

const focusRing =
  'outline-none focus-visible:ring-2 focus-visible:ring-ink/60 focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

const iconLink = `flex h-8 w-8 items-center justify-center rounded-full text-ink-subtle transition-colors duration-300 hover:text-ink ${focusRing}`

/** Floating frosted pill navigation. */
export function Navbar() {
  return (
    <header className="pointer-events-none fixed left-1/2 top-6 z-50 -translate-x-1/2">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-line/10 bg-paper/70 px-2 py-1.5 shadow-lift backdrop-blur-xl"
      >
        <ul className="flex items-center">
          {SECTIONS.map((section) => (
            <li key={section.href}>
              <a
                href={section.href}
                className={`rounded-full px-3 py-1.5 text-[0.8125rem] font-medium text-ink-muted transition-colors duration-300 hover:text-ink ${focusRing}`}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>

        <span aria-hidden className="mx-1 h-4 w-px bg-line/15" />

        <ul className="flex items-center">
          {GITHUB_URL && (
            <li>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer noopener"
                title="GitHub"
                className={iconLink}
              >
                <FiGithub aria-hidden className="h-[0.9375rem] w-[0.9375rem]" />
                <span className="sr-only">GitHub profile</span>
              </a>
            </li>
          )}
          <li>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer noopener"
              title="LinkedIn"
              className={iconLink}
            >
              <FiLinkedin aria-hidden className="h-[0.9375rem] w-[0.9375rem]" />
              <span className="sr-only">LinkedIn profile</span>
            </a>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  )
}
