import { technicalContent, type Audience, type ReviewSection, type TechnicalQuestion } from './technicalContent'
import { mergedQuestions, type AnswerMap } from '../lib/reviewStorage'

export interface PreviewSectionDef {
  slug: string
  title: string
  /** Internal review sections whose confirmed public content can appear here. */
  sections?: ReviewSection[]
  /** Specific question ids, for preview sections that draw on more than one review section. */
  questionIds?: string[]
}

function collectIds(def: PreviewSectionDef): Set<string> {
  const ids = new Set(def.questionIds ?? [])
  if (def.sections) {
    for (const item of technicalContent) {
      if (def.sections.includes(item.section)) ids.add(item.id)
    }
  }
  return ids
}

export const TECHNICAL_OVERVIEW_STRUCTURE: PreviewSectionDef[] = [
  { slug: 'architecture', title: 'Architecture', sections: ['Architecture'] },
  { slug: 'controlled-execution', title: 'Controlled execution', sections: ['Pipelines and execution'] },
  { slug: 'business-knowledge', title: 'Business knowledge', sections: ['Big Brain'] },
  { slug: 'models-and-providers', title: 'Models and providers', sections: ['Models and AI providers'] },
  { slug: 'integration-and-extensibility', title: 'Integration and extensibility', sections: ['Integrations and developer access'] },
  { slug: 'security-and-data', title: 'Security and data', sections: ['Security and data'] },
  { slug: 'reliability-and-observability', title: 'Reliability and observability', sections: ['Reliability and observability'] },
  {
    slug: 'working-with-technical-teams',
    title: 'Working with technical teams',
    questionIds: [
      'integrations-11', 'integrations-12', 'integrations-13', 'integrations-17', 'integrations-18',
      'limitations-10', 'limitations-11', 'limitations-12',
    ],
  },
  { slug: 'known-limitations', title: 'Known limitations', sections: ['Limitations and fit'] },
]

export const DOCS_STRUCTURE: PreviewSectionDef[] = [
  { slug: 'introduction', title: 'Introduction', sections: ['Architecture'] },
  { slug: 'getting-access', title: 'Getting access', questionIds: ['integrations-13', 'integrations-14'] },
  { slug: 'core-concepts', title: 'Core concepts', questionIds: ['architecture-01', 'architecture-02', 'architecture-06'] },
  { slug: 'authentication', title: 'Authentication', questionIds: ['integrations-04', 'integrations-08', 'integrations-09'] },
  { slug: 'pipelines', title: 'Pipelines', sections: ['Pipelines and execution'] },
  { slug: 'teammates', title: 'Teammates', sections: ['Teammates'] },
  { slug: 'big-brain', title: 'Big Brain', sections: ['Big Brain'] },
  { slug: 'rest-api', title: 'REST API', questionIds: ['big-brain-14', 'integrations-02'] },
  { slug: 'webhooks', title: 'Webhooks', questionIds: ['integrations-04', 'integrations-05'] },
  { slug: 'mcp', title: 'MCP', questionIds: ['integrations-03'] },
  { slug: 'custom-tools', title: 'Custom tools', questionIds: ['integrations-06', 'integrations-07'] },
  { slug: 'errors-and-retries', title: 'Errors and retries', questionIds: ['integrations-10', 'pipelines-10', 'pipelines-11', 'pipelines-12'] },
  { slug: 'usage-and-limits', title: 'Usage and limits', sections: ['Usage and cost control'], questionIds: ['big-brain-11', 'models-08', 'models-09'] },
  { slug: 'environments-and-deployment', title: 'Environments and deployment', questionIds: ['integrations-14', 'integrations-15', 'integrations-16'] },
  { slug: 'examples', title: 'Examples' },
  { slug: 'current-limitations', title: 'Current limitations', sections: ['Limitations and fit'] },
]

/**
 * Confirmed, public, audience-assigned questions for one preview section.
 * A question only appears if it is Answered, classified Public, assigned to
 * the requested audience, and has text in the field that audience actually
 * renders (publicSummary for the Technical Overview, documentationContent
 * for Developer Documentation). This is the single safety gate both preview
 * routes rely on.
 */
