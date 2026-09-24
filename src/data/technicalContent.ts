// Shared structured content source for the three technical routes:
// /technical-review (internal workspace), /technical (Technical Overview draft)
// and /docs (Developer Documentation draft).
//
// This file holds the TypeScript types and options for each question, plus
// re-exports the FIXED, non-editable question content (id, section,
// question, why it matters, known information) from
// config/technicalContent.mjs - a plain-JS file so the Express server can
// read the same question list when building the transcript-extraction
// prompt (see server/reviewTranscript.js), without going through the TS
// toolchain. The part Rob and Harry fill in during the review (answer,
// status, classification, capability status, audience, evidence, public
// summary, documentation content, internal notes, follow-up flag) is kept
// separately in a small server-side database — see src/lib/reviewStorage.ts.
//
// Nothing in this file is a claim about Harba. Known-information entries are
// starting facts supplied for the review, not confirmed public answers.

import {
  technicalContent as rawTechnicalContent,
  STATUS_OPTIONS as rawStatusOptions,
  CAPABILITY_STATUS_OPTIONS as rawCapabilityStatusOptions,
  defaultAnswerState as rawDefaultAnswerState,
} from '../../config/technicalContent.mjs'

export const REVIEW_SECTIONS = [
  'Architecture',
  'Pipelines and execution',
  'Teammates',
  'Big Brain',
  'Models and AI providers',
  'Integrations and developer access',
  'Security and data',
  'Reliability and observability',
  'Usage and cost control',
  'Limitations and fit',
] as const

export type ReviewSection = (typeof REVIEW_SECTIONS)[number]

export const STATUS_OPTIONS = rawStatusOptions as unknown as readonly ['Unanswered', 'Partially answered', 'Answered', 'Needs verification']
export type QuestionStatus = (typeof STATUS_OPTIONS)[number]

export const CLASSIFICATION_OPTIONS = ['Public', 'Customer-only', 'Confidential', 'Not applicable'] as const
export type Classification = (typeof CLASSIFICATION_OPTIONS)[number]

export const CAPABILITY_STATUS_OPTIONS = rawCapabilityStatusOptions as unknown as readonly ['Live', 'Configurable', 'Planned', 'Deprecated', 'Unknown']
export type CapabilityStatus = (typeof CAPABILITY_STATUS_OPTIONS)[number]

export const AUDIENCE_OPTIONS = ['Technical Overview', 'Developer Documentation', 'Governance', 'Internal only'] as const
export type Audience = (typeof AUDIENCE_OPTIONS)[number]

/** The fixed, shared part of a question. This is `technicalContent`. */
export interface QuestionContent {
  id: string
  section: ReviewSection
  question: string
  whyItMatters: string
  /** Starting information supplied ahead of the review. Not a confirmed answer. */
  knownInformation: string
}

/** The part Rob and Harry fill in. Stored server-side, keyed by question id. */
export interface QuestionAnswerState {
  audience: Audience[]
  answer: string
  status: QuestionStatus
  classification: Classification | null
  capabilityStatus: CapabilityStatus
  evidence: string
  publicSummary: string
  documentationContent: string
  internalNotes: string
  flaggedForFollowUp: boolean
}

/** Content and answer state merged, for display and export. */
export type TechnicalQuestion = QuestionContent & QuestionAnswerState

export function defaultAnswerState(): QuestionAnswerState {
  return rawDefaultAnswerState() as QuestionAnswerState
}

export const technicalContent: QuestionContent[] = rawTechnicalContent as unknown as QuestionContent[]

export function questionsBySection(section: ReviewSection): QuestionContent[] {
  return technicalContent.filter((item) => item.section === section)
}
