import { Link } from 'react-router-dom'
import { AuthShell, FieldError } from '../components/AuthShell'
import { useForgotPasswordForm, GENERIC_RESET_SENT_MESSAGE } from '../hooks/useForgotPasswordForm'

export function ForgotPassword() {
  const { status, error, submit, emailRef } = useForgotPasswordForm()
  const submitting = status === 'submitting'
  const sent = status === 'sent'

  return (
    <AuthShell>
      <section className="login-panel">
        <div className="login-panel-inner">
          <p className="eyebrow">PASSWORD HELP</p>
          <h1>Reset your password.</h1>
          <p className="login-panel-support">Enter your work email and we&rsquo;ll send instructions if an eligible account is found.</p>

          {sent ? (
            <p className="login-reset-sent" role="status">{GENERIC_RESET_SENT_MESSAGE}</p>
          ) : (
            <form method="post" onSubmit={submit} noValidate>
              <label htmlFor="forgot-email">Work email
                <input
                  id="forgot-email"
                  ref={emailRef}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'forgot-email-error' : undefined}
                />
              </label>
              <FieldError id="forgot-email-error" message={error} />

              <button className="button login-submit" type="submit" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Sending…' : 'Send reset instructions'}
              </button>
            </form>
          )}

          <p className="login-access-help">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </section>
    </AuthShell>
  )
}