export function publishableForSection(def: PreviewSectionDef, answers: AnswerMap, audience: Audience): TechnicalQuestion[] {
  const ids = collectIds(def)
  const contentField: 'publicSummary' | 'documentationContent' = audience === 'Developer Documentation' ? 'documentationContent' : 'publicSummary'
  return mergedQuestions(answers).filter(
    (question) =>
      ids.has(question.id) &&
      question.status === 'Answered' &&
      question.classification === 'Public' &&
      question.audience.includes(audience) &&
      question[contentField].trim() !== '',
  )
}

export interface ReadinessScore {
  percent: number | null
  confirmed: number
  assigned: number
}

export function readinessScore(answers: AnswerMap, audience: Audience): ReadinessScore {
  const all = mergedQuestions(answers)
  const assigned = all.filter((question) => question.audience.includes(audience))
  const confirmed = assigned.filter((question) => question.status === 'Answered' && question.classification === 'Public')
  return {
    percent: assigned.length ? Math.round((confirmed.length / assigned.length) * 100) : null,
    confirmed: confirmed.length,
    assigned: assigned.length,
  }
}

// Curated id lists used only to report gaps in the Publication review. These
// do not add content; they flag where a diagram, code example or API
// reference is expected but not yet confirmed and public.
const DIAGRAM_QUESTION_IDS = ['architecture-08']
const CODE_EXAMPLE_RELEVANT_IDS = ['integrations-02', 'integrations-03', 'integrations-04', 'integrations-06', 'integrations-07']
const API_DOCUMENTATION_RELEVANT_IDS = ['big-brain-14', 'integrations-02', 'integrations-03']

export interface PublicationSummary {
  total: number
  unanswered: TechnicalQuestion[]
  needsVerification: TechnicalQuestion[]
  confirmedPublic: TechnicalQuestion[]
  customerOnly: TechnicalQuestion[]
  confidential: TechnicalQuestion[]
  live: TechnicalQuestion[]
  configurable: TechnicalQuestion[]
  planned: TechnicalQuestion[]
  deprecated: TechnicalQuestion[]
  unknownCapability: TechnicalQuestion[]
  flagged: TechnicalQuestion[]
  missingDiagrams: TechnicalQuestion[]
  missingCodeExamples: TechnicalQuestion[]
  missingApiDocs: TechnicalQuestion[]
}

export function publicationSummary(answers: AnswerMap): PublicationSummary {
  const all = mergedQuestions(answers)
  const byId = new Map(all.map((question) => [question.id, question]))
  const notConfirmedPublic = (id: string) => {
    const item = byId.get(id)
    return !item || item.status !== 'Answered' || item.classification !== 'Public'
  }
  const noDocumentationContent = (id: string) => {
    const item = byId.get(id)
    return !item || item.documentationContent.trim() === ''
  }

  return {
    total: all.length,
    unanswered: all.filter((q) => q.status === 'Unanswered'),
    needsVerification: all.filter((q) => q.status === 'Needs verification'),
    confirmedPublic: all.filter((q) => q.status === 'Answered' && q.classification === 'Public'),
    customerOnly: all.filter((q) => q.classification === 'Customer-only'),
    confidential: all.filter((q) => q.classification === 'Confidential'),
    live: all.filter((q) => q.capabilityStatus === 'Live'),
    configurable: all.filter((q) => q.capabilityStatus === 'Configurable'),
    planned: all.filter((q) => q.capabilityStatus === 'Planned'),
    deprecated: all.filter((q) => q.capabilityStatus === 'Deprecated'),
    unknownCapability: all.filter((q) => q.capabilityStatus === 'Unknown'),
    flagged: all.filter((q) => q.flaggedForFollowUp),
    missingDiagrams: DIAGRAM_QUESTION_IDS.filter(notConfirmedPublic).map((id) => byId.get(id)).filter((x): x is TechnicalQuestion => !!x),
    missingCodeExamples: CODE_EXAMPLE_RELEVANT_IDS.filter(noDocumentationContent).map((id) => byId.get(id)).filter((x): x is TechnicalQuestion => !!x),
    missingApiDocs: API_DOCUMENTATION_RELEVANT_IDS.filter(noDocumentationContent).map((id) => byId.get(id)).filter((x): x is TechnicalQuestion => !!x),
  }
}
