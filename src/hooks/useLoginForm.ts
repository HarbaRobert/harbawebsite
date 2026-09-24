import { useRef, useState } from 'react'

export type LoginStatus = 'idle' | 'submitting' | 'error'
export type LoginFieldErrors = { email?: string; password?: string }

// Centralised so the copy is easy to update in one place and so the message
// never reveals whether an email address exists.
export const GENERIC_CREDENTIALS_ERROR = 'We could not sign you in with those details. Check your email and password and try again.'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Front-end-only sign-in form state. There is no authentication backend
 * behind this page yet (see the completion report for what a real
 * integration still needs - a POST endpoint, CSRF token, session, rate
 * limiting), so `submit` only ever performs client-side validation and
 * then simulates a network round trip. It never logs the password value,
 * never uses GET, and always resolves to the same generic error rather
 * than fabricating a fake "success".
 */
export function useLoginForm() {
  const [status, setStatus] = useState<LoginStatus>('idle')
  const [errors, setErrors] = useState<LoginFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  const validate = (data: FormData): LoginFieldErrors => {
    const nextErrors: LoginFieldErrors = {}
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')

    if (!email) nextErrors.email = 'Enter your work email address.'
    else if (!EMAIL_PATTERN.test(email)) nextErrors.email = 'Enter a valid email address.'

    if (!password) nextErrors.password = 'Enter your password.'

    return nextErrors
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting') return // duplicate-submission prevention

    const form = event.currentTarget
    const data = new FormData(form)
    const nextErrors = validate(data)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setFormError(null)
      // Computed from the local nextErrors, not the (not yet re-rendered)
      // errors state, so focus lands correctly even on the very first
      // invalid submission.
      if (nextErrors.email) emailRef.current?.focus()
      else if (nextErrors.password) passwordRef.current?.focus()
      return
    }

    setErrors({})
    setFormError(null)
    setStatus('submitting')

    // Simulated round trip: this page has no real /api/login endpoint to
    // call yet. A genuine integration replaces this block with a POST to
    // that endpoint (method="post" is already set on the <form> below so
    // credentials are never placed in the URL even before that exists).
    await new Promise((resolve) => setTimeout(resolve, 900))

    setStatus('error')
    setFormError(GENERIC_CREDENTIALS_ERROR)
    // The email field is left as the visitor typed it; only the password
    // input's own autocomplete/browser behaviour governs its value, which
    // this hook never reads again or persists anywhere.
  }

  return { status, errors, formError, submit, emailRef, passwordRef }
}
