import { useEffect, useRef, useState } from 'react'
import { track, type EventName } from '../lib/analytics'

export type FieldErrors = Record<string, string>
export type EnquiryStatus = 'idle' | 'submitting' | 'success' | 'error'

// Platform-provided form-relay endpoint. Deliberately a relative path (see
// the vendor's own note): it keeps working regardless of which domain the
// site is reached by, so it must never be made absolute.
const FORM_ENDPOINT = '/.well-known/platform/forms/7u8XeYCOyTOpZ4bW'

interface UseEnquiryFormOptions {
  requiredFields: string[]
  startedEvent?: EventName
  submittedEvent?: EventName
}

/**
 * Shared submission mechanics for both the working-session and demo forms
 * (src/pages/WorkingSession.tsx and src/pages/BookADemo.tsx): client-side
 * validation plus submission to the platform's form-relay endpoint.
 *
 * The endpoint takes application/x-www-form-urlencoded, not JSON or
 * multipart - passing a FormData straight to fetch encodes it as a file
 * upload, which the endpoint refuses, so the body must be built via
 * URLSearchParams instead. Its own anti-spam checks look for two specific
 * fields, which every form using this hook must include:
 *   - `_gotcha`: an empty honeypot input, positioned off-screen (not
 *     display:none - some bots skip fields hidden that way).
 *   - `_t`: a hidden timestamp, set client-side on mount via the
 *     timestampRef this hook returns (equivalent to the vendor's own
 *     inline <script> that stamps it on page load).
 */
export function useEnquiryForm({ requiredFields, startedEvent, submittedEvent }: UseEnquiryFormOptions) {
  const [started, setStarted] = useState(false)
  const [status, setStatus] = useState<EnquiryStatus>('idle')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const timestampRef = useRef<HTMLInputElement>(null)

  // Client-only, after mount: matches the vendor's inline <script>, and
  // avoids baking a build-time timestamp into the prerendered HTML.
  useEffect(() => {
    if (timestampRef.current) timestampRef.current.value = String(Date.now())
  }, [])

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
    if (String(data.get('_gotcha') ?? '').trim()) {
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
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        // FormData satisfies the iterable-of-pairs protocol at runtime, but
        // the DOM lib's URLSearchParams overloads don't list it directly -
        // materialising the entries as string[][] hits a real, typed
        // overload without an unsafe cast.
        body: new URLSearchParams(Array.from(data.entries()) as [string, string][]),
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
      setFormError('Something went wrong. Please try again or email rob@harba.ai directly.')
      setStatus('error')
    } catch {
      setFormError('Something went wrong. Please check your connection and try again, or email rob@harba.ai directly.')
      setStatus('error')
    }
  }

  return { started, markStarted, status, errors, formError, submit, timestampRef, formAction: FORM_ENDPOINT }
}
