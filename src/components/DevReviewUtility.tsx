import { Link } from 'react-router-dom'

// Development-only convenience links to the internal review workspace and
// the two draft public pages. Gated by import.meta.env.DEV at the call site,
// so this never renders in a production build.
export function DevReviewUtility() {
  return (
    <div className="dev-review-utility" role="complementary" aria-label="Internal review utility">
      <span>Internal review</span>
      <Link to="/technical-review">Workspace</Link>
      <Link to="/technical">Technical</Link>
      <Link to="/docs">Docs</Link>
    </div>
  )
}
