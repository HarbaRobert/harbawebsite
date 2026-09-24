// The fixed, non-editable content for the Technical Review's ~120 questions:
// id, section, question, why it matters, and any known starting information.
// Plain JS (not .ts), like siteConfig.mjs and legalConfig.mjs, so both the
// client bundle and the Express server can read it without going through the
// TS toolchain - the server needs this list to build the transcript
// extraction prompt in server/reviewTranscript.js.
//
// The answer itself (what Rob and Harry fill in) is never stored here. See
// src/data/technicalContent.ts for the TypeScript types layered on top of
// this array, and server/db.js for where answers are actually persisted.

function q(entry) {
  return { knownInformation: '', ...entry }
}

// Shared with src/data/technicalContent.ts (single source of truth), and
// used server-side by server/reviewTranscript.js to validate values an LLM
// returns before they are ever written to the database.
export const STATUS_OPTIONS = ['Unanswered', 'Partially answered', 'Answered', 'Needs verification']
export const CAPABILITY_STATUS_OPTIONS = ['Live', 'Configurable', 'Planned', 'Deprecated', 'Unknown']

export function defaultAnswerState() {
  return {
    audience: [],
    answer: '',
    status: 'Unanswered',
    classification: null,
    capabilityStatus: 'Unknown',
    evidence: '',
    publicSummary: '',
    documentationContent: '',
    internalNotes: '',
    flaggedForFollowUp: false,
  }
}

const FACT_PIPELINES_DEFINITION = 'Pipelines define governed, repeatable processes.'
const FACT_PIPELINE_STEPS = 'Pipelines can include AI steps, system actions and human approvals.'
const FACT_MODEL_CONFIG = 'Model choice can be configured at individual Pipeline-step and Teammate level.'
const FACT_TEAMMATE_ROLES = 'Teammates have defined roles and can work with Big Brain, Pipelines, Harba data and other Teammates.'
const FACT_TEAMMATES_BUILD_PIPELINES = 'Teammates can help build Pipelines.'
const FACT_BIG_BRAIN_DEFINITION = 'Big Brain stores searchable business knowledge.'
const FACT_BIG_BRAIN_SEARCH = 'Big Brain supports semantic search, structured filtering or both.'
const FACT_BIG_BRAIN_ACCESS = 'Big Brain can be used through Pipelines, Teammates, the in-app assistant, MCP and the REST API.'
const FACT_WORKSPACE = 'Every customer has their own workspace.'
const FACT_BIG_BRAIN_ISOLATION = 'Every customer has an isolated Big Brain environment.'
const FACT_HOSTING = 'Harba uses Fly.io and Scaleway according to customer requirements, including EU or USA hosting needs.'
const FACT_AUDIT = 'Platform activity is audited.'
const FACT_APPROVALS = 'Human approvals are configurable.'
const FACT_OPENROUTER = 'Harba can access models through OpenRouter.'
const FACT_PROVIDER_POLICY = 'Data handling and training policies depend on the selected provider and model.'
const FACT_INTEGRATION_METHODS = 'Harba integrates through APIs, webhooks and MCP.'
const FACT_WORKS_WITH_EXISTING = 'Harba works with existing systems rather than replacing them.'
const FACT_USAGE_VISIBILITY = 'Harba includes usage and cost visibility.'
const FACT_CHANNELS = 'Harba supports AI voice calling and WhatsApp or messaging capabilities.'

