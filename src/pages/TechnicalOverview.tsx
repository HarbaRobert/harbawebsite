import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import { Eyebrow } from '../components/ui'

interface TechnicalSubsection {
  heading?: string
  body: string[]
  points: string[]
}

interface TechnicalSection {
  slug: string
  eyebrow: string
  heading: string
  intro?: string
  subsections: TechnicalSubsection[]
}

// Fixed, reviewed copy for the public Technical page. Unlike /docs, this no
// longer draws on the internal review tool's answers (see
// src/lib/reviewStorage.ts) - the content here has already been through
// that review and is safe to publish as-is, so it is written directly
// rather than gated behind a "confirmed, Public, Answered" filter.
//
// Five sections, each with a stable slug used both as the section id and as
// a link target from elsewhere (see the "Read the technical overview" /
// "See how customer separation works" / "See how models are configured"
// links on the Governance page). Where a section covers more than one
// former topic, a subsection heading marks the boundary; where it covers
// just one, no subheading is needed.
const TECHNICAL_SECTIONS: TechnicalSection[] = [
  {
    slug: 'architecture-and-execution',
    eyebrow: 'ARCHITECTURE AND EXECUTION',
    heading: 'Central orchestration and controlled execution.',
    intro: 'Harba’s components sit around a central orchestration layer, connecting outward through APIs, webhooks, MCP, scheduled tasks and configured integrations.',
    subsections: [
      {
        heading: 'Architecture',
        body: [
          'Customer information, Pipeline definitions, outputs and useful run data remain persistent. Temporary workers are created only when computational work is required, and removed once the job finishes.',
        ],
        points: ['Central orchestration', 'Persistent customer data', 'Temporary execution workers', 'Workspace-specific access'],
      },
      {
        heading: 'Execution',
        body: [
          'Pipelines arrange AI actions, deterministic code, integrations and human approval points into a controlled sequence. Each step receives structured input, performs its action and passes the result onwards.',
          'Branching, looping, retries and time limits are handled by Harba’s orchestration rather than left to the AI model. A failed step stops the Pipeline unless a configured retry succeeds or an authorised user restarts the work.',
        ],
        points: ['Structured Pipeline inputs and outputs', 'Deterministic branches and loops', 'Configurable attempts and time limits', 'Human approval steps', 'Recorded run history and errors'],
      },
    ],
  },
  {
    slug: 'data-and-big-brain',
    eyebrow: 'DATA AND BIG BRAIN',
    heading: 'Searchable memory for each customer workspace.',
    subsections: [
      {
        body: [
          'Big Brain stores customer-provided JSON records, searchable through semantic meaning, keywords and structured filters. Pipelines, Teammates, MCP clients and connected applications share the same search capability.',
          'Each customer’s Big Brain information is held in a separate database with unique credentials, and dedicated database infrastructure is available where physical separation is required.',
        ],
        points: ['PostgreSQL and vector search', 'Semantic and structured queries', 'Customer-defined records and filters', 'Stable identifiers for updates and deletion', 'Logical or physical isolation options'],
      },
    ],
  },
  {
    slug: 'models-and-providers',
    eyebrow: 'MODELS AND PROVIDERS',
    heading: 'Model choice at the point of use.',
    subsections: [
      {
        body: [
          'Harba provides access to supported models through OpenRouter. Pipeline builders can select an appropriate model for each AI step and configure the prompt and its parameters.',
          'Model context limits and probabilistic outputs still apply, so larger workloads must be filtered, divided or processed in stages rather than passed to a model as one unrestricted request.',
        ],
        points: ['Model selection by Pipeline step', 'Configurable prompts and parameters', 'Usage and token measurement', 'Bring-your-own OpenRouter key', 'Provider terms considered during implementation'],
      },
    ],
  },
  {
    slug: 'integrations-security-and-customer-environments',
    eyebrow: 'INTEGRATIONS, SECURITY AND CUSTOMER ENVIRONMENTS',
    heading: 'Connections, protections and shared responsibilities.',
    intro: 'Beyond the Pipeline mechanics above, this covers how Harba connects outward, how access and credentials are protected, and how implementation work is shared with your technical team.',
    subsections: [
      {
        heading: 'Integrations and extensibility',
        body: [
          'Harba can receive and return work through REST APIs, MCP, webhooks, scheduled tasks and configured integrations. Pipelines can also use scripts and reusable custom steps where standard connections are not sufficient.',
        ],
        points: ['REST API', 'MCP', 'Inbound and outbound webhooks', 'Configured integrations', 'Custom code and Pipeline steps'],
      },
      {
        heading: 'Security and data',
        body: [
          'Application access is checked against the user’s workspace and role. Temporary workers use short-lived access tokens, and long-lived integration credentials stay within the central platform rather than passing into individual jobs.',
          'External communications use encrypted connections. Hosting, model providers, data handling and retention requirements are reviewed as part of the implementation.',
        ],
        points: ['Workspace-based access', 'Short-lived worker credentials', 'Encrypted external connections', 'Implementation-specific data review'],
      },
      {
        heading: 'Working with technical teams',
        body: [
          'We work with business and technical teams to understand the process, define the data flow, configure the operation and connect the systems involved.',
          'Customer developers can own APIs, webhooks, data contracts, custom code, test data and customer-side deployment. Harba provides the platform knowledge, configuration support and operational context to bring it together.',
        ],
        points: ['Collaborative technical discovery', 'Agreed implementation responsibilities', 'Customer-owned integrations', 'Configuration and ongoing support', 'Separate test workspaces where required'],
      },
    ],
  },
  {
    slug: 'reliability-observability-and-limitations',
    eyebrow: 'RELIABILITY, OBSERVABILITY AND LIMITATIONS',
    heading: 'How Pipeline work is tracked, and where AI still needs care.',
    intro: 'Pipeline runs are recorded and inspectable, with checks in place to catch stalled or failing work. The same discipline matters because AI output itself cannot be trusted blindly.',
    subsections: [
      {
        heading: 'Reliability and observability',
        body: [
          'Pipeline runs retain step activity, outputs, usage and failure information, and progression checks help prevent work from stalling undetected.',
          'Customers can inspect Pipeline-level information directly. Harba retains additional operational logs to support investigation when a problem originates within the platform or its infrastructure.',
        ],
        points: ['Pipeline run status', 'Step outputs and errors', 'Usage and cost visibility', 'Additional support diagnostics'],
      },
      {
        heading: 'Known limitations',
        body: [
          'Generative AI output is probabilistic and can be inconsistent or incorrect, and every model has a limit on how much information it can process at once.',
          'Harba addresses this through Pipeline design, deterministic validation, structured outputs, retries and approval steps. Decisions with significant legal, financial, safety, regulatory or reputational consequences should retain accountable human judgement.',
        ],
        points: ['AI output is not deterministic', 'Model context windows still apply', 'Large workloads require staged processing', 'Validation should surround AI steps', 'High-consequence decisions retain human judgement'],
      },
    ],
  },
]

