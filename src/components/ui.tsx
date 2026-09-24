import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { track, type EventName } from '../lib/analytics'

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

export function PageIntro({ eyebrow, title, text }: { eyebrow?: string; title: string; text: string }) {
  return <section className="page-intro container">{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<h1>{title}</h1><p className="intro-copy">{text}</p></section>
}

export function ButtonLink({ to, children, secondary = false, event = 'primary_cta_clicked' as EventName }: { to: string; children: React.ReactNode; secondary?: boolean; event?: EventName }) {
  return <Link className={secondary ? 'button button-secondary' : 'button'} to={to} onClick={() => track(event)}>{children}<ArrowRight aria-hidden="true" /></Link>
}

export function SectionHeading({ title, text }: { title: string; text?: string }) {
  return <div className="section-heading"><h2>{title}</h2>{text && <p>{text}</p>}</div>
}

export function TextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return <Link className="text-link" to={to}>{children}<ArrowRight aria-hidden="true" /></Link>
}

export function CTA({
  title = 'Ready to see where a digital workforce fits your operations?',
  text = "Request a working session. We'll map one high-value process across your current stack and tell you honestly if Harba isn't the right path.",
  showDemo = false,
}: { title?: string; text?: string; showDemo?: boolean }) {
  return <section className="cta"><div className="container cta-inner"><Eyebrow>GET STARTED</Eyebrow><h2>{title}</h2><p>{text}</p>
    <div className="cta-actions">
      <ButtonLink to="/book-a-working-session">Request a working session</ButtonLink>
      {showDemo && <ButtonLink to="/book-a-demo" secondary event="secondary_cta_clicked">Book a demo</ButtonLink>}
    </div>
  </div></section>
}
