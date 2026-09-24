// Data-driven timeline for the homepage hero animation (see
// src/components/HarbaEnquiryVisual.tsx). Retiming, relabelling or
// reordering the story only ever means editing JOURNEY_FRAMES below.
//
// One coherent journey: a user asks a Customer Teammate to prepare a
// response to a new enquiry. The Teammate invokes a governed Pipeline. The
// Pipeline collects information from the customer's systems, searches Big
// Brain, prepares the work and pauses for approval. Once approved, Harba
// updates the CRM, sends the response and records the activity.

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

function stepsBefore(id: PipelineStepId | null): PipelineStepId[] {
  if (!id) return []
  return STEP_ORDER.slice(0, STEP_ORDER.indexOf(id))
}

export type ExternalSystemId = 'inbox' | 'crm' | 'documents' | 'communications'

export const EXTERNAL_SYSTEMS: { id: ExternalSystemId; label: string }[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'crm', label: 'CRM' },
  { id: 'documents', label: 'Documents' },
  { id: 'communications', label: 'Communications' },
]

/** The nine named scenes (eight from the brief, plus a brief idle/reset beat between loops). */
export type SceneId = 'idle' | 'request' | 'teammate' | 'pipeline' | 'sources' | 'knowledge' | 'prepare' | 'approval' | 'complete'

/** Which element should read as the single focal point for this frame. */
export type Focal = 'user' | 'teammate' | 'pipeline' | 'workitem' | 'bigbrain' | 'approval' | 'system' | null

/** Direction and meaning of whatever is currently crossing the Harba boundary, if anything. */
export type BoundaryFlow =
  | 'request-in'    // the user's message, outside -> inside
  | 'handoff'       // Teammate -> Pipeline, an internal signal (does not cross the outer boundary)
  | 'source-in'     // an external system's data, outside -> inside
  | 'approval-out'  // the approval request, inside -> outside, to the user
  | 'approval-in'   // the granted approval, outside -> inside
  | 'crm-out'       // the CRM update, inside -> outside
  | 'comms-out'     // the sent response, inside -> outside
  | null

export interface WorkItemContent {
  eyebrow: string
  lines: string[]
}

export interface ApprovalCardContent {
  status: 'pending' | 'approved'
  lines: string[]
}

export interface JourneyFrame {
  scene: SceneId
  duration: number
  /** Short caption for sighted visitors - decorative, not announced to assistive technology. */
  message: string
  focal: Focal
  userMessage: string | null
  teammateActive: boolean
  teammateLine: string | null
  activeStep: PipelineStepId | null
  completedSteps: PipelineStepId[]
  activeSystem: ExternalSystemId | null
  systemStatus: string | null
  bigBrainActive: boolean
  bigBrainStatus: string | null
  workItem: WorkItemContent | null
  approvalCard: ApprovalCardContent | null
  boundaryFlow: BoundaryFlow
  /** True while the approval request is outstanding - background activity visibly pauses. */
  paused: boolean
}

const NO_WORK_ITEM_DEFAULTS = {
  userMessage: null,
  teammateActive: false,
  teammateLine: null,
  activeStep: null,
  activeSystem: null,
  systemStatus: null,
  bigBrainActive: false,
  bigBrainStatus: null,
  approvalCard: null,
  boundaryFlow: null,
  paused: false,
} as const

