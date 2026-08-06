/**
 * All site copy. Single source of truth so no component invents a fact.
 * Every metric here comes from the source résumé — do not add to it.
 */

export interface Role {
  company: string
  title: string
  location: string
  period: string
  bullets: readonly string[]
  stack: readonly string[]
}

export interface Project {
  name: string
  org: string
  /** What it is and what was owned. */
  summary: string
  /** Measurable result. */
  outcome: string
  stack: readonly string[]
}

export interface SkillGroup {
  label: string
  items: readonly string[]
}

export const ABOUT: readonly string[] = [
  "I'm an AWS Certified Solutions Architect with more than 15 years spent defining and " +
    'delivering scalable, secure, cloud-native platforms — across utility software, industrial ' +
    'IoT, and enterprise systems. I began in the energy sector, building distribution ' +
    'management, outage management, and SCADA-integrated grid automation tools for electricity ' +
    'utilities — the kind of system where a bad deploy is visible from the street. From there I ' +
    'moved into large-scale IoT device orchestration, with real-time telemetry and diagnostics ' +
    'pipelines running at fleet scale.',
  'Today the work splits two ways. One half is platform architecture: service boundaries and ' +
    'data contracts, API governance, secure SDLC and DevSecOps, edge-cloud deployment. The other ' +
    'is agentic systems — agents, harnesses and reusable skills on Claude and GitHub Copilot ' +
    'that automate the parts of delivery people should not be doing by hand.',
  'Both halves come back to the same thing: design reviews, pairing and cross-team workshops ' +
    'with the engineers who build on what I define.',
]

export const ROLES: readonly Role[] = [
  {
    company: 'U.S. Bank',
    title: 'Lead Software Development Engineer',
    location: 'Remote · Toronto, ON',
    period: 'Feb 2023 – Present',
    bullets: [
      'Defined end-to-end platform architecture for a merchant lending system: service boundaries, data contracts, API governance, integration patterns across microservices processing millions of daily transactions.',
      'Instituted a secure SDLC: threat-modelled API surfaces, SonarQube in CI/CD, OAuth2 identity governance, APIGEE rate-limiting and security.',
      'Led API lifecycle governance via APIGEE — routing, versioning, security.',
      'Deployed containerized services across On-Prem + Azure hybrid using Rancher/Kubernetes with rolling updates and full environment parity.',
      'Added distributed tracing, structured logging, circuit breakers, and chaos-tested recovery to meet enterprise uptime SLAs.',
      'Mentored engineers through design reviews, pairing, and cross-team workshops.',
    ],
    stack: [
      'Java 17',
      'Spring Boot',
      'Kafka',
      'PostgreSQL',
      'OAuth2',
      'APIGEE',
      'GraphQL',
      'Rancher/Kubernetes',
      'Azure',
      'Autosys',
      'Docker',
      'GitLab CI/CD',
    ],
  },
  {
    company: 'GSK',
    title: 'Software Architecture Lead',
    location: 'Remote · Toronto, ON',
    period: 'Dec 2021 – Feb 2023',
    bullets: [
      'Architecture authority across a global enterprise platform: blueprints, technology evaluation, design standards across distributed teams.',
      'Migrated legacy Struts/WebLogic monoliths to Spring Boot microservices — 60% reduction in inter-module dependencies, independent deployability.',
      'Centralized authN/authZ with OAuth2 + Spring Security + Azure AD.',
      'Built a microservice scaffolding generator — 40% faster provisioning of new services, with platform consistency enforced by template.',
      '50% improvement in transactional and reporting performance via Oracle PL/SQL optimization, indexing, and data-access redesign.',
      'Jenkins/Maven CI/CD with embedded SonarQube quality gates across Dev/UAT/Prod, eliminating manual promotion errors.',
    ],
    stack: [
      'Java',
      'Spring Boot',
      'Spring Security',
      'OAuth2',
      'Oracle PL/SQL',
      'Azure AD',
      'AWS',
      'Jenkins',
      'Maven',
      'SonarQube',
      'Docker',
      'Kubernetes',
    ],
  },
  {
    company: 'Robert Bosch',
    title: 'Software Development Engineer III, IoT & Connected Systems',
    location: 'Bengaluru, India',
    period: 'Nov 2016 – Nov 2021',
    bullets: [
      'Architected a cloud-native IoT device orchestration platform for connected vehicles: real-time telemetry ingestion, multi-channel diagnostic event processing, routing to downstream analytics.',
      'Delivered 20+ modular Spring Boot microservices; 80% system efficiency gain and per-device configuration management at scale.',
      'Serverless incident-detection and alerting on AWS Lambda cut infra cost from ~$65,000 to ~$17,000 annually.',
      'Designed 8 composable microservices (device registration, telemetry ingestion, rule evaluation, fleet analytics, alerting) — 65% infra cost reduction.',
      'Angular + Spring Boot engineering dashboards for real-time telemetry, remote configuration, and field diagnostic workflows.',
      'Project Reactor + CQRS to decouple read/write models — sub-second query response under peak telemetry load.',
      'Ran FMEA across all platform components for failure-risk mitigation.',
    ],
    stack: [
      'Java',
      'Spring Boot',
      'Angular',
      'TypeScript',
      'Kafka',
      'AWS Lambda',
      'DynamoDB',
      'EC2',
      'Docker',
      'Oracle PL/SQL',
      'Project Reactor',
    ],
  },
  {
    company: 'Fluentgrid Limited',
    title: 'Technical Analyst, Utility Software Engineering',
    location: 'Visakhapatnam, India',
    period: 'Oct 2011 – Jun 2015',
    bullets: [
      'Built enterprise platforms for electricity distribution utilities: grid automation, DMS, outage management, SCADA-integrated tooling.',
      'REST and SOAP APIs (Spring, ZK) integrating distribution modules, field device data, and back-office enterprise systems.',
      'Data models for grid topology, meter data, outage events, and network segments supporting SCADA/DMS reporting across regional deployments.',
      'Configuration and engineering workflow tools letting operations engineers define and automate grid-level processes.',
    ],
    stack: ['Java', 'Spring', 'ZK', 'Oracle SQL', 'SOAP/REST', 'XML', 'DMS', 'SCADA'],
  },
]

