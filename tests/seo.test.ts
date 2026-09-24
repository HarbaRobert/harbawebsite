import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PUBLIC_ROUTES, getIndexableRoutes, getRouteRobots } from '../config/siteConfig.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const PORT = 8091
const BASE = `http://localhost:${PORT}`

let serverProcess: ChildProcess

async function waitForServer(url: string, timeoutMs = 20000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url)
      if (res.ok || res.status === 404) return
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`Server did not respond at ${url} within ${timeoutMs}ms`)
}

beforeAll(async () => {
  serverProcess = spawn(process.execPath, ['server/index.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'pipe',
  })
  await waitForServer(`${BASE}/`)
})

afterAll(() => {
  serverProcess?.kill()
})

function extractAll(html: string, regex: RegExp): string[] {
  return [...html.matchAll(regex)].map((match) => match[1])
}

function extractOne(html: string, regex: RegExp): string | null {
  return regex.exec(html)?.[1] ?? null
}

async function fetchText(pathName: string) {
  const res = await fetch(`${BASE}${pathName}`)
  const text = await res.text()
  return { res, text }
}

describe('public routes', () => {
  for (const route of PUBLIC_ROUTES) {
    it(`${route.path} returns 200 with meaningful content and correct metadata`, async () => {
      const { res, text } = await fetchText(route.path)
      expect(res.status).toBe(200)

      // Meaningful content: an H1, present exactly once.
      const h1s = extractAll(text, /<h1[ >]/g)
      expect(h1s.length).toBe(1)

      // Title matches configuration exactly.
      const title = extractOne(text, /<title>([^<]*)<\/title>/)
      expect(title).toBe(route.title)

      // Description matches configuration exactly.
      const description = extractOne(text, /<meta name="description" content="([^"]*)"/)
      expect(description).toBe(route.description)

      // Exactly one canonical, and it is self-referencing.
      const canonicals = extractAll(text, /<link rel="canonical" href="([^"]*)"/g)
      expect(canonicals.length).toBe(1)
      const expectedPath = route.path === '/' ? '/' : route.path
      expect(new URL(canonicals[0]).pathname).toBe(expectedPath)

      // Indexable, unless this is a legal page still missing required facts
      // (see config/legalConfig.mjs) - in which case noindex is correct and expected.
      const robots = extractOne(text, /<meta name="robots" content="([^"]*)"/)
      expect(robots).toBe(getRouteRobots(route.path))

      // At least one internal link present (nav/footer/body).
      expect(text).toMatch(/href="\/[a-z-]*"/)

      // JSON-LD present and valid.
      const ldBlocks = extractAll(text, /<script type="application\/ld\+json">(.*?)<\/script>/gs)
      expect(ldBlocks.length).toBeGreaterThan(0)
      for (const block of ldBlocks) expect(() => JSON.parse(block)).not.toThrow()
    })
  }

  it('every public route has a unique title', async () => {
    const titles = new Set<string>()
    for (const route of PUBLIC_ROUTES) {
      const { text } = await fetchText(route.path)
      const title = extractOne(text, /<title>([^<]*)<\/title>/)
      expect(titles.has(title!)).toBe(false)
      titles.add(title!)
    }
  })

  it('every public route has a unique description', async () => {
    const descriptions = new Set<string>()
    for (const route of PUBLIC_ROUTES) {
      const { text } = await fetchText(route.path)
      const description = extractOne(text, /<meta name="description" content="([^"]*)"/)
      expect(descriptions.has(description!)).toBe(false)
      descriptions.add(description!)
    }
  })

  it('no public page contains draft placeholder text', async () => {
    for (const route of PUBLIC_ROUTES) {
      const { text } = await fetchText(route.path)
      expect(text).not.toContain('Details coming soon')
      expect(text).not.toContain('PLACEHOLDER')
      expect(text).not.toContain('harba.example')
      expect(text).not.toContain('to be supplied')
      // No bracketed placeholder tokens anywhere (e.g. "[registered company name to be confirmed]").
      // Legal pages with missing facts must use neutral wording instead - see config/legalConfig.mjs.
      expect(text).not.toMatch(/\[[A-Za-z][a-zA-Z ]{3,}\]/)
    }
  })

  it('a legal page missing required facts is noindex and excluded from the sitemap; a complete one is indexed and included', async () => {
    const { text: sitemapText } = await fetchText('/sitemap.xml')
    for (const legalPath of ['/privacy', '/cookies', '/terms']) {
      const { text } = await fetchText(legalPath)
      const robots = extractOne(text, /<meta name="robots" content="([^"]*)"/)
      const expectedRobots = getRouteRobots(legalPath)
      expect(robots).toBe(expectedRobots)
      const inSitemap = sitemapText.includes(`>${new URL(extractOne(text, /<link rel="canonical" href="([^"]*)"/)!).toString()}<`)
      expect(inSitemap).toBe(expectedRobots === 'index, follow')
    }
  })

  it('analytics does not load before consent (no GA script referenced in any initial HTML)', async () => {
    for (const route of PUBLIC_ROUTES) {
      const { text } = await fetchText(route.path)
      expect(text).not.toContain('googletagmanager.com')
    }
  })
})

