// Data-driven timeline for the homepage hero animation (see
// src/components/HarbaSystemVisual.tsx). Retiming, relabelling or
// reordering the story only ever means editing SCENE_FRAMES below - the
// component itself has no hard-coded copy or durations.
//
// One example run: a customer enquiry arrives through Inbox, the Enquiry
// Pipeline runs it through six governed steps, Big Brain supplies knowledge
// during Research, the Customer and Operations Teammates do defined work
// during Prepare, a human approves before Update, and the Pipeline writes
// back to CRM and Communications - work moving both into and out of Harba,
// not disappearing into a black box.

export type PipelineStepId = 'receive' | 'understand' | 'research' | 'prepare' | 'approve' | 'update'

export const PIPELINE_STEPS: { id: PipelineStepId; label: string }[] = [
  { id: 'receive', label: 'Receive' },
  { id: 'understand', label: 'Understand' },
  { id: 'research', label: 'Research' },
  { id: 'prepare', label: 'Prepare' },
  { id: 'approve', label: 'Approve' },
  { id: 'update', label: 'Update' },
]

const STEP_ORDER = PIPELINE_STEPS.map((step) => step.id)

/** Every step before `id`, for the "completed" (solid) indicator. */
function stepsBefore(id: PipelineStepId | null): PipelineStepId[] {
  if (!id) return []
  return STEP_ORDER.slice(0, STEP_ORDER.indexOf(id))
}

export type ExternalSystemId = 'inbox' | 'crm' | 'documents' | 'communications'

export const EXTERNAL_SYSTEMS: { id: ExternalSystemId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'crm', label: 'CRM' },
  { id: 'documents', label: 'Documents / ERP' },
  { id: 'communications', label: 'Communications' },
]

export type ConnectorId =
  | 'inbox-pipeline'
  | 'crm-understand'
  | 'pipeline-bigbrain'
  | 'bigbrain-pipeline'
  | 'pipeline-customer'
  | 'customer-ops'
  | 'pipeline-approval'
  | 'pipeline-crm'
  | 'pipeline-comms'

/**
 * The nine phases named in the brief. Several map to more than one frame
 * below (e.g. "approval" covers both the pending wait and the moment it is
 * granted) so each distinct microcopy beat gets its own frame, while still
 * grouping cleanly under one of these nine names for the simplified
 * four-stage mobile view (see MOBILE_STAGE_BY_PHASE).
 */
export type ScenePhase = 'idle' | 'intake' | 'understand' | 'retrieve' | 'prepare' | 'handoff' | 'approval' | 'update' | 'complete'

export interface SceneFrame {
  phase: ScenePhase
  /** Milliseconds this frame holds before advancing. */
  duration: number
  /** Short operational microcopy - never a timing, model name, cost or customer name. */
  message: string
  activeStep: PipelineStepId | null
  completedSteps: PipelineStepId[]
  activeSystem: ExternalSystemId | null
  activeConnector: ConnectorId | null
  bigBrain: 'idle' | 'searching' | 'returned'
  activeTeammate: 'customer' | 'ops' | null
  approval: 'idle' | 'pending' | 'approved'
  complete: boolean
}