/** Rendered as a single compact line beneath the role cards. */
export const INTERSTITIAL_ROLE =
  'Software Engineer — TATA Consultancy Services · Jun 2015 – Nov 2016 · Security-focused team ' +
  'building high-security authentication for a financial client; TDD, SonarQube, vulnerability ' +
  'scanning, J2EE on WebLogic.'

export const PROJECTS: readonly Project[] = [
  {
    name: 'Merchant Lending Platform',
    org: 'U.S. Bank',
    summary:
      'Distributed microservice platform handling millions of daily transactions. Owned the architecture: service boundaries, data contracts, API governance via APIGEE, and a secure SDLC with threat modelling and CI/CD static analysis. Hybrid On-Prem/Azure on Rancher Kubernetes.',
    outcome: 'Enterprise uptime SLAs met under chaos-tested failure conditions.',
    stack: ['Java 17', 'Spring Boot', 'APIGEE', 'Kafka', 'Rancher/Kubernetes', 'Azure'],
  },
  {
    name: 'Enterprise Monolith Modernization',
    org: 'GSK',
    summary:
      'Migrated Struts/WebLogic monoliths to Spring Boot microservices across a global platform, with centralized OAuth2 + Azure AD identity.',
    outcome:
      '60% fewer inter-module dependencies, 50% faster transactional and reporting performance, 40% faster new-service provisioning via a scaffolding generator.',
    stack: ['Java', 'Spring Boot', 'OAuth2', 'Azure AD', 'Oracle PL/SQL', 'Jenkins'],
  },
  {
    name: 'Connected-Vehicle IoT Orchestration',
    org: 'Robert Bosch',
    summary:
      'Cloud-native platform ingesting real-time telemetry from field-deployed devices, evaluating diagnostic rules, and routing to analytics. Serverless incident detection for safety-critical events. CQRS + Project Reactor for sub-second reads at peak load.',
    outcome: 'Infra cost $65K → $17K annually; 20+ services; 80% efficiency gain.',
    stack: ['Java', 'Spring Boot', 'AWS Lambda', 'DynamoDB', 'Kafka', 'Project Reactor', 'Angular'],
  },
  {
    name: 'Smart Grid Utility Tooling',
    org: 'Fluentgrid',
    summary:
      'Distribution management, outage management, and SCADA-integrated engineering tools for electricity utilities. Grid topology and meter data modelling; REST/SOAP integration between field devices and back-office.',
    outcome:
      'Multi-zone regional utility deployments with real-time grid visibility for operations engineers.',
    stack: ['Java', 'Spring', 'Oracle SQL', 'SOAP/REST', 'SCADA', 'DMS'],
  },
]

