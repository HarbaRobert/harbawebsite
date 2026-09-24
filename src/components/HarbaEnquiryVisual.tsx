import { useEffect, useRef, useState } from 'react'
import { Check, Clock, Database, Pause, Play, ShieldCheck, User } from 'lucide-react'
import {
  EXTERNAL_SYSTEMS,
  JOURNEY_FRAMES,
  MOBILE_STAGES,
  PIPELINE_STEPS,
  RESOLVED_FRAME,
  mobileStageForScene,
  type JourneyFrame,
} from '../data/heroJourney'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

const ACCESSIBLE_DESCRIPTION = 'A user asks a Harba Teammate to prepare a customer response. The Teammate starts a Pipeline that collects information from customer systems, searches Big Brain, prepares the response, pauses for human approval, updates the CRM and records the completed activity.'

/**
 * Advances through JOURNEY_FRAMES on a timer, pausing when the visitor asks
 * it to, when the component scrolls out of view, when the browser tab is
 * hidden, or when the OS is set to prefers-reduced-motion. reducedMotion,
 * inView and tabVisible all default to the "animate" value so the very
 * first client render matches the prerendered server HTML exactly - real
 * window/document/observer checks only ever run after mount, in effects,
 * never in a render-phase initializer, so there is nothing here for
 * hydration to disagree with.
 */
function useJourneyScene() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [inView, setInView] = useState(true)
  const [tabVisible, setTabVisible] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(query.matches)
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    setTabVisible(document.visibilityState === 'visible')
    const onVisibilityChange = () => setTabVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const running = playing && inView && tabVisible && !reducedMotion

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => {
      setFrameIndex((index) => (index + 1) % JOURNEY_FRAMES.length)
    }, JOURNEY_FRAMES[frameIndex].duration)
    return () => window.clearTimeout(id)
  }, [frameIndex, running])

  // Reduced motion shows the finished run, not a frozen mid-step frame - a
  // static illustration is more meaningful stopped on a resolved state than
  // paused arbitrarily partway through one step.
  const frame: JourneyFrame = reducedMotion ? RESOLVED_FRAME : JOURNEY_FRAMES[frameIndex]

  return { frame, containerRef, playing, setPlaying, reducedMotion }
}

function systemStatusFor(frame: JourneyFrame, id: (typeof EXTERNAL_SYSTEMS)[number]['id']): string | null {
  return frame.activeSystem === id ? frame.systemStatus : null
}

const TOP_INBOUND = new Set(['request-in', 'approval-in'])
const TOP_OUTBOUND = new Set(['approval-out'])
const BOTTOM_INBOUND = new Set(['source-in'])
const BOTTOM_OUTBOUND = new Set(['crm-out', 'comms-out'])

function BoundarySeam({ inbound, outbound }: { inbound: boolean; outbound: boolean }) {
  const active = inbound || outbound
  return (
    <div className={cx('journey-seam', active && 'is-active', outbound && 'is-outbound')} aria-hidden="true">
      {active && <span className="journey-seam-dot" />}
    </div>
  )
}

