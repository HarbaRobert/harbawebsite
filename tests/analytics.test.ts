// Browser-driven tests for the consent-gated GA4 integration and the
// working-session conversion flow. Uses puppeteer-core against whatever
// Chrome/Chromium is already installed (no bundled browser download, so
// this stays a lightweight dev dependency) - the suite skips itself
// cleanly, rather than failing, on a machine or CI runner with no browser
// available. See SEO_SETUP.md section 7 for the manual equivalent.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, spawnSync, type ChildProcess } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Mirrors the ambient Window augmentation in src/lib/ga.ts: this file's
// page.evaluate() callbacks are type-checked as ordinary TS in this
// project (tsconfig.test.json), which does not include src/, so the
// global needs restating here for `window.dataLayer`/`window.gtag` to type-check.
declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const PROD_PORT = 8097
const DEV_PORT = 5183
const PROD_BASE = `http://localhost:${PROD_PORT}`
const DEV_BASE = `http://localhost:${DEV_PORT}`
const TEST_DIST_DIR = path.join(root, 'dist-test-analytics')
const TEST_GA_ID = 'G-TESTID123'

function findBrowser(): string | null {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH
  }
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ]
  return candidates.find((candidate) => existsSync(candidate)) ?? null
}

const browserPath = findBrowser()

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

