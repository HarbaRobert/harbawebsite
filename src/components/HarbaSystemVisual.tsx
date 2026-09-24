import { useEffect, useRef, useState } from 'react'
import { Check, Clock, ShieldCheck, User } from 'lucide-react'
import {
  EXTERNAL_SYSTEMS,
  MOBILE_STAGES,
  PIPELINE_STEPS,
  RESOLVED_FRAME,
  SCENE_FRAMES,
  mobileStageForPhase,
  type SceneFrame,
} from '../data/heroVisual'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

/**
 * Advances through SCENE_FRAMES on a timer, pausing when the component
 * scrolls out of view or when the OS is set to prefers-reduced-motion.
 * reducedMotion and inView both default to the "animate" value so the very
 * first client render matches the prerendered server HTML exactly (see the
 * comment above the effects below) - real window/observer checks only ever
 * run after mount, in effects, never in a render-phase initializer, so
 * there is nothing here for hydration to disagree with.
 */
function useHeroVisualScene() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [inView, setInView] = useState(true)
  const [reducedMotion, setReducedMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Checked once, client-side only, after the first paint - see the
  // function comment above for why this can't run during render.
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

  const running = inView && !reducedMotion

  useEffect(() => {
    if (!running) return
    const id = window.setTimeout(() => {
      setFrameIndex((index) => (index + 1) % SCENE_FRAMES.length)
    }, SCENE_FRAMES[frameIndex].duration)
    return () => window.clearTimeout(id)
  }, [frameIndex, running])

  // Reduced motion shows the finished run, not a frozen mid-step frame - a
  // static illustration is more meaningful stopped on a resolved state than
  // paused arbitrarily partway through one step.
  const frame: SceneFrame = reducedMotion ? RESOLVED_FRAME : SCENE_FRAMES[frameIndex]

  return { frame, containerRef, reducedMotion }
}

function bigBrainStatus(frame: SceneFrame): string {
  if (frame.bigBrain === 'searching') return 'Searching Big Brain'
  if (frame.bigBrain === 'returned') return 'Relevant knowledge found'
  return 'Searchable business knowledge'
}

function teammateStatus(frame: SceneFrame, who: 'customer' | 'ops'): string {
  if (frame.activeTeammate === who) return who === 'customer' ? 'Preparing response' : 'Creating follow-up'
  return who === 'customer' ? 'Customer enquiries' : 'Operational follow-through'
}

function approvalCopy(frame: SceneFrame): { title: string; status: string } {
  if (frame.approval === 'pending') return { title: 'Awaiting approval', status: 'Review before sending' }
  if (frame.approval === 'approved') return { title: 'Approved', status: 'Consequential action released' }
  return { title: 'Human approval', status: 'Pauses on consequential actions' }
}

function Wire({ active, reverse, className }: { active: boolean; reverse?: boolean; className: string }) {
  return (
    <span className={cx('harba-wire', className, active && 'is-active', active && reverse && 'is-reverse')} aria-hidden="true">
      {active && <span className="harba-wire-dot" />}
    </span>
  )
}

