import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { getMarketingSiteUrl } from '../../config/siteConfig.mjs'
import { useLoginForm } from '../hooks/useLoginForm'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

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

/**
 * Whether the decorative composition below is allowed to animate: not
 * under prefers-reduced-motion, and not while the tab is hidden. Defaults
 * to "animating" so the very first client render has something to correct
 * only in an effect, never a render-phase window/document read - this page
 * is never prerendered with real body content (see DRAFT_ROUTES), so there
 * is no hydration mismatch risk here, but the pattern is kept consistent
 * with the rest of the codebase (see useJourneyScene in
 * HarbaEnquiryVisual.tsx) in case that ever changes.
 */
function useMotionAllowed() {
  const [allowed, setAllowed] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setAllowed(!query.matches && document.visibilityState === 'visible')
    update()
    query.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      query.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return allowed
}

/** Decorative only (aria-hidden, and never separately announced - there is
 * no live region here) - a restrained impression of Teammates, a Pipeline
 * and Big Brain working together, never a literal feature list, dashboard
 * or architecture diagram. The single animated piece is a slow lime fill
 * that travels through the three stations and rests once "connected";
 * .is-paused (driven by useMotionAllowed) stops it under
 * prefers-reduced-motion or when the tab is hidden, and the sitewide
 * reduced-motion rule in App.css is a second, CSS-only backstop. */
function LoginComposition() {
  const motionAllowed = useMotionAllowed()

  return (
    <div className={cx('login-composition', !motionAllowed && 'is-paused')} aria-hidden="true">
      <div className="login-composition-row">
        <span className="login-composition-node">TEAMMATES</span>
        <span className="login-composition-node">PIPELINES</span>
        <span className="login-composition-node">BIG BRAIN</span>
      </div>
      <div className="login-composition-track">
        <span className="login-composition-tick" />
        <span className="login-composition-tick" />
        <span className="login-composition-tick" />
        <span className="login-composition-fill" />
      </div>
      <div className="login-composition-status">
        <span className="login-composition-mark" />
        <span>One connected workspace</span>
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

              {/* No "Forgotten your password?" link: re-checked on this
                  pass - there is still no authentication framework, no
                  password-reset route/controller/token storage and no
                  configured transactional email service anywhere in this
                  project (fly secrets list -a harba returns empty). Per the
                  brief's own instruction for this exact case, a dead or
                  fabricated reset link would be worse than omitting it; the
                  "Need access?" route below remains the one real path. See
                  the completion report for what is still required. */}

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
