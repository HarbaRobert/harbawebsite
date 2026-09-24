import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Clipboard, Download, RotateCcw, Trash2, Upload } from 'lucide-react'
import {
  buildJSONExport,
  buildMarkdownExport,
  copyToClipboard,
  downloadFile,
  formatQuestionListForClipboard,
  mergedQuestions,
  parseImportedJSON,
  type AnswerMap,
} from '../../lib/reviewStorage'

function timestampForFilename(): string {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

export function ReviewToolbar({
  answers,
  onImport,
  onClear,
  lastSavedAt,
}: {
  answers: AnswerMap
  onImport: (next: AnswerMap) => void
  onClear: () => void
  lastSavedAt: number | null
}) {
  const [message, setMessage] = useState<string | null>(null)
  const [confirmingClear, setConfirmingClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const flash = (text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage((current) => (current === text ? null : current)), 4000)
  }

  const exportJSON = () => {
    const data = buildJSONExport(answers)
    downloadFile(`harba-technical-review-${timestampForFilename()}.json`, JSON.stringify(data, null, 2), 'application/json')
    flash('Exported JSON.')
  }

  const exportMarkdown = () => {
    downloadFile(`harba-technical-review-${timestampForFilename()}.md`, buildMarkdownExport(answers), 'text/markdown')
    flash('Exported Markdown.')
  }

  const triggerImport = () => fileInputRef.current?.click()

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const text = await file.text()
    const { answers: imported, result } = parseImportedJSON(text)
    if (result.ok) onImport(imported)
    flash(result.message)
  }

  const copyUnanswered = async () => {
    const list = mergedQuestions(answers).filter((question) => question.status === 'Unanswered')
    const ok = await copyToClipboard(formatQuestionListForClipboard(list))
    flash(ok ? `Copied ${list.length} unanswered question${list.length === 1 ? '' : 's'}.` : 'Could not copy to clipboard.')
  }

  const copyNeedsVerification = async () => {
    const list = mergedQuestions(answers).filter((question) => question.status === 'Needs verification')
    const ok = await copyToClipboard(formatQuestionListForClipboard(list))
    flash(ok ? `Copied ${list.length} question${list.length === 1 ? '' : 's'} needing verification.` : 'Could not copy to clipboard.')
  }

  const handleClear = () => {
    onClear()
    setConfirmingClear(false)
    flash('Cleared saved answers in this browser.')
  }

  return (
    <div className="review-toolbar">
      <div className="review-toolbar-row">
        <button type="button" className="toolbar-btn" onClick={exportJSON}><Download aria-hidden="true" />Export JSON</button>
        <button type="button" className="toolbar-btn" onClick={exportMarkdown}><Download aria-hidden="true" />Export Markdown</button>
        <button type="button" className="toolbar-btn" onClick={triggerImport}><Upload aria-hidden="true" />Import JSON</button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hp-field" onChange={handleImportFile} aria-label="Import a previously exported JSON file" />
        <button type="button" className="toolbar-btn" onClick={copyUnanswered}><Clipboard aria-hidden="true" />Copy unanswered</button>
        <button type="button" className="toolbar-btn" onClick={copyNeedsVerification}><Clipboard aria-hidden="true" />Copy needing verification</button>

        {!confirmingClear ? (
          <button type="button" className="toolbar-btn toolbar-btn-danger" onClick={() => setConfirmingClear(true)}>
            <Trash2 aria-hidden="true" />Clear saved answers
          </button>
        ) : (
          <span className="toolbar-confirm">
            Clear everything saved in this browser?
            <button type="button" className="toolbar-btn toolbar-btn-danger" onClick={handleClear}><Check aria-hidden="true" />Yes, clear it</button>
            <button type="button" className="toolbar-btn" onClick={() => setConfirmingClear(false)}><RotateCcw aria-hidden="true" />Cancel</button>
          </span>
        )}
      </div>

      <div className="review-toolbar-row review-toolbar-previews">
        <Link className="button button-small" to="/technical"><span>Preview Technical Overview</span><ArrowRight aria-hidden="true" /></Link>
        <Link className="button button-small button-secondary" to="/docs"><span>Preview Developer Documentation</span><ArrowRight aria-hidden="true" /></Link>
        <span className="save-indicator">{lastSavedAt ? `Saved locally at ${new Date(lastSavedAt).toLocaleTimeString('en-GB')}` : 'Not yet saved in this browser'}</span>
      </div>

      {message && <p className="toolbar-message" role="status">{message}</p>}
    </div>
  )
}
