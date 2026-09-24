import { useMemo, useState } from 'react'
import {
  AlertCircle,
  BrainCircuit,
  ClipboardCopy,
  CircuitBoard,
  Cpu,
  Database,
  Gauge,
  Network,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react'
import { Eyebrow } from '../components/ui'
import { DraftBanner } from '../components/DraftBanner'
import { QuestionCard } from '../components/review/QuestionCard'
import { ReviewToolbar } from '../components/review/ReviewToolbar'
import { PublicationReviewPanel } from '../components/review/PublicationReviewPanel'
import { AccessGate } from '../components/review/AccessGate'
import { TranscriptImportPanel } from '../components/review/TranscriptImportPanel'
import {
  AUDIENCE_OPTIONS,
  CAPABILITY_STATUS_OPTIONS,
  CLASSIFICATION_OPTIONS,
  REVIEW_SECTIONS,
  STATUS_OPTIONS,
  defaultAnswerState,
  questionsBySection,
  technicalContent,
  type Audience,
  type CapabilityStatus,
  type Classification,
  type QuestionStatus,
  type ReviewSection,
} from '../data/technicalContent'
import { useReviewAnswers } from '../lib/reviewStorage'

const SECTION_ICONS: Record<ReviewSection, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'Architecture': CircuitBoard,
  'Pipelines and execution': Workflow,
  'Teammates': Users,
  'Big Brain': BrainCircuit,
  'Models and AI providers': Cpu,
  'Integrations and developer access': Network,
  'Security and data': ShieldCheck,
  'Reliability and observability': Gauge,
  'Usage and cost control': Database,
  'Limitations and fit': AlertCircle,
}

type NavKey = ReviewSection | 'Publication review'
const NAV_ITEMS: NavKey[] = [...REVIEW_SECTIONS, 'Publication review']

