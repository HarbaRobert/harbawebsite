import { Eyebrow, PageIntro, CTA } from '../components/ui'
import { founders } from '../data/founders'

const principles = [
  { title: 'Business before technology', text: 'Start with the process, people and outcome.' },
  { title: 'Control before scale', text: 'Define approvals and visibility before expanding automation.' },
  { title: 'Partnership beyond launch', text: 'Continue supporting and improving the digital workforce after deployment.' },
]

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('')
}

function Founders() {
  return <div className="founders-grid">{founders.map((founder) => <article className="founder-card" key={founder.name}>
    {founder.photo ? <img className="founder-photo" src={founder.photo} alt="" /> : <div className="founder-initials" aria-hidden="true">{initials(founder.name)}</div>}
    <h3>{founder.name}</h3>
    <p className="founder-role">{founder.role}</p>
    {founder.bio && <p>{founder.bio}</p>}
    {founder.linkedin && <a href={founder.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
  </article>)}</div>
}

function Principles() {
  return <div className="principles-grid">{principles.map((principle) => <article key={principle.title}><h3>{principle.title}</h3><p>{principle.text}</p></article>)}</div>
}

export function Company() {
  return <>
    <PageIntro eyebrow="COMPANY" title="Technology is only useful when it works inside the business." text="Harba helps established organisations move from experimenting with AI to operating a useful, governed digital workforce." />

    <section className="section paper">
      <div className="container about-grid">
        <div><Eyebrow>WHY HARBA EXISTS</Eyebrow><h2>The hard part is rarely the model.</h2></div>
        <div>
          <p>The difficult work sits around the AI: understanding the process, connecting the systems, deciding what can happen automatically and creating a sensible route back to a person.</p>
          <p>Harba brings the platform and implementation approach together. We work with each customer to identify the opportunity, configure the digital workforce and improve it over time.</p>
        </div>
      </div>
    </section>

    <section className="section dark">
      <div className="container">
        <Eyebrow>THE FOUNDERS</Eyebrow>
        <Founders />
      </div>
    </section>

    <section className="section paper">
      <div className="container">
        <Eyebrow>HOW WE APPROACH THE WORK</Eyebrow>
        <Principles />
      </div>
    </section>

    <CTA />
  </>
}
