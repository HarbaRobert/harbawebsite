import { Link, useSearchParams } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { PageIntro, Eyebrow } from '../components/ui'
import { useEnquiryForm } from '../hooks/useEnquiryForm'

const REQUIRED_FIELDS = ['name', 'email', 'company', 'process']

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p className="field-error" id={id} role="alert">{message}</p>
}

const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  'developer-access': 'Developer access',
  'technical': 'Technical discussion',
}

export function WorkingSession() {
  const [searchParams] = useSearchParams()
  const topic = searchParams.get('topic')
  const enquiryLabel = topic ? ENQUIRY_TYPE_LABELS[topic] : undefined
  const { markStarted, status, errors, formError, submit } = useEnquiryForm({
    requiredFields: REQUIRED_FIELDS,
    startedEvent: 'working_session_form_started',
    submittedEvent: 'working_session_form_submitted',
  })

  return <>
    <PageIntro eyebrow="REQUEST A WORKING SESSION" title="Find the first process worth improving." text="A practical conversation for leaders who want to use AI operationally, but need clarity on value, complexity, information, systems and control." />
    <section className="section paper">
      <div className="container review-layout">
        <div className="review-detail">
          {enquiryLabel && <p className="enquiry-type-note">Enquiry type: {enquiryLabel}</p>}
          <Eyebrow>WHAT WE WILL COVER</Eyebrow>
          <ul>{['The operational friction your team is experiencing', 'Suitable places to stand up a first digital workforce', 'The knowledge, systems and controls required', 'A sensible first module and what happens next'].map((item) => <li key={item}><Check />{item}</li>)}</ul>
          <p className="small-note">Usually 45 minutes. No preparation or AI strategy required.</p>

          <Eyebrow>WHAT HAPPENS AFTER YOU SUBMIT</Eyebrow>
          <ul>{['We review what you have shared.', 'We contact you to arrange the session.', 'The session explores your process, systems, controls and whether Harba is a good fit.'].map((item) => <li key={item}><Check />{item}</li>)}</ul>
          <p className="small-note">Submitting this form sends us your enquiry; it does not book a calendar slot straight away.</p>
        </div>

        {status === 'success' ? <div className="form-success">
          <Check />
          <h2>Thank you. We have received your enquiry.</h2>
          <p>Rob will review what you have shared and come back to arrange the next conversation.</p>
        </div> : <form
          // Explicit method/action so that if the onSubmit handler below
          // never attaches (JS fails to load or errors before hydration),
          // the browser's native fallback submission is still a POST to the
          // real endpoint - not a GET, which would put name, email and the
          // rest of this form in the URL, browser history and server logs.
          method="post"
          action="/api/working-session"
          onFocus={markStarted}
          onSubmit={submit}
          noValidate
        >
          <label className="hp-field" aria-hidden="true">Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
          {topic && <input type="hidden" name="topic" value={topic} />}

          <label htmlFor="wsq-name">Name
            <input id="wsq-name" name="name" required autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'wsq-name-error' : undefined} />
          </label>
          <FieldError id="wsq-name-error" message={errors.name} />

          <label htmlFor="wsq-email">Work email
            <input id="wsq-email" name="email" type="email" required autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'wsq-email-error' : undefined} />
          </label>
          <FieldError id="wsq-email-error" message={errors.email} />

          <div className="form-row">
            <div>
              <label htmlFor="wsq-company">Company
                <input id="wsq-company" name="company" required aria-invalid={!!errors.company} aria-describedby={errors.company ? 'wsq-company-error' : undefined} />
              </label>
              <FieldError id="wsq-company-error" message={errors.company} />
            </div>
            <div>
              <label htmlFor="wsq-role">Role
                <input id="wsq-role" name="role" />
              </label>
            </div>
          </div>

          <label htmlFor="wsq-process">What part of your business would you like to improve?
            <textarea id="wsq-process" name="process" rows={3} required aria-invalid={!!errors.process} aria-describedby={errors.process ? 'wsq-process-error' : undefined} />
          </label>
          <FieldError id="wsq-process-error" message={errors.process} />

          <label htmlFor="wsq-systems">Which systems or platforms are involved?
            <textarea id="wsq-systems" name="systems" rows={2} />
          </label>

          <label htmlFor="wsq-phone">Phone number (optional)
            <input id="wsq-phone" name="phone" type="tel" autoComplete="tel" />
          </label>

          <label className="checkbox-field" htmlFor="wsq-privacy">
            <input id="wsq-privacy" type="checkbox" name="privacy" required aria-invalid={!!errors.privacy} aria-describedby={errors.privacy ? 'wsq-privacy-error' : undefined} />
            <span>I have read the <Link to="/privacy">privacy policy</Link>.</span>
          </label>
          <FieldError id="wsq-privacy-error" message={errors.privacy} />

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button className="button" type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Request a working session'} <ArrowRight />
          </button>
          <p className="form-privacy">By submitting, you are asking Harba to contact you about this working session.</p>
        </form>}
      </div>
    </section>
  </>
}
