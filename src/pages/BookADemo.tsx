import { Link } from 'react-router-dom'
import { Check, ArrowRight } from 'lucide-react'
import { PageIntro, Eyebrow } from '../components/ui'
import { useEnquiryForm } from '../hooks/useEnquiryForm'

const REQUIRED_FIELDS = ['name', 'email', 'company', 'process']

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p className="field-error" id={id} role="alert">{message}</p>
}

export function BookADemo() {
  const { markStarted, status, errors, formError, submit, timestampRef, formAction } = useEnquiryForm({
    requiredFields: REQUIRED_FIELDS,
    submittedEvent: 'working_session_form_submitted',
  })

  return <>
    <PageIntro eyebrow="BOOK A DEMO" title="See Harba in action." text="See how Pipelines, Teammates and Big Brain work together to carry out controlled work across existing business systems." />
    <section className="section paper">
      <div className="container review-layout">
        <div className="review-detail">
          <Eyebrow>WHAT THE DEMO COVERS</Eyebrow>
          <ul>{['How a Pipeline progresses through defined steps', 'How Teammates perform configured roles', 'How Big Brain supplies relevant business knowledge', 'How human approvals pause consequential actions', 'How Pipeline activity, usage and failures remain visible'].map((item) => <li key={item}><Check />{item}</li>)}</ul>
          <p className="small-note">A guided walkthrough of the platform, not a sales pitch.</p>

          <Eyebrow>WHAT HAPPENS AFTER YOU SUBMIT</Eyebrow>
          <ul>{['We review what you have shared.', 'We contact you to arrange the walkthrough.', 'The walkthrough shows Harba working through a scenario close to your business.'].map((item) => <li key={item}><Check />{item}</li>)}</ul>
          <p className="small-note">Submitting this form sends us your enquiry; it does not book a calendar slot straight away.</p>
        </div>

        {status === 'success' ? <div className="form-success">
          <Check />
          <h2>Thank you. We have received your enquiry.</h2>
          <p>Rob will review what you have shared and come back to arrange the demo.</p>
        </div> : <form
          // Explicit method/action so that if the onSubmit handler below
          // never attaches (JS fails to load or errors before hydration),
          // the browser's native fallback submission is still a POST to the
          // real endpoint - not a GET, which would put name, email and the
          // rest of this form in the URL, browser history and server logs.
          method="post"
          action={formAction}
          onFocus={markStarted}
          onSubmit={submit}
          noValidate
        >
          <input name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" className="gotcha-field" />
          <input type="hidden" name="_t" ref={timestampRef} />
          <input type="hidden" name="topic" value="demo" />

          <label htmlFor="dq-name">Name
            <input id="dq-name" name="name" required autoComplete="name" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'dq-name-error' : undefined} />
          </label>
          <FieldError id="dq-name-error" message={errors.name} />

          <label htmlFor="dq-email">Work email
            <input id="dq-email" name="email" type="email" required autoComplete="email" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'dq-email-error' : undefined} />
          </label>
          <FieldError id="dq-email-error" message={errors.email} />

          <div className="form-row">
            <div>
              <label htmlFor="dq-company">Company
                <input id="dq-company" name="company" required aria-invalid={!!errors.company} aria-describedby={errors.company ? 'dq-company-error' : undefined} />
              </label>
              <FieldError id="dq-company-error" message={errors.company} />
            </div>
            <div>
              <label htmlFor="dq-role">Role
                <input id="dq-role" name="role" />
              </label>
            </div>
          </div>

          <label htmlFor="dq-process">What would you like to see in the demo?
            <textarea id="dq-process" name="process" rows={3} required aria-invalid={!!errors.process} aria-describedby={errors.process ? 'dq-process-error' : undefined} />
          </label>
          <FieldError id="dq-process-error" message={errors.process} />

          <label htmlFor="dq-systems">Which systems or platforms are involved?
            <textarea id="dq-systems" name="systems" rows={2} />
          </label>

          <label htmlFor="dq-phone">Phone number (optional)
            <input id="dq-phone" name="phone" type="tel" autoComplete="tel" />
          </label>

          <label className="checkbox-field" htmlFor="dq-privacy">
            <input id="dq-privacy" type="checkbox" name="privacy" required aria-invalid={!!errors.privacy} aria-describedby={errors.privacy ? 'dq-privacy-error' : undefined} />
            <span>I have read the <Link to="/privacy">privacy policy</Link>.</span>
          </label>
          <FieldError id="dq-privacy-error" message={errors.privacy} />

          {formError && <p className="form-error" role="alert">{formError}</p>}

          <button className="button" type="submit" disabled={status === 'submitting'} aria-busy={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : 'Book a demo'} <ArrowRight />
          </button>
          <p className="form-privacy">By submitting, you are asking Harba to contact you about a demo.</p>
        </form>}
      </div>
    </section>
  </>
}
