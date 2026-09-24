import { ShieldAlert } from 'lucide-react'

export function DraftBanner({ title, note }: { title: string; note: string }) {
  return (
    <div className="draft-banner" role="note">
      <ShieldAlert aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        <p>{note}</p>
      </div>
    </div>
  )
}
