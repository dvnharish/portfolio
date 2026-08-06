/**
 * Single source of truth for identity-level constants that appear in more than
 * one place (metadata, JSON-LD, navbar, footer).
 */

/**
 * Absolute origin of the deployed site. Overridable via NEXT_PUBLIC_SITE_URL
 * so preview deploys can self-canonicalise.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://harishduddupudi.com'
).replace(/\/$/, '')

export const NAME = 'Harish Duddupudi'
export const TITLE = 'Software Architect'
/**
 * Positioning line. Widened from "Cloud-Native Platforms" to name the backend
 * and full-stack depth explicitly — revert here if you want the narrower
 * architect-only framing back.
 */
export const HEADLINE = 'Software Architect · Backend & Cloud-Native Platforms'
export const LOCATION = 'Ontario, Canada'
export const EMAIL = 'harishworks.ca@gmail.com'
export const LINKEDIN_URL = 'https://linkedin.com/in/dvnharish'

/**
 * Profile-level GitHub link used by the navbar and footer. Derived from the
 * repo URL provided (github.com/dvnharish/portfolio.git) — the profile is
 * linked rather than that single repo so the social link is not a dead end.
 */
export const GITHUB_URL: string | null = 'https://github.com/dvnharish'

/** Repository this site deploys from. */
export const REPO_URL = 'https://github.com/dvnharish/portfolio'

export const DESCRIPTION =
  'AWS Certified Solutions Architect and backend engineer with 15+ years delivering scalable, ' +
  'secure, cloud-native platforms across banking, life sciences, industrial IoT and utilities. ' +
  'Platform architecture, API governance, secure SDLC — and agentic AI systems built on Claude ' +
  'and GitHub Copilot that automate the product development life cycle.'
