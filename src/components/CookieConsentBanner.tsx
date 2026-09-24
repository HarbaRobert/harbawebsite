import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getConsent, onConsentChange, setConsent } from '../lib/consent'

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  // Deliberately not a lazy useState initializer: getConsent() reads
  // localStorage, which does not exist during prerendering (see
  // scripts/prerender.mjs). Starting at false and correcting after mount
  // keeps the server-rendered and first client-rendered output identical
  // (both show nothing), avoiding a real hydration mismatch that reading
  // localStorage during render would otherwise cause for returning visitors.
  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect
    setVisible(getConsent() === null)
  }, [])

  // Reappears whenever the preference is cleared, e.g. via the "Cookie
  // preferences" control in the footer, so a visitor can change their mind
  // without needing to clear browser data manually.
  useEffect(() => onConsentChange((value) => {
    if (value === null) setVisible(true)
  }), [])

  if (!visible) return null

  const choose = (value: 'granted' | 'denied') => {
    setConsent(value)
    setVisible(false)
  }

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie preferences">
      <p>
        We use essential website functionality only, plus optional analytics cookies if you agree. See our{' '}
        <Link to="/cookies">Cookie Policy</Link> for details.
      </p>
      <div className="cookie-banner-actions">
        <button type="button" data-choice="accept" className="button button-small" onClick={() => choose('granted')}>Accept analytics</button>
        <button type="button" data-choice="reject" className="button button-small button-secondary" onClick={() => choose('denied')}>Reject analytics</button>
      </div>
    </div>
  )
}