export const SCENE_FRAMES: SceneFrame[] = [
  {
    phase: 'idle', duration: 400, message: 'Ready for the next enquiry',
    activeStep: null, completedSteps: [], activeSystem: null, activeConnector: null,
    bigBrain: 'idle', activeTeammate: null, approval: 'idle', complete: false,
  },
  {
    phase: 'intake', duration: 2000, message: 'New customer enquiry',
    activeStep: null, completedSteps: [], activeSystem: 'inbox', activeConnector: 'inbox-pipeline',
    bigBrain: 'idle', activeTeammate: null, approval: 'idle', complete: false,
  },
  {
    phase: 'understand', duration: 1200, message: 'Pipeline started',
    activeStep: 'receive', completedSteps: stepsBefore('receive'), activeSystem: null, activeConnector: null,
    bigBrain: 'idle', activeTeammate: null, approval: 'idle', complete: false,
  },
  {
    phase: 'understand', duration: 1800, message: 'Customer identified',
    activeStep: 'understand', completedSteps: stepsBefore('understand'), activeSystem: 'crm', activeConnector: 'crm-understand',
    bigBrain: 'idle', activeTeammate: null, approval: 'idle', complete: false,
  },
  {
    phase: 'retrieve', duration: 1100, message: 'Searching Big Brain',
    activeStep: 'research', completedSteps: stepsBefore('research'), activeSystem: null, activeConnector: 'pipeline-bigbrain',
    bigBrain: 'searching', activeTeammate: null, approval: 'idle', complete: false,
  },
  {
    phase: 'retrieve', duration: 1100, message: 'Relevant knowledge found',
    activeStep: 'research', completedSteps: stepsBefore('research'), activeSystem: null, activeConnector: 'bigbrain-pipeline',
    bigBrain: 'returned', activeTeammate: null, approval: 'idle', complete: false,
  },
  {
    phase: 'prepare', duration: 1500, message: 'Response prepared',
    activeStep: 'prepare', completedSteps: stepsBefore('prepare'), activeSystem: null, activeConnector: 'pipeline-customer',
    bigBrain: 'idle', activeTeammate: 'customer', approval: 'idle', complete: false,
  },
  {
    phase: 'handoff', duration: 1500, message: 'Follow-up created',
    activeStep: 'prepare', completedSteps: stepsBefore('prepare'), activeSystem: null, activeConnector: 'customer-ops',
    bigBrain: 'idle', activeTeammate: 'ops', approval: 'idle', complete: false,
  },
  {
    phase: 'approval', duration: 1800, message: 'Awaiting approval',
    activeStep: 'approve', completedSteps: stepsBefore('approve'), activeSystem: null, activeConnector: 'pipeline-approval',
    bigBrain: 'idle', activeTeammate: null, approval: 'pending', complete: false,
  },
  {
    phase: 'approval', duration: 1200, message: 'Approved',
    activeStep: 'approve', completedSteps: stepsBefore('approve'), activeSystem: null, activeConnector: null,
    bigBrain: 'idle', activeTeammate: null, approval: 'approved', complete: false,
  },
  {
    phase: 'update', duration: 1000, message: 'CRM updated',
    activeStep: 'update', completedSteps: stepsBefore('update'), activeSystem: 'crm', activeConnector: 'pipeline-crm',
    bigBrain: 'idle', activeTeammate: null, approval: 'approved', complete: false,
  },
  {
    phase: 'update', duration: 1000, message: 'Reply sent',
    activeStep: 'update', completedSteps: stepsBefore('update'), activeSystem: 'communications', activeConnector: 'pipeline-comms',
    bigBrain: 'idle', activeTeammate: null, approval: 'approved', complete: false,
  },
  {
    phase: 'complete', duration: 1000, message: 'Run complete',
    activeStep: null, completedSteps: STEP_ORDER, activeSystem: null, activeConnector: null,
    bigBrain: 'idle', activeTeammate: null, approval: 'approved', complete: true,
  },
  {
    phase: 'complete', duration: 1000, message: 'Activity recorded',
    activeStep: null, completedSteps: STEP_ORDER, activeSystem: null, activeConnector: null,
    bigBrain: 'idle', activeTeammate: null, approval: 'approved', complete: true,
  },
]

/**
 * The frame shown under prefers-reduced-motion: the finished run, not the
 * idle reset, so a visitor who never sees the animation still sees a
 * meaningful, complete state rather than an empty one.
 */
export const RESOLVED_FRAME: SceneFrame = SCENE_FRAMES[SCENE_FRAMES.length - 1]

/** Groups the nine phases into the four plain-language stages used by the simplified mobile view. */
export type MobileStage = 'arrives' | 'works' | 'approves' | 'updates'

const MOBILE_STAGE_BY_PHASE: Record<ScenePhase, MobileStage> = {
  idle: 'arrives',
  intake: 'arrives',
  understand: 'arrives',
  retrieve: 'works',
  prepare: 'works',
  handoff: 'works',
  approval: 'approves',
  update: 'updates',
  complete: 'updates',
}

export const MOBILE_STAGES: { id: MobileStage; label: string }[] = [
  { id: 'arrives', label: 'Work arrives' },
  { id: 'works', label: 'Harba works' },
  { id: 'approves', label: 'Human approves' },
  { id: 'updates', label: 'Systems update' },
]

export function mobileStageForPhase(phase: ScenePhase): MobileStage {
  return MOBILE_STAGE_BY_PHASE[phase]
}
