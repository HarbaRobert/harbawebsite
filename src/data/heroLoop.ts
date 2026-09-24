// The hero's single-story loop: one customer enquiry moves from the
// business's inbox, through Harba, past a human approval gate, and back
// out to the CRM and an email reply. See src/components/HeroEnvironment.tsx
// for the component this drives. Deliberately not a six-stage pipeline -
// this is the outcome-level story, not an architecture diagram.

export type Beat = 'signal' | 'arrive' | 'work' | 'hold' | 'pending' | 'approved' | 'deliver' | 'settle'
export type TokenState = 'hidden' | 'inbox' | 'transit' | 'harba' | 'paused' | 'release'
export type ApprovalState = 'none' | 'pending' | 'approved'
export type OutputId = 'crm' | 'email'

export interface LoopFrame {
  beat: Beat
  duration: number
  caption: string | null
  inboxActive: boolean
  harbaActive: boolean
  approval: ApprovalState
  outputsActive: OutputId[]
  token: TokenState
}

export const LOOP: LoopFrame[] = [
  { beat: 'signal', duration: 1800, caption: null, inboxActive: true, harbaActive: false, approval: 'none', outputsActive: [], token: 'inbox' },
  { beat: 'arrive', duration: 1000, caption: 'Customer enquiry', inboxActive: true, harbaActive: true, approval: 'none', outputsActive: [], token: 'transit' },
  { beat: 'work', duration: 1800, caption: 'Working', inboxActive: false, harbaActive: true, approval: 'none', outputsActive: [], token: 'harba' },
  { beat: 'hold', duration: 900, caption: null, inboxActive: false, harbaActive: true, approval: 'none', outputsActive: [], token: 'harba' },
  // Token invisible (but parked at the same spot, not "hidden" back at the
  // inbox) during the approval beats: visible here it would sit on top of
  // the pill's own centred text, and the pill should read clearly on its
  // own (see section 9 of the brief).
  { beat: 'pending', duration: 1300, caption: null, inboxActive: false, harbaActive: true, approval: 'pending', outputsActive: [], token: 'paused' },
  { beat: 'approved', duration: 700, caption: null, inboxActive: false, harbaActive: true, approval: 'approved', outputsActive: [], token: 'paused' },
  { beat: 'deliver', duration: 2000, caption: null, inboxActive: false, harbaActive: true, approval: 'none', outputsActive: ['crm', 'email'], token: 'release' },
  { beat: 'settle', duration: 1500, caption: null, inboxActive: false, harbaActive: false, approval: 'none', outputsActive: [], token: 'hidden' },
]

// Shown instead of the loop under prefers-reduced-motion: one settled,
// understandable composition rather than a frozen mid-transition frame.
export const RESOLVED_FRAME: LoopFrame = {
  beat: 'settle',
  duration: 0,
  caption: null,
  inboxActive: false,
  harbaActive: true,
  approval: 'approved',
  outputsActive: ['crm', 'email'],
  token: 'hidden',
}

// Global (left,top) percentage positions shared by desktop's free-form
// canvas layout. Ignored entirely on mobile, where every element switches
// to position:static and stacks in DOM order instead (see the ≤560px rules
// in App.css) - CSS position:static ignores left/top by definition, so no
// override is needed there beyond that one property.
export const TOKEN_POSITION: Record<TokenState, { left: string; top: string }> = {
  hidden: { left: '8%', top: '78%' },
  inbox: { left: '8%', top: '78%' },
  transit: { left: '38%', top: '60%' },
  harba: { left: '62%', top: '50%' },
  paused: { left: '62%', top: '50%' },
  release: { left: '62%', top: '50%' },
}
