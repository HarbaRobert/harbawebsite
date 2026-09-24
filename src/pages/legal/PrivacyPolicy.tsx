import { Link } from 'react-router-dom'
import { getLegalPageStatus, legalConfig } from '../../../config/legalConfig.mjs'
import { LegalLayout } from './LegalLayout'

const LAST_UPDATED = '20 September 2026'

export function PrivacyPolicy() {
  const { complete } = getLegalPageStatus('/privacy')

  return (
    <LegalLayout
      eyebrow="PRIVACY"
      title="Privacy Policy"
      intro="How we collect, use and protect information through this website."
      lastUpdated={LAST_UPDATED}
    >
      <h2>Who we are</h2>
      {complete ? (
        <p>
          This website is operated by {legalConfig.legalEntityName} (company number {legalConfig.companyNumber}), trading as Harba, of{' '}
          {legalConfig.registeredAddress} (&ldquo;Harba&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the controller of personal information
          collected through this website. You can contact us at <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>
      ) : (
        <p>
          This website is operated by Harba (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We are the controller of personal information collected through this
          website. You can contact us at <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
        </p>
      )}

      <h2>Information you provide to us</h2>
      <p>When you use the working-session enquiry form, we ask for:</p>
      <ul>
        <li>Your name</li>
        <li>Your work email address</li>
        <li>Your company name</li>
        <li>Your role (optional)</li>
        <li>Your phone number (optional)</li>
        <li>A description of the business process you would like to improve</li>
        <li>The systems or platforms involved (optional)</li>
      </ul>
      <p>We do not ask for or knowingly collect any special category data through this form.</p>

      <h2>Information collected automatically</h2>
      <p>
        As with most websites, our hosting infrastructure records standard technical information as part of normal operation, such as IP address, browser
        type and request timestamps, for security and reliability purposes.
      </p>
      <p>
        If we have enabled Google Analytics, it collects aggregated usage information (such as pages viewed and general location) once you have accepted
        analytics cookies through the banner on this site. See our <Link to="/cookies">Cookie Policy</Link> for details. We do not run analytics before you
        have made a choice.
      </p>

      <h2>How and why we use this information</h2>
      <ul>
        <li>To respond to your enquiry and arrange a working session (legitimate interests: responding to business enquiries you have made to us).</li>
        <li>To operate, secure and maintain the website (legitimate interests).</li>
        <li>To understand how the website is used in aggregate, only where you have given analytics consent (consent).</li>
      </ul>

      <h2>Who we share information with</h2>
      <p>We do not sell personal information. We share it only where necessary to operate the website, specifically:</p>
      <ul>
        <li>{legalConfig.hostingProvider}, which hosts this website ({legalConfig.hostingRegion}).</li>
        <li>{legalConfig.emailProcessorName ? `${legalConfig.emailProcessorName}, an` : 'An'} email delivery service, to send enquiry emails to our team.</li>
        <li>Google, only where Google Analytics has been enabled and you have given analytics consent.</li>
      </ul>

      <h2>International transfers</h2>
      <p>
        Our website infrastructure is currently hosted in {legalConfig.hostingRegion}. Where a service provider we use processes information outside the
        UK, we take steps to ensure an appropriate legal safeguard is in place before that transfer occurs.
      </p>

      <h2>Retention</h2>
      <p>
        We keep enquiry information for as long as reasonably necessary to respond to you and to handle any related follow-up, and delete it when it is no
        longer needed for that purpose. A formal retention schedule is being finalised.
      </p>

      <h2>Security</h2>
      <p>
        This website is served over HTTPS. We take reasonable technical and organisational measures to protect the information we hold, appropriate to a
        website of this kind.
      </p>

      <h2>Your UK data protection rights</h2>
      <p>Under UK data protection law, you have the right to:</p>
      <ul>
        <li>Access the personal information we hold about you</li>
        <li>Ask us to correct inaccurate information</li>
        <li>Ask us to delete your information</li>
        <li>Ask us to restrict how we use your information</li>
        <li>Object to our use of your information</li>
        <li>Ask for your information in a portable format</li>
        <li>Withdraw consent at any time, where we rely on consent</li>
      </ul>
      <p>
        To exercise any of these rights, contact us at <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
      </p>

      <h2>Complaints</h2>
      <p>
        If you are unhappy with how we have handled your information, we would welcome the chance to address it directly. You also have the right to
        complain to the Information Commissioner&rsquo;s Office (ICO), the UK regulator for data protection, at{' '}
        <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a>.
      </p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy from time to time. The date at the top shows when it was last revised.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
      </p>
    </LegalLayout>
  )
}
