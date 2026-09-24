import type { ReactNode } from 'react'
import { PageIntro } from '../../components/ui'

export function LegalLayout({ eyebrow, title, intro, lastUpdated, children }: { eyebrow: string; title: string; intro: string; lastUpdated: string; children: ReactNode }) {
  return <>
    <PageIntro eyebrow={eyebrow} title={title} text={intro} />
    <section className="section paper">
      <div className="container legal-content">
        <p className="legal-updated">Last updated: {lastUpdated}</p>
        {children}
      </div>
    </section>
  </>
}