export function HarbaSystemVisual() {
  const { frame, containerRef, reducedMotion } = useHeroVisualScene()

  const entryDirection = frame.activeConnector === 'inbox-pipeline' || frame.activeConnector === 'crm-understand' ? 'in'
    : frame.activeConnector === 'pipeline-crm' || frame.activeConnector === 'pipeline-comms' ? 'out'
    : null

  const mobileStage = mobileStageForPhase(frame.phase)

  return (
    <div className="harba-visual" ref={containerRef}>
      <div className="harba-visual-toolbar">
        <span id="harba-visual-label" className="sr-only">
          Animated diagram: a customer enquiry moving through Harba. It arrives from an existing system, a Pipeline
          controls the process, Big Brain supplies relevant knowledge, two Teammates perform defined roles, a person
          approves the consequential action, and Harba writes the result back to the customer&rsquo;s own systems.
        </span>
        <p className="harba-caption" aria-hidden="true">{frame.message}</p>
      </div>

      <div className="harba-stage" role="img" aria-labelledby="harba-visual-label">
        <div className="harba-stage-full" aria-hidden="true">
          <div className="harba-systems-col">
            {EXTERNAL_SYSTEMS.map((system) => (
              <div key={system.id} className={cx('harba-system-card', frame.activeSystem === system.id && 'is-active')}>
                {system.label}
              </div>
            ))}
          </div>

          <div className="harba-entry-lane">
            <Wire active={!reducedMotion && entryDirection !== null} reverse={entryDirection === 'out'} className="harba-wire-entry" />
          </div>

          <div className={cx('harba-operation', frame.complete && 'is-complete')}>
            <div className="harba-pipeline-row">
              <span className="harba-pipeline-label">Enquiry Pipeline</span>
              <div className="harba-pipeline-track">
                {PIPELINE_STEPS.map((step) => {
                  const state = frame.completedSteps.includes(step.id) ? 'complete' : frame.activeStep === step.id ? 'active' : 'pending'
                  return (
                    <div key={step.id} className={`harba-pipeline-step is-${state}`}>
                      {state === 'complete' ? <Check aria-hidden="true" /> : <span className="harba-step-dot" aria-hidden="true" />}
                      <span>{step.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="harba-branches">
              <div className="harba-branch">
                <Wire active={!reducedMotion && frame.bigBrain !== 'idle'} reverse={frame.activeConnector === 'bigbrain-pipeline'} className="harba-wire-vertical" />
                <div className={cx('harba-node', 'harba-bigbrain', frame.bigBrain !== 'idle' && 'is-active')}>
                  <span className="harba-bigbrain-core" aria-hidden="true" />
                  <div>
                    <span className="harba-node-title">Big Brain</span>
                    <span className="harba-node-status">{bigBrainStatus(frame)}</span>
                  </div>
                </div>
              </div>

              <div className="harba-branch">
                <Wire active={!reducedMotion && frame.activeTeammate === 'customer'} className="harba-wire-vertical" />
                <div className={cx('harba-node', 'harba-teammate', frame.activeTeammate === 'customer' && 'is-active')}>
                  <User aria-hidden="true" />
                  <div>
                    <span className="harba-node-title">Customer Teammate</span>
                    <span className="harba-node-status">{teammateStatus(frame, 'customer')}</span>
                  </div>
                </div>
              </div>

              <div className="harba-branch">
                <Wire active={!reducedMotion && frame.activeConnector === 'customer-ops'} className="harba-wire-horizontal" />
                <Wire active={!reducedMotion && frame.activeTeammate === 'ops'} className="harba-wire-vertical" />
                <div className={cx('harba-node', 'harba-teammate', frame.activeTeammate === 'ops' && 'is-active')}>
                  <User aria-hidden="true" />
                  <div>
                    <span className="harba-node-title">Operations Teammate</span>
                    <span className="harba-node-status">{teammateStatus(frame, 'ops')}</span>
                  </div>
                </div>
              </div>
            </div>

            <Wire active={!reducedMotion && frame.activeConnector === 'pipeline-approval'} className="harba-wire-vertical harba-wire-approval" />

            <div className={`harba-approval is-${frame.approval}`}>
              {frame.approval === 'approved' ? <Check aria-hidden="true" /> : frame.approval === 'pending' ? <Clock aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}
              <div>
                <span className="harba-node-title">{approvalCopy(frame).title}</span>
                <span className="harba-node-status">{approvalCopy(frame).status}</span>
              </div>
            </div>
          </div>

        </div>

        <div className="harba-stage-mobile" aria-hidden="true">
          {MOBILE_STAGES.map((stage) => (
            <div key={stage.id} className={cx('harba-mobile-stage', mobileStage === stage.id && 'is-active')}>
              <span className="harba-step-dot" aria-hidden="true" />
              {stage.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
