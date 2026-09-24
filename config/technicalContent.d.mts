export interface QuestionContentEntry {
  id: string
  section: string
  question: string
  whyItMatters: string
  knownInformation: string
}

export const technicalContent: QuestionContentEntry[]

export const STATUS_OPTIONS: string[]
export const CAPABILITY_STATUS_OPTIONS: string[]

export interface QuestionAnswerStateShape {
  audience: string[]
  answer: string
  status: string
  classification: string | null
  capabilityStatus: string
  evidence: string
  publicSummary: string
  documentationContent: string
  internalNotes: string
  flaggedForFollowUp: boolean
}

export function defaultAnswerState(): QuestionAnswerStateShape
