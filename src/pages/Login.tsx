import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { AuthShell, FieldError } from '../components/AuthShell'
import { useLoginForm } from '../hooks/useLoginForm'

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { status, errors, formError, submit, emailRef, passwordRef } = useLoginForm()
  const submitting = status === 'submitting'

  return (
    <AuthShell>
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
              <div className="login-password-label-row">
                <label htmlFor="login-password">Password</label>
                <Link className="login-forgot-link" to="/forgot-password">Forgotten your password?</Link>
              </div>
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
    </AuthShell>
  )
}
