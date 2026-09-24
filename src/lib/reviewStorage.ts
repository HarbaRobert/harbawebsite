import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AUDIENCE_OPTIONS,
  CLASSIFICATION_OPTIONS,
  CAPABILITY_STATUS_OPTIONS,
  STATUS_OPTIONS,
  defaultAnswerState,
  technicalContent,
  type Audience,
  type Classification,
  type CapabilityStatus,
  type QuestionAnswerState,
  type QuestionStatus,
  type TechnicalQuestion,
} from '../data/technicalContent'

export type AnswerMap = Record<string, QuestionAnswerState>

const TOKEN_KEY = 'harba-review-access-token'
const SAVE_DEBOUNCE_MS = 800

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setToken(token: string) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // sessionStorage may be unavailable; the access code just won't persist across reloads.
  }
}

function clearToken() {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nothing to do if this fails.
  }
}

async function apiRequest(path: string, init?: RequestInit): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(path, { ...init, headers })
}

function isValidStatus(value: unknown): value is QuestionStatus {
  return typeof value === 'string' && (STATUS_OPTIONS as readonly string[]).includes(value)
}
function isValidClassification(value: unknown): value is Classification {
  return typeof value === 'string' && (CLASSIFICATION_OPTIONS as readonly string[]).includes(value)
}
function isValidCapabilityStatus(value: unknown): value is CapabilityStatus {
  return typeof value === 'string' && (CAPABILITY_STATUS_OPTIONS as readonly string[]).includes(value)
}
function isValidAudienceList(value: unknown): value is Audience[] {
  return Array.isArray(value) && value.every((item) => (AUDIENCE_OPTIONS as readonly string[]).includes(item))
}

/** Defensively coerce an unknown record into a valid QuestionAnswerState, keeping known-good fields only. */
function sanitiseAnswerState(raw: unknown): QuestionAnswerState {
  const fallback = defaultAnswerState()
  if (!raw || typeof raw !== 'object') return fallback
  const value = raw as Record<string, unknown>
  return {
    audience: isValidAudienceList(value.audience) ? value.audience : fallback.audience,
    answer: typeof value.answer === 'string' ? value.answer : fallback.answer,
    status: isValidStatus(value.status) ? value.status : fallback.status,
    classification: isValidClassification(value.classification) ? value.classification : null,
    capabilityStatus: isValidCapabilityStatus(value.capabilityStatus) ? value.capabilityStatus : fallback.capabilityStatus,
    evidence: typeof value.evidence === 'string' ? value.evidence : fallback.evidence,
    publicSummary: typeof value.publicSummary === 'string' ? value.publicSummary : fallback.publicSummary,
    documentationContent: typeof value.documentationContent === 'string' ? value.documentationContent : fallback.documentationContent,
    internalNotes: typeof value.internalNotes === 'string' ? value.internalNotes : fallback.internalNotes,
    flaggedForFollowUp: typeof value.flaggedForFollowUp === 'boolean' ? value.flaggedForFollowUp : fallback.flaggedForFollowUp,
  }
}

function sanitiseAnswerMap(raw: unknown): AnswerMap {
  if (!raw || typeof raw !== 'object') return {}
  const result: AnswerMap = {}
  for (const item of technicalContent) {
    if (item.id in (raw as Record<string, unknown>)) {
      result[item.id] = sanitiseAnswerState((raw as Record<string, unknown>)[item.id])
    }
  }
  return result
}

export interface TranscriptImportResult {
  ok: boolean
  message?: string
  updated?: string[]
}

/**
 * Shared hook for reading and writing the review's answer state, backed by
 * the small server-side database in server/db.js (see server/index.js's
 * /api/review/* routes). All three routes previously read from browser
 * local storage; now they all read from the same server-side answers, so
 * the workspace is no longer tied to one browser or one device.
 */
