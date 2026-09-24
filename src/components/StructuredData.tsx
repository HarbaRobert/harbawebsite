import { SITE_NAME, getSiteUrl } from '../../config/siteConfig.mjs'

const ORG_DESCRIPTION = 'Harba is a managed digital workforce platform, connecting AI teammates, governed Pipelines and business knowledge to the systems your organisation already uses.'

/**
 * JSON-LD for one page: Organization + WebSite (repeated per page, which is
 * normal practice) plus a WebPage and, for non-home pages, a BreadcrumbList
 * matching the visible route indicator already shown in the UI. Only
 * verified facts are included: no logo (no asset exists), no sameAs (no
 * verified official profile exists), no ratings, reviews or claims absent
 * from the visible page.
 */
export function StructuredData({ path, title, description, breadcrumbLabel }: { path: string; title: string; description: string; breadcrumbLabel: string }) {
  const siteUrl = getSiteUrl()
  const homeUrl = `${siteUrl}/`
  const canonical = path === '/' ? homeUrl : `${siteUrl}${path}`
  const organizationId = `${siteUrl}/#organization`
  const websiteId = `${siteUrl}/#website`

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: SITE_NAME,
      url: homeUrl,
      description: ORG_DESCRIPTION,
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: homeUrl,
      publisher: { '@id': organizationId },
    },
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: { '@id': websiteId },
      ...(path !== '/' ? { breadcrumb: { '@id': `${canonical}#breadcrumb` } } : {}),
    },
  ]

  if (path !== '/') {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: homeUrl },
        { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: canonical },
      ],
    })
  }

  const jsonLd = { '@context': 'https://schema.org', '@graph': graph }
  // Escape '<' so a value can never prematurely close the script tag.
  const serialised = JSON.stringify(jsonLd).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialised }} />
}
