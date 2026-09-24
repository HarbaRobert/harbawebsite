import { useState } from 'react'
import { track, type EventName } from '../lib/analytics'

export type FieldErrors = Record<string, string>
export type EnquiryStatus = 'idle' | 'submitting' | 'success' | 'error'

interface UseEnquiryFormOptions {
  requiredFields: string[]
  startedEvent?: EventName
  submittedEvent?: EventName
}

/**
 * Shared submission mechanics for both the working-session and demo forms
 * (src/pages/WorkingSession.tsx and src/pages/BookADemo.tsx): the honeypot
 * check, client-side validation, and the POST to /api/working-session. Each
 * page owns its own JSX and copy, but both need the same security-sensitive
 * behaviour, so that lives here once rather than twice.
 */
export function useEnquiryForm({ requiredFields, startedEvent, submittedEvent }: UseEnquiryFormOptions) {
  const [started, setStarted] = useState(false)
  const [status, setStatus] = useState<EnquiryStatus>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const markStarted = () => {
    if (started) return
    setStarted(true)
    if (startedEvent) track(startedEvent)
  }

  const validate = (data: FormData): FieldErrors => {
    const nextErrors: FieldErrors = {}
    for (const field of requiredFields) {
      if (!String(data.get(field) ?? '').trim()) nextErrors[field] = 'This field is required.'
    }
    const email = String(data.get('email') ?? '')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    if (!data.get('privacy')) nextErrors.privacy = 'Please confirm you have read the privacy policy.'
    return nextErrors
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)

    // Honeypot: real visitors never see or fill this field in.
    if (String(data.get('website') ?? '').trim()) {
      setStatus('success')
      return
    }

    const clientErrors = validate(data)
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setErrors({})
    setFormError(null)
    setStatus('submitting')

    try {
      const response = await fetch('/api/working-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data)),
      })
      const result = await response.json().catch(() => null)

      if (response.ok && result?.ok) {
        // Fired only here, once, on genuine acceptance by the server - never
        // on click, never on a validation, network or server error, and
        // never again after this (the form unmounts once status is
        // 'success', so there is no way to trigger this a second time
        // without a full page reload).
        if (submittedEvent) track(submittedEvent)
        setStatus('success')
        return
      }
      if (response.status === 400 && result?.errors) {
        setErrors(result.errors)
        setStatus('idle')
        return
      }
      setFormError(result?.message || 'Something went wrong. Please try again or email rob@harba.ai directly.')
      setStatus('error')
    } catch {
      setFormError('Something went wrong. Please check your connection and try again, or email rob@harba.ai directly.')
      setStatus('error')
    }
  }

  return { started, markStarted, status, errors, formError, submit }
}