describe.skipIf(!browserPath)('consent-gated analytics (browser)', () => {
  let prodServer: ChildProcess
  let devServer: ChildProcess
  let puppeteer: typeof import('puppeteer-core')
  let browser: import('puppeteer-core').Browser

  beforeAll(async () => {
    puppeteer = await import('puppeteer-core')

    // Build an isolated copy of the site with a test GA measurement ID
    // baked in, entirely separate from the real dist/ used elsewhere.
    rmSync(TEST_DIST_DIR, { recursive: true, force: true })
    // NODE_ENV must be forced to 'production' here: Vitest sets NODE_ENV=test
    // on this process, and `vite build` only defaults NODE_ENV to 'production'
    // when it is *unset* - inheriting 'test' silently produces a build with
    // import.meta.env.DEV=true (shipping DevReviewUtility and disabling GA,
    // since getMeasurementId() short-circuits on !import.meta.env.PROD).
    // Confirmed by reproducing the hydration-mismatch/no-gtag failure this
    // caused and fixing it with this explicit override.
    const buildEnv = { ...process.env, NODE_ENV: 'production', GA_MEASUREMENT_ID: TEST_GA_ID }
    const build = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'dist-test-analytics'], { cwd: root, env: buildEnv })
    if (build.status !== 0) throw new Error(`Test build failed: ${build.stderr?.toString()}`)
    const prerender = spawnSync(process.execPath, ['scripts/prerender.mjs'], { cwd: root, env: { ...buildEnv, DIST_DIR: TEST_DIST_DIR } })
    if (prerender.status !== 0) throw new Error(`Prerender failed: ${prerender.stderr?.toString()}`)

    prodServer = spawn(process.execPath, ['server/index.js'], {
      cwd: root,
      env: { ...process.env, PORT: String(PROD_PORT), DIST_DIR: TEST_DIST_DIR, GA_MEASUREMENT_ID: TEST_GA_ID },
      stdio: 'pipe',
    })
    await waitForServer(`${PROD_BASE}/`)

    // A real `vite dev` server, to prove analytics never activates in
    // development regardless of GA_MEASUREMENT_ID being set.
    devServer = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port', String(DEV_PORT), '--strictPort'], {
      cwd: root,
      env: { ...process.env, GA_MEASUREMENT_ID: TEST_GA_ID },
      stdio: 'pipe',
    })
    await waitForServer(DEV_BASE)

    browser = await puppeteer.launch({ executablePath: browserPath!, headless: true })
  }, 60000)

  afterAll(async () => {
    await browser?.close()
    prodServer?.kill()
    devServer?.kill()
    rmSync(TEST_DIST_DIR, { recursive: true, force: true })
  })

  // A fresh incognito-style browser context per test, not just a new page:
  // localStorage is per-origin and shared across pages within the same
  // context, so a plain browser.newPage() would leak one test's consent
  // decision into the next (they are all the same origin). A fresh context
  // gives genuinely isolated storage, matching how a new, unrelated visitor
  // actually arrives at the site.
  async function newIsolatedPage() {
    const context = await browser.createBrowserContext()
    const page = await context.newPage()
    // Wider than the site's mobile breakpoint (900px), otherwise the desktop
    // nav is hidden behind a closed hamburger menu and links inside it are
    // correctly reported as unclickable.
    await page.setViewport({ width: 1280, height: 900 })
    return page
  }

  // GA activation is checked via the resulting DOM/JS state (a script tag
  // referencing googletagmanager.com, window.gtag, dataLayer contents),
  // not by observing the actual network request completing: this sandbox
  // has known, unrelated IPv6 connectivity problems reaching real external
  // hosts, so relying on an outbound request to a live Google domain
  // actually succeeding would make these tests depend on this machine's
  // network path rather than on the application's own logic.
  async function gaScriptTagPresent(page: import('puppeteer-core').Page) {
    return page.evaluate(() => !!document.querySelector('script[src*="googletagmanager.com"]'))
  }

  async function dataLayerLength(page: import('puppeteer-core').Page) {
    return page.evaluate(() => (window.dataLayer ?? []).length)
  }

  async function newPageTrackingGaRequests() {
    const page = await newIsolatedPage()
    const gaRequests: string[] = []
    page.on('request', (req) => {
      if (req.url().includes('googletagmanager.com')) gaRequests.push(req.url())
    })
    return { page, gaRequests }
  }

  it('does not request GA before any consent decision', async () => {
    const { page, gaRequests } = await newPageTrackingGaRequests()
    await page.goto(PROD_BASE, { waitUntil: 'networkidle0' })
    const bannerVisible = await page.evaluate(() => !!document.querySelector('.cookie-banner'))
    expect(bannerVisible).toBe(true)
    expect(gaRequests).toHaveLength(0)
    await page.close()
  })

  it('does not request GA after rejecting, including across a reload', async () => {
    const { page, gaRequests } = await newPageTrackingGaRequests()
    await page.goto(PROD_BASE, { waitUntil: 'networkidle0' })
    await page.click('[data-choice="reject"]')
    await new Promise((r) => setTimeout(r, 300))
    expect(gaRequests).toHaveLength(0)

    await page.reload({ waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 300))
    expect(gaRequests).toHaveLength(0)
    const consent = await page.evaluate(() => localStorage.getItem('harba-cookie-consent'))
    expect(consent).toBe('denied')
    await page.close()
  })

  it('requests GA only after accepting, and persists that decision across a reload', async () => {
    const page = await newIsolatedPage()
    await page.goto(PROD_BASE, { waitUntil: 'networkidle0' })
    expect(await gaScriptTagPresent(page)).toBe(false)
    await page.click('[data-choice="accept"]')
    await new Promise((r) => setTimeout(r, 500))
    expect(await gaScriptTagPresent(page)).toBe(true)
    expect(await page.evaluate(() => typeof window.gtag)).toBe('function')

    await page.reload({ waitUntil: 'networkidle0' })
    await new Promise((r) => setTimeout(r, 500))
    expect(await gaScriptTagPresent(page)).toBe(true)
    await page.close()
  })

  it('setting no cookies happens regardless of consent (site has none to set)', async () => {
    const { page } = await newPageTrackingGaRequests()
    await page.goto(PROD_BASE, { waitUntil: 'networkidle0' })
    await page.click('[data-choice="accept"]')
    await new Promise((r) => setTimeout(r, 500))
    const cookies = await page.cookies()
    expect(cookies).toHaveLength(0)
    await page.close()
  })

  it('revoking consent via "Cookie preferences" stops further events without a reload', async () => {
    const page = await newIsolatedPage()
    await page.goto(PROD_BASE, { waitUntil: 'networkidle0' })
    await page.click('[data-choice="accept"]')
    await new Promise((r) => setTimeout(r, 400))
    expect(await gaScriptTagPresent(page)).toBe(true)

    // Revoke via the footer control, then reject again.
    const preferencesButton = await page.$('.footer-link-button')
    await preferencesButton!.click()
    await new Promise((r) => setTimeout(r, 200))
    await page.click('[data-choice="reject"]')
    await new Promise((r) => setTimeout(r, 200))

    const lengthBeforeNav = await dataLayerLength(page)
    // Trigger a client-side route change, which would normally send a page_view event.
    await page.click('a[href="/governance"]')
    await new Promise((r) => setTimeout(r, 400))
    // dataLayer must not have grown: the already-loaded gtag script cannot be
    // un-inserted, but the app must stop pushing further events to it the
    // moment consent is revoked (see currentlyGranted in src/lib/ga.ts).
    expect(await dataLayerLength(page)).toBe(lengthBeforeNav)
    const consent = await page.evaluate(() => localStorage.getItem('harba-cookie-consent'))
    expect(consent).toBe('denied')
    await page.close()
  })

  it('fires generate_lead exactly once on a successful submission, and not on a failed one', async () => {
    const page = await newIsolatedPage()
    await page.goto(PROD_BASE, { waitUntil: 'networkidle0' })
    await page.click('[data-choice="accept"]')
    await new Promise((r) => setTimeout(r, 400))

    // First: a failed submission should not fire generate_lead.
    await page.goto(`${PROD_BASE}/book-a-working-session`, { waitUntil: 'networkidle0' })
    await page.setRequestInterception(true)
    const onFailRoute = (req: import('puppeteer-core').HTTPRequest) => {
      if (req.url().endsWith('/.well-known/platform/forms/7u8XeYCOyTOpZ4bW')) {
        req.respond({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false, message: 'fail' }) })
      } else {
        req.continue()
      }
    }
    page.on('request', onFailRoute)
    await fillAndSubmitWorkingSession(page)
    await new Promise((r) => setTimeout(r, 400))
    const leadsAfterFailure = await page.evaluate(() => (window.dataLayer ?? []).filter((entry) => Array.isArray(entry) && entry[0] === 'event' && entry[1] === 'generate_lead').length)
    expect(leadsAfterFailure).toBe(0)
    page.off('request', onFailRoute)

    // Then: a successful submission fires it exactly once, even if the button were clicked twice (it is disabled while submitting).
    let apiCallCount = 0
    const onSuccessRoute = (req: import('puppeteer-core').HTTPRequest) => {
      if (req.url().endsWith('/.well-known/platform/forms/7u8XeYCOyTOpZ4bW')) {
        apiCallCount++
        req.respond({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) })
      } else {
        req.continue()
      }
    }
    page.on('request', onSuccessRoute)
    await page.goto(`${PROD_BASE}/book-a-working-session`, { waitUntil: 'networkidle0' })
    await fillWorkingSessionForm(page)
    const submitButton = await page.$('button[type="submit"]')
    // Two rapid clicks: the second should be a no-op because the button disables on submit.
    await Promise.all([submitButton!.click(), submitButton!.click()])
    await new Promise((r) => setTimeout(r, 500))
    expect(apiCallCount).toBe(1)
    const leadsAfterSuccess = await page.evaluate(() => (window.dataLayer ?? []).filter((entry) => Array.isArray(entry) && entry[0] === 'event' && entry[1] === 'generate_lead').length)
    expect(leadsAfterSuccess).toBe(1)
    await page.close()
  }, 20000)

  it('never sends analytics in a `vite dev` server, even with GA_MEASUREMENT_ID and consent granted', async () => {
    const { page, gaRequests } = await newPageTrackingGaRequests()
    await page.goto(DEV_BASE, { waitUntil: 'networkidle0' })
    const acceptButton = await page.$('[data-choice="accept"]')
    if (acceptButton) await acceptButton.click()
    await new Promise((r) => setTimeout(r, 500))
    expect(gaRequests).toHaveLength(0)
    await page.close()
  })
})

async function fillWorkingSessionForm(page: import('puppeteer-core').Page) {
  await page.type('#wsq-name', 'Test User')
  await page.type('#wsq-email', 'test@example.com')
  await page.type('#wsq-company', 'Test Co')
  await page.type('#wsq-process', 'Automate something')
  await page.click('#wsq-privacy')
}

async function fillAndSubmitWorkingSession(page: import('puppeteer-core').Page) {
  await fillWorkingSessionForm(page)
  await page.click('button[type="submit"]')
}
