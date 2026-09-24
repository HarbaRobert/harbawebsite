import { legalConfig } from '../../../config/legalConfig.mjs'
import { LegalLayout } from './LegalLayout'

const LAST_UPDATED = '20 September 2026'

export function CookiePolicy() {
  return (
    <LegalLayout
      eyebrow="COOKIES"
      title="Cookie Policy"
      intro="What cookies and similar technologies this website uses, and how you can control them."
      lastUpdated={LAST_UPDATED}
    >
      <h2>What this policy covers</h2>
      <p>
        Cookies are small text files placed on your device by websites you visit. Similar technologies, such as browser local storage, work in a comparable
        way. This policy describes what this website currently uses.
      </p>

      <h2>Current position</h2>
      <p>
        At the time of writing, this website does not set any cookies. The one preference this site stores, whether you have accepted or rejected
        analytics cookies, is kept in your browser&rsquo;s local storage rather than a cookie, and is used only to remember your choice.
      </p>

      <h2>If analytics is enabled</h2>
      <p>
        We may, in future, enable Google Analytics (GA4) to understand how the website is used in aggregate. If we do, the cookies below will only be set
        after you actively accept analytics cookies through the banner shown on this site. They are never set beforehand.
      </p>
      <table className="cookie-table">
        <thead>
          <tr><th>Name</th><th>Purpose</th><th>Typical duration</th><th>Set by</th></tr>
        </thead>
        <tbody>
          <tr><td>_ga</td><td>Distinguishes unique visitors for aggregate analytics reporting</td><td>Up to 2 years</td><td>Google Analytics (only after consent)</td></tr>
          <tr><td>_ga_&lt;container-id&gt;</td><td>Persists session state for aggregate analytics reporting</td><td>Up to 2 years</td><td>Google Analytics (only after consent)</td></tr>
        </tbody>
      </table>
      <p>We do not use advertising cookies, and we do not list any here because none are present.</p>

      <h2>Managing your preference</h2>
      <p>
        You can accept or reject analytics cookies using the banner shown on this site. You can change your mind at any time by clearing your browser&rsquo;s
        local storage for this site, which will show the banner again on your next visit. You can also control cookies generally through your browser
        settings.
      </p>

      <h2>Changes to this policy</h2>
      <p>We will update this policy if what this website uses changes. The date at the top shows when it was last revised.</p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <a href={`mailto:${legalConfig.contactEmail}`}>{legalConfig.contactEmail}</a>.
      </p>
    </LegalLayout>
  )
}
