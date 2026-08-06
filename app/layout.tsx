import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConsoleNote } from '@/components/ConsoleNote'
import { Navbar } from '@/components/Navbar'
import { DEFAULT_THEME, THEME_INIT_SCRIPT } from '@/lib/theme'
import {
  DESCRIPTION,
  EMAIL,
  GITHUB_URL,
  HEADLINE,
  LINKEDIN_URL,
  LOCATION,
  NAME,
  SITE_URL,
  TITLE,
} from '@/lib/site'

// next/font self-hosts the files at build time — no runtime request to Google,
// no layout shift from a late swap.
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const PAGE_TITLE = `${NAME} — ${TITLE}`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: PAGE_TITLE,
  description: DESCRIPTION,
  applicationName: PAGE_TITLE,
  authors: [{ name: NAME, url: SITE_URL }],
  creator: NAME,
  keywords: [
    'Software Architect',
    'Backend Engineer',
    'Full-Stack Developer',
    'Cloud-Native Platforms',
    'AWS Certified Solutions Architect',
    'Microservices',
    'Spring Boot',
    'Kubernetes',
    'API Governance',
    'DevSecOps',
    'Event-Driven Architecture',
    'Agentic AI',
    'AI Agents',
    'Multi-Agent Orchestration',
    'Claude',
    'GitHub Copilot',
    NAME,
  ],
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'profile',
    siteName: PAGE_TITLE,
    title: PAGE_TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: 'en_CA',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: `${NAME} — ${HEADLINE}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: DESCRIPTION,
    images: ['/og.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  // Matches --paper per theme, so the mobile browser chrome tracks the page.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'light dark',
  width: 'device-width',
  initialScale: 1,
}

/** schema.org Person — lets search engines resolve the identity, not just the page. */
const personJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: NAME,
  jobTitle: TITLE,
  description: DESCRIPTION,
  url: SITE_URL,
  image: `${SITE_URL}/og.jpg`,
  email: `mailto:${EMAIL}`,
  address: { '@type': 'PostalAddress', addressRegion: 'Ontario', addressCountry: 'CA' },
  homeLocation: { '@type': 'Place', name: LOCATION },
  sameAs: [LINKEDIN_URL, GITHUB_URL].filter((url): url is string => Boolean(url)),
  knowsAbout: [
    'Platform Architecture',
    'Backend Engineering',
    'Microservices',
    'Event-Driven Architecture',
    'API Governance',
    'Secure SDLC',
    'Kubernetes',
    'AWS',
    'Azure',
    'IoT Telemetry',
    'SCADA/DMS Integration',
    'Agentic AI Systems',
    'Multi-Agent Orchestration',
    'AI Agent Harnesses',
  ],
  hasCredential: {
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'certification',
    name: 'AWS Certified Solutions Architect',
  },
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'JNTU Kakinada' },
} as const

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `suppressHydrationWarning`: the inline script below sets `data-theme` on
    // this element before React hydrates, so server and client markup differ
    // here by design.
    <html lang="en" className={inter.variable} data-theme={DEFAULT_THEME} suppressHydrationWarning>
      <head>
        <script
          // Must run before first paint, or a dark-theme visitor gets a white
          // flash on every navigation. Static, author-controlled string.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="bg-paper font-sans text-ink-muted antialiased">
        <a
          href="#about"
          className="skip-link rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper"
        >
          Skip to content
        </a>

        <Navbar />
        {children}
        <ConsoleNote />

        <script
          type="application/ld+json"
          // Static, author-controlled object — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  )
}
