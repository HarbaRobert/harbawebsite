import { useState } from 'react'
import { Lock } from 'lucide-react'
import { Eyebrow } from '../ui'

export function AccessGate({
  error,
  onSubmit,
}: {
  error: string | null
  onSubmit: (code: string) => Promise<boolean>
}) {
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    await onSubmit(code)
    setSubmitting(false)
  }

  return (
    <div className="review-workspace review-access-gate">
      <div className="access-gate-card">
        <Eyebrow>HARBA TECHNICAL REVIEW</Eyebrow>
        <h1><Lock aria-hidden="true" /> Access code required</h1>
        <p>This workspace holds confidential answers about Harba&rsquo;s architecture and security. Enter the access code to continue.</p>
        <form onSubmit={handleSubmit}>
          <label className="review-field" htmlFor="access-code">
            Access code
            <input
              id="access-code"
              type="password"
              autoComplete="off"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoFocus
            />
          </label>
          {error && <p className="toolbar-message" role="alert">{error}</p>}
          <button type="submit" className="button" disabled={submitting || !code}>
            {submitting ? 'Checking…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
