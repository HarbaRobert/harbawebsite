import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Menu, X } from 'lucide-react'
import { track } from '../lib/analytics'

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return <header className="site-header">
    <Link className="wordmark" to="/" onClick={closeMenu} aria-label="Harba home">harba<span>.</span></Link>
    <button className="menu-toggle" aria-expanded={menuOpen} aria-controls="site-nav" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X /> : <Menu />}</button>
    <nav id="site-nav" className={menuOpen ? 'site-nav is-open' : 'site-nav'} aria-label="Primary navigation">
      <Link to="/#platform" onClick={closeMenu}>Platform</Link>
      <Link to="/use-cases" onClick={closeMenu}>Use cases</Link>
      <Link to="/how-we-work" onClick={closeMenu}>How we work</Link>
      <Link to="/governance" onClick={closeMenu}>Governance</Link>
      <Link to="/technical" onClick={closeMenu}>Technical</Link>
      <Link to="/company" onClick={closeMenu}>Company</Link>
      <Link to="/book-a-demo" onClick={closeMenu}>Book a demo</Link>
      <Link className="button button-secondary button-small" to="/login" onClick={closeMenu}>Login</Link>
      <Link className="button button-small" to="/book-a-working-session" onClick={() => { track('navigation_cta_clicked'); closeMenu() }}>Request a working session <ArrowRight /></Link>
    </nav>
  </header>
}
