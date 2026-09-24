# Legal information required before publication

The Privacy Policy, Cookie Policy and Website Terms at `/privacy`, `/cookies` and `/terms` are
substantive operational drafts, not placeholders, but they are **not publication-ready**. Every
fact below is missing from this repository and was not invented. Each shows in the rendered
pages as a clearly bracketed placeholder (for example `[registered company name to be
confirmed]`) rather than a plausible-looking guess.

All of these live in `src/config/legalConfig.ts`. Update that file once the facts are confirmed
and every bracketed placeholder across all three pages updates automatically.

## Required from Rob

1. **Registered legal entity name** — the company that operates harba.fly.dev / will operate
   the permanent domain. Referenced in the Privacy Policy and Terms as the data controller and
   IP owner.
2. **Companies House registration number** (or equivalent, if not a UK limited company).
3. **Registered office address.**
4. **Confirmation of governing jurisdiction** — the Terms currently assume England and Wales.
   Confirm this is correct once the operating entity is finalised.
5. **ICO registration number**, if the organisation has registered with the ICO (most UK data
   controllers must). If not yet registered, this should happen before the Privacy Policy is
   published, since the policy currently omits any registration number.
6. **Name of the email delivery processor** — `server/index.js` sends enquiry emails via
   generic `SMTP_HOST`/`SMTP_USER` environment variables with no provider named in code. The
   Privacy Policy needs to name whichever provider is actually configured (e.g. a specific
   transactional email service) as a processor.
7. **A formal data retention schedule** for working-session enquiry data. The Privacy Policy
   currently describes retention qualitatively ("as long as necessary to respond") rather than
   with a specific period, since no specific period exists anywhere in the codebase or
   elsewhere and none should be invented.

## Also worth deciding, not currently blocking

- **A dedicated logo image and a social share (Open Graph) image do not exist in this
  repository.** Only `public/favicon.svg` and `public/icons.svg` exist; the wordmark used in
  the header is styled text, not an image. `og:image`, `twitter:image`, and the JSON-LD
  `Organization.logo` field have all been deliberately omitted rather than invented. Supply a
  square logo (for JSON-LD) and a 1200×630 share image (for Open Graph/Twitter cards) and these
  can be wired in.
- **No official social media profile (LinkedIn, X, etc.) exists anywhere in the codebase.**
  JSON-LD `sameAs` has been omitted entirely. If Harba has or creates an official company
  profile, add its URL to `src/config/legalConfig.ts` and it can be added to the Organization
  schema.
- Whether the current wording — no cookies today, GA4 optional and consent-gated when enabled —
  matches what you actually intend to run. If you plan to add any other analytics, advertising,
  or embedded third-party tool later (e.g. a chat widget, a scheduling embed), the Cookie Policy
  and Privacy Policy will need updating at that point; do not assume they cover it in advance.

## Not a blocker, just a heads-up

All three documents are marked "in draft pending final legal review" directly on the page.
Please have a qualified UK solicitor review the liability, governing law and IP clauses in
`/terms` specifically before publication — the wording there is intentionally conservative but
generic.
