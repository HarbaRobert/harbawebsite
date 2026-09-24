// Single source of truth for site-wide SEO configuration: the production
// site URL and the list of public, indexable routes with their metadata.
//
// This file is plain JS (not .ts) so it can be imported directly by the
// Express server (server/index.js) and the Node prerender script
// (scripts/prerender.tsx) without a TypeScript build step, as well as by
// the React app via Vite. See siteConfig.d.ts for the accompanying types.
//
// Do not hardcode the production hostname anywhere else in the codebase.
// Change it by setting PUBLIC_SITE_URL, not by editing this default.

import { getLegalPageStatus, isLegalRoute } from './legalConfig.mjs'

export const SITE_NAME = 'Harba'
export const DEFAULT_SITE_URL = 'https://harba.fly.dev'

/**
 * Resolves the configured production site URL, trimmed of a trailing slash.
 *
 * IMPORTANT: this must be a bare `process.env.PUBLIC_SITE_URL` reference,
 * not `typeof process !== 'undefined' && process.env && ...`. In real
 * Node (the server, the prerender script) `process` always genuinely
 * exists, so a guard is unnecessary there. In the browser bundle, Vite's
 * `define` (see vite.config.ts) textually replaces the exact expression
 * `process.env.PUBLIC_SITE_URL` with a literal string at build time -
 * there is no runtime `process` object involved at all. A `typeof
 * process !== 'undefined'` guard is checked at genuine runtime in that
 * bundle (nothing replaces `typeof process` itself) and is always false in
 * a browser, so it does not "fail safe" - it silently discards whatever
 * value was configured and falls back to DEFAULT_SITE_URL every time,
 * with the bug masked whenever the configured value happens to be empty
 * (esbuild can constant-fold the whole expression away in that specific
 * case) and only surfacing once a real custom domain is actually set.
 * Confirmed by inspecting the compiled output; do not reintroduce the guard.
 */
export function getSiteUrl() {
  const fromEnv = process.env.PUBLIC_SITE_URL || ''
  const url = fromEnv || DEFAULT_SITE_URL
  return url.replace(/\/+$/, '')
}

/**
 * The public marketing site's base URL, no trailing slash - used by
 * standalone pages like /login for their "back to Harba" link and
 * wordmark. This repository currently *is* the marketing site, so an unset
 * MARKETING_SITE_URL correctly resolves to '' (a safe same-origin
 * fallback: callers treat '' as "link to a relative path", never as a
 * hardcoded domain). Only set MARKETING_SITE_URL once the application and
 * the marketing site are deployed as separate hosts.
 */
export function getMarketingSiteUrl() {
  return (process.env.MARKETING_SITE_URL || '').replace(/\/+$/, '')
}

/**
 * Public, indexable marketing routes. Each entry drives the prerendered
 * HTML's <title>, meta description, canonical URL, OG/Twitter tags and
 * sitemap.xml entry. `breadcrumbLabel` is the short label used in the
 * BreadcrumbList structured data and matches the visible route indicator
 * already shown in the UI.
 */
