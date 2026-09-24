// Static pre-rendering for the public marketing routes. Run after `vite
// build` (see the "build" script in package.json). Uses Vite's own SSR
// module loading (vite.ssrLoadModule) rather than a separate TS runner, so
// import.meta.env, JSX and every existing Vite plugin resolve exactly as
// they do in the real client build - no extra build-tool dependency needed.
import { createServer } from 'vite'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DRAFT_ROUTES, PUBLIC_ROUTES, SITE_NAME, getRouteRobots, getSiteUrl } from '../config/siteConfig.mjs'
import { getLegalPageStatus, isLegalRoute } from '../config/legalConfig.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
// Overridable so tests can prerender into an isolated directory (e.g. to
// build with a test-only GA_MEASUREMENT_ID) without touching the real dist/
// used for local preview and deployment. Unset in normal use.
const distDir = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(root, 'dist')

function readManifest() {
  const manifestPath = path.join(distDir, '.vite', 'manifest.json')
  if (!existsSync(manifestPath)) {
    throw new Error(`Vite manifest not found at ${manifestPath}. Run "vite build" before prerendering.`)
  }
  return JSON.parse(readFileSync(manifestPath, 'utf8'))
}

function assetTags(manifest) {
  const entry = manifest['index.html']
  if (!entry) throw new Error('index.html entry not found in the Vite manifest.')
  const cssLinks = (entry.css || []).map((href) => `<link rel="stylesheet" href="/${href}" />`).join('\n    ')
  const scriptTag = `<script type="module" src="/${entry.file}"></script>`
  return { cssLinks, scriptTag }
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildHead({ title, description, canonical, robots, ogEnabled }) {
  const lines = [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '<meta name="theme-color" content="#17241e" />',
    '<link rel="icon" type="image/svg+xml" href="/favicon.svg" />',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="robots" content="${robots}" />`,
  ]
  if (description) lines.push(`<meta name="description" content="${escapeHtml(description)}" />`)
  if (canonical) lines.push(`<link rel="canonical" href="${canonical}" />`)

  if (ogEnabled) {
    lines.push(
      `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
      '<meta property="og:type" content="website" />',
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
    )
    if (description) lines.push(`<meta property="og:description" content="${escapeHtml(description)}" />`)
    if (canonical) lines.push(`<meta property="og:url" content="${canonical}" />`)
    lines.push(
      '<meta name="twitter:card" content="summary_large_image" />',
      `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    )
    if (description) lines.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`)
  }

  // No genuine Harba social share image or logo asset exists in this
  // repository (checked public/ and src/assets/); og:image / twitter:image
  // and a JSON-LD logo are deliberately omitted rather than invented. See
  // the completion report for this as a flagged missing asset.

  if (process.env.GOOGLE_SITE_VERIFICATION) {
    lines.push(`<meta name="google-site-verification" content="${escapeHtml(process.env.GOOGLE_SITE_VERIFICATION)}" />`)
  }
  if (process.env.BING_SITE_VERIFICATION) {
    lines.push(`<meta name="msvalidate.01" content="${escapeHtml(process.env.BING_SITE_VERIFICATION)}" />`)
  }

  return lines.join('\n    ')
}

function buildDocument({ headHtml, cssLinks, bodyHtml, scriptTag }) {
  return `<!doctype html>
<html lang="en-GB">
  <head>
    ${headHtml}
    ${cssLinks}
  </head>
  <body>
    <div id="root">${bodyHtml}</div>
    ${scriptTag}
  </body>
</html>
`
}

function writeRouteFile(routePath, html) {
  const target = routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath.replace(/^\//, ''), 'index.html')
  mkdirSync(path.dirname(target), { recursive: true })
  writeFileSync(target, html)
  return target
}

async function main() {
  const vite = await createServer({
    root,
    mode: 'production',
    server: { middlewareMode: true },
    appType: 'custom',
  })

  try {
    const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
    const manifest = readManifest()
    const { cssLinks, scriptTag } = assetTags(manifest)
    const siteUrl = getSiteUrl()
    const written = []

    const missingLegalFacts = []

    for (const route of PUBLIC_ROUTES) {
      const bodyHtml = render(route.path)
      const canonical = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`
      const robots = getRouteRobots(route.path)
      const headHtml = buildHead({ title: route.title, description: route.description, canonical, robots, ogEnabled: true })
      written.push(writeRouteFile(route.path, buildDocument({ headHtml, cssLinks, bodyHtml, scriptTag })))

      if (isLegalRoute(route.path)) {
        const status = getLegalPageStatus(route.path)
        if (!status.complete) missingLegalFacts.push(`${route.path}: missing ${status.missingFields.join(', ')}`)
      }
    }

    for (const route of DRAFT_ROUTES) {
      // Only the <head> is prerendered here: a real, server-verifiable
      // noindex, nofollow. The body stays an empty shell and continues to
      // render entirely client-side, since this content depends on
      // browser-local review data that cannot be meaningfully prerendered.
      const headHtml = buildHead({ title: route.title, description: null, canonical: null, robots: 'noindex, nofollow', ogEnabled: false })
      written.push(writeRouteFile(route.path, buildDocument({ headHtml, cssLinks, bodyHtml: '', scriptTag })))
    }

    // Render an arbitrary unmatched path so the 404 body is exactly what
    // the client's own <Route path="*"> shows, then mark it noindex, follow.
    const notFoundBody = render('/__prerender_not_found_probe__')
    const notFoundHead = buildHead({ title: 'Page Not Found | Harba', description: null, canonical: null, robots: 'noindex, follow', ogEnabled: false })
    written.push(writeRouteFile('/404', buildDocument({ headHtml: notFoundHead, cssLinks, bodyHtml: notFoundBody, scriptTag })))

    if (missingLegalFacts.length > 0) {
      console.warn('\nWARNING: legal pages are incomplete and have been built as noindex, follow:')
      for (const line of missingLegalFacts) console.warn(`  - ${line}`)
      console.warn('See LEGAL_INFORMATION_REQUIRED.md. The build did not fail; these pages render neutral wording instead of placeholder tokens and will not be indexed until the missing facts are supplied.\n')
    }

    console.log(`Prerendered ${written.length} files:`)
    for (const file of written) console.log(`  ${path.relative(root, file)}`)
  } finally {
    await vite.close()
  }
}

main().catch((error) => {
  console.error('Prerender failed:', error)
  process.exitCode = 1
})
