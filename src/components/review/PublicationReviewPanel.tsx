import { Eyebrow } from '../ui'
import { publicationSummary, readinessScore } from '../../data/previewStructure'
import type { AnswerMap } from '../../lib/reviewStorage'
import type { TechnicalQuestion } from '../../data/technicalContent'

function QuestionList({ items, emptyLabel }: { items: TechnicalQuestion[]; emptyLabel: string }) {
  if (items.length === 0) return <p className="publication-empty">{emptyLabel}</p>
  return (
    <ul className="publication-list">
      {items.map((item) => (
        <li key={item.id}>
          <span className="publication-list-section">{item.section}</span>
          {item.question}
        </li>
      ))}
    </ul>
  )
}

function ReadinessCard({ label, score }: { label: string; score: ReturnType<typeof readinessScore> }) {
  return (
    <div className="readiness-card">
      <span className="readiness-label">{label}</span>
      <span className="readiness-score">{score.percent === null ? 'Not yet scoped' : `${score.percent}%`}</span>
      <span className="readiness-detail">
        {score.assigned === 0
          ? 'No questions have been assigned to this audience yet.'
          : `${score.confirmed} of ${score.assigned} assigned questions are answered and classified Public.`}
      </span>
    </div>
  )
}

export function PublicationReviewPanel({ answers }: { answers: AnswerMap }) {
  const summary = publicationSummary(answers)
  const technicalReadiness = readinessScore(answers, 'Technical Overview')
  const docsReadiness = readinessScore(answers, 'Developer Documentation')

  return (
    <div className="publication-review">
      <Eyebrow>PUBLICATION REVIEW</Eyebrow>
      <h2>Where the review stands before anything is published.</h2>
      <p className="publication-caveat">
        A readiness score reflects how much confirmed, Public material exists for an audience. It does not by itself mean the
        pages are safe to publish: someone still needs to read the confirmed content, the customer-only and confidential
        material, and the open decisions below before that call is made.
      </p>

      <div className="readiness-row">
        <ReadinessCard label="Technical Overview readiness" score={technicalReadiness} />
        <ReadinessCard label="Developer Documentation readiness" score={docsReadiness} />
      </div>

      <div className="publication-grid">
        <section>
          <h3>Questions still unanswered ({summary.unanswered.length})</h3>
          <QuestionList items={summary.unanswered} emptyLabel="None. Every question has at least a partial answer." />
        </section>

        <section>
          <h3>Questions needing verification ({summary.needsVerification.length})</h3>
          <QuestionList items={summary.needsVerification} emptyLabel="None currently marked as needing verification." />
        </section>

        <section>
          <h3>Confirmed public claims ({summary.confirmedPublic.length})</h3>
          <QuestionList items={summary.confirmedPublic} emptyLabel="No answers are yet classified Public." />
        </section>

        <section>
          <h3>Customer-only material ({summary.customerOnly.length})</h3>
          <QuestionList items={summary.customerOnly} emptyLabel="No answers are currently classified Customer-only." />
        </section>

        <section>
          <h3>Confidential material ({summary.confidential.length})</h3>
          <QuestionList items={summary.confidential} emptyLabel="No answers are currently classified Confidential." />
        </section>

        <section>
          <h3>Decisions required before publication ({summary.flagged.length + summary.needsVerification.length})</h3>
          <QuestionList
            items={[...summary.flagged, ...summary.needsVerification].filter((item, index, all) => all.findIndex((other) => other.id === item.id) === index)}
            emptyLabel="Nothing is currently flagged for follow-up or verification."
          />
        </section>
      </div>

      <h3>Live versus planned capability</h3>
      <div className="capability-summary-row">
        <span className="capability-badge is-live">Live: {summary.live.length}</span>
        <span className="capability-badge is-configurable">Configurable: {summary.configurable.length}</span>
        <span className="capability-badge is-planned">Planned: {summary.planned.length}</span>
        <span className="capability-badge is-deprecated">Deprecated: {summary.deprecated.length}</span>
        <span className="capability-badge is-unknown">Unknown: {summary.unknownCapability.length}</span>
      </div>

      <div className="publication-grid">
        <section>
          <h3>Missing diagrams</h3>
          <QuestionList items={summary.missingDiagrams} emptyLabel="The publishable architecture diagram question is confirmed and Public." />
        </section>
        <section>
          <h3>Missing code examples</h3>
          <QuestionList items={summary.missingCodeExamples} emptyLabel="Documentation content exists for the questions code examples would depend on." />
        </section>
        <section>
          <h3>Missing API documentation</h3>
          <QuestionList items={summary.missingApiDocs} emptyLabel="Documentation content exists for the core API-related questions." />
        </section>
      </div>
    </div>
  )
}
