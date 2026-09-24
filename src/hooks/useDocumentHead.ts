import { useEffect } from 'react'
import { SITE_NAME, findDraftRoute, findPublicRoute, getRouteRobots, getSiteUrl } from '../../config/siteConfig.mjs'

function setMetaByName(name: string, content: string | null) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (content === null) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setMetaByProperty(property: string, content: string | null) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (content === null) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

/** Updates or removes the single canonical link, never adding a second one. */
function setCanonical(href: string | null) {
  let tag = document.querySelector('link[rel="canonical"]')
  if (href === null) {
    tag?.remove()
    return
  }
  if (!tag) {
    tag = document.createElement('link')
    tag.setAttribute('rel', 'canonical')
    document.head.appendChild(tag)
  }
  tag.setAttribute('href', href)
}

interface HeadState {
  title: string
  description: string | null
  robots: string
  canonical: string | null
  isPublic: boolean
}

function applyHead(state: HeadState) {
  document.title = state.title
  setMetaByName('description', state.description)
  setMetaByName('robots', state.robots)
  setCanonical(state.canonical)
  setMetaByProperty('og:title', state.isPublic ? state.title : null)
  setMetaByProperty('og:description', state.isPublic ? state.description : null)
  setMetaByProperty('og:url', state.isPublic ? state.canonical : null)
  setMetaByProperty('og:type', state.isPublic ? 'website' : null)
  setMetaByProperty('og:site_name', state.isPublic ? SITE_NAME : null)
  setMetaByName('twitter:card', state.isPublic ? 'summary_large_image' : null)
  setMetaByName('twitter:title', state.isPublic ? state.title : null)
  setMetaByName('twitter:description', state.isPublic ? state.description : null)
}

/**
 * Keeps <title>, canonical, meta description, robots and OG/Twitter tags
 * correct across client-side route changes. The initial load of every
 * indexable route already has correct tags baked in by the prerender
 * script (scripts/prerender.tsx); this hook only matters for SPA
 * navigation, where React Router swaps content without a full page load.
 */
export function useDocumentHead(pathname: string) {
  useEffect(() => {
    const siteUrl = getSiteUrl()
    const publicRoute = findPublicRoute(pathname)
    const draftRoute = findDraftRoute(pathname)

    if (publicRoute) {
      const canonical = pathname === '/' ? `${siteUrl}/` : `${siteUrl}${pathname}`
      applyHead({ title: publicRoute.title, description: publicRoute.description, robots: getRouteRobots(pathname), canonical, isPublic: true })
      return
    }

    if (draftRoute) {
      applyHead({ title: draftRoute.title, description: null, robots: 'noindex, nofollow', canonical: null, isPublic: false })
      return
    }

    applyHead({ title: 'Page Not Found | Harba', description: null, robots: 'noindex, follow', canonical: null, isPublic: false })
  }, [pathname])
}
