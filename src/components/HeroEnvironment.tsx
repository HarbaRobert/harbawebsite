import { useEffect, useRef, useState } from 'react'
import { Check, Clock, Database, FileText, Mail, MessageSquare, Pause, Play, Reply, IdCard } from 'lucide-react'
import { LOOP, RESOLVED_FRAME, TOKEN_POSITION, type LoopFrame } from '../data/heroLoop'

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ')
}

const ACCESSIBLE_DESCRIPTION = 'A customer enquiry arrives in the business’s inbox. Harba’s digital workforce takes on the work, prepares a response, and pauses for a person to approve it before updating the CRM and sending the reply.'

/**
 * Advances through LOOP on a timer, pausing when the visitor asks it to,
 * when the hero scrolls out of view, when the browser tab is hidden, or
 * when the OS is set to prefers-reduced-motion. reducedMotion, inView and
 * tabVisible all default to the "animate" value so the very first client
 * render matches the prerendered server HTML exactly (Home.tsx is a real
 * public route, unlike /login) - real window/document/observer checks only
 * ever run after mount, in effects, never in a render-phase initializer.
 */
function useHeroLoop() {
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
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.15 })
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
      setFrameIndex((index) => (index + 1) % LOOP.length)
    }, LOOP[frameIndex].duration)
    return () => window.clearTimeout(id)
  }, [frameIndex, running])

  const frame: LoopFrame = reducedMotion ? RESOLVED_FRAME : LOOP[frameIndex]

  return { frame, containerRef, playing, setPlaying, reducedMotion, paused: !running }
}

export function HeroEnvironment() {
  const { frame, containerRef, playing, setPlaying, reducedMotion, paused } = useHeroLoop()
  const tokenPos = TOKEN_POSITION[frame.token]
  const tokenVisible = frame.token !== 'hidden' && frame.token !== 'paused'
  const tokenReleasing = frame.token === 'release'

  return (
    <div className="hero-visual" ref={containerRef}>
      <span id="hero-visual-label" className="sr-only">{ACCESSIBLE_DESCRIPTION}</span>

      <div className={cx('hero-env', paused && 'is-paused')} role="img" aria-labelledby="hero-visual-label">
        <span className="hero-env-ambient hero-env-ambient-a" aria-hidden="true"><FileText aria-hidden="true" /></span>
        <span className="hero-env-ambient hero-env-ambient-b" aria-hidden="true"><MessageSquare aria-hidden="true" /></span>
        <span className="hero-env-ambient hero-env-ambient-c" aria-hidden="true"><Database aria-hidden="true" /></span>

        <span
          className={cx('hero-env-token', tokenVisible && 'is-visible', tokenReleasing && 'is-releasing')}
          style={{ '--x': tokenPos.left, '--y': tokenPos.top } as React.CSSProperties}
          aria-hidden="true"
        />

        <div className={cx('hero-env-signal hero-env-signal-inbox', frame.inboxActive && 'is-active')} aria-hidden="true">
          <Mail aria-hidden="true" />
          <span>Inbox</span>
        </div>

        <div className={cx('hero-env-harba', frame.harbaActive && 'is-active')} aria-hidden="true">
          <span className="hero-env-harba-surface" />
          <span className="hero-env-harba-surface hero-env-harba-surface-2" />
          <span className="hero-env-harba-glow" />
          <div className="hero-env-harba-content">
            {frame.caption && <span className="hero-env-caption">{frame.caption}</span>}
            {frame.approval !== 'none' && (
              <span className={cx('hero-env-approval', `is-${frame.approval}`)}>
                {frame.approval === 'pending' ? <Clock aria-hidden="true" /> : <Check aria-hidden="true" />}
                {frame.approval === 'pending' ? 'Approval required' : 'Approved'}
              </span>
            )}
          </div>
        </div>

        <div className={cx('hero-env-signal hero-env-signal-crm', frame.outputsActive.includes('crm') && 'is-active')} aria-hidden="true">
          <IdCard aria-hidden="true" />
          <span>CRM{frame.outputsActive.includes('crm') && <em>Updated</em>}</span>
        </div>

        <div className={cx('hero-env-signal hero-env-signal-email', frame.outputsActive.includes('email') && 'is-active')} aria-hidden="true">
          <Reply aria-hidden="true" />
          <span>Email{frame.outputsActive.includes('email') && <em>Reply sent</em>}</span>
        </div>
      </div>

      {!reducedMotion && (
        <button
          type="button"
          className="hero-toggle"
          onClick={() => setPlaying((current) => !current)}
          aria-pressed={playing}
          aria-describedby="hero-visual-label"
        >
          {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          <span className="sr-only">{playing ? 'Pause animation' : 'Play animation'}</span>
        </button>
      )}
    </div>
  )
}