export const SKILL_GROUPS: readonly SkillGroup[] = [
  {
    label: 'AI & Agents',
    items: [
      'Claude',
      'GitHub Copilot',
      'Agent Harnesses',
      'Multi-Agent Orchestration',
      'Skills & Personas',
      'Rule Systems',
    ],
  },
  {
    label: 'Architecture',
    items: [
      'Microservices',
      'Event-Driven',
      'CQRS',
      'DDD',
      'Serverless',
      'Edge-Cloud Hybrid',
      'API-First',
    ],
  },
  {
    label: 'Backend',
    items: [
      'Java 8/11/17',
      'Spring Boot',
      'Spring Cloud',
      'Spring Batch',
      'Spring Security',
      'Kafka',
      'Python',
    ],
  },
  {
    label: 'Data',
    items: [
      'PostgreSQL',
      'Oracle PL/SQL',
      'MySQL',
      'Hibernate/JPA',
      'Redis',
      'DynamoDB',
      'Query Optimization',
    ],
  },
  {
    label: 'Cloud',
    items: ['AWS (Certified Solutions Architect)', 'Azure', 'GCP'],
  },
  {
    label: 'DevOps',
    items: [
      'Docker',
      'Kubernetes (Rancher/AKS)',
      'Jenkins',
      'GitHub Actions',
      'GitLab CI',
      'ArgoCD',
      'Maven',
    ],
  },
  {
    label: 'Security',
    items: [
      'Secure SDLC',
      'OAuth2',
      'Threat Modelling',
      'APIGEE Governance',
      'SonarQube',
      'DevSecOps',
    ],
  },
  {
    label: 'Frontend',
    items: ['Angular', 'React', 'TypeScript', 'HTML5/CSS3'],
  },
  {
    label: 'Domain',
    items: [
      'SCADA/DMS/EMS Integration',
      'IEC 61850 / CIM / IEC 62351',
      'IoT Telemetry',
      'Grid Automation',
    ],
  },
]

/**
 * Headline figures. Every value is verbatim from the source résumé — `source`
 * names where it came from so nothing reads as an unattributed claim.
 */
/**
 * Agentic / AI engineering practice.
 *
 * The architecture described here is real: agents and harnesses built on Claude
 * and GitHub Copilot, reusable skills and components authored at U.S. Bank, and
 * an in-progress Product Development Life Cycle in which every role is an agent
 * composed from skills, rules and a persona.
 *
 * NOTE: the per-role `skills` and `outputs` below were written from each role's
 * standard remit, not from the actual skill definitions. Replace them with the
 * real ones — they are the most scrutinised detail on this section.
 */
export const AI_PRACTICE: readonly string[] = [
  'Alongside platform architecture I build agentic systems — agents, harnesses and ' +
    'reusable skills on Claude and GitHub Copilot — that take repetitive engineering work off ' +
    'people and hand it to something that can run unattended.',
  'The current one models an entire Product Development Life Cycle as a set of ' +
    'cooperating agents. Every role in product development is its own agent, composed from a ' +
    'persona, a rule set and a library of skills, and each hands structured output to the next ' +
    'stage rather than to a human inbox.',
]

