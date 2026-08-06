'use client'

import { useEffect } from 'react'
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from '@/lib/site'

/**
 * A note for whoever opens devtools.
 *
 * Engineers who inspect a portfolio are disproportionately the ones who end up
 * recommending its author, so this is the cheapest possible place to leave a
 * hiring nudge. Runs once, logs nothing on error paths, and is invisible to
 * everyone else.
 */
export function ConsoleNote() {
  useEffect(() => {
    const heading = 'font-size:13px;font-weight:600;'
    const body = 'font-size:12px;'
    const dim = 'font-size:12px;opacity:0.7;'

    console.log('%cYou opened devtools. Respect.', heading)
    console.log(
      '%cThe scroll is a canvas element scrubbing a decoded image sequence — not a video tag.\n' +
        'Each experience chapter is a hand-written generative scene. No libraries were harmed.',
      body
    )
    console.log(
      `%cIf you are hiring, or just want to argue about service boundaries:\n  ${EMAIL}` +
        `\n  ${LINKEDIN_URL}` +
        (GITHUB_URL ? `\n  ${GITHUB_URL}` : ''),
      dim
    )
  }, [])

  return null
}
