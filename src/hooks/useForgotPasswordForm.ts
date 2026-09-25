import { useRef, useState } from 'react'

export type ForgotPasswordStatus = 'idle' | 'submitting' | 'sent'

// Never reveals whether an account exists for the address entered - the
// same response either way, worded to match the one Login.tsx uses for
// its own generic credentials error.
export const GENERIC_RESET_SENT_MESSAGE = 'If an eligible account exists for that email address, reset instructions have been sent.'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Front-end-only "forgotten password" form state, mirroring
 * useLoginForm.ts: there is no authentication backend, password-reset
 * token storage or transactional email service behind this page yet (see
 * the /login completion report for what a real integration still needs),
 * so `submit` only ever validates the email client-side and then
 * simulates a network round trip before showing the generic confirmation.
 * It never logs the entered address anywhere and never fabricates a
 * different outcome depending on whether the address looks real.
 */
export function useForgotPasswordForm() {
  const [status, setStatus] = useState<ForgotPasswordStatus>('idle')
  const [error, setError] = useState<string | undefined>(undefined)
  const emailRef = useRef<HTMLInputElement>(null)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (status === 'submitting') return // duplicate-submission prevention

    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim()

    if (!email) {
      setError('Enter your work email address.')
      emailRef.current?.focus()
      return
    }
    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address.')
      emailRef.current?.focus()
      return
    }

    setError(undefined)
    setStatus('submitting')

    // Simulated round trip: this page has no real /api/forgot-password
    // endpoint to call yet. A genuine integration replaces this block with
    // a POST to that endpoint (method="post" is already set on the <form>
    // below so the address is never placed in the URL even before that
    // exists), and must return this exact same generic response whether or
    // not the address matches an account.
    await new Promise((resolve) => setTimeout(resolve, 700))

    setStatus('sent')
  }

  return { status, error, submit, emailRef }
}
