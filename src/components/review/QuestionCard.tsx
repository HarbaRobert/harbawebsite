import { Flag } from 'lucide-react'
import {
  AUDIENCE_OPTIONS,
  CAPABILITY_STATUS_OPTIONS,
  CLASSIFICATION_OPTIONS,
  STATUS_OPTIONS,
  type Audience,
  type Classification,
  type QuestionAnswerState,
  type QuestionContent,
} from '../../data/technicalContent'

export function QuestionCard({
  content,
  state,
  onChange,
}: {
  content: QuestionContent
  state: QuestionAnswerState
  onChange: (patch: Partial<QuestionAnswerState>) => void
}) {
  const toggleAudience = (audience: Audience) => {
    const next = state.audience.includes(audience)
      ? state.audience.filter((item) => item !== audience)
      : [...state.audience, audience]
    onChange({ audience: next })
  }

  return (
    <article className="review-question" id={content.id} aria-labelledby={`${content.id}-heading`}>
      <div className="review-question-top">
        <span className="review-question-id">{content.id}</span>
        <button
          type="button"
          className={state.flaggedForFollowUp ? 'flag-toggle is-flagged' : 'flag-toggle'}
          aria-pressed={state.flaggedForFollowUp}
          onClick={() => onChange({ flaggedForFollowUp: !state.flaggedForFollowUp })}
        >
          <Flag aria-hidden="true" />
          {state.flaggedForFollowUp ? 'Flagged for follow-up' : 'Flag for follow-up'}
        </button>
      </div>

      <h3 id={`${content.id}-heading`}>{content.question}</h3>
      <p className="review-why"><strong>Why it matters.</strong> {content.whyItMatters}</p>
      {content.knownInformation && (
        <p className="review-known"><strong>Known information.</strong> {content.knownInformation}</p>
      )}

      <label className="review-field" htmlFor={`${content.id}-answer`}>
        Answer
        <textarea
          id={`${content.id}-answer`}
          rows={5}
          value={state.answer}
          onChange={(event) => onChange({ answer: event.target.value })}
          placeholder="Capture what Harba's technical architect confirms here."
        />
      </label>

      <div className="review-selectors">
        <label className="review-field" htmlFor={`${content.id}-status`}>
          Status
          <select id={`${content.id}-status`} value={state.status} onChange={(event) => onChange({ status: event.target.value as QuestionAnswerState['status'] })}>
            {STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <label className="review-field" htmlFor={`${content.id}-classification`}>
          Classification
          <select
            id={`${content.id}-classification`}
            value={state.classification ?? ''}
            onChange={(event) => onChange({ classification: (event.target.value || null) as Classification | null })}
          >
            <option value="">Not yet classified</option>
            {CLASSIFICATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>

        <label className="review-field" htmlFor={`${content.id}-capability`}>
          Capability status
          <select
            id={`${content.id}-capability`}
            value={state.capabilityStatus}
            onChange={(event) => onChange({ capabilityStatus: event.target.value as QuestionAnswerState['capabilityStatus'] })}
          >
            {CAPABILITY_STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
      </div>

      <fieldset className="review-audience">
        <legend>Audience</legend>
        {AUDIENCE_OPTIONS.map((audience) => (
          <label key={audience} className="checkbox-field">
            <input
              type="checkbox"
              checked={state.audience.includes(audience)}
              onChange={() => toggleAudience(audience)}
            />
            <span>{audience}</span>
          </label>
        ))}
      </fieldset>

      <label className="review-field" htmlFor={`${content.id}-evidence`}>
        Evidence or source
        <textarea
          id={`${content.id}-evidence`}
          rows={2}
          value={state.evidence}
          onChange={(event) => onChange({ evidence: event.target.value })}
          placeholder="Where this was confirmed: a document, a system, a conversation."
        />
      </label>

      <label className="review-field" htmlFor={`${content.id}-public-summary`}>
        Public summary
        <textarea
          id={`${content.id}-public-summary`}
          rows={3}
          value={state.publicSummary}
          onChange={(event) => onChange({ publicSummary: event.target.value })}
          placeholder="Only used on /technical once this question is Answered and Public."
        />
      </label>

      <label className="review-field" htmlFor={`${content.id}-doc-content`}>
        Documentation content
        <textarea
          id={`${content.id}-doc-content`}
          rows={4}
          value={state.documentationContent}
          onChange={(event) => onChange({ documentationContent: event.target.value })}
          placeholder="Only used on /docs once this question is Answered and Public."
        />
      </label>

      <label className="review-field" htmlFor={`${content.id}-internal-notes`}>
        Internal notes
        <textarea
          id={`${content.id}-internal-notes`}
          rows={3}
          value={state.internalNotes}
          onChange={(event) => onChange({ internalNotes: event.target.value })}
          placeholder="Context for Rob and Harry. Never shown outside this workspace."
        />
      </label>
    </article>
  )
}