export function useReviewAnswers() {
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [loading, setLoading] = useState(true)
  const [authRequired, setAuthRequired] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const load = useCallback(async () => {
    if (typeof window === 'undefined') return
    setLoading(true)
    try {
      const res = await apiRequest('/api/review/answers')
      if (res.status === 401 || res.status === 503) {
        setAuthRequired(true)
        return
      }
      const data = await res.json()
      if (data?.ok) {
        setAnswers(sanitiseAnswerMap(data.answers))
        setAuthRequired(false)
      }
    } catch {
      // Network error on initial load: leave the workspace empty rather than crash.
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const submitAccessCode = useCallback(async (code: string): Promise<boolean> => {
    setToken(code)
    setAuthError(null)
    try {
      const res = await apiRequest('/api/review/answers')
      if (res.status === 401) {
        clearToken()
        setAuthError('Incorrect access code.')
        return false
      }
      if (res.status === 503) {
        setAuthError('The review workspace is not configured on the server yet.')
        return false
      }
      const data = await res.json()
      if (data?.ok) {
        setAnswers(sanitiseAnswerMap(data.answers))
        setAuthRequired(false)
        return true
      }
      setAuthError('Something went wrong. Please try again.')
      return false
    } catch {
      setAuthError('Could not reach the server. Check your connection and try again.')
      return false
    }
  }, [])

  const updateQuestion = useCallback((id: string, patch: Partial<QuestionAnswerState>) => {
    let nextState: QuestionAnswerState | null = null
    setAnswers((current) => {
      const existing = current[id] ?? defaultAnswerState()
      nextState = { ...existing, ...patch }
      return { ...current, [id]: nextState }
    })
    clearTimeout(saveTimers.current[id])
    saveTimers.current[id] = setTimeout(() => {
      if (!nextState) return
      apiRequest(`/api/review/answers/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(nextState) })
        .then((res) => {
          if (res.ok) setLastSavedAt(Date.now())
        })
        .catch(() => {
          // A dropped autosave isn't fatal - the field still holds its value locally.
        })
    }, SAVE_DEBOUNCE_MS)
  }, [])

  const replaceAll = useCallback((next: AnswerMap) => {
    setAnswers(next)
    apiRequest('/api/review/answers', { method: 'PUT', body: JSON.stringify({ answers: next }) })
      .then((res) => {
        if (res.ok) setLastSavedAt(Date.now())
      })
      .catch(() => {})
  }, [])

  const clearAll = useCallback(() => {
    setAnswers({})
    apiRequest('/api/review/answers', { method: 'DELETE' })
      .then((res) => {
        if (res.ok) setLastSavedAt(Date.now())
      })
      .catch(() => {})
  }, [])

  const importTranscript = useCallback(async (transcript: string): Promise<TranscriptImportResult> => {
    try {
      const res = await apiRequest('/api/review/transcript', { method: 'POST', body: JSON.stringify({ transcript }) })
      const data = await res.json().catch(() => null)
      if (!res.ok || !data?.ok) {
        return { ok: false, message: data?.message || `Import failed (HTTP ${res.status}).` }
      }
      setAnswers(sanitiseAnswerMap(data.answers))
      setLastSavedAt(Date.now())
      return { ok: true, updated: data.updated as string[] }
    } catch {
      return { ok: false, message: 'Could not reach the server. Check your connection and try again.' }
    }
  }, [])

  return {
    answers,
    loading,
    authRequired,
    authError,
    submitAccessCode,
    updateQuestion,
    replaceAll,
    clearAll,
    importTranscript,
    lastSavedAt,
  }
}

export function mergeQuestion(contentId: string, answers: AnswerMap): TechnicalQuestion | null {
  const content = technicalContent.find((item) => item.id === contentId)
  if (!content) return null
  return { ...content, ...(answers[contentId] ?? defaultAnswerState()) }
}

export function mergedQuestions(answers: AnswerMap): TechnicalQuestion[] {
  return technicalContent.map((content) => ({ ...content, ...(answers[content.id] ?? defaultAnswerState()) }))
}

export interface ReviewExport {
  exportedAt: string
  source: 'Harba Technical Review'
  questions: TechnicalQuestion[]
}

export function buildJSONExport(answers: AnswerMap): ReviewExport {
  return {
    exportedAt: new Date().toISOString(),
    source: 'Harba Technical Review',
    questions: mergedQuestions(answers),
  }
}

export function downloadFile(filename: string, contents: string, mimeType: string) {
  const blob = new Blob([contents], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function mdEscapeHeading(text: string): string {
  return text.replace(/\n+/g, ' ').trim()
}

export function buildMarkdownExport(answers: AnswerMap): string {
  const lines: string[] = []
  lines.push('# Harba Technical Review')
  lines.push('')
  lines.push(`Exported: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('This export is for internal use. It has not been filtered for publication; confidential and customer-only material may be present.')

  const bySection = new Map<string, TechnicalQuestion[]>()
  for (const question of mergedQuestions(answers)) {
    const list = bySection.get(question.section) ?? []
    list.push(question)
    bySection.set(question.section, list)
  }

  for (const [section, questions] of bySection) {
    lines.push('')
    lines.push(`## ${section}`)
    for (const question of questions) {
      lines.push('')
      lines.push(`### ${mdEscapeHeading(question.question)}`)
      lines.push('')
      lines.push(`- Status: ${question.status}`)
      lines.push(`- Classification: ${question.classification ?? 'Not yet classified'}`)
      lines.push(`- Capability status: ${question.capabilityStatus}`)
      lines.push(`- Audience: ${question.audience.length ? question.audience.join(', ') : 'Not yet assigned'}`)
      lines.push(`- Flagged for follow-up: ${question.flaggedForFollowUp ? 'Yes' : 'No'}`)
      lines.push('')
      lines.push(`**Why it matters:** ${question.whyItMatters}`)
      if (question.knownInformation) {
        lines.push('')
        lines.push(`**Known information:** ${question.knownInformation}`)
      }
      lines.push('')
      lines.push('**Answer:**')
      lines.push('')
      lines.push(question.answer || '_Not yet answered._')
      if (question.publicSummary) {
        lines.push('')
        lines.push('**Public summary:**')
        lines.push('')
        lines.push(question.publicSummary)
      }
      if (question.documentationContent) {
        lines.push('')
        lines.push('**Documentation content:**')
        lines.push('')
        lines.push(question.documentationContent)
      }
      if (question.evidence) {
        lines.push('')
        lines.push(`**Evidence or source:** ${question.evidence}`)
      }
      if (question.internalNotes) {
        lines.push('')
        lines.push(`**Internal notes:** ${question.internalNotes}`)
      }
      lines.push('')
      lines.push('---')
    }
  }

  return lines.join('\n')
}

export interface ImportResult {
  ok: boolean
  message: string
  imported?: number
  skipped?: number
}

export function parseImportedJSON(raw: string): { answers: AnswerMap; result: ImportResult } {
  try {
    const parsed = JSON.parse(raw)
    const list = Array.isArray(parsed?.questions) ? parsed.questions : Array.isArray(parsed) ? parsed : null
    if (!list) {
      return { answers: {}, result: { ok: false, message: 'That file does not look like a Harba Technical Review export.' } }
    }
    const validIds = new Set(technicalContent.map((item) => item.id))
    const answers: AnswerMap = {}
    let imported = 0
    let skipped = 0
    for (const entry of list) {
      const id = entry?.id
      if (typeof id !== 'string' || !validIds.has(id)) {
        skipped++
        continue
      }
      answers[id] = sanitiseAnswerState(entry)
      imported++
    }
    return {
      answers,
      result: {
        ok: imported > 0,
        message: imported > 0
          ? `Imported ${imported} question${imported === 1 ? '' : 's'}${skipped ? `, skipped ${skipped} unrecognised entr${skipped === 1 ? 'y' : 'ies'}.` : '.'}`
          : 'No recognised questions were found in that file.',
        imported,
        skipped,
      },
    }
  } catch {
    return { answers: {}, result: { ok: false, message: 'That file could not be read as JSON.' } }
  }
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) return Promise.resolve(false)
  return navigator.clipboard.writeText(text).then(() => true).catch(() => false)
}

export function formatQuestionListForClipboard(questions: TechnicalQuestion[]): string {
  return questions.map((question) => `- [${question.section}] ${question.question}`).join('\n')
}