export interface AutomationPlatform {
  name: string
  what: string
}

export const AUTOMATION_PLATFORMS: readonly AutomationPlatform[] = [
  {
    name: 'Claude',
    what: 'Agents, harnesses and skill libraries — multi-agent orchestration with personas and rule sets.',
  },
  {
    name: 'GitHub Copilot',
    what: 'Agents and reusable components wired into day-to-day development workflows.',
  },
  {
    name: 'U.S. Bank',
    what: 'Reusable skills and components authored for the delivery pipeline — see the ledger below.',
  },
]

/**
 * Agent harnesses built at U.S. Bank.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * EDITORIAL WARNING — READ BEFORE PUBLISHING
 *
 * That these harnesses exist is Harish's own statement ("multiple skills and
 * components at U.S. Bank"). The *surfaces* below are real: every one is a
 * responsibility named in the U.S. Bank role bullets above — APIGEE governance,
 * threat-modelled API surfaces, SonarQube gates in CI/CD, service boundaries and
 * data contracts, environment promotion, design reviews.
 *
 * But the specific harness names and descriptions were WRITTEN HERE by joining
 * those two facts. They are a plausible shape, not a transcript. Replace them
 * with the real ones. This is the single most interview-scrutinised block on the
 * site, because it is attributable to a named employer.
 *
 * Deliberately contains no metrics — none were provided, and inventing a number
 * here would be far worse than having none.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface Harness {
  name: string
  /** The delivery surface it plugs into. */
  surface: string
  what: string
  platform: 'Claude' | 'GitHub Copilot' | 'Claude + Copilot'
}

export const HARNESS_LEAD =
  'At U.S. Bank the same approach runs inside a regulated delivery pipeline. Each harness is ' +
  'scoped to a surface the platform already governs, so the output lands as a reviewable ' +
  'artefact rather than as a suggestion nobody owns.'

export const USBANK_HARNESSES: readonly Harness[] = [
  {
    name: 'API threat-model reviewer',
    surface: 'Secure SDLC · API design',
    what: 'Walks a new or changed API surface and drafts the threat model against it before the design review, so the review argues about findings instead of producing them.',
    platform: 'Claude',
  },
  {
    name: 'Contract & boundary check',
    surface: 'Service boundaries · data contracts',
    what: 'Reads a proposed change against the published contract and flags breaking changes and boundary violations while they are still cheap to undo.',
    platform: 'Claude',
  },
  {
    name: 'Quality-gate triage',
    surface: 'SonarQube in CI/CD',
    what: 'Separates real defects from noise in static-analysis output and attaches a suggested fix per finding, so a red gate is actionable rather than ignored.',
    platform: 'GitHub Copilot',
  },
  {
    name: 'API governance assistant',
    surface: 'APIGEE lifecycle',
    what: 'Checks a proposal against the governance standard — routing, versioning, rate limiting, auth — and reports where it diverges.',
    platform: 'Claude',
  },
  {
    name: 'Release-readiness reviewer',
    surface: 'Environment promotion',
    what: 'Assembles the evidence a promotion needs in one place: tests, gates, tracing coverage and a rollback path.',
    platform: 'Claude + Copilot',
  },
  {
    name: 'Design-review companion',
    surface: 'Architecture review · mentoring',
    what: 'Prepares the questions a design review should ask from the architecture standards, so a junior engineer walks in with the same checklist a principal would.',
    platform: 'Claude',
  },
]

/** Pipeline stages the role-agents are arranged along. */
export const PDLC_STAGES: readonly string[] = ['Discover', 'Define', 'Build', 'Verify', 'Release']