export const technicalContent = [
  // 1. Architecture
  q({
    id: 'architecture-01',
    section: 'Architecture',
    question: 'What are the main technical components that make up Harba?',
    whyItMatters: 'CTOs and developers both need a shared, accurate mental model of the platform before anything else can be explained correctly.',
    knownInformation: `${FACT_PIPELINES_DEFINITION} ${FACT_TEAMMATE_ROLES}`,
  }),
  q({
    id: 'architecture-02',
    section: 'Architecture',
    question: 'How do Pipelines, Teammates, Big Brain and customer systems communicate?',
    whyItMatters: 'Determines what can be shown in an architecture diagram and what integration patterns are realistic to describe.',
  }),
  q({
    id: 'architecture-03',
    section: 'Architecture',
    question: 'Which parts of the platform are persistent?',
    whyItMatters: 'Buyers assessing reliability and data handling need to know what state Harba retains between runs.',
  }),
  q({
    id: 'architecture-04',
    section: 'Architecture',
    question: 'Which resources are created temporarily for individual jobs?',
    whyItMatters: 'Distinguishes ephemeral execution from stored state, which affects both security review and cost expectations.',
  }),
  q({
    id: 'architecture-05',
    section: 'Architecture',
    question: 'Where does orchestration take place?',
    whyItMatters: 'Clarifies who or what is responsible for sequencing work, which matters for reliability and incident response conversations.',
  }),
  q({
    id: 'architecture-06',
    section: 'Architecture',
    question: 'How does data move through Harba from input to approved output?',
    whyItMatters: 'This is the core flow a technical buyer will want traced end to end before trusting the platform with real data.',
  }),
  q({
    id: 'architecture-07',
    section: 'Architecture',
    question: 'How are customer workspaces separated?',
    whyItMatters: 'Multi-tenant isolation is usually one of the first questions a security-conscious buyer asks.',
    knownInformation: `${FACT_WORKSPACE} ${FACT_BIG_BRAIN_ISOLATION}`,
  }),
  q({
    id: 'architecture-08',
    section: 'Architecture',
    question: 'What architecture diagram can safely be published?',
    whyItMatters: 'A diagram is one of the highest-value assets for a technical page, but only if it does not expose internal implementation detail.',
  }),
  q({
    id: 'architecture-09',
    section: 'Architecture',
    question: 'Which architectural details must remain confidential?',
    whyItMatters: 'Sets the boundary that the public Technical Overview and Developer Documentation must not cross.',
  }),

  // 2. Pipelines and execution
  q({
    id: 'pipelines-01',
    section: 'Pipelines and execution',
    question: 'Which Pipeline-step types currently exist?',
    whyItMatters: 'Developers need the concrete vocabulary of what a Pipeline can actually contain before they can design one.',
    knownInformation: FACT_PIPELINE_STEPS,
  }),
  q({
    id: 'pipelines-02',
    section: 'Pipelines and execution',
    question: 'How are inputs and outputs passed between steps?',
    whyItMatters: 'Determines what a developer needs to understand before composing steps together reliably.',
  }),
  q({
    id: 'pipelines-03',
    section: 'Pipelines and execution',
    question: 'How are output schemas or data contracts enforced?',
    whyItMatters: 'Buyers evaluating consistency want to know whether structure is enforced or only hoped for.',
  }),
  q({
    id: 'pipelines-04',
    section: 'Pipelines and execution',
    question: 'How are branches, conditions and loops handled?',
    whyItMatters: 'Establishes whether Pipelines support real control flow or only linear sequences.',
  }),
  q({
    id: 'pipelines-05',
    section: 'Pipelines and execution',
    question: 'How do human approval gates work?',
    whyItMatters: 'Approvals are a headline governance feature, so the mechanics need to be accurate before they are described as a control.',
    knownInformation: FACT_APPROVALS,
  }),
  q({
    id: 'pipelines-06',
    section: 'Pipelines and execution',
    question: 'How are maximum attempts, time limits and cost limits enforced?',
    whyItMatters: 'These are the guardrails that stop a Pipeline running away; buyers will ask what actually stops it.',
  }),
  q({
    id: 'pipelines-07',
    section: 'Pipelines and execution',
    question: 'How are long-running jobs continued?',
    whyItMatters: 'Long-running or asynchronous work behaves differently to a simple request and response call, and developers need to know which model applies.',
  }),
  q({
    id: 'pipelines-08',
    section: 'Pipelines and execution',
    question: 'How are completed steps cached?',
    whyItMatters: 'Affects both cost and behaviour on retry, and is often assumed rather than confirmed.',
  }),
  q({
    id: 'pipelines-09',
    section: 'Pipelines and execution',
    question: 'How does Harba avoid processing the same event twice?',
    whyItMatters: 'Idempotency is a common integration question and a common source of silent bugs if left unconfirmed.',
  }),
  q({
    id: 'pipelines-10',
    section: 'Pipelines and execution',
    question: 'What happens when a Pipeline step fails?',
    whyItMatters: 'Buyers and developers both need a clear failure model before they can trust the platform with production work.',
  }),
  q({
    id: 'pipelines-11',
    section: 'Pipelines and execution',
    question: 'Can a Pipeline resume from the failed step?',
    whyItMatters: 'Determines whether failure means rework or a simple retry.',
  }),
  q({
    id: 'pipelines-12',
    section: 'Pipelines and execution',
    question: 'How are retries controlled?',
    whyItMatters: 'Uncontrolled retries can duplicate side effects or inflate cost, so this needs a precise answer.',
  }),
  q({
    id: 'pipelines-13',
    section: 'Pipelines and execution',
    question: 'How does Harba reduce inconsistent AI output?',
    whyItMatters: 'This is the difference between a demo and something a business can rely on.',
  }),
  q({
    id: 'pipelines-14',
    section: 'Pipelines and execution',
    question: 'When does Harba use deterministic code rather than an AI model?',
    whyItMatters: 'Directly informs the rule against describing AI as fully deterministic, and shows where reliability actually comes from.',
  }),
  q({
    id: 'pipelines-15',
    section: 'Pipelines and execution',
    question: 'Can customers create or modify Pipelines directly?',
    whyItMatters: 'Central to the managed-first versus self-service distinction the whole review depends on.',
  }),

  // 3. Teammates
  q({
    id: 'teammates-01',
    section: 'Teammates',
    question: 'What technically distinguishes a Teammate from a standard prompt-based agent?',
    whyItMatters: 'Developers evaluating Harba against building it themselves will ask this directly.',
    knownInformation: FACT_TEAMMATE_ROLES,
  }),
  q({
    id: 'teammates-02',
    section: 'Teammates',
    question: 'How are its role, instructions and tools configured?',
    whyItMatters: 'Establishes what configuration surface actually exists today.',
  }),
  q({
    id: 'teammates-03',
    section: 'Teammates',
    question: 'How are permissions applied?',
    whyItMatters: 'A named control needs a real mechanism behind it before it can be described as governance.',
  }),
  q({
    id: 'teammates-04',
    section: 'Teammates',
    question: 'What Harba data can a Teammate access?',
    whyItMatters: 'Data access scope is a standard security review question.',
  }),
  q({
    id: 'teammates-05',
    section: 'Teammates',
    question: 'How does a Teammate access Big Brain?',
    whyItMatters: 'Confirms the relationship between two named platform components rather than assuming one.',
    knownInformation: FACT_BIG_BRAIN_ACCESS,
  }),
  q({
    id: 'teammates-06',
    section: 'Teammates',
    question: 'How does a Teammate invoke a Pipeline?',
    whyItMatters: 'Clarifies the boundary between conversational work and governed execution.',
    knownInformation: FACT_TEAMMATES_BUILD_PIPELINES,
  }),
  q({
    id: 'teammates-07',
    section: 'Teammates',
    question: 'How do Teammates communicate or hand work to each other?',
    whyItMatters: 'Multi-agent coordination is often described loosely, so this needs a concrete answer.',
  }),
  q({
    id: 'teammates-08',
    section: 'Teammates',
    question: 'What actions require human confirmation?',
    whyItMatters: 'Feeds directly into how approvals are described on the public pages.',
  }),
  q({
    id: 'teammates-09',
    section: 'Teammates',
    question: 'How is Teammate activity audited?',
    whyItMatters: 'Supports the platform-activity-is-audited claim with a specific mechanism.',
    knownInformation: FACT_AUDIT,
  }),
  q({
    id: 'teammates-10',
    section: 'Teammates',
    question: 'What prevents a Teammate from acting beyond its role?',
    whyItMatters: 'This is the technical backing for any claim about safe or bounded autonomy.',
  }),
  q({
    id: 'teammates-11',
    section: 'Teammates',
    question: 'Which Teammate capabilities are live now?',
    whyItMatters: 'Keeps live and planned capability visibly separate, as required throughout this review.',
  }),
  q({
    id: 'teammates-12',
    section: 'Teammates',
    question: 'Which capabilities are planned?',
    whyItMatters: 'The direct counterpart to the previous question, so roadmap items are never presented as shipped.',
  }),
  q({
    id: 'teammates-13',
    section: 'Teammates',
    question: 'Can customer developers create Teammates?',
    whyItMatters: 'Another direct input into the managed-first versus self-service distinction.',
  }),

  // 4. Big Brain
  q({
    id: 'big-brain-01',
    section: 'Big Brain',
    question: 'What does an isolated Big Brain environment mean technically?',
    whyItMatters: '"Isolated" is currently an assertion; this question defines what it actually means in implementation.',
    knownInformation: `${FACT_BIG_BRAIN_DEFINITION} ${FACT_BIG_BRAIN_ISOLATION}`,
  }),
  q({
    id: 'big-brain-02',
    section: 'Big Brain',
    question: 'Is isolation logical, physical or configurable?',
    whyItMatters: 'A CTO doing due diligence will want this precision, not just the word "isolated".',
    knownInformation: FACT_BIG_BRAIN_ISOLATION,
  }),
  q({
    id: 'big-brain-03',
    section: 'Big Brain',
    question: 'Which database and search technologies are used?',
    whyItMatters: 'Developers integrating directly will want to understand the underlying technology, and this also determines what can safely be published.',
  }),
  q({
    id: 'big-brain-04',
    section: 'Big Brain',
    question: 'How are records and embeddings separated between customers?',
    whyItMatters: 'The technical detail behind the isolation claim in the previous questions.',
  }),
  q({
    id: 'big-brain-05',
    section: 'Big Brain',
    question: 'How does hybrid semantic and structured search work?',
    whyItMatters: 'Confirms the mechanics behind an existing public claim so it can be described accurately.',
    knownInformation: FACT_BIG_BRAIN_SEARCH,
  }),
  q({
    id: 'big-brain-06',
    section: 'Big Brain',
    question: 'How are embedding models selected?',
    whyItMatters: 'Affects both search quality and data handling, and is a natural developer question.',
  }),
  q({
    id: 'big-brain-07',
    section: 'Big Brain',
    question: 'How does re-embedding work?',
    whyItMatters: 'Determines what happens when an embedding model changes or existing content is updated.',
  }),
  q({
    id: 'big-brain-08',
    section: 'Big Brain',
    question: 'How is long content divided into searchable chunks?',
    whyItMatters: 'A common integration detail that affects how developers structure what they store in Big Brain.',
  }),
  q({
    id: 'big-brain-09',
    section: 'Big Brain',
    question: 'How quickly does new information become searchable?',
    whyItMatters: 'Sets realistic expectations for near-real-time use cases.',
  }),
  q({
    id: 'big-brain-10',
    section: 'Big Brain',
    question: 'How are records updated and deleted?',
    whyItMatters: 'Needed for both developer documentation and data-retention conversations.',
  }),
  q({
    id: 'big-brain-11',
    section: 'Big Brain',
    question: 'What record, rate or query limits apply?',
    whyItMatters: 'Developers need known limits before they can design around them.',
  }),
  q({
    id: 'big-brain-12',
    section: 'Big Brain',
    question: 'What performance or scale information can be published?',
    whyItMatters: 'Distinguishes what can be stated publicly from what is still informal or unmeasured.',
  }),
  q({
    id: 'big-brain-13',
    section: 'Big Brain',
    question: 'How does Big Brain differ from file storage or a conventional database?',
    whyItMatters: 'Buyers will naturally ask this comparison question.',
    knownInformation: FACT_BIG_BRAIN_DEFINITION,
  }),
  q({
    id: 'big-brain-14',
    section: 'Big Brain',
    question: 'What REST API operations are available?',
    whyItMatters: 'Directly required for the Developer Documentation REST API section.',
    knownInformation: FACT_BIG_BRAIN_ACCESS,
  }),

  // 5. Models and AI providers
  q({
    id: 'models-01',
    section: 'Models and AI providers',
    question: 'How are models selected and configured?',
    whyItMatters: 'The mechanism behind the existing public claim that model choice is configurable.',
    knownInformation: `${FACT_MODEL_CONFIG} ${FACT_OPENROUTER}`,
  }),
  q({
    id: 'models-02',
    section: 'Models and AI providers',
    question: 'Which model parameters can be controlled per step or Teammate?',
    whyItMatters: 'Developers need the actual configuration surface, not just the concept.',
    knownInformation: FACT_MODEL_CONFIG,
  }),
  q({
    id: 'models-03',
    section: 'Models and AI providers',
    question: 'Can a customer restrict permitted providers or models?',
    whyItMatters: 'A common procurement and compliance question.',
  }),
  q({
    id: 'models-04',
    section: 'Models and AI providers',
    question: 'Is bring-your-own-key available?',
    whyItMatters: 'Directly affects cost, data handling and how the platform can be described to technical buyers.',
  }),
  q({
    id: 'models-05',
    section: 'Models and AI providers',
    question: 'What model request and response information is logged?',
    whyItMatters: 'Feeds both the audit story and any data-handling disclosure.',
  }),
  q({
    id: 'models-06',
    section: 'Models and AI providers',
    question: 'How are provider failures handled?',
    whyItMatters: 'A reliability question that also affects whether fallback can be claimed.',
  }),
  q({
    id: 'models-07',
    section: 'Models and AI providers',
    question: 'Is model fallback supported?',
    whyItMatters: 'Should not be assumed without confirmation, given the reliability and determinism safety rules for this review.',
  }),
  q({
    id: 'models-08',
    section: 'Models and AI providers',
    question: 'How are context-window limits handled?',
    whyItMatters: 'A practical developer concern when working with larger inputs.',
  }),
  q({
    id: 'models-09',
    section: 'Models and AI providers',
    question: 'How are large payloads kept within model limits?',
    whyItMatters: 'Related to context-window handling and relevant to Big Brain and Pipeline design.',
  }),
  q({
    id: 'models-10',
    section: 'Models and AI providers',
    question: 'How does Harba prevent uncontrolled model usage or cost?',
    whyItMatters: 'Directly supports the usage-and-cost-control claims made elsewhere in the review.',
  }),
  q({
    id: 'models-11',
    section: 'Models and AI providers',
    question: 'What information is sent to OpenRouter and the underlying model provider?',
    whyItMatters: 'Core to any accurate data-handling statement.',
    knownInformation: FACT_OPENROUTER,
  }),
  q({
    id: 'models-12',
    section: 'Models and AI providers',
    question: 'How should customer requirements be matched to provider data policies?',
    whyItMatters: 'Needed before making any statement about training or data use, given the explicit rule against overclaiming this.',
    knownInformation: FACT_PROVIDER_POLICY,
  }),
  q({
    id: 'models-13',
    section: 'Models and AI providers',
    question: 'Which model-provider claims are safe to publish?',
    whyItMatters: 'A direct checkpoint against the rule that not all providers can be said to exclude customer data from training.',
    knownInformation: FACT_PROVIDER_POLICY,
  }),

  // 6. Integrations and developer access
  q({
    id: 'integrations-01',
    section: 'Integrations and developer access',
    question: 'Which integration methods are currently supported?',
    whyItMatters: 'Foundational for both the Technical Overview and the Developer Documentation.',
    knownInformation: `${FACT_INTEGRATION_METHODS} ${FACT_WORKS_WITH_EXISTING} ${FACT_CHANNELS}`,
  }),
  q({
    id: 'integrations-02',
    section: 'Integrations and developer access',
    question: 'What can developers do through the REST API?',
    whyItMatters: 'Defines the real scope of the REST API documentation section.',
  }),
  q({
    id: 'integrations-03',
    section: 'Integrations and developer access',
    question: 'What MCP tools are currently available?',
    whyItMatters: 'Needed before the MCP documentation section can contain anything concrete.',
  }),
  q({
    id: 'integrations-04',
    section: 'Integrations and developer access',
    question: 'How are inbound webhooks authenticated and validated?',
    whyItMatters: 'A standard, expected security question for any webhook-based integration.',
  }),
  q({
    id: 'integrations-05',
    section: 'Integrations and developer access',
    question: 'How does Harba write information back to customer systems?',
    whyItMatters: 'Completes the integration picture beyond just receiving data.',
  }),
  q({
    id: 'integrations-06',
    section: 'Integrations and developer access',
    question: 'Can developers create custom tools or Pipeline steps?',
    whyItMatters: 'Central to how much direct extensibility can honestly be offered today.',
  }),
  q({
    id: 'integrations-07',
    section: 'Integrations and developer access',
    question: 'Can developers run their own code?',
    whyItMatters: 'A direct test of how far "work more directly with the platform" can be taken today.',
  }),
  q({
    id: 'integrations-08',
    section: 'Integrations and developer access',
    question: 'How are integration credentials stored?',
    whyItMatters: 'A standard security review question with a specific expected answer.',
  }),
  q({
    id: 'integrations-09',
    section: 'Integrations and developer access',
    question: 'How are credentials made available to Pipelines and Teammates?',
    whyItMatters: 'The practical mechanism behind secure integration access.',
  }),
  q({
    id: 'integrations-10',
    section: 'Integrations and developer access',
    question: 'How are integration errors handled?',
    whyItMatters: 'Needed for the Developer Documentation errors and retries section.',
  }),
  q({
    id: 'integrations-11',
    section: 'Integrations and developer access',
    question: 'Which implementation work must Harba perform?',
    whyItMatters: 'Defines the real boundary of the managed-first model in practice.',
  }),
  q({
    id: 'integrations-12',
    section: 'Integrations and developer access',
    question: 'What can a customer’s developer own?',
    whyItMatters: 'The direct counterpart to the previous question, from the developer’s side.',
  }),
  q({
    id: 'integrations-13',
    section: 'Integrations and developer access',
    question: 'How does a developer receive access?',
    whyItMatters: 'Needed before "Request developer access" can be described accurately rather than aspirationally.',
  }),
  q({
    id: 'integrations-14',
    section: 'Integrations and developer access',
    question: 'Can developers create a test workspace?',
    whyItMatters: 'A common early question from any technical evaluator.',
  }),
  q({
    id: 'integrations-15',
    section: 'Integrations and developer access',
    question: 'Are development and production environments separated?',
    whyItMatters: 'A standard expectation for any serious integration work.',
  }),
  q({
    id: 'integrations-16',
    section: 'Integrations and developer access',
    question: 'How are changes tested, versioned and deployed?',
    whyItMatters: 'Needed for the environments and deployment documentation section.',
  }),
  q({
    id: 'integrations-17',
    section: 'Integrations and developer access',
    question: 'What documentation or API references already exist?',
    whyItMatters: 'Determines how much of the Developer Documentation can be populated now versus later.',
  }),
  q({
    id: 'integrations-18',
    section: 'Integrations and developer access',
    question: 'Which integrations are proven today?',
    whyItMatters: 'Distinguishes demonstrated integration work from theoretical capability.',
  }),

  // 7. Security and data
  q({
    id: 'security-01',
    section: 'Security and data',
    question: 'Which services run on Fly.io?',
    whyItMatters: 'Supports the existing public hosting claim with enough precision to be defensible, without exposing exploitable detail.',
    knownInformation: FACT_HOSTING,
  }),
  q({
    id: 'security-02',
    section: 'Security and data',
    question: 'Which services run on Scaleway?',
    whyItMatters: 'Same as the previous question, for the second hosting provider.',
    knownInformation: FACT_HOSTING,
  }),
  q({
    id: 'security-03',
    section: 'Security and data',
    question: 'How is the hosting region selected and enforced?',
    whyItMatters: 'Turns the EU and USA hosting claim into a real, checkable mechanism.',
    knownInformation: FACT_HOSTING,
  }),
  q({
    id: 'security-04',
    section: 'Security and data',
    question: 'How is data encrypted in transit?',
    whyItMatters: 'A standard, expected security question.',
  }),
  q({
    id: 'security-05',
    section: 'Security and data',
    question: 'How is data encrypted at rest?',
    whyItMatters: 'A standard, expected security question.',
  }),
  q({
    id: 'security-06',
    section: 'Security and data',
    question: 'How are secrets stored and rotated?',
    whyItMatters: 'A standard security review question that must be answered without exposing exploitable detail, even in a safe summary.',
  }),
  q({
    id: 'security-07',
    section: 'Security and data',
    question: 'How are workspace permissions enforced?',
    whyItMatters: 'The mechanism behind the customer separation described elsewhere in the review.',
  }),
  q({
    id: 'security-08',
    section: 'Security and data',
    question: 'How is cross-customer access prevented?',
    whyItMatters: 'Directly supports the multi-tenant isolation story.',
  }),
  q({
    id: 'security-09',
    section: 'Security and data',
    question: 'What information is included in the audit trail?',
    whyItMatters: 'Turns the platform-activity-is-audited claim into something specific enough to describe publicly.',
    knownInformation: FACT_AUDIT,
  }),
  q({
    id: 'security-10',
    section: 'Security and data',
    question: 'What customer data is retained?',
    whyItMatters: 'A standard data protection and procurement question.',
  }),
  q({
    id: 'security-11',
    section: 'Security and data',
    question: 'How long is it retained?',
    whyItMatters: 'Needed alongside the previous question for any retention statement.',
  }),
  q({
    id: 'security-12',
    section: 'Security and data',
    question: 'How is data deleted?',
    whyItMatters: 'Completes the data lifecycle picture.',
  }),
  q({
    id: 'security-13',
    section: 'Security and data',
    question: 'What backups and recovery processes exist?',
    whyItMatters: 'A standard reliability and continuity question.',
  }),
  q({
    id: 'security-14',
    section: 'Security and data',
    question: 'What monitoring and incident processes exist?',
    whyItMatters: 'Needed before any uptime or incident-response claim can be made.',
  }),
  q({
    id: 'security-15',
    section: 'Security and data',
    question: 'Which subprocessors are involved?',
    whyItMatters: 'A standard procurement and data protection question.',
  }),
  q({
    id: 'security-16',
    section: 'Security and data',
    question: 'Is a DPA available?',
    whyItMatters: 'A common blocker or accelerator in enterprise procurement.',
  }),
  q({
    id: 'security-17',
    section: 'Security and data',
    question: 'Are there security reviews, certifications or testing that can be referenced?',
    whyItMatters: 'Determines what evidence, if any, can support the Governance and Technical Overview pages.',
  }),
  q({
    id: 'security-18',
    section: 'Security and data',
    question: 'Which answers are public, customer-only or confidential?',
    whyItMatters: 'The final classification pass across this section, which the rest of the review depends on being accurate.',
  }),

  // 8. Reliability and observability
  q({
    id: 'reliability-01',
    section: 'Reliability and observability',
    question: 'How are Pipeline and Teammate runs monitored?',
    whyItMatters: 'Needed before any reliability claim can be made with confidence.',
  }),
  q({
    id: 'reliability-02',
    section: 'Reliability and observability',
    question: 'What logs can users see?',
    whyItMatters: 'Defines what customers can self-diagnose versus what requires Harba involvement.',
  }),
  q({
    id: 'reliability-03',
    section: 'Reliability and observability',
    question: 'What internal logs does Harba retain?',
    whyItMatters: 'Distinct from user-visible logs, and relevant to both support and data-retention questions.',
  }),
  q({
    id: 'reliability-04',
    section: 'Reliability and observability',
    question: 'What alerts currently exist?',
    whyItMatters: 'Establishes whether issues are caught proactively or only reported after the fact.',
  }),
  q({
    id: 'reliability-05',
    section: 'Reliability and observability',
    question: 'How are stalled jobs identified?',
    whyItMatters: 'A specific, common operational question for anything running asynchronous work.',
  }),
  q({
    id: 'reliability-06',
    section: 'Reliability and observability',
    question: 'How are provider and system outages handled?',
    whyItMatters: 'Needed before describing resilience to external failures.',
  }),
  q({
    id: 'reliability-07',
    section: 'Reliability and observability',
    question: 'What happens if a customer system is unavailable?',
    whyItMatters: 'A realistic and common failure mode worth answering precisely.',
  }),
  q({
    id: 'reliability-08',
    section: 'Reliability and observability',
    question: 'How are partial results handled?',
    whyItMatters: 'Determines whether incomplete work is visible or silently lost.',
  }),
  q({
    id: 'reliability-09',
    section: 'Reliability and observability',
    question: 'How are unusually slow or expensive runs identified?',
    whyItMatters: 'Connects reliability to the cost-control story elsewhere in the review.',
  }),
  q({
    id: 'reliability-10',
    section: 'Reliability and observability',
    question: 'What reliability metrics can be published?',
    whyItMatters: 'Distinguishes internal operational data from anything safe to state publicly.',
  }),
  q({
    id: 'reliability-11',
    section: 'Reliability and observability',
    question: 'What operational intervention can Harba perform?',
    whyItMatters: 'Clarifies what "managed" actually means when something goes wrong.',
  }),
  q({
    id: 'reliability-12',
    section: 'Reliability and observability',
    question: 'What can customers diagnose themselves?',
    whyItMatters: 'The direct counterpart to the previous question, and relevant to how self-directed developers are supported.',
  }),

  // 9. Usage and cost control
  q({
    id: 'usage-01',
    section: 'Usage and cost control',
    question: 'What usage is recorded?',
    whyItMatters: 'The foundation for every other question in this section.',
    knownInformation: FACT_USAGE_VISIBILITY,
  }),
  q({
    id: 'usage-02',
    section: 'Usage and cost control',
    question: 'Can usage be attributed by workspace, project, Pipeline, Teammate, step and model?',
    whyItMatters: 'Determines how precisely cost and usage can be reported today.',
  }),
  q({
    id: 'usage-03',
    section: 'Usage and cost control',
    question: 'How are model costs calculated?',
    whyItMatters: 'A direct and expected question from any technical buyer thinking about cost.',
  }),
  q({
    id: 'usage-04',
    section: 'Usage and cost control',
    question: 'How are infrastructure costs represented?',
    whyItMatters: 'Completes the cost picture beyond model usage alone.',
  }),
  q({
    id: 'usage-05',
    section: 'Usage and cost control',
    question: 'How is Big Brain usage measured?',
    whyItMatters: 'Extends the usage story to the knowledge layer, not just model calls.',
  }),
  q({
    id: 'usage-06',
    section: 'Usage and cost control',
    question: 'Can customers set spending or usage limits?',
    whyItMatters: 'Turns the general cost-visibility claim into a concrete control.',
  }),
  q({
    id: 'usage-07',
    section: 'Usage and cost control',
    question: 'What happens when a limit is reached?',
    whyItMatters: 'Needed before describing limits as an actual safeguard rather than just a number on a dashboard.',
  }),
  q({
    id: 'usage-08',
    section: 'Usage and cost control',
    question: 'Are customers warned before reaching a limit?',
    whyItMatters: 'A common expectation once limits are described as a feature.',
  }),
  q({
    id: 'usage-09',
    section: 'Usage and cost control',
    question: 'What usage information can be accessed through the API?',
    whyItMatters: 'Needed for the Developer Documentation usage and limits section.',
  }),
  q({
    id: 'usage-10',
    section: 'Usage and cost control',
    question: 'Which cost controls are live and which are planned?',
    whyItMatters: 'Keeps this section honest about current capability versus roadmap.',
    knownInformation: FACT_USAGE_VISIBILITY,
  }),

  // 10. Limitations and fit
  q({
    id: 'limitations-01',
    section: 'Limitations and fit',
    question: 'What are Harba’s main technical limitations today?',
    whyItMatters: 'Sets the honest baseline the rest of this section builds on.',
  }),
  q({
    id: 'limitations-02',
    section: 'Limitations and fit',
    question: 'Which limitations are inherent to AI?',
    whyItMatters: 'Separates platform-specific gaps from limitations of AI generally, which matters for how they are described.',
  }),
  q({
    id: 'limitations-03',
    section: 'Limitations and fit',
    question: 'Which limitations are current product gaps?',
    whyItMatters: 'The direct counterpart to the previous question.',
  }),
  q({
    id: 'limitations-04',
    section: 'Limitations and fit',
    question: 'Which tasks should always retain human judgement?',
    whyItMatters: 'Directly informs where approvals and human review should be positioned as necessary rather than optional.',
  }),
  q({
    id: 'limitations-05',
    section: 'Limitations and fit',
    question: 'Which workloads are a poor fit for Harba?',
    whyItMatters: 'Protects both the buyer and Harba from a bad-fit engagement.',
  }),
  q({
    id: 'limitations-06',
    section: 'Limitations and fit',
    question: 'What should never be described as deterministic?',
    whyItMatters: 'A direct checkpoint against one of the explicit safety rules for this review.',
  }),
  q({
    id: 'limitations-07',
    section: 'Limitations and fit',
    question: 'What workload or data-volume limits currently exist?',
    whyItMatters: 'Needed before any capacity claim can be made to a technical buyer.',
  }),
  q({
    id: 'limitations-08',
    section: 'Limitations and fit',
    question: 'Where is Harba stronger than a general automation platform?',
    whyItMatters: 'Gives the Technical Overview a genuine point of differentiation, if one exists.',
  }),
  q({
    id: 'limitations-09',
    section: 'Limitations and fit',
    question: 'Where would an experienced developer reasonably choose another tool?',
    whyItMatters: 'An honest answer here builds more credibility with technical buyers than avoiding the question.',
  }),
  q({
    id: 'limitations-10',
    section: 'Limitations and fit',
    question: 'When does Harba’s managed involvement add the most value?',
    whyItMatters: 'Reinforces the managed-first positioning with a concrete answer rather than an assertion.',
  }),
  q({
    id: 'limitations-11',
    section: 'Limitations and fit',
    question: 'What support would a self-directed developer still require?',
    whyItMatters: 'Defines the realistic middle ground between fully managed and fully self-service.',
  }),
  q({
    id: 'limitations-12',
    section: 'Limitations and fit',
    question: 'What must be built before genuinely instant self-service is possible?',
    whyItMatters: 'Sets the honest bar for the rule against describing developer access as instant unless confirmed.',
  }),
]
