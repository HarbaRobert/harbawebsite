import { Check } from 'lucide-react'
import { PageIntro, Eyebrow, CTA } from '../components/ui'

const stages = [
  {
    number: '01',
    title: 'Understand',
    lead: 'Find the right opportunity.',
    text: 'The first working session helps us understand the business, the process, the systems involved and the result you need. It also establishes whether the opportunity is a good fit for Harba.',
    covers: ['The operational problem', 'The people and systems involved', 'Existing controls', 'The desired outcome', 'Whether Harba is the right fit'],
  },
  {
    number: '02',
    title: 'Shape',
    lead: 'Define the first implementation.',
    text: 'We turn what we have learned into an initial prototype approach and proposal. This sets out the first process to address, how Harba would support it and what implementation work is required.',
    covers: ['Proposed prototype', 'Initial scope', 'Required information and connections', 'Responsibilities and dependencies', 'Implementation proposal'],
  },
  {
    number: '03',
    title: 'Configure',
    lead: 'Build it around your business.',
    text: 'Harba configures the Pipelines, Big Brain knowledge, Teammates, approvals and model choices required. Where existing platforms need to be connected, we work with the customer’s internal technical team or relevant external partners.',
    covers: ['Pipeline configuration', 'Knowledge and data', 'Teammate roles', 'Human approvals', 'System integrations', 'Testing'],
  },
  {
    number: '04',
    title: 'Deploy and improve',
    lead: 'Move into real work and continue improving it.',
    text: 'The implementation is introduced into the agreed working process. Harba remains involved through ongoing platform access, support and improvement as usage grows and further opportunities are identified.',
    covers: ['Controlled deployment', 'Feedback and refinement', 'Usage and cost oversight', 'Ongoing support', 'Further opportunities'],
  },
]

function Stages() {
  return <div className="stage-grid">{stages.map((stage) => <article className="stage-card" key={stage.title}>
    <span className="step-number">{stage.number}</span>
    <h3>{stage.title}</h3>
    <p className="stage-lead">{stage.lead}</p>
    <p>{stage.text}</p>
    <ul className="stage-covers">{stage.covers.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
  </article>)}</div>
}

export function HowWeWork() {
  return <>
    <PageIntro eyebrow="HOW WE WORK" title="From an operational opportunity to a working digital workforce." text="We start with the business, identify a valuable first process and configure Harba around the way your organisation already works." />

    <section className="section dark"><div className="container"><Stages /></div></section>

    <section className="section paper">
      <div className="container">
        <Eyebrow>HOW PRICING WORKS</Eyebrow>
        <div className="pricing-grid">
          <article><h3>Implementation</h3><p>The work required to understand, configure, integrate and deploy the initial solution.</p></article>
          <article><h3>Platform and support</h3><p>Ongoing access to Harba, infrastructure usage and continued support.</p></article>
        </div>
        <p className="pricing-note">The exact scope depends on the process, systems, information and support required. This is defined in the proposal after the initial working session.</p>
      </div>
    </section>

    <CTA title="Find the first piece of work worth improving." text="Request a working session to explore the opportunity and establish whether Harba is the right fit." />
  </>
}