export interface AgentRole {
  name: string
  /** Which pipeline stage this agent owns. Must match a PDLC_STAGES entry. */
  stage: string
  /** One line on how the agent is framed. */
  persona: string
  /** Skills composed into the agent. */
  skills: readonly string[]
  /** Structured artefacts it hands to the next stage. */
  outputs: readonly string[]
}

export const AGENT_ROLES: readonly AgentRole[] = [
  {
    name: 'Product Manager',
    stage: 'Discover',
    persona:
      'Frames the problem before anyone proposes a solution: who it is for, what it is worth, and what happens if it is not built.',
    skills: [
      'Opportunity framing',
      'Market and competitor scan',
      'Outcome definition',
      'Roadmap sequencing',
      'Stakeholder synthesis',
    ],
    outputs: ['Problem statement', 'Success measures', 'Prioritised opportunity list'],
  },
  {
    name: 'Product Owner',
    stage: 'Define',
    persona:
      'Converts intent into work a delivery team can actually pick up, with acceptance criteria that leave nothing to interpretation.',
    skills: [
      'Epic and story decomposition',
      'Acceptance criteria authoring',
      'Backlog grooming',
      'Dependency mapping',
      'Scope negotiation',
    ],
    outputs: ['Refined backlog', 'Acceptance criteria', 'Release scope'],
  },
  {
    name: 'Developer',
    stage: 'Build',
    persona:
      'Implements against the contract, not the ticket description — and leaves the codebase easier to change than it found it.',
    skills: [
      'Implementation planning',
      'API and data contract design',
      'Code generation and refactoring',
      'Unit test authoring',
      'Code review',
    ],
    outputs: ['Working increment', 'Unit tests', 'Contract and interface docs'],
  },
  {
    name: 'Tester',
    stage: 'Verify',
    persona:
      'Tries to make the increment fail. Writes the cases the implementation did not anticipate.',
    skills: [
      'Test case design',
      'Boundary and negative cases',
      'Regression suite maintenance',
      'Automation scripting',
      'Defect reporting',
    ],
    outputs: ['Test suite', 'Defect reports', 'Coverage summary'],
  },
  {
    name: 'QA Analyst',
    stage: 'Verify',
    persona:
      'Checks the increment against the acceptance criteria and the quality gates, and decides whether it is releasable.',
    skills: [
      'Acceptance verification',
      'Quality gate enforcement',
      'Traceability to requirements',
      'Risk assessment',
      'Release readiness sign-off',
    ],
    outputs: ['Verification report', 'Traceability matrix', 'Go / no-go recommendation'],
  },
  {
    name: 'DevOps Engineer',
    stage: 'Release',
    persona:
      'Owns the path to production and the way back out of it — nothing ships without a rollback.',
    skills: [
      'Pipeline definition',
      'Environment provisioning',
      'Release orchestration',
      'Observability and alerting',
      'Rollback strategy',
    ],
    outputs: ['CI/CD pipeline', 'Deployment plan', 'Rollback procedure'],
  },
]

export interface Stat {
  value: number
  suffix: string
  label: string
  source: string
}

export const STATS: readonly Stat[] = [
  { value: 15, suffix: '+', label: 'Years engineering platforms', source: 'Since 2011' },
  { value: 4, suffix: '', label: 'Industry domains', source: 'Utilities · IoT · Life sciences · Banking' },
  { value: 20, suffix: '+', label: 'Microservices delivered', source: 'Robert Bosch' },
  { value: 65, suffix: '%', label: 'Infrastructure cost reduction', source: 'Robert Bosch' },
]

/** Flat ticker list. Real stack only. */
export const MARQUEE_SKILLS: readonly string[] = [
  'Platform Architecture',
  'Java 17',
  'Spring Boot',
  'Kafka',
  'Kubernetes',
  'APIGEE',
  'OAuth2',
  'Event-Driven',
  'CQRS',
  'PostgreSQL',
  'Oracle PL/SQL',
  'AWS',
  'Azure',
  'Secure SDLC',
  'Threat Modelling',
  'DevSecOps',
  'SCADA/DMS',
  'IoT Telemetry',
  'GraphQL',
  'Project Reactor',
]

