export type UseCase = {
  industry: string
  heading: string
  intro: string
  connect: string
  remember: string
  work: string
  interact: string
  outcome: string
  question: string
}

export const useCases: UseCase[] = [
  {
    industry: 'Aviation',
    heading: 'Find parts, process enquiries and prepare quotes faster',
    intro: 'For an aviation parts business, Harba could connect sourcing, supplier communication and commercial processes without replacing the specialist systems the business already uses.',
    connect: 'Connect Harba with RFQ inboxes, supplier platforms, inventory systems, CRM data and existing operational software.',
    remember: 'Big Brain builds searchable knowledge from previous RFQs, part requirements, supplier responses, availability, pricing and commercial decisions.',
    work: 'Governed pipelines process incoming RFQs, search connected sources, compare results and prepare quote options. Teammates support sourcing, supplier communication, follow-ups and commercial administration.',
    interact: 'Staff work through their Personal Assistant to ask questions, review progress and involve the right teammates or pipelines.',
    outcome: 'Respond to opportunities faster, reduce manual searching and retain valuable commercial knowledge.',
    question: 'Which suppliers have previously quoted this part, and what is the best current option?',
  },
  {
    industry: 'Estate agency',
    heading: 'Give every client conversation more context',
    intro: 'For an estate agency, Harba could connect information spread across calls, emails, property systems and customer records.',
    connect: 'Connect Harba with the agency’s CRM, property software, email, call data and other existing systems.',
    remember: 'Big Brain builds searchable knowledge about buyers, vendors, properties, conversations, requirements and previous decisions.',
    work: 'Governed pipelines process information, update knowledge and carry out repeatable activities. Teammates support enquiries, follow-ups, client preparation and administration.',
    interact: 'Agents speak naturally to their Personal Assistant, which understands the wider context and involves the right teammate or pipeline when work needs to be completed.',
    outcome: 'Deliver faster follow-ups, reduce administration and miss fewer opportunities.',
    question: 'Which active buyers are most likely to be interested in this property, and why?',
  },
  {
    industry: 'Accountancy',
    heading: 'Process client information with greater consistency',
    intro: 'For an accountancy firm, Harba could support high-volume document and data processes while retaining human control over important decisions.',
    connect: 'Connect Harba with document storage, accounting software, email, client portals and internal systems.',
    remember: 'Big Brain stores searchable client rules, previous decisions, supporting records and the context needed to handle each account correctly.',
    work: 'Governed pipelines extract and check information from invoices, receipts and client documents before passing approved data into the relevant system. Teammates help review discrepancies, prepare information and support client queries.',
    interact: 'Staff use their Personal Assistant to find information, understand what needs attention and start the appropriate governed process.',
    outcome: 'Reduce repetitive processing, improve consistency and give staff more time for valuable client work.',
    question: 'Which client documents are incomplete, and what information do we still need?',
  },
  {
    industry: 'Recruitment',
    heading: 'Turn scattered candidate knowledge into useful action',
    intro: 'For a recruitment agency, Harba could bring together information about candidates, clients, vacancies and conversations.',
    connect: 'Connect Harba with the agency’s CRM, applicant tracking system, email, calendars, call data and job platforms.',
    remember: 'Big Brain builds searchable knowledge about candidates, client requirements, vacancies, previous conversations and placement history.',
    work: 'Governed pipelines process job requirements, structure candidate information and identify potential matches. Teammates support research, shortlisting, preparation and follow-ups.',
    interact: 'Consultants use their Personal Assistant to explore the agency’s knowledge, manage priorities and involve the right teammate or pipeline.',
    outcome: 'Create stronger shortlists, respond to clients faster and make better use of existing candidate relationships.',
    question: 'Who have we spoken to in the past six months who could be suitable for this role?',
  },
  {
    industry: 'Customer service',
    heading: 'Resolve more enquiries with the full picture',
    intro: 'For a customer service operation, Harba could help teams understand, research and respond to incoming requests across multiple systems.',
    connect: 'Connect Harba with helpdesks, email, CRM records, product information, order systems and internal documentation.',
    remember: 'Big Brain provides searchable knowledge from previous cases, customer history, product information and approved support guidance.',
    work: 'Governed pipelines classify enquiries, gather relevant information and prepare or send approved responses. Teammates support triage, research, resolution and escalation.',
    interact: 'Service teams and managers use their Personal Assistant to investigate issues, review priorities and co-ordinate the appropriate response.',
    outcome: 'Resolve enquiries faster, provide more consistent answers and identify recurring customer problems.',
    question: 'Why is this customer contacting us again, and what has already been tried?',
  },
  {
    industry: 'Marketing agencies',
    heading: 'Give every piece of work the right client context',
    intro: 'For a marketing agency, Harba could connect client knowledge, briefing, production, quality assurance and reporting.',
    connect: 'Connect Harba with project management tools, email, document storage, analytics platforms and client systems.',
    remember: 'Big Brain builds searchable knowledge about each client’s brand, campaigns, audiences, feedback and previous decisions.',
    work: 'Governed pipelines turn requests into structured briefs, support production and run defined checks before work is delivered. Teammates assist with research, content, reporting and account administration.',
    interact: 'Account managers use their Personal Assistant to access client knowledge, understand project status and co-ordinate teammates and pipelines.',
    outcome: 'Produce work with better context, reduce repeated briefing and maintain greater consistency across client accounts.',
    question: 'What have we previously agreed about this client’s audience, tone and campaign priorities?',
  },
]

export const systemParts = [
  { id: 'pipelines', title: 'Pipelines', text: 'Governed, repeatable processes that carry out work consistently.' },
  { id: 'modules', title: 'Modules', text: 'Prepared combinations of pipelines, teammates and interfaces for particular jobs or industries.' },
  { id: 'teammates', title: 'Teammates', text: 'AI agents configured for particular roles that work with business data, systems, Pipelines and each other.' },
  { id: 'personal-assistant', title: 'Personal Assistant', text: 'The simple conversational interface through which each person accesses knowledge and co-ordinates work.' },
  { id: 'big-brain', title: 'Big Brain', text: 'Your workspace’s searchable business memory, available to authorised Harba components.' },
  { id: 'integrations', title: 'Integrations', text: 'The connections that allow Harba to work with existing systems rather than becoming another central system that replaces them.' },
]
