import { Link } from 'react-router-dom'
import { clearConsent } from '../lib/consent'

export function Footer() {
  return <footer className="site-footer">
    <div className="container footer-top">
      <div><Link className="wordmark" to="/">harba<span>.</span></Link><p>Managed digital workforce platform, across your systems.</p></div>
      <div className="footer-links">
        <div><strong>Explore</strong><Link to="/use-cases">Use cases</Link><Link to="/how-we-work">How we work</Link><Link to="/governance">Governance</Link><Link to="/technical">Technical</Link><Link to="/company">Company</Link></div>
        <div><strong>Get started</strong><Link to="/book-a-working-session">Request a working session</Link><Link to="/book-a-demo">Book a demo</Link></div>
        <div><strong>Legal</strong><Link to="/privacy">Privacy</Link><Link to="/cookies">Cookies</Link><Link to="/terms">Terms</Link><button type="button" className="footer-link-button" onClick={clearConsent}>Cookie preferences</button></div>
      </div>
    </div>
    <div className="container footer-bottom"><span suppressHydrationWarning>© {new Date().getFullYear()} Harba</span></div>
  </footer>
}