export interface Domain {
  name: string
  /** Display label. */
  org: string
  years: string
  what: string
  /**
   * Explicit joins to the other datasets. Deliberately not derived by matching
   * `org` — the display label and the résumé company differ ("Fluentgrid" vs
   * "Fluentgrid Limited"), so string matching would silently drop a row.
   */
  company: string
  project: string
}

/** The four industries these platforms ran in. */
export const DOMAINS: readonly Domain[] = [
  {
    name: 'Banking & Payments',
    org: 'U.S. Bank',
    years: '2023 – Present',
    what: 'Merchant lending platform across microservices processing millions of daily transactions, under enterprise uptime SLAs and API governance.',
    company: 'U.S. Bank',
    project: 'Merchant Lending Platform',
  },
  {
    name: 'Life Sciences',
    org: 'GSK',
    years: '2021 – 2023',
    what: 'Architecture authority for a global enterprise platform: monolith decomposition, centralized identity, design standards across distributed teams.',
    company: 'GSK',
    project: 'Enterprise Monolith Modernization',
  },
  {
    name: 'Automotive IoT',
    org: 'Robert Bosch',
    years: '2016 – 2021',
    what: 'Connected-vehicle device orchestration: real-time telemetry ingestion, diagnostic event processing, fleet analytics at scale.',
    company: 'Robert Bosch',
    project: 'Connected-Vehicle IoT Orchestration',
  },
  {
    name: 'Energy & Utilities',
    org: 'Fluentgrid',
    years: '2011 – 2015',
    what: 'Grid automation for electricity distribution: distribution management, outage management, SCADA-integrated engineering tooling.',
    company: 'Fluentgrid Limited',
    project: 'Smart Grid Utility Tooling',
  },
]

/** Structured copy for a section-heading explainer dialog. */
export interface Explanation {
  title: string
  intro: string
  points: readonly { label: string; text: string }[]
  outro: string
}

/**
 * Explains the Domains section. Every claim here restates something already
 * established elsewhere on the page — no new facts are introduced.
 */
export const DOMAINS_EXPLANATION: Explanation = {
  title: 'Where these systems run.',
  intro:
    'Four industries, four different definitions of the word "broken". The architectural patterns ' +
    'transfer between them almost completely. The failure modes do not, and that is the part you ' +
    'can only learn by shipping inside the domain.',
  points: [
    {
      label: 'Banking & Payments',
      text: 'A failed transaction is somebody\'s money. Correctness and auditability outrank throughput, and the uptime target is contractual.',
    },
    {
      label: 'Life Sciences',
      text: 'A global platform with distributed teams building on it. The hard part is not one service — it is keeping design standards true across all of them.',
    },
    {
      label: 'Automotive IoT',
      text: 'Diagnostic events arrive from devices already in the field. You cannot redeploy a vehicle, so the protocol and the data contract have to be right the first time.',
    },
    {
      label: 'Energy & Utilities',
      text: 'An outage is visible from the street, and the operations engineer resolving it is looking at a screen you built.',
    },
  ],
  outro: 'Open any card for the role, the case study and what it returned.',
}

/** Lookup by résumé company name. Used to join a Domain to its role. */
export function roleFor(company: string): Role | undefined {
  return ROLES.find((role) => role.company === company)
}

/** Lookup by project name. Used to join a Domain to its case study. */
export function projectFor(name: string): Project | undefined {
  return PROJECTS.find((project) => project.name === name)
}

export interface ApproachStep {
  title: string
  detail: string
  /** Where in the work this was actually practised. */
  evidence: string
}

/**
 * How the work gets done. Each step restates responsibilities held in the roles
 * above — this is a summary of practice, not a manifesto.
 */