describe('/trust (renamed to /governance)', () => {
  it('redirects permanently to /governance, preserving any query string, with no further hop', async () => {
    const res = await fetch(`${BASE}/trust`, { redirect: 'manual' })
    expect(res.status).toBe(301)
    expect(res.headers.get('location')).toBe('/governance')

    const resWithQuery = await fetch(`${BASE}/trust?ref=old-link`, { redirect: 'manual' })
    expect(resWithQuery.status).toBe(301)
    expect(resWithQuery.headers.get('location')).toBe('/governance?ref=old-link')

    // Following the redirect lands on the real, indexable page, not another redirect.
    const { res: finalRes } = await fetchText('/governance')
    expect(finalRes.status).toBe(200)
  })
})

describe('/book-a-demo', () => {
  it('is its own standalone enquiry form, not a link into the working-session page', async () => {
    const { res, text } = await fetchText('/book-a-demo')
    expect(res.status).toBe(200)
    expect(text).toContain('<form')
    expect(text).toContain('action="/.well-known/platform/forms/7u8XeYCOyTOpZ4bW"')
    expect(text).toContain('method="post"')
    expect(text).toContain('name="topic" value="demo"')
    expect(text).toMatch(/Book a demo/)
    // The two journeys are separate: no in-content link redirecting a demo
    // visitor to the working-session page (the site-wide nav/footer links to
    // it regardless, which is expected and not what this checks).
    expect(text).not.toMatch(/Discuss a specific process/)
  })
})

describe('unknown routes', () => {
  it('returns HTTP 404 with a branded, noindex page', async () => {
    const { res, text } = await fetchText('/this-page-does-not-exist')
    expect(res.status).toBe(404)
    expect(text).toMatch(/<h1[ >]/)
    const robots = extractOne(text, /<meta name="robots" content="([^"]*)"/)
    expect(robots).toBe('noindex, follow')
    // Must not declare the homepage (or anything) as canonical.
    expect(text).not.toMatch(/<link rel="canonical"/)
    // Useful links back into the site.
    expect(text).toMatch(/href="\/"/)
  })
})

describe('draft routes (not part of the customer journey)', () => {
  for (const draftPath of ['/docs', '/technical-review', '/login']) {
    it(`${draftPath} is reachable but marked noindex, nofollow`, async () => {
      const { res, text } = await fetchText(draftPath)
      expect(res.status).toBe(200)
      const robots = extractOne(text, /<meta name="robots" content="([^"]*)"/)
      expect(robots).toBe('noindex, nofollow')
    })
  }
})

describe('robots.txt', () => {
  it('references the sitemap on the configured production host, not the placeholder domain', async () => {
    const { res, text } = await fetchText('/robots.txt')
    expect(res.status).toBe(200)
    expect(text).not.toContain('harba.example')
    expect(text).toMatch(/Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/)
    expect(text).toContain('User-agent: OAI-SearchBot')
  })
})

describe('sitemap.xml', () => {
  it('returns 200, contains only currently-indexable canonical URLs, and no internal or incomplete-legal routes', async () => {
    const { res, text } = await fetchText('/sitemap.xml')
    expect(res.status).toBe(200)
    expect(text).not.toContain('harba.example')

    const locs = extractAll(text, /<loc>([^<]*)<\/loc>/g)
    const indexableRoutes = getIndexableRoutes()
    expect(locs.length).toBe(indexableRoutes.length)

    for (const draftPath of ['/docs', '/technical-review', '/login']) {
      expect(locs.some((loc) => loc.endsWith(draftPath))).toBe(false)
    }

    // /technical is now a fully reviewed, published page and must be indexable.
    expect(locs.some((loc) => loc.endsWith('/technical'))).toBe(true)

    // Any public route NOT currently indexable (e.g. an incomplete legal page) must not appear.
    for (const route of PUBLIC_ROUTES) {
      if (indexableRoutes.includes(route)) continue
      expect(locs.some((loc) => loc.endsWith(route.path))).toBe(false)
    }

    const siteOrigin = new URL(locs[0]).origin
    for (const route of indexableRoutes) {
      const expected = route.path === '/' ? `${siteOrigin}/` : `${siteOrigin}${route.path}`
      expect(locs).toContain(expected)
    }
  })
})