export function TechnicalReview() {
  const {
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
  } = useReviewAnswers()
  const [active, setActive] = useState<NavKey>('Architecture')
  const [statusFilter, setStatusFilter] = useState<'All' | QuestionStatus>('All')
  const [classificationFilter, setClassificationFilter] = useState<'All' | Classification | 'Not yet classified'>('All')
  const [capabilityFilter, setCapabilityFilter] = useState<'All' | CapabilityStatus>('All')
  const [audienceFilter, setAudienceFilter] = useState<'All' | Audience>('All')

  const progress = useMemo(() => {
    const counts: Record<QuestionStatus, number> = {
      Unanswered: 0,
      'Partially answered': 0,
      Answered: 0,
      'Needs verification': 0,
    }
    for (const item of technicalContent) {
      const status = answers[item.id]?.status ?? 'Unanswered'
      counts[status]++
    }
    return { total: technicalContent.length, ...counts }
  }, [answers])

  const sectionCounts = useMemo(() => {
    const map = new Map<ReviewSection, { answered: number; total: number }>()
    for (const section of REVIEW_SECTIONS) {
      const items = questionsBySection(section)
      const answered = items.filter((item) => answers[item.id]?.status === 'Answered').length
      map.set(section, { answered, total: items.length })
    }
    return map
  }, [answers])

  const activeQuestions = useMemo(() => {
    if (active === 'Publication review') return []
    return questionsBySection(active).filter((content) => {
      const state = answers[content.id] ?? defaultAnswerState()
      if (statusFilter !== 'All' && state.status !== statusFilter) return false
      if (classificationFilter !== 'All') {
        const classification = state.classification ?? 'Not yet classified'
        if (classification !== classificationFilter) return false
      }
      if (capabilityFilter !== 'All' && state.capabilityStatus !== capabilityFilter) return false
      if (audienceFilter !== 'All' && !state.audience.includes(audienceFilter)) return false
      return true
    })
  }, [active, answers, statusFilter, classificationFilter, capabilityFilter, audienceFilter])

  if (authRequired) {
    return <AccessGate error={authError} onSubmit={submitAccessCode} />
  }

  if (loading) {
    return (
      <div className="review-workspace">
        <DraftBanner
          title="INTERNAL WORKSPACE. NOT PUBLISHED."
          note="Excluded from navigation, footer and sitemap, and marked noindex, nofollow. Visible only to people with this link."
        />
        <p className="intro-copy">Loading saved answers…</p>
      </div>
    )
  }

  return (
    <div className="review-workspace">
      <DraftBanner
        title="INTERNAL WORKSPACE. NOT PUBLISHED."
        note="Excluded from navigation, footer and sitemap, and marked noindex, nofollow. Visible only to people with this link."
      />

      <header className="review-header">
        <Eyebrow>HARBA TECHNICAL REVIEW</Eyebrow>
        <h1>Document the platform before we describe it.</h1>
        <p className="intro-copy">
          Work through each section with Harba&rsquo;s technical architect. Separate current capability from planned work,
          and public information from confidential implementation detail.
        </p>

        <div className="review-progress" role="group" aria-label="Review progress">
          <div className="progress-tile"><span className="progress-count">{progress.total}</span><span>Total questions</span></div>
          <div className="progress-tile"><span className="progress-count">{progress.Answered}</span><span>Answered</span></div>
          <div className="progress-tile"><span className="progress-count">{progress['Partially answered']}</span><span>Partially answered</span></div>
          <div className="progress-tile"><span className="progress-count">{progress['Needs verification']}</span><span>Needs verification</span></div>
          <div className="progress-tile"><span className="progress-count">{progress.Unanswered}</span><span>Unanswered</span></div>
        </div>

        <p className="storage-notice">
          Answers are saved to Harba&rsquo;s server as you type, shared across anyone with the access code. Export a copy
          before clearing answers, just in case.
        </p>

        <ReviewToolbar answers={answers} onImport={replaceAll} onClear={clearAll} lastSavedAt={lastSavedAt} />
        <TranscriptImportPanel onImport={importTranscript} />
      </header>

      <div className="review-body">
        <nav className="review-sidebar" aria-label="Review sections">
          {NAV_ITEMS.map((item) => {
            const Icon = item === 'Publication review' ? ClipboardCopy : SECTION_ICONS[item]
            const counts = item === 'Publication review' ? null : sectionCounts.get(item)
            return (
              <button
                key={item}
                type="button"
                className={active === item ? 'review-nav-item is-active' : 'review-nav-item'}
                onClick={() => setActive(item)}
                aria-current={active === item ? 'page' : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{item}</span>
                {counts && <span className="review-nav-count">{counts.answered}/{counts.total}</span>}
              </button>
            )
          })}
        </nav>

        <div className="review-main">
          {active === 'Publication review' ? (
            <PublicationReviewPanel answers={answers} />
          ) : (
            <>
              <div className="review-filters" role="group" aria-label="Filter questions">
                <label className="review-field">Status
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                    <option value="All">All statuses</option>
                    {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="review-field">Classification
                  <select value={classificationFilter} onChange={(event) => setClassificationFilter(event.target.value as typeof classificationFilter)}>
                    <option value="All">All classifications</option>
                    <option value="Not yet classified">Not yet classified</option>
                    {CLASSIFICATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="review-field">Capability status
                  <select value={capabilityFilter} onChange={(event) => setCapabilityFilter(event.target.value as typeof capabilityFilter)}>
                    <option value="All">All capability statuses</option>
                    {CAPABILITY_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="review-field">Audience
                  <select value={audienceFilter} onChange={(event) => setAudienceFilter(event.target.value as typeof audienceFilter)}>
                    <option value="All">All audiences</option>
                    {AUDIENCE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
              </div>

              <h2 className="review-section-title">{active}</h2>
              {activeQuestions.length === 0 ? (
                <p className="publication-empty">No questions in this section match the current filters.</p>
              ) : (
                <div className="review-question-list">
                  {activeQuestions.map((content) => (
                    <QuestionCard
                      key={content.id}
                      content={content}
                      state={answers[content.id] ?? defaultAnswerState()}
                      onChange={(patch) => updateQuestion(content.id, patch)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
