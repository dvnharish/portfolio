import type { ReactNode } from 'react'
import {
  FaAws,
  FaDocker,
  FaJava,
  FaPython,
  FaAngular,
  FaReact,
  FaDatabase,
  FaLock,
  FaCloud,
  FaCogs,
  FaMicrochip,
  FaStream,
} from 'react-icons/fa'
import { SiKubernetes, SiSpringboot, SiTypescript, SiJenkins, SiGitlab } from 'react-icons/si'

/**
 * Icon lookup for technology names. Matching is substring-based and
 * case-insensitive, longest key first, so "Spring Boot" and "Spring Security"
 * both resolve sensibly. Unmatched names simply render without an icon.
 */
const ICONS: ReadonlyArray<readonly [string, ReactNode]> = [
  ['spring boot', <SiSpringboot key="i" />],
  ['spring', <SiSpringboot key="i" />],
  ['kubernetes', <SiKubernetes key="i" />],
  ['rancher', <SiKubernetes key="i" />],
  ['typescript', <SiTypescript key="i" />],
  ['jenkins', <SiJenkins key="i" />],
  ['gitlab', <SiGitlab key="i" />],
  ['docker', <FaDocker key="i" />],
  ['java', <FaJava key="i" />],
  ['python', <FaPython key="i" />],
  ['angular', <FaAngular key="i" />],
  ['react', <FaReact key="i" />],
  ['aws', <FaAws key="i" />],
  ['lambda', <FaAws key="i" />],
  ['ec2', <FaAws key="i" />],
  ['dynamodb', <FaAws key="i" />],
  ['azure', <FaCloud key="i" />],
  ['kafka', <FaStream key="i" />],
  ['reactor', <FaStream key="i" />],
  ['postgresql', <FaDatabase key="i" />],
  ['oracle', <FaDatabase key="i" />],
  ['mysql', <FaDatabase key="i" />],
  ['redis', <FaDatabase key="i" />],
  ['hibernate', <FaDatabase key="i" />],
  ['oauth2', <FaLock key="i" />],
  ['apigee', <FaLock key="i" />],
  ['sonarqube', <FaLock key="i" />],
  ['security', <FaLock key="i" />],
  ['scada', <FaMicrochip key="i" />],
  ['graphql', <FaCogs key="i" />],
  ['maven', <FaCogs key="i" />],
  ['autosys', <FaCogs key="i" />],
]

function iconFor(label: string): ReactNode | null {
  const needle = label.toLowerCase()
  for (const [key, icon] of ICONS) {
    if (needle.includes(key)) return icon
  }
  return null
}

/** Small monochrome technology tag. */
export function TechPill({ label }: { label: string }) {
  const icon = iconFor(label)
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line/12 bg-ink/[0.03] px-2.5 py-1 text-[0.6875rem] font-medium tracking-wide text-ink-muted">
      {icon && (
        <span aria-hidden className="text-[0.8125rem] text-ink-subtle">
          {icon}
        </span>
      )}
      {label}
    </span>
  )
}

export function TechPillRow({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <TechPill label={item} />
        </li>
      ))}
    </ul>
  )
}
