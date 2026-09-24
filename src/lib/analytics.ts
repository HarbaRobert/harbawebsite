export type EventName =
  | 'primary_cta_clicked'
  | 'secondary_cta_clicked'
  | 'navigation_cta_clicked'
  | 'working_session_form_started'
  | 'working_session_form_submitted'

export function track(event: EventName) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('harba:analytics', { detail: { event } }))
  }
}