export function TechnicalOverview() {
  const location = useLocation()
  // Landing here with a hash (e.g. arriving from Governance's "Read the
  // technical overview" link) is a client-side route change, which the
  // browser does not scroll for on its own - only a full page load does
  // that automatically. Mirrors Home.tsx's own hash-scroll effect.
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return (
    <>
      <section className="page-intro container">
        <h1>A governed operating layer for AI work across your existing systems.</h1>
        <p className="intro-copy">
          Harba brings together orchestration, business knowledge, AI models, integrations and human control within one
          managed platform. It works with the CRM, ERP, communications and operational tools a business already uses
          rather than attempting to replace them.
        </p>
        <ul className="page-contents" aria-label="Jump to a section">
          {TECHNICAL_SECTIONS.map((section) => (
            <li key={section.slug}><a href={`#${section.slug}`}>{section.eyebrow}</a></li>
          ))}
        </ul>
      </section>

      {TECHNICAL_SECTIONS.map((section, index) => (
        <section key={section.slug} id={section.slug} className={index % 2 === 0 ? 'section paper' : 'section dark'}>
          <div className="container">
            <Eyebrow>{section.eyebrow}</Eyebrow>
            <h2>{section.heading}</h2>
            {section.intro && <p className="intro-copy">{section.intro}</p>}

            {section.subsections.map((subsection) => (
              <div className="trust-layout technical-subsection" key={subsection.heading ?? section.slug}>
                <div>
                  {subsection.heading && <h3>{subsection.heading}</h3>}
                  {subsection.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
                <div className="trust-list">
                  {subsection.points.map((point) => <div key={point}><Check aria-hidden="true" /><span>{point}</span></div>)}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="cta">
        <div className="container cta-inner">
          <Eyebrow>GET STARTED</Eyebrow>
          <h2>Discuss your technical requirements.</h2>
          <p>
            Bring your architecture, integration, hosting and governance questions to a working session. We will explain
            how Harba could be configured around your systems and identify anything that requires further technical
            validation.
          </p>
          <Link className="button" to="/book-a-working-session?topic=technical">
            Discuss your requirements<ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  )
}
