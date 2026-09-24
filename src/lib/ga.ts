// Optional GA4 integration. Loads only when a measurement ID is configured,
// the build is a real production build (never `vite dev` or a local test
// server), AND the visitor has granted analytics consent. Never transmits
// form contents or personal information: it only ever receives event
// *names* from the existing lib/analytics.ts event bus, never field values.
//
// Event names sent to GA4 are documented in SEO_SETUP.md.
import { getConsent, onConsentChange } from './consent'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function getMeasurementId(): string {
  // import.meta.env.PROD is false in `vite dev` and true only in a real
  // `vite build` output, regardless of what GA_MEASUREMENT_ID is set to
  // locally - so a developer's .env can never cause analytics to fire while
  // developing.
  if (!import.meta.env.PROD) return ''
  // Bare reference, not `typeof process !== 'undefined' && ...`: this file
  // only ever runs in the browser, where Vite's `define` (vite.config.ts)
  // replaces this exact expression with a literal string at build time.
  // A `typeof process` guard is a genuine runtime check in that bundle -
  // always false in a browser - and silently discards the configured
  // value instead of failing safe. See the equivalent note on
  // getSiteUrl() in config/siteConfig.mjs for how this was found.
  return process.env.GA_MEASUREMENT_ID || ''
}

let loaded = false
// Tracks the live consent decision, not just whether the script has been
// loaded, so that revoking consent after previously granting it stops
// events immediately, even though a already-inserted <script> tag cannot
// literally be removed from the page.
let currentlyGranted = false

function loadGtagScript(measurementId: string) {
  currentlyGranted = true
  if (loaded) return
  loaded = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('consent', 'default', { analytics_storage: 'granted' })
  window.gtag('config', measurementId, { send_page_view: false })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`
  document.head.appendChild(script)
}

function syncWithConsent() {
  const measurementId = getMeasurementId()
  const consent = getConsent()
  if (consent === 'granted' && measurementId) {
    loadGtagScript(measurementId)
  } else {
    // Includes 'denied' and null (no decision yet): never send further
    // events, even if the script happened to load earlier in this session.
    currentlyGranted = false
  }
}

let listening = false

/**
 * Call once, near app start. Applies whatever consent decision already
 * exists (including from a previous visit), reacts immediately to consent
 * changing in either direction, and forwards events from the existing
 * harba:analytics bus (see lib/analytics.ts) to GA4. That bus only ever
 * carries an event name, never event data, so no personal information can
 * flow through this path.
 */
export function initAnalytics() {
  syncWithConsent()
  onConsentChange(syncWithConsent)

  if (listening) return
  listening = true
  window.addEventListener('harba:analytics', (event) => {
    const detail = (event as CustomEvent<{ event: string }>).detail
    if (detail?.event) trackEvent(detail.event)
  })
}

export function trackPageView(pathname: string) {
  if (!currentlyGranted || !window.gtag) return
  window.gtag('event', 'page_view', { page_path: pathname })
}

const CONVERSION_EVENTS: Record<string, string> = {
  // Both the working-session and demo forms submit through the same event -
  // see src/hooks/useEnquiryForm.ts - since both are genuine enquiries sent
  // the same way, just tagged with a different topic.
  working_session_form_submitted: 'generate_lead',
}

/** Forwards an event name (never event data) from the existing analytics bus to GA4, only while consent is currently granted. */
export function trackEvent(eventName: string) {
  if (!currentlyGranted || !window.gtag) return
  window.gtag('event', eventName)
  const conversionName = CONVERSION_EVENTS[eventName]
  if (conversionName) window.gtag('event', conversionName)
}
