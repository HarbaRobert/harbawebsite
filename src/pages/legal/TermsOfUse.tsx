import { getLegalPageStatus, legalConfig } from '../../../config/legalConfig.mjs'
import { LegalLayout } from './LegalLayout'

const LAST_UPDATED = '20 September 2026'

export function TermsOfUse() {
  const { complete } = getLegalPageStatus('/terms')

  return (
    <LegalLayout
      eyebrow="TERMS"
      title="Website Terms"
      intro="The terms governing access to and use of this website."
      lastUpdated={LAST_UPDATED}
    >
      <p>
        These terms govern your use of this marketing website only. They are separate from, and do not form part of, any contract that applies if you
        become a Harba customer and use the Harba platform; that relationship is governed by separate agreed terms.
      </p>

      <h2>Who we are</h2>
      {complete ? (
        <p>
          This website is operated by {legalConfig.legalEntityName}, trading as Harba, of {legalConfig.registeredAddress} (&ldquo;Harba&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>
      ) : (
        <p>This website is operated by Harba (&ldquo;we&rdquo;, &ldquo;us&rdquo;).</p>
      )}

      <h2>Website access</h2>
      <p>
        We aim to keep this website available, but we do not guarantee uninterrupted access. We may suspend, withdraw or restrict access to all or part of
        the website without notice, for example for maintenance.
      </p>

      <h2>Permitted use</h2>
      <p>
        You may view and use this website for lawful, legitimate purposes connected with evaluating or engaging with Harba. You must not misuse the
        website, including by introducing malicious code, attempting unauthorised access, or using automated means to extract content in a way that
        places an unreasonable burden on our systems.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The content, design and branding of this website belong to Harba or our licensors, unless otherwise stated. You may not reproduce, copy or
        distribute material from this website for commercial purposes without our prior written consent.
      </p>

      <h2>Accuracy and availability</h2>
      <p>
        We take reasonable care to keep the information on this website accurate and up to date, but we make no warranty that it is complete, accurate or
        error-free, and we may change it at any time without notice.
      </p>

      <h2>Third-party links</h2>
      <p>
        This website may link to third-party websites. We are not responsible for the content, accuracy or practices of any website we do not operate.
      </p>

      <h2>Prohibited conduct</h2>
      <ul>
        <li>Using the website for any unlawful purpose</li>
        <li>Attempting to gain unauthorised access to our systems or data</li>
        <li>Interfering with the operation or security of the website</li>
        <li>Submitting false or misleading information through our forms</li>
      </ul>

      <h2>Liability</h2>
      <p>
        Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence, for fraud, or for any other
        liability that cannot lawfully be excluded or limited. Subject to that, we exclude all other liability arising from your use of this website to
        the fullest extent permitted by law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the law of England and Wales, and the courts of England and Wales have exclusive jurisdiction over any dispute arising
        from them.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
      </p>
    </LegalLayout>
  )
}
