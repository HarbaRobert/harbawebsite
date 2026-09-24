import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { BrainCircuit, Check, ChevronLeft, ChevronRight, FileSearch, Gauge, Layers, Link2, MessageCircle, Phone, ShieldCheck, Users, Workflow } from 'lucide-react'
import { Eyebrow, ButtonLink, SectionHeading, TextLink, CTA } from '../components/ui'
import { HarbaSystemVisual } from '../components/HarbaSystemVisual'
import { capabilityRow, engageSteps, failedPaths, moduleCards, stackShowcase, trustTiles } from '../data/site'

const platformIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  pipelines: Workflow,
  'big-brain': BrainCircuit,
  teammates: Users,
  modules: Layers,
  'personal-assistant': MessageCircle,
}

const capabilityIcons: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  voice: Phone,
  messaging: MessageCircle,
  integrations: Link2,
  approvals: ShieldCheck,
  audit: FileSearch,
  cost: Gauge,
}

function PlatformShowcase() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [motionOK] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const total = stackShowcase.length

  useEffect(() => {
    if (!motionOK || paused) return
    const id = setInterval(() => setActive((current) => (current + 1) % total), 5500)
    return () => clearInterval(id)
  }, [paused, motionOK, total])

  const goTo = (index: number) => setActive(((index % total) + total) % total)
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); goTo(active + 1) }
    if (event.key === 'ArrowLeft') { event.preventDefault(); goTo(active - 1) }
  }

  const slide = stackShowcase[active]
  const Icon = platformIcons[slide.id]

  return <div
    className="platform-showcase"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)}
    onBlur={() => setPaused(false)}
    onKeyDown={onKeyDown}
  >
    <div className="platform-showcase-copy" key={`copy-${slide.id}`}>
      <span className="platform-slide-count">{String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
      <h3>{slide.title}</h3>
      <p className="platform-lead">{slide.lead}</p>
      <p className="platform-supporting">{slide.text}</p>
    </div>

    <div className="platform-showcase-controls">
      <button className="platform-nav-btn" aria-label="Previous component" onClick={() => goTo(active - 1)}><ChevronLeft aria-hidden="true" /></button>
      <div className="showcase-dots" role="tablist" aria-label="Choose a platform component">
        {stackShowcase.map((item, index) => <button key={item.id} role="tab" aria-selected={index === active} className={index === active ? 'showcase-dot is-active' : 'showcase-dot'} aria-label={`Show ${item.title}`} onClick={() => goTo(index)} />)}
      </div>
      <button className="platform-nav-btn" aria-label="Next component" onClick={() => goTo(active + 1)}><ChevronRight aria-hidden="true" /></button>
    </div>

    <div className="platform-showcase-visual" key={`visual-${slide.id}`}>
      <div className="showcase-frame">
        <Icon aria-hidden="true" />
        <span className="showcase-frame-tag">Placeholder — {slide.title} view</span>
      </div>
    </div>
  </div>
}

function PlatformHierarchy() {
  return <>
    <p className="hierarchy-statement">
      <strong>Pipelines</strong> control the work. <strong>Big Brain</strong> supplies the knowledge. <strong>Teammates</strong> perform defined roles. <strong>Modules</strong> package them around business outcomes. Your <strong>Personal Assistant</strong> gives you one simple way to access it all.
    </p>
    <div className="capability-row">
      {capabilityRow.map((item) => {
        const Icon = capabilityIcons[item.id]
        return <span className="capability-item" key={item.id}><Icon aria-hidden="true" />{item.label}</span>
      })}
    </div>
    <p className="hierarchy-supporting">Harba connects these capabilities to the systems your business already uses, while keeping important work governed and visible.</p>
  </>
}

function FailedPaths() {
  return <div className="failed-paths">{failedPaths.map((row, index) => <article key={row.path}><span className="index">0{index + 1}</span><h3>{row.path}</h3><p className="failed-wrong">{row.wrong}</p><p className="failed-response"><Check /> {row.response}</p></article>)}</div>
}

function EngageSteps() {
  return <div className="process-steps">{engageSteps.map((step) => <article key={step.title}><span className="step-number">{step.number}</span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
}

function ModuleGrid() {
  return <div className="module-grid">{moduleCards.map((card, index) => <article key={card.title}><span className="index">0{index + 1}</span><h3>{card.title}</h3><p>{card.text}</p></article>)}</div>
}

function GovernanceTiles() {
  return <div className="trust-tiles">{trustTiles.map((tile) => <div key={tile}><Check />{tile}</div>)}</div>
}

export function Home() {
  const location = useLocation()
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  return <>
    <section className="hero container-wide">
      <div className="hero-copy">
        <Eyebrow>MANAGED DIGITAL WORKFORCE PLATFORM</Eyebrow>
        <h1>AI teammates that run real work <em>across the systems you already trust.</em></h1>
        <p>On governed Pipelines, across the CRM, ERP and tools you already run.</p>
        <div className="hero-actions">
          <ButtonLink to="/book-a-working-session">Request a working session</ButtonLink>
          <ButtonLink to="/book-a-demo" secondary event="secondary_cta_clicked">Book a demo</ButtonLink>
        </div>
      </div>
      <div className="hero-visual"><HarbaSystemVisual /></div>
    </section>

    <section className="section paper" id="platform"><div className="container"><h2 className="platform-title">The platform</h2><PlatformShowcase /></div></section>

    <section className="section paper hierarchy-section"><div className="container"><PlatformHierarchy /></div></section>

    <section className="section dark"><div className="container"><Eyebrow>THE PROBLEM</Eyebrow><SectionHeading title="Most AI buys stall for the same three reasons." /><FailedPaths /></div></section>

    <section className="section paper" id="how-we-engage"><div className="container"><Eyebrow>HOW WE ENGAGE</Eyebrow><SectionHeading title="Harba is managed-first." text="Teammates become the lasting workforce; we remain the partner who configures, governs and improves them." /><EngageSteps /><TextLink to="/how-we-work">See how we work</TextLink></div></section>

    <section className="section dark"><div className="container"><Eyebrow>WHERE TEAMS USUALLY START</Eyebrow><SectionHeading title="Start with one valuable process. Expand from there." /><ModuleGrid /><TextLink to="/use-cases">Explore use cases</TextLink></div></section>

    <section className="section paper"><div className="container"><Eyebrow>GOVERNED FOR REAL WORK</Eyebrow><SectionHeading title="AI your business can operate, inspect and control." text="Important actions can require human approval. Pipeline runs retain their step history, outputs and errors, while model usage and cost remain visible. This gives teams a practical way to review work, investigate failures and keep AI operations under control." /><GovernanceTiles /><TextLink to="/governance">Explore security and governance</TextLink></div></section>

    <CTA text="Request a working session. We will map one valuable process across your current systems and tell you honestly whether Harba is the right fit." showDemo />
  </>
}
