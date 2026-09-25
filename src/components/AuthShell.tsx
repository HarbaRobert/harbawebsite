import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMarketingSiteUrl } from '../../config/siteConfig.mjs'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

// "Back to Harba" and the wordmark leave the signed-in application for the
// public marketing site. Today that is the same repository (getMarketingSiteUrl()
// resolves to '', so this falls back to a same-origin '/'); once the two are
// split onto separate hosts, setting MARKETING_SITE_URL points this at the
// real external domain without a code change.
const MARKETING_HOME = `${getMarketingSiteUrl()}/`

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return <p className="field-error" id={id} role="alert">{message}</p>
}

/**
 * Whether the decorative composition below is allowed to animate: not
 * under prefers-reduced-motion, and not while the tab is hidden. Defaults
 * to "animating" so the very first client render has something to correct
 * only in an effect, never a render-phase window/document read - these
 * pages are never prerendered with real body content (see DRAFT_ROUTES),
 * so there is no hydration mismatch risk here, but the pattern is kept
 * consistent with the rest of the codebase (see useJourneyScene-style
 * hooks used elsewhere for animated homepage content) in case that ever
 * changes.
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
function AuthComposition() {
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

/** Shared chrome for every standalone authentication page (currently
 * /login and /forgot-password): the minimal header, the brand panel
 * (identical copy and decorative composition on both), and the footer
 * legal links. Each page supplies only its own sign-in-area content as
 * children - see src/pages/Login.tsx and src/pages/ForgotPassword.tsx. */
export function AuthShell({ children }: { children: React.ReactNode }) {
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
            <AuthComposition />
          </div>
          <p className="login-brand-tagline">Managed digital workforce, across your systems.</p>
        </section>

        {children}
      </div>

      <footer className="login-footer">
        <Link to="/privacy">Privacy</Link>
        <Link to="/terms">Terms</Link>
      </footer>
    </div>
  )
}
