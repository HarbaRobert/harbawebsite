import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react'
import { getMarketingSiteUrl } from '../../config/siteConfig.mjs'
import { useLoginForm } from '../hooks/useLoginForm'

// "Back to Harba" and the wordmark leave the signed-in application for the
// public marketing site. Today that is the same repository (getMarketingSiteUrl()
// resolves to '', so this falls back to a same-origin '/'); once the two are
// split onto separate hosts, setting MARKETING_SITE_URL points this at the
// real external domain without a code change.
const MARKETING_HOME = `${getMarketingSiteUrl()}/`

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p className="field-error" id={id} role="alert">{message}</p>
}

/** Decorative only (aria-hidden) - a restrained impression of Teammates, a
 * Pipeline and Big Brain, never a literal feature list or architecture
 * diagram. The single moving piece is the lime progress dot; everything
 * else is static, and the whole thing is hidden under prefers-reduced-motion
 * by the .login-composition-dot CSS rule turning its animation off (see
 * the global reduced-motion rule in App.css, which already covers this). */
function LoginComposition() {
  return (
    <div className="login-composition" aria-hidden="true">
      <div className="login-composition-row">
        <span className="login-composition-node">TEAMMATES</span>
        <span className="login-composition-node">PIPELINES</span>
        <span className="login-composition-node">BIG BRAIN</span>
      </div>
      <div className="login-composition-track">
        <span className="login-composition-fill" />
        <span className="login-composition-dot" />
      </div>
      <div className="login-composition-status">
        <Check aria-hidden="true" />
        <span>Workspace ready</span>
      </div>
    </div>
  )
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { status, errors, formError, submit, emailRef, passwordRef } = useLoginForm()
  const submitting = status === 'submitting'

  return (
    <div className="login-page">
      <header className="login-header">
        <a className="wordmark" href={MARKETING_HOME} aria-label="Harba home">harba<span>.</span></a>
        <a className="login-back" href={MARKETING_HOME}>Back to Harba</a>
      </header>

      <div className="login-body">
        <section className="login-brand">
          <div className="login-brand-inner">
            <p className="eyebrow">HARBA WORKSPACE</p>
            <p className="login-statement">Your digital workforce, ready to work.</p>
            <p className="login-brand-support">Access your Teammates, Pipelines and business knowledge from your Harba workspace.</p>
            <LoginComposition />
          </div>
          <p className="login-brand-tagline">Managed digital workforce, across your systems.</p>
        </section>

        <section className="login-panel">
          <div className="login-panel-inner">
            <p className="eyebrow">SIGN IN</p>
            <h1>Welcome back.</h1>
            <p className="login-panel-support">Sign in to your Harba workspace.</p>

            <span role="status" aria-live="polite" className="sr-only">
              {submitting ? 'Signing in…' : formError ?? ''}
            </span>

            <form
              method="post"
              onSubmit={submit}
              noValidate
            >
              <label htmlFor="login-email">Work email
                <input
                  id="login-email"
                  ref={emailRef}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'login-email-error' : undefined}
                />
              </label>
              <FieldError id="login-email-error" message={errors.email} />

              <div className="login-password-field">
                <label htmlFor="login-password">Password</label>
                <div className="login-password-row">
                  <input
                    id="login-password"
                    ref={passwordRef}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'login-password-error' : undefined}
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
                  </button>
                </div>
              </div>
              <FieldError id="login-password-error" message={errors.password} />

              {/* No "Forgotten your password?" link: this page has no
                  password-reset route to send visitors to yet (see the
                  completion report). Adding one here would be a dead link. */}

              <label className="checkbox-field" htmlFor="login-remember">
                <input id="login-remember" type="checkbox" name="remember" />
                <span>Keep me signed in</span>
              </label>

              {formError && <p className="form-error" role="alert"><AlertCircle aria-hidden="true" /> {formError}</p>}

              <button className="button login-submit" type="submit" disabled={submitting} aria-busy={submitting}>
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <p className="login-access-help">
              Need access?
              <br />
              Contact your workspace administrator or <a href="mailto:help@harba.ai">Harba support</a>.
            </p>
          </div>
        </section>
      </div>

      <footer className="login-footer">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </footer>
    </div>
  )
}
