import { useRef, useState } from 'react'
import { BrainCircuit, Layers, Link2, MessageCircle, Sparkles, Users, Workflow } from 'lucide-react'
import { Eyebrow, ButtonLink, SectionHeading } from '../components/ui'
import { useCases, systemParts, type UseCase } from '../data/useCases'

const systemIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  pipelines: Workflow,
  modules: Layers,
  teammates: Users,
  'personal-assistant': MessageCircle,
  'big-brain': BrainCircuit,
  integrations: Link2,
}

function UseCaseContent({ useCase }: { useCase: UseCase }) {
  return <div className="usecase-content">
    <h3>{useCase.heading}</h3>
    <p className="usecase-intro">{useCase.intro}</p>
    <div className="usecase-steps">
      <article><Link2 aria-hidden="true" /><h4>Connect</h4><p>{useCase.connect}</p></article>
      <article><BrainCircuit aria-hidden="true" /><h4>Remember</h4><p>{useCase.remember}</p></article>
      <article><Workflow aria-hidden="true" /><h4>Work</h4><p>{useCase.work}</p></article>
      <article><MessageCircle aria-hidden="true" /><h4>Interact</h4><p>{useCase.interact}</p></article>
    </div>
    <div className="usecase-outcome">
      <Sparkles aria-hidden="true" />
      <div><span className="usecase-outcome-label">Outcome</span><p>{useCase.outcome}</p></div>
    </div>
    <blockquote className="usecase-question">&ldquo;{useCase.question}&rdquo;</blockquote>
  </div>
}

function UseCaseExplorer() {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onTabKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    event.preventDefault()
    const next = event.key === 'ArrowRight' ? (index + 1) % useCases.length : (index - 1 + useCases.length) % useCases.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  return <div className="usecase-explorer" role="tablist" aria-label="Choose an industry">
    {useCases.map((useCase, index) => <button
      key={`tab-${useCase.industry}`}
      ref={(el) => { tabRefs.current[index] = el }}
      role="tab"
      id={`usecase-tab-${index}`}
      aria-selected={active === index}
      aria-controls={`usecase-panel-${index}`}
      tabIndex={active === index ? 0 : -1}
      className={active === index ? 'usecase-tab is-active' : 'usecase-tab'}
      onClick={() => setActive(index)}
      onKeyDown={(event) => onTabKeyDown(event, index)}
    >{useCase.industry}</button>)}

    {useCases.map((useCase, index) => <div
      key={`panel-${useCase.industry}`}
      id={`usecase-panel-${index}`}
      role="tabpanel"
      aria-labelledby={`usecase-tab-${index}`}
      hidden={active !== index}
      className="usecase-panel"
    ><UseCaseContent useCase={useCase} /></div>)}
  </div>
}

function SystemFrame() {
  return <div className="system-frame">
    <span className="system-frame-kicker">HARBA</span>
    <div className="system-grid">
      {systemParts.map((part) => {
        const Icon = systemIcons[part.id]
        return <article className="stack-tile" key={part.id}><Icon aria-hidden="true" /><h3>{part.title}</h3><p>{part.text}</p></article>
      })}
    </div>
  </div>
}

export function UseCases() {
  return <>
    <section className="page-intro container">
      <Eyebrow>HARBA IN YOUR BUSINESS</Eyebrow>
      <h1>See how Harba could work inside your business</h1>
      <p className="intro-copy">Every business works differently. Harba connects with the systems you already use, builds knowledge around your organisation and brings together governed pipelines, AI teammates and a Personal Assistant to help work get done.</p>
      <p className="intro-supporting">Explore how the same Harba platform could be configured for different industries and ways of working.</p>
    </section>

    <section className="section paper"><div className="container"><UseCaseExplorer /></div></section>

    <section className="section dark"><div className="container"><SectionHeading title="Different businesses. The same connected foundation." /><SystemFrame /></div></section>

    <section className="cta"><div className="container cta-inner">
      <Eyebrow>GET STARTED</Eyebrow>
      <h2>What could Harba do inside your business?</h2>
      <p>We start by understanding how your business works, where information lives and which processes create the greatest opportunity. We then help you identify, build and run the right Harba configuration around your organisation.</p>
      <div className="hero-actions">
        <ButtonLink to="/book-a-working-session">Explore Harba for your business</ButtonLink>
        <ButtonLink to="/how-we-work" secondary>See how Harba works</ButtonLink>
      </div>
    </div></section>
  </>
}
