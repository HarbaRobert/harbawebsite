import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Menu, Search, X } from 'lucide-react'
import { DraftLabel } from '../components/DraftLabel'
import { CapabilityBadge } from '../components/CapabilityBadge'
import { RichText } from '../components/RichText'
import { DOCS_STRUCTURE, publishableForSection } from '../data/previewStructure'
import { useReviewAnswers } from '../lib/reviewStorage'

const DEVELOPER_ACCESS_LINK = '/book-a-working-session?topic=developer-access'

export function Docs() {
  const { answers } = useReviewAnswers()
  const [activeSlug, setActiveSlug] = useState(DOCS_STRUCTURE[0].slug)
  const [search, setSearch] = useState('')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const activeIndex = DOCS_STRUCTURE.findIndex((section) => section.slug === activeSlug)
  const activeSection = DOCS_STRUCTURE[activeIndex] ?? DOCS_STRUCTURE[0]
  const previous = activeIndex > 0 ? DOCS_STRUCTURE[activeIndex - 1] : null
  const next = activeIndex < DOCS_STRUCTURE.length - 1 ? DOCS_STRUCTURE[activeIndex + 1] : null

  const items = useMemo(
    () => publishableForSection(activeSection, answers, 'Developer Documentation'),
    [activeSection, answers],
  )

  const filteredNav = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return DOCS_STRUCTURE
    return DOCS_STRUCTURE.filter((section) => {
      if (section.title.toLowerCase().includes(term)) return true
      return publishableForSection(section, answers, 'Developer Documentation').some(
        (item) => item.question.toLowerCase().includes(term) || item.documentationContent.toLowerCase().includes(term),
      )
    })
  }, [search, answers])

  const selectSection = (slug: string) => {
    setActiveSlug(slug)
    setMobileNavOpen(false)
  }

  return (
    <>
      <header className="docs-topbar">
        <Link className="wordmark" to="/" aria-label="Back to Harba">harba<span>.</span></Link>
        <Link className="docs-topbar-link" to="/technical">Technical overview</Link>
      </header>

      <div className="docs-layout">
        <button
          type="button"
          className="docs-mobile-toggle"
          aria-expanded={mobileNavOpen}
          aria-controls="docs-sidebar"
          onClick={() => setMobileNavOpen((open) => !open)}
        >
          {mobileNavOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          {mobileNavOpen ? 'Close documentation menu' : 'Documentation menu'}
        </button>

        <aside id="docs-sidebar" className={mobileNavOpen ? 'docs-sidebar is-open' : 'docs-sidebar'} aria-label="Documentation sections">
          <label className="docs-search">
            <Search aria-hidden="true" />
            <span className="hp-field">Search documentation</span>
            <input
              type="search"
              placeholder="Filter documentation"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <nav aria-label="Documentation contents">
            <ol className="docs-nav-list">
              {filteredNav.map((section) => (
                <li key={section.slug}>
                  <button
                    type="button"
                    className={section.slug === activeSlug ? 'docs-nav-item is-active' : 'docs-nav-item'}
                    aria-current={section.slug === activeSlug ? 'page' : undefined}
                    onClick={() => selectSection(section.slug)}
                  >
                    {section.title}
                  </button>
                </li>
              ))}
            </ol>
          </nav>

          <Link className="docs-persistent-cta" to={DEVELOPER_ACCESS_LINK}>
            Request developer access<ArrowRight aria-hidden="true" />
          </Link>
        </aside>

        <article className="docs-content">
          <DraftLabel />
          <h1>{activeSection.title}</h1>

          {items.length === 0 ? (
            <div className="awaiting-review">
              <h2>Documentation pending technical review</h2>
            </div>
          ) : (
            <div className="docs-answers">
              {items.map((item) => (
                <section key={item.id} className="docs-answer">
                  <div className="overview-answer-head">
                    <h2>{item.question}</h2>
                    <CapabilityBadge status={item.capabilityStatus} />
                  </div>
                  <RichText text={item.documentationContent} />
                </section>
              ))}
            </div>
          )}

          <nav className="docs-prev-next" aria-label="Documentation page navigation">
            {previous ? (
              <button type="button" className="docs-prev-next-link" onClick={() => selectSection(previous.slug)}>
                <ArrowLeft aria-hidden="true" />
                <span><small>Previous</small>{previous.title}</span>
              </button>
            ) : <span />}
            {next ? (
              <button type="button" className="docs-prev-next-link is-next" onClick={() => selectSection(next.slug)}>
                <span><small>Next</small>{next.title}</span>
                <ArrowRight aria-hidden="true" />
              </button>
            ) : <span />}
          </nav>

          <div className="docs-footer-cta">
            <h2>Request developer access</h2>
            <p>Tell us about the integration you have in mind. We will confirm what direct platform access looks like today.</p>
            <Link className="button" to={DEVELOPER_ACCESS_LINK}>Request developer access<ArrowRight aria-hidden="true" /></Link>
          </div>
        </article>
      </div>
    </>
  )
}