export const JOURNEY_FRAMES: JourneyFrame[] = [
  // --- idle / reset (1s) ---
  {
    scene: 'idle', duration: 1000, message: 'Ready for the next enquiry', focal: null,
    ...NO_WORK_ITEM_DEFAULTS, workItem: null, completedSteps: [],
  },

  // --- Scene 1: request (3s) ---
  {
    scene: 'request', duration: 1800, message: 'User requests a response', focal: 'user',
    ...NO_WORK_ITEM_DEFAULTS,
    userMessage: 'Prepare a response for the new customer enquiry.',
    boundaryFlow: 'request-in',
    workItem: null, completedSteps: [],
  },
  {
    scene: 'request', duration: 1200, message: 'Message reaches the Teammate', focal: 'teammate',
    ...NO_WORK_ITEM_DEFAULTS,
    userMessage: 'Prepare a response for the new customer enquiry.',
    teammateActive: true,
    workItem: null, completedSteps: [],
  },

  // --- Scene 2: teammate (2.5s) ---
  {
    scene: 'teammate', duration: 1300, message: 'Customer Teammate responds', focal: 'teammate',
    ...NO_WORK_ITEM_DEFAULTS,
    teammateActive: true,
    teammateLine: 'I’ll run the enquiry process.',
    workItem: null, completedSteps: [],
  },
  {
    scene: 'teammate', duration: 1200, message: 'Teammate invokes the Pipeline', focal: 'teammate',
    ...NO_WORK_ITEM_DEFAULTS,
    teammateActive: true,
    teammateLine: 'I’ll run the enquiry process.',
    boundaryFlow: 'handoff',
    workItem: null, completedSteps: [],
  },

  // --- Scene 3: pipeline (2s) ---
  {
    scene: 'pipeline', duration: 2000, message: 'Enquiry Pipeline starts', focal: 'pipeline',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'receive',
    workItem: { eyebrow: 'NEW CUSTOMER ENQUIRY', lines: ['Response required'] },
    completedSteps: [],
  },

  // --- Scene 4: sources (4s) ---
  {
    scene: 'sources', duration: 1330, message: 'Inbox: enquiry received', focal: 'system',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'understand',
    activeSystem: 'inbox', systemStatus: 'Enquiry received', boundaryFlow: 'source-in',
    workItem: { eyebrow: 'NEW CUSTOMER ENQUIRY', lines: ['Response required'] },
    completedSteps: stepsBefore('understand'),
  },
  {
    scene: 'sources', duration: 1330, message: 'CRM: customer identified', focal: 'system',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'understand',
    activeSystem: 'crm', systemStatus: 'Customer identified', boundaryFlow: 'source-in',
    workItem: { eyebrow: 'NEW CUSTOMER ENQUIRY', lines: ['Customer identified'] },
    completedSteps: stepsBefore('understand'),
  },
  {
    scene: 'sources', duration: 1340, message: 'Documents: supporting information found', focal: 'system',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'understand',
    activeSystem: 'documents', systemStatus: 'Supporting information found', boundaryFlow: 'source-in',
    workItem: { eyebrow: 'NEW CUSTOMER ENQUIRY', lines: ['Customer identified'] },
    completedSteps: stepsBefore('understand'),
  },

  // --- Scene 5: knowledge (3s) ---
  {
    scene: 'knowledge', duration: 1500, message: 'Searching Big Brain', focal: 'bigbrain',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'research',
    bigBrainActive: true, bigBrainStatus: 'Searching business knowledge',
    workItem: { eyebrow: 'NEW CUSTOMER ENQUIRY', lines: ['Customer identified'] },
    completedSteps: stepsBefore('research'),
  },
  {
    scene: 'knowledge', duration: 1500, message: 'Relevant context found', focal: 'bigbrain',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'research',
    bigBrainActive: true, bigBrainStatus: 'Relevant context found',
    workItem: { eyebrow: 'NEW CUSTOMER ENQUIRY', lines: ['Relevant context found'] },
    completedSteps: stepsBefore('research'),
  },

  // --- Scene 6: prepare (3s) ---
  {
    scene: 'prepare', duration: 1500, message: 'Teammate prepares the work', focal: 'teammate',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'prepare', teammateActive: true,
    workItem: { eyebrow: 'RESPONSE PREPARED', lines: [] },
    completedSteps: stepsBefore('prepare'),
  },
  {
    scene: 'prepare', duration: 1500, message: 'Follow-up prepared', focal: 'workitem',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'prepare',
    workItem: { eyebrow: 'RESPONSE PREPARED', lines: ['Follow-up prepared'] },
    completedSteps: stepsBefore('prepare'),
  },

  // --- Scene 7: approval (4s) - background activity pauses ---
  {
    scene: 'approval', duration: 2400, message: 'Awaiting approval', focal: 'approval',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'approve', paused: true, boundaryFlow: 'approval-out',
    approvalCard: { status: 'pending', lines: ['Customer response', 'CRM update'] },
    workItem: { eyebrow: 'RESPONSE PREPARED', lines: ['Follow-up prepared'] },
    completedSteps: stepsBefore('approve'),
  },
  {
    scene: 'approval', duration: 1600, message: 'Approved', focal: 'approval',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'approve', boundaryFlow: 'approval-in',
    approvalCard: { status: 'approved', lines: ['Customer response', 'CRM update'] },
    workItem: { eyebrow: 'RESPONSE PREPARED', lines: ['Follow-up prepared'] },
    completedSteps: stepsBefore('approve'),
  },

  // --- Scene 8: complete (3.5s) ---
  {
    scene: 'complete', duration: 1200, message: 'CRM updated', focal: 'system',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'update',
    activeSystem: 'crm', systemStatus: 'Updated', boundaryFlow: 'crm-out',
    workItem: { eyebrow: 'RESPONSE PREPARED', lines: ['Follow-up prepared'] },
    completedSteps: stepsBefore('update'),
  },
  {
    scene: 'complete', duration: 1200, message: 'Response sent', focal: 'system',
    ...NO_WORK_ITEM_DEFAULTS,
    activeStep: 'update',
    activeSystem: 'communications', systemStatus: 'Response sent', boundaryFlow: 'comms-out',
    workItem: { eyebrow: 'RESPONSE PREPARED', lines: ['Follow-up prepared'] },
    completedSteps: stepsBefore('update'),
  },
  {
    scene: 'complete', duration: 1100, message: 'Run complete, activity recorded', focal: 'workitem',
    ...NO_WORK_ITEM_DEFAULTS,
    workItem: { eyebrow: 'RUN COMPLETE', lines: ['CRM updated', 'Response sent', 'Activity recorded'] },
    completedSteps: STEP_ORDER,
  },
]

/** The finished run - shown as the meaningful static state under prefers-reduced-motion. */
export const RESOLVED_FRAME: JourneyFrame = JOURNEY_FRAMES[JOURNEY_FRAMES.length - 1]

/** Groups scenes into the five plain-language stages used by the simplified mobile view. */
export type MobileStage = 'request' | 'pipeline' | 'context' | 'approval' | 'update'

const MOBILE_STAGE_BY_SCENE: Record<SceneId, MobileStage> = {
  idle: 'request',
  request: 'request',
  teammate: 'request',
  pipeline: 'pipeline',
  sources: 'context',
  knowledge: 'context',
  prepare: 'pipeline',
  approval: 'approval',
  complete: 'update',
}

export const MOBILE_STAGES: { id: MobileStage; label: string }[] = [
  { id: 'request', label: 'User request enters Harba' },
  { id: 'pipeline', label: 'Teammate starts the Pipeline' },
  { id: 'context', label: 'Big Brain and customer systems provide context' },
  { id: 'approval', label: 'Human approval' },
  { id: 'update', label: 'CRM updated and response sent' },
]

export function mobileStageForScene(scene: SceneId): MobileStage {
  return MOBILE_STAGE_BY_SCENE[scene]
}
