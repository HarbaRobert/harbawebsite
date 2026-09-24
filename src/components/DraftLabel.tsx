// Small reminder, visible only in development, that this page's content is
// still being confirmed with Harry. Never rendered in a production build, so
// it must never be relied on to communicate anything to a real visitor: the
// "Documentation pending technical review" placeholder text on /docs is what
// keeps unconfirmed content from being shown as fact.
export function DraftLabel() {
  if (!import.meta.env.DEV) return null
  return <p className="draft-label">Draft technical content</p>
}
