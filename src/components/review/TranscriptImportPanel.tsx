import { useRef, useState } from 'react'
import { FileText, Sparkles, Upload } from 'lucide-react'
import type { TranscriptImportResult } from '../../lib/reviewStorage'

export function TranscriptImportPanel({
  onImport,
}: {
  onImport: (transcript: string) => Promise<TranscriptImportResult>
}) {
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<TranscriptImportResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setTranscript(await file.text())
  }

  const handleImport = async () => {
    if (!transcript.trim()) return
    setProcessing(true)
    setResult(null)
    const outcome = await onImport(transcript)
    setResult(outcome)
    setProcessing(false)
  }

  return (
    <details className="transcript-import">
      <summary>
        <Sparkles aria-hidden="true" />
        Populate answers from a call transcript
      </summary>

      <div className="transcript-import-body">
        <p>
          Paste or upload a transcript of the technical review call. It is sent to OpenAI to draft answers for the
          questions it covers - existing answers are never overwritten, only added to underneath. Always read and verify
          what comes back before treating it as confirmed.
        </p>

        <div className="review-toolbar-row">
          <button type="button" className="toolbar-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload aria-hidden="true" />Upload transcript file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.md,text/plain"
            className="hp-field"
            onChange={handleFile}
            aria-label="Upload a transcript text file"
          />
        </div>

        <label className="review-field" htmlFor="transcript-text">
          Transcript text
          <textarea
            id="transcript-text"
            rows={10}
            value={transcript}
            onChange={(event) => setTranscript(event.target.value)}
            placeholder="Paste the transcribed call here, or upload a file above."
          />
        </label>

        <button type="button" className="button" onClick={handleImport} disabled={processing || !transcript.trim()}>
          <FileText aria-hidden="true" />
          {processing ? 'Reading transcript…' : 'Populate answers from this transcript'}
        </button>

        {result && (
          <p className={result.ok ? 'toolbar-message' : 'toolbar-message'} role="status">
            {result.ok
              ? `Updated ${result.updated?.length ?? 0} question${result.updated?.length === 1 ? '' : 's'} from the transcript. Review each one before marking it confirmed.`
              : result.message}
          </p>
        )}
      </div>
    </details>
  )
}