export const PUBLIC_ROUTES = [
  {
    path: '/',
    title: 'Managed Digital Workforce Platform | Harba',
    description: 'Harba is a managed digital workforce platform, connecting AI teammates, governed Pipelines and business knowledge to the systems your organisation already uses.',
    breadcrumbLabel: 'Home',
  },
  {
    path: '/use-cases',
    title: 'AI Automation Use Cases for Business | Harba',
    description: 'Explore how Harba supports document processing, intake, triage, exception handling, research and operational follow-through.',
    breadcrumbLabel: 'Use cases',
  },
  {
    path: '/how-we-work',
    title: 'From AI Opportunity to Working Operation | Harba',
    description: 'See how Harba identifies, configures, deploys and improves governed AI workflows across your existing business systems.',
    breadcrumbLabel: 'How we work',
  },
  {
    path: '/governance',
    title: 'AI Governance, Security and Human Oversight | Harba',
    description: 'Learn how Harba controls AI work through workspace access, human approvals, recorded Pipeline activity, customer separation and usage visibility.',
    breadcrumbLabel: 'Governance',
  },
  {
    path: '/technical',
    title: 'Technical Overview of the Harba AI Platform | Harba',
    description: 'Explore how Harba combines governed AI Pipelines, business knowledge, integrations, human approvals and managed implementation across your existing systems.',
    breadcrumbLabel: 'Technical',
  },
  {
    path: '/company',
    title: 'About Harba | Managed Digital Workforce Platform',
    description: 'Harba helps organisations move from isolated AI experiments to a managed digital workforce that works across existing systems.',
    breadcrumbLabel: 'Company',
  },
  {
    path: '/book-a-working-session',
    title: 'Request a Working Session | Harba',
    description: 'Request a working session to map one valuable business process with Harba and assess whether a governed AI workflow is the right fit.',
    breadcrumbLabel: 'Request a working session',
  },
  {
    path: '/book-a-demo',
    title: 'Book a Demo | Harba',
    description: 'See how Harba’s Pipelines, Teammates and Big Brain work together to carry out controlled AI work across your existing business systems.',
    breadcrumbLabel: 'Book a demo',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Harba',
    description: 'Read how Harba collects, uses, protects and manages personal information through its website and services.',
    breadcrumbLabel: 'Privacy Policy',
  },
  {
    path: '/cookies',
    title: 'Cookie Policy | Harba',
    description: 'Read about the cookies and similar technologies used on the Harba website and how you can control your preferences.',
    breadcrumbLabel: 'Cookie Policy',
  },
  {
    path: '/terms',
    title: 'Website Terms | Harba',
    description: 'Read the terms governing access to and use of the Harba website.',
    breadcrumbLabel: 'Terms',
  },
]

/**
 * Routes that exist and work but are not published: reachable through the
 * interface (nav, footer, cross-links) but excluded from the sitemap and
 * marked noindex, nofollow. /docs mirrors /technical's old placeholder
 * pattern and stays draft until its content has been through the same
 * review and rewrite /technical received. /technical-review is the
 * internal review workspace itself, never meant to be public. Only the
 * <head> is prerendered for these (see scripts/prerender.mjs); their body
 * content stays client-rendered.
 */
export const DRAFT_ROUTES = [
  { path: '/docs', title: 'Developer Documentation | Harba' },
  { path: '/technical-review', title: 'Technical Review (internal) | Harba' },
  // Sign-in is a utility page, not a marketing destination: it should never
  // compete with the public pages above in search results.
  { path: '/login', title: 'Sign in | Harba' },
]

export function findPublicRoute(pathname) {
  return PUBLIC_ROUTES.find((route) => route.path === pathname) || null
}

export function findDraftRoute(pathname) {
  return DRAFT_ROUTES.find((route) => route.path === pathname) || null
}

/**
 * The robots directive for a public route. Normally 'index, follow'. Legal
 * pages (see config/legalConfig.mjs) automatically fall back to
 * 'noindex, follow' whenever a required fact (legal entity name, company
 * number, etc.) has not been supplied yet, so an incomplete policy can
 * never be indexed by accident - there is no manual flag to remember to
 * flip. Once every required fact for that page is supplied, it becomes
 * indexable again with no code change.
 */
export function getRouteRobots(pathname) {
  if (isLegalRoute(pathname)) {
    const { complete } = getLegalPageStatus(pathname)
    return complete ? 'index, follow' : 'noindex, follow'
  }
  return 'index, follow'
}

/** Public routes that are currently indexable, for the sitemap: an incomplete legal page is excluded rather than listed noindex. */
export function getIndexableRoutes() {
  return PUBLIC_ROUTES.filter((route) => getRouteRobots(route.path) === 'index, follow')
}
