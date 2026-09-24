export const failedPaths = [
  { path: 'DIY builders', wrong: 'Canvas excitement, then nobody owns production.', response: 'Configured, deployed and continuously improved with you.' },
  { path: 'Suite agents', wrong: 'Powerful inside one vendor, while real work spans many systems.', response: 'A neutral operating layer across CRM, ERP, finance, documents and communications.' },
  { path: 'Agency black box', wrong: 'Delivered as a one-off solution that is difficult to govern, understand or reuse.', response: 'Managed on a visible platform of Pipelines, Big Brain, Teammates and Modules.' },
]

// Concise homepage summary of the four-stage engagement process. The
// How we work page (src/pages/HowWeWork.tsx) is the source of truth for
// the process itself, with the fuller explanation of each stage; keep
// these titles in sync with it rather than duplicating its detail here.
export const engageSteps = [
  { number: '01', title: 'Understand', text: 'Understand the process, people, systems and result required.' },
  { number: '02', title: 'Shape', text: 'Define the first implementation, its scope and what it will require.' },
  { number: '03', title: 'Configure', text: 'Configure the Pipelines, knowledge, Teammates, approvals and integrations.' },
  { number: '04', title: 'Deploy and improve', text: 'Introduce Harba into real work, then refine and expand it over time.' },
]

export const stackShowcase = [
  {
    id: 'pipelines',
    title: 'Pipelines',
    lead: 'The controlled foundation that gets work done.',
    text: 'Pipelines turn repeatable business processes into governed AI workflows. They connect agents, system actions and human approvals in a defined sequence, making work more consistent, traceable and reliable than asking AI to complete an open-ended task on its own.',
  },
  {
    id: 'big-brain',
    title: 'Big Brain',
    lead: 'Searchable business knowledge that improves every interaction.',
    text: 'Big Brain turns business information and pipeline outputs into searchable, reusable knowledge. Pipelines, Teammates and your Personal Assistant can draw on the same context, so Harba does not start from a blank page every time work begins.',
  },
  {
    id: 'teammates',
    title: 'Teammates',
    lead: 'AI agents with roles, knowledge and work to do.',
    text: 'Teammates work with your business data, existing systems, Big Brain and pipelines. They can research, analyse, prepare work and collaborate with other Teammates, while operating within the access, instructions and controls defined for their role.',
  },
  {
    id: 'modules',
    title: 'Modules',
    lead: 'Prepared solutions for specific jobs and industries.',
    text: 'Modules package pipelines, Teammates and the right interface around a defined business outcome. They provide a faster starting point for activities such as finding aircraft parts, reviewing client documents or progressing property sales, while still being configured around the way each business operates.',
  },
  {
    id: 'personal-assistant',
    title: 'Personal Assistant',
    lead: 'One simple way to access your AI-powered business.',
    text: 'Your Personal Assistant understands your business context, priorities and available knowledge. You can ask questions, find information and manage your day naturally, while it involves the right Teammates or triggers the right governed pipeline when work needs to be completed.',
  },
]

export const capabilityRow = [
  { id: 'voice', label: 'Voice' },
  { id: 'messaging', label: 'WhatsApp and messaging' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'approvals', label: 'Human approvals' },
  { id: 'audit', label: 'Run visibility' },
  { id: 'cost', label: 'Usage and cost controls' },
]

export const moduleCards = [
  { title: 'Intake and triage', text: 'Turn incoming requests, emails or forms into the right owned workflow.' },
  { title: 'Document processing', text: 'Collect, review, chase and return information to the correct system.' },
  { title: 'Exception handling', text: 'Investigate failed or unusual cases and route them to the right person.' },
  { title: 'Research to action', text: 'Gather context, make a recommendation and trigger the appropriate governed process.' },
]

export const trustTiles = ['Human approvals', 'Pipeline run history', 'Model controls', 'Usage and cost visibility']

export const controlByDesignPoints = [
  'Configurable human approvals',
  'Recorded Pipeline activity',
  'Workspace access controls',
  'Visible usage and cost',
  'Customer-specific Pipelines and Teammates',
]

export const customerEnvironmentPoints = [
  'Separate customer workspace and data',
  'Customer-specific system connections',
  'Hosting aligned with agreed requirements',
]
