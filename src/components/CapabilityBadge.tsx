import type { CapabilityStatus } from '../data/technicalContent'

const CLASS_BY_STATUS: Record<CapabilityStatus, string> = {
  Live: 'capability-badge is-live',
  Configurable: 'capability-badge is-configurable',
  Planned: 'capability-badge is-planned',
  Deprecated: 'capability-badge is-deprecated',
  Unknown: 'capability-badge is-unknown',
}

/** Keeps live, configurable and planned capability visibly distinct wherever confirmed content is shown. */
export function CapabilityBadge({ status }: { status: CapabilityStatus }) {
  return <span className={CLASS_BY_STATUS[status]}>{status}</span>
}
