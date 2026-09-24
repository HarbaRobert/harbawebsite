import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { CookieConsentBanner } from './CookieConsentBanner'
import { StructuredData } from './StructuredData'
import { DevReviewUtility } from './DevReviewUtility'
import { Home } from '../pages/Home'
import { UseCases } from '../pages/UseCases'
import { HowWeWork } from '../pages/HowWeWork'
import { Governance } from '../pages/Governance'
import { Company } from '../pages/Company'
import { WorkingSession } from '../pages/WorkingSession'
import { BookADemo } from '../pages/BookADemo'
import { PrivacyPolicy } from '../pages/legal/PrivacyPolicy'
import { CookiePolicy } from '../pages/legal/CookiePolicy'
import { TermsOfUse } from '../pages/legal/TermsOfUse'
import { NotFound } from '../pages/NotFound'
import { TechnicalReview } from '../pages/TechnicalReview'
import { TechnicalOverview } from '../pages/TechnicalOverview'
import { Docs } from '../pages/Docs'
import { Login } from '../pages/Login'
import { findPublicRoute } from '../../config/siteConfig.mjs'
import { useDocumentHead } from '../hooks/useDocumentHead'
import { useIsomorphicLayoutEffect } from '../hooks/useIsomorphicLayoutEffect'
import { initAnalytics, trackPageView } from '../lib/ga'
import { onConsentChange } from '../lib/consent'

// The internal workspace has its own header, progress summary and section
// sidebar, so it is rendered without any public marketing chrome at all.
// /login is likewise its own fully-branded standalone page (its own minimal
// header and footer - see Login.tsx) rather than the marketing nav/footer.
const STANDALONE_ROUTES = new Set(['/technical-review', '/login'])

// Documentation keeps the footer (legal links stay reachable) but replaces
// the full marketing nav with its own compact header, so it does not clutter
// the documentation layout.
const CUSTOM_HEADER_ROUTES = new Set(['/docs'])

export function SiteShell({ forceProd = false }: { forceProd?: boolean } = {}) {
  const location = useLocation()
  // import.meta.env.DEV reflects `vite build` vs `vite dev`, not the `mode`
  // option passed to a programmatically created dev server - so it cannot
  // be trusted inside scripts/prerender.mjs, which loads this module via
  // vite.ssrLoadModule (always a dev-pipeline server under the hood, even in
  // middleware mode). entry-server.tsx passes forceProd to sidestep that.
  const isDev = !forceProd && import.meta.env.DEV
  const isStandalone = STANDALONE_ROUTES.has(location.pathname)
  const hasCustomHeader = CUSTOM_HEADER_ROUTES.has(location.pathname)
  const showMarketingNav = !isStandalone && !hasCustomHeader
  const showFooter = !isStandalone
  const publicRoute = findPublicRoute(location.pathname)

  useDocumentHead(location.pathname)

  // Reset scroll to the top of the new page on every route change. Skipped
  // when the destination has a hash (e.g. "/#platform" from the nav), so it
  // does not fight with a page's own scroll-to-anchor effect (see Home.tsx).
  useIsomorphicLayoutEffect(() => {
    if (location.hash) return
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    initAnalytics()
  }, [])

  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])

  useEffect(() => onConsentChange((value) => {
    if (value === 'granted') trackPageView(location.pathname)
  }), [location.pathname])

  return (
    <div className="site-shell">
      {isDev && <DevReviewUtility />}

      {publicRoute && <StructuredData path={publicRoute.path} title={publicRoute.title} description={publicRoute.description} breadcrumbLabel={publicRoute.breadcrumbLabel} />}

      {showMarketingNav && <Nav />}

      {showMarketingNav && location.pathname !== '/' && (
        <div className="route-marker">
          <span>HARBA /</span> {location.pathname.replaceAll('/', ' ').trim().replaceAll('-', ' ')}
        </div>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/use-cases" element={<UseCases />} />
          <Route path="/how-we-work" element={<HowWeWork />} />
          <Route path="/governance" element={<Governance />} />
          {/* The real, permanent redirect is server-side (see server/index.js), so a
              full page load or search engine request gets a genuine 301. This route
              only covers a same-session client-side navigation to the old address
              (e.g. browser back/forward to a stale history entry) without a network
              round trip. */}
          <Route path="/trust" element={<Navigate to="/governance" replace />} />
          <Route path="/company" element={<Company />} />
          <Route path="/book-a-working-session" element={<WorkingSession />} />
          <Route path="/book-a-demo" element={<BookADemo />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
          <Route path="/technical-review" element={<TechnicalReview />} />
          <Route path="/technical" element={<TechnicalOverview />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
      {!isStandalone && <CookieConsentBanner />}
    </div>
  )
}
