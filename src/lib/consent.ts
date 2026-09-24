// Minimal cookie-consent state. The website currently sets no cookies of
// its own; this exists so that optional analytics (see lib/ga.ts) has real,
// checkable consent to respect before it loads, per UK PECR guidance that
// analytics cookies require prior consent. The preference itself is stored
// in local storage, not a cookie.

export type ConsentValue = 'granted' | 'denied'

const STORAGE_KEY = 'harba-cookie-consent'
const CONSENT_EVENT = 'harba:consent-changed'

export function getConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value === 'granted' || value === 'denied' ? value : null
  } catch {
    return null
  }
}

export function setConsent(value: ConsentValue) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Local storage may be unavailable; consent simply will not persist.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { value } }))
}

/** Clears any stored decision (used by the "Cookie preferences" control) so the banner reappears and the visitor can choose again, without needing to clear browser data manually. */
export function clearConsent() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Local storage may be unavailable; nothing to clear.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { value: null } }))
}

export function onConsentChange(listener: (value: ConsentValue | null) => void): () => void {
  if (typeof window === 'undefined') return () => {}
  const handler = (event: Event) => listener((event as CustomEvent<{ value: ConsentValue | null }>).detail.value)
  window.addEventListener(CONSENT_EVENT, handler)
  return () => window.removeEventListener(CONSENT_EVENT, handler)
}
