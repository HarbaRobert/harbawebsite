import { Check } from 'lucide-react'
import { PageIntro, Eyebrow, TextLink, CTA } from '../components/ui'
import { controlByDesignPoints, customerEnvironmentPoints } from '../data/site'

// Formerly the Trust page (/trust, now a permanent redirect to /governance -
// see server/index.js). No page-level eyebrow is passed to PageIntro here:
// the site-wide route indicator in SiteShell.tsx already renders
// "HARBA / GOVERNANCE" above every page from the URL, so a second, identical
// eyebrow directly above the H1 would just repeat it.
//
// This page states the assurances (what customers can control, review and
// govern) and leaves the mechanisms behind them to /technical - see the
// TextLink at the end of each section. Keep it that way rather than folding
// the technical detail back in here: see src/pages/TechnicalOverview.tsx for
// where separate databases, credentials, per-step model configuration and
// approval steps within Pipeline execution are actually explained.
export function Governance() {
  return <>
    <PageIntro title="Useful AI needs boundaries." text="Control is designed into each Harba implementation from the start." />

    <section className="section paper">
      <div className="container trust-layout">
        <div>
          <Eyebrow>CONTROL BY DESIGN</Eyebrow>
          <h2>Make the operation visible, reviewable and accountable.</h2>
          <p>Harba is configured around defined processes, workspace access and decision points. Pipeline activity is recorded, and important actions can pause for human approval before work continues.</p>
          <TextLink to="/technical#architecture-and-execution">Read the technical overview</TextLink>
        </div>
        <div className="trust-list">{controlByDesignPoints.map((point) => <div key={point}><Check /><span>{point}</span></div>)}</div>
      </div>
    </section>

    <section className="section dark">
      <div className="container trust-layout">
        <div>
          <Eyebrow>CUSTOMER ENVIRONMENTS</Eyebrow>
          <h2>Configured around your organisation and requirements.</h2>
          <p>Every customer works within their own Harba workspace, with their information and data kept separate from every other customer.</p>
          <TextLink to="/technical#data-and-big-brain">See how customer separation works</TextLink>
        </div>
        <div className="trust-list">{customerEnvironmentPoints.map((point) => <div key={point}><Check /><span>{point}</span></div>)}</div>
      </div>
    </section>

    <section className="section paper">
      <div className="container">
        <Eyebrow>MODEL CHOICE</Eyebrow>
        <h2>Choose the right model for each part of the work.</h2>
        <p className="intro-copy">Harba can match model and provider choice to the needs of each part of the work, so capability, cost and provider requirements are properly considered.</p>
        <p className="intro-copy">Data handling, retention and training policies vary between providers. The selected provider and model must therefore be considered against the customer’s requirements and the provider’s current terms.</p>
        <TextLink to="/technical#models-and-providers">See how models are configured</TextLink>
      </div>
    </section>

    <CTA title="Have a specific security, hosting or data question?" text="Include it when you request a working session and we will address it as part of the technical and implementation review." />
  </>
}