export function HarbaEnquiryVisual() {
  const { frame, containerRef, playing, setPlaying, reducedMotion } = useJourneyScene()
  const mobileStage = mobileStageForScene(frame.scene)
  const dimmed = frame.paused

  return (
    <div className="journey" ref={containerRef}>
      <div className="journey-toolbar">
        <span id="journey-label" className="sr-only">{ACCESSIBLE_DESCRIPTION}</span>
        {!reducedMotion && (
          <button
            type="button"
            className="journey-toggle"
            onClick={() => setPlaying((current) => !current)}
            aria-pressed={playing}
            aria-describedby="journey-label"
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span>{playing ? 'Pause animation' : 'Play animation'}</span>
          </button>
        )}
        <p className="journey-caption" aria-hidden="true">{frame.message}</p>
      </div>

      <div className="journey-stage" role="img" aria-labelledby="journey-label">
        <div className="journey-stage-full" aria-hidden="true">
          {/* Outside Harba: the customer's own world. */}
          <div className="journey-outside journey-outside-top">
            <div className={cx('journey-user', frame.focal === 'user' && 'is-focal')}>
              <User aria-hidden="true" />
              <span>User</span>
            </div>
            {frame.userMessage && (
              <div className={cx('journey-bubble', frame.boundaryFlow === 'request-in' && 'is-crossing')}>
                {frame.userMessage}
              </div>
            )}
          </div>

          <BoundarySeam inbound={TOP_INBOUND.has(frame.boundaryFlow ?? '')} outbound={TOP_OUTBOUND.has(frame.boundaryFlow ?? '')} />

          {/* Inside Harba: one coherent operating environment. */}
          <div className={cx('journey-harba', dimmed && 'is-paused')}>
            <span className="journey-harba-label">HARBA<br />MANAGED DIGITAL WORKFORCE</span>

            <div className="journey-harba-row">
              <div className={cx('journey-teammate', frame.focal === 'teammate' && 'is-focal', frame.teammateActive && 'is-active')}>
                <User aria-hidden="true" />
                <div>
                  <span className="journey-node-title">Customer Teammate</span>
                  {frame.teammateLine && <span className="journey-node-status">{frame.teammateLine}</span>}
                </div>
              </div>

              <div className={cx('journey-bigbrain', frame.focal === 'bigbrain' && 'is-focal', frame.bigBrainActive && 'is-active')}>
                <Database aria-hidden="true" />
                <div>
                  <span className="journey-node-title">Big Brain</span>
                  {frame.bigBrainStatus && <span className="journey-node-status">{frame.bigBrainStatus}</span>}
                </div>
              </div>
            </div>

            <div className={cx('journey-workitem', frame.focal === 'workitem' && 'is-focal')}>
              {frame.workItem ? (
                <>
                  <span className="journey-workitem-eyebrow">{frame.workItem.eyebrow}</span>
                  {frame.workItem.lines.map((line) => <p key={line}>{line}</p>)}
                </>
              ) : (
                <span className="journey-workitem-eyebrow">Enquiry Pipeline</span>
              )}
            </div>

            <div className="journey-rail">
              {PIPELINE_STEPS.map((step) => {
                const state = frame.completedSteps.includes(step.id) ? 'complete' : frame.activeStep === step.id ? 'active' : 'pending'
                return (
                  <div key={step.id} className={cx('journey-rail-step', `is-${state}`, frame.focal === 'pipeline' && state === 'active' && 'is-focal')}>
                    {state === 'complete' ? <Check aria-hidden="true" /> : <span className="journey-rail-dot" aria-hidden="true" />}
                    <span>{step.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <BoundarySeam inbound={BOTTOM_INBOUND.has(frame.boundaryFlow ?? '')} outbound={BOTTOM_OUTBOUND.has(frame.boundaryFlow ?? '')} />

          {/* Outside Harba: the systems Harba reads from and writes back to. */}
          <div className="journey-outside journey-outside-bottom">
            {EXTERNAL_SYSTEMS.map((system) => {
              const status = systemStatusFor(frame, system.id)
              return (
                <div key={system.id} className={cx('journey-system', status && 'is-active', frame.focal === 'system' && status && 'is-focal')}>
                  <span className="journey-system-label">{system.label}</span>
                  {status && <span className="journey-system-status">{status}</span>}
                </div>
              )
            })}
          </div>

          {/* The approval moment: brought into the foreground, everything else dims. */}
          {frame.approvalCard && (
            <div className={cx('journey-approval', `is-${frame.approvalCard.status}`, frame.focal === 'approval' && 'is-focal')}>
              <span className="journey-approval-title">
                {frame.approvalCard.status === 'approved' ? <Check aria-hidden="true" /> : <Clock aria-hidden="true" />}
                Human approval
              </span>
              {frame.approvalCard.lines.map((line) => <p key={line}>{line}</p>)}
              <span className="journey-approval-status">
                {frame.approvalCard.status === 'approved' ? <><ShieldCheck aria-hidden="true" />Approved &middot; Continue</> : 'Awaiting review'}
              </span>
            </div>
          )}
        </div>

        <div className="journey-stage-mobile" aria-hidden="true">
          {MOBILE_STAGES.map((stage) => (
            <div key={stage.id} className={cx('journey-mobile-stage', mobileStage === stage.id && 'is-active')}>
              <span className="journey-rail-dot" aria-hidden="true" />
              {stage.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