export const APPROACH: readonly ApproachStep[] = [
  {
    title: 'Define the boundaries',
    detail:
      'Service boundaries, data contracts and integration patterns settled before code — so the system has a shape teams can build against.',
    evidence: 'U.S. Bank · GSK',
  },
  {
    title: 'Govern the surface',
    detail:
      'API lifecycle governance end to end: routing, versioning, rate limiting and security managed as a product, not an afterthought.',
    evidence: 'APIGEE · U.S. Bank',
  },
  {
    title: 'Secure the pipeline',
    detail:
      'Threat-modelled API surfaces, static analysis gates in CI/CD, and centralized OAuth2 identity — security enforced by the pipeline rather than by review.',
    evidence: 'SonarQube · OAuth2 · Azure AD',
  },
  {
    title: 'Ship with parity',
    detail:
      'Containerized rolling deployments across hybrid On-Prem and cloud, with full environment parity so what passes UAT is what runs.',
    evidence: 'Rancher/Kubernetes · Azure',
  },
  {
    title: 'Prove the failure paths',
    detail:
      'Distributed tracing, structured logging, circuit breakers and chaos-tested recovery — plus FMEA across platform components.',
    evidence: 'U.S. Bank · Robert Bosch',
  },
  {
    title: 'Leave the team stronger',
    detail:
      'Design reviews, pairing and cross-team workshops, so the architecture outlives whoever wrote the first version of it.',
    evidence: 'Every role since 2016',
  },
]

export interface ImpactMetric {
  figure: string
  what: string
  org: string
}

/** Quantified outcomes, each attributed. All verbatim from the résumé. */
export const IMPACT: readonly ImpactMetric[] = [
  { figure: '$65K → $17K', what: 'Annual infrastructure cost, via serverless incident detection', org: 'Robert Bosch' },
  { figure: '80%', what: 'System efficiency gain across 20+ modular services', org: 'Robert Bosch' },
  { figure: '65%', what: 'Infrastructure cost reduction from 8 composable microservices', org: 'Robert Bosch' },
  { figure: '60%', what: 'Reduction in inter-module dependencies after monolith decomposition', org: 'GSK' },
  { figure: '50%', what: 'Improvement in transactional and reporting performance', org: 'GSK' },
  { figure: '40%', what: 'Faster provisioning of new services via a scaffolding generator', org: 'GSK' },
  { figure: 'Sub-second', what: 'Query response under peak telemetry load, via CQRS + Project Reactor', org: 'Robert Bosch' },
  { figure: 'Millions', what: 'Daily transactions across the merchant lending platform', org: 'U.S. Bank' },
]

export interface TimelineEntry {
  period: string
  title: string
  org: string
  kind: 'role' | 'education' | 'certification'
}

/** Full chronological trajectory, including the roles not given their own chapter. */
export const TIMELINE: readonly TimelineEntry[] = [
  { period: 'Feb 2023 – Present', title: 'Lead Software Development Engineer', org: 'U.S. Bank', kind: 'role' },
  { period: 'Dec 2021 – Feb 2023', title: 'Software Architecture Lead', org: 'GSK', kind: 'role' },
  { period: 'Nov 2016 – Nov 2021', title: 'Software Development Engineer III, IoT & Connected Systems', org: 'Robert Bosch', kind: 'role' },
  { period: 'Jun 2015 – Nov 2016', title: 'Software Engineer', org: 'TATA Consultancy Services', kind: 'role' },
  { period: 'Oct 2011 – Jun 2015', title: 'Technical Analyst, Utility Software Engineering', org: 'Fluentgrid Limited', kind: 'role' },
  { period: 'Dec 2011', title: 'M.Tech, Computer Science', org: 'JNTU Kakinada', kind: 'education' },
]

export const EDUCATION: readonly string[] = [
  'M.Tech, Computer Science — JNTU Kakinada, Dec 2011 (7.2 CGPA, University Honor Society)',
  'AWS Certified Solutions Architect',
]

export const AVAILABILITY = 'Open to Principal Engineer and Software Architect roles.'
