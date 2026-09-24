// Central legal configuration for the public website's Privacy Policy,
// Cookie Policy and Terms of Use. Plain JS (not .ts), like siteConfig.mjs,
// so both the prerender script and the Express server can determine a legal
// page's completeness without going through Vite - the prerender script
// needs this to decide each page's robots directive at build time.
//
// Fields set to `null` are facts that do not exist anywhere in this
// repository and have not been supplied. They are NOT invented. Do not fill
// these in with assumed or plausible values; replace `null` only with a
// fact confirmed by Rob. See LEGAL_INFORMATION_REQUIRED.md.
//
// There are no bracketed placeholder tokens anywhere in this file or in the
// pages that read it. When a required field is missing, the affected page
// renders neutral, accurate wording that simply omits the missing detail,
// and is automatically marked noindex, follow (see getLegalPageStatus and
// config/siteConfig.mjs's getRouteRobots) until the field is supplied.

export const legalConfig = {
  legalEntityName: 'Barley Digital Limited',
  companyNumber: '16856063',
  registeredAddress: 'Camburgh House, 27 New Dover Road, Canterbury, Kent, United Kingdom, CT1 3DN',
  contactEmail: 'help@harba.ai',
  icoRegistrationNumber: null,
  hostingProvider: 'Fly.io',
  hostingRegion: 'London, United Kingdom',
  emailProcessorName: null,
}

// The fields each legal page needs to be considered complete: the facts a
// UK company must disclose (registered name, number and address, under the
// Companies (Trading Disclosures) Regulations 2008) and/or that UK GDPR
// Article 13 requires (the controller's identity). emailProcessorName is
// deliberately not required here: a privacy policy can accurately describe
// a processor by category ("an email delivery service") without naming the
// specific vendor, so its absence does not block indexing - see
// PrivacyPolicy.tsx. Cookies has no entity-identity requirement at all.
const REQUIRED_FIELDS_BY_ROUTE = {
  '/privacy': ['legalEntityName', 'companyNumber', 'registeredAddress'],
  '/terms': ['legalEntityName', 'registeredAddress'],
  '/cookies': [],
}

export function getLegalPageStatus(routePath) {
  const required = REQUIRED_FIELDS_BY_ROUTE[routePath] ?? []
  const missingFields = required.filter((field) => !legalConfig[field])
  return { complete: missingFields.length === 0, missingFields }
}

export function isLegalRoute(routePath) {
  return Object.prototype.hasOwnProperty.call(REQUIRED_FIELDS_BY_ROUTE, routePath)
}
