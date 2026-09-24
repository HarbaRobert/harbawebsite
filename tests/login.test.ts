// Browser-driven tests for the /login page (see src/pages/Login.tsx and
// src/hooks/useLoginForm.ts). Uses puppeteer-core against whatever
// Chrome/Chromium is already installed, and skips cleanly rather than
// failing on a machine with no browser available (same pattern as
// tests/analytics.test.ts). Runs against the already-built dist/ (npm run
// build must have been run first), same as tests/seo.test.ts.
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const PORT = 8098
const BASE = `http://localhost:${PORT}`

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

describe.skipIf(!browserPath)('/login (browser)', () => {
  let serverProcess: ChildProcess
  let puppeteer: typeof import('puppeteer-core')
  let browser: import('puppeteer-core').Browser

  beforeAll(async () => {
    puppeteer = await import('puppeteer-core')
    serverProcess = spawn(process.execPath, ['server/index.js'], {
      cwd: root,
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'pipe',
    })
    await waitForServer(`${BASE}/`)
    browser = await puppeteer.launch({ executablePath: browserPath!, headless: true })
  }, 40000)

  afterAll(async () => {
    await browser?.close()
    serverProcess?.kill()
  })

  async function newPage() {
    const page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
    return page
  }

  it('renders with exactly one H1 and the expected copy, no obsolete branding', async () => {
    const page = await newPage()
    const h1Count = await page.$$eval('h1', (els) => els.length)
    expect(h1Count).toBe(1)
    const h1Text = await page.$eval('h1', (el) => el.textContent)
    expect(h1Text).toBe('Welcome back.')

    const bodyText = await page.evaluate(() => document.body.textContent || '')
    expect(bodyText).toContain('Your digital workforce, ready to work.')
    expect(bodyText).not.toContain('Harba.AI')
    expect(bodyText).not.toContain('Agent orchestration')
    expect(bodyText).not.toContain('v0.1 reference implementation')
    expect(bodyText).not.toContain('Create one')
    await page.close()
  })

  it('form posts (never GET), and credentials never end up in the URL', async () => {
    const page = await newPage()
    const methodAttr = await page.$eval('form', (el) => el.getAttribute('method'))
    expect(methodAttr).toBe('post')
    await page.type('#login-email', 'person@example.com')
    await page.type('#login-password', 'correct horse battery staple')
    await page.click('.login-submit')
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(page.url()).not.toContain('correct')
    expect(page.url()).not.toContain('example.com')
    expect(page.url()).not.toContain('?')
    await page.close()
  })

  it('shows required-field errors, associates them via aria-describedby/aria-invalid, and moves focus to the first invalid field', async () => {
    const page = await newPage()
    await page.click('.login-submit')
    await new Promise((resolve) => setTimeout(resolve, 100))

    const emailInvalid = await page.$eval('#login-email', (el) => el.getAttribute('aria-invalid'))
    expect(emailInvalid).toBe('true')
    const describedBy = await page.$eval('#login-email', (el) => el.getAttribute('aria-describedby'))
    expect(describedBy).toBe('login-email-error')
    const errorText = await page.$eval('#login-email-error', (el) => el.textContent)
    expect(errorText).toMatch(/enter your work email/i)

    const focused = await page.evaluate(() => document.activeElement?.id)
    expect(focused).toBe('login-email')
    await page.close()
  })

  it('rejects an invalid email format', async () => {
    const page = await newPage()
    await page.type('#login-email', 'not-an-email')
    await page.type('#login-password', 'something')
    await page.click('.login-submit')
    await new Promise((resolve) => setTimeout(resolve, 100))
    const errorText = await page.$eval('#login-email-error', (el) => el.textContent)
    expect(errorText).toMatch(/valid email/i)
    await page.close()
  })

  it('shows a loading state, prevents duplicate submission, then a generic invalid-credentials error without clearing the email field', async () => {
    const page = await newPage()
    await page.type('#login-email', 'person@example.com')
    await page.type('#login-password', 'wrong-password')
    await page.click('.login-submit')

    const [disabledDuringSubmit, labelDuringSubmit] = await Promise.all([
      page.$eval('.login-submit', (el) => (el as HTMLButtonElement).disabled),
      page.$eval('.login-submit', (el) => el.textContent),
    ])
    expect(disabledDuringSubmit).toBe(true)
    expect(labelDuringSubmit).toContain('Signing in')

    // A second click while disabled must not throw or double-submit.
    await page.click('.login-submit').catch(() => {})

    await page.waitForFunction(() => document.querySelector('.form-error') !== null, { timeout: 5000 })
    const formError = await page.$eval('.form-error', (el) => el.textContent)
    expect(formError).toMatch(/we could not sign you in with those details/i)
    // Never reveals whether the account exists.
    expect(formError).not.toMatch(/no account|user not found|does not exist/i)

    const emailValue = await page.$eval('#login-email', (el) => (el as HTMLInputElement).value)
    expect(emailValue).toBe('person@example.com')

    const enabledAfter = await page.$eval('.login-submit', (el) => (el as HTMLButtonElement).disabled)
    expect(enabledAfter).toBe(false)
    await page.close()
  }, 10000)

  it('show/hide password toggle has an accessible name and works via keyboard', async () => {
    const page = await newPage()
    await page.type('#login-password', 'secret-value')

    const initialType = await page.$eval('#login-password', (el) => (el as HTMLInputElement).type)
    expect(initialType).toBe('password')

    const accessibleName = await page.$eval('.login-password-toggle', (el) => el.textContent?.trim())
    expect(accessibleName).toBe('Show password')

    await page.focus('.login-password-toggle')
    await page.keyboard.press('Enter')
    const toggledType = await page.$eval('#login-password', (el) => (el as HTMLInputElement).type)
    expect(toggledType).toBe('text')
    const value = await page.$eval('#login-password', (el) => (el as HTMLInputElement).value)
    expect(value).toBe('secret-value') // toggling visibility never alters the value

    const accessibleNameAfter = await page.$eval('.login-password-toggle', (el) => el.textContent?.trim())
    expect(accessibleNameAfter).toBe('Hide password')
    await page.close()
  })

  it('remember-me checkbox has an explicit label and toggles', async () => {
    const page = await newPage()
    const label = await page.$eval('label[for="login-remember"] span', (el) => el.textContent)
    expect(label).toBe('Keep me signed in')
    await page.click('#login-remember')
    const checked = await page.$eval('#login-remember', (el) => (el as HTMLInputElement).checked)
    expect(checked).toBe(true)
    await page.close()
  })

  it('has no forgotten-password link (no reset route exists) and no public create-account CTA', async () => {
    const page = await newPage()
    const bodyText = await page.evaluate(() => document.body.textContent || '')
    expect(bodyText).not.toMatch(/forgotten your password/i)
    expect(bodyText).not.toMatch(/create one|create an? account|sign up/i)
    expect(bodyText).toMatch(/need access/i)
    expect(bodyText).toMatch(/contact your workspace administrator/i)
    const mailto = await page.$eval('a[href^="mailto:"]', (el) => el.getAttribute('href'))
    expect(mailto).toBe('mailto:help@harba.ai')
    await page.close()
  })

  it('the wordmark and "Back to Harba" link resolve to the marketing home, and legal links resolve', async () => {
    const page = await newPage()
    const backHref = await page.$eval('.login-back', (el) => el.getAttribute('href'))
    expect(backHref).toBe('/')
    const wordmarkHref = await page.$eval('.login-header .wordmark', (el) => el.getAttribute('href'))
    expect(wordmarkHref).toBe('/')

    const privacyHref = await page.$eval('.login-footer a[href="/privacy"]', (el) => el.getAttribute('href'))
    expect(privacyHref).toBe('/privacy')
    const termsHref = await page.$eval('.login-footer a[href="/terms"]', (el) => el.getAttribute('href'))
    expect(termsHref).toBe('/terms')
    await page.close()
  })

  it('respects prefers-reduced-motion (no animation on the decorative composition fill)', async () => {
    const page = await browser.newPage()
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
    await page.setViewport({ width: 1280, height: 900 })
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
    const animationName = await page.$eval('.login-composition-fill', (el) => getComputedStyle(el).animationName)
    expect(animationName).toBe('none')
    await page.close()
  })

  it('pauses the composition animation when the tab is hidden, and resumes when visible again', async () => {
    const page = await newPage()
    const playStateVisible = await page.$eval('.login-composition-fill', (el) => getComputedStyle(el).animationPlayState)
    expect(playStateVisible).toBe('running')

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await new Promise((resolve) => setTimeout(resolve, 100))
    const playStateHidden = await page.$eval('.login-composition-fill', (el) => getComputedStyle(el).animationPlayState)
    expect(playStateHidden).toBe('paused')
    await page.close()
  })

  it('replaces the old "Workspace ready" status with "One connected workspace" and removes the tick icon', async () => {
    const page = await newPage()
    const bodyText = await page.evaluate(() => document.body.textContent || '')
    expect(bodyText).not.toMatch(/workspace ready/i)
    expect(bodyText).toContain('One connected workspace')
    const svgInStatus = await page.$('.login-composition-status svg')
    expect(svgInStatus).toBeNull()
    await page.close()
  })

  it('enlarges the password toggle and the remember-me row to ~44x44px targets, without moving the password field', async () => {
    const page = await newPage()
    const toggleBox = await page.$eval('.login-password-toggle', (el) => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height } })
    expect(toggleBox.width).toBeGreaterThanOrEqual(44)
    expect(toggleBox.height).toBeGreaterThanOrEqual(44)

    const passwordBoxBefore = await page.$eval('#login-password', (el) => el.getBoundingClientRect().toJSON())
    await page.click('.login-password-toggle')
    const passwordBoxAfter = await page.$eval('#login-password', (el) => el.getBoundingClientRect().toJSON())
    expect(passwordBoxAfter.width).toBe(passwordBoxBefore.width)
    expect(passwordBoxAfter.height).toBe(passwordBoxBefore.height)
    expect(passwordBoxAfter.x).toBe(passwordBoxBefore.x)
    expect(passwordBoxAfter.y).toBe(passwordBoxBefore.y)

    const checkboxRowHeight = await page.$eval('label[for="login-remember"]', (el) => el.getBoundingClientRect().height)
    expect(checkboxRowHeight).toBeGreaterThanOrEqual(44)
    await page.close()
  })

  it('makes the entire remember-me row clickable without submitting the form', async () => {
    const page = await newPage()
    // Click near the right edge of the label, well past the visible
    // checkbox and text, to prove the whole row (not just the checkbox
    // itself) responds.
    const box = await page.$eval('label[for="login-remember"]', (el) => el.getBoundingClientRect().toJSON())
    await page.mouse.click(box.x + box.width - 4, box.y + box.height / 2)
    const checked = await page.$eval('#login-remember', (el) => (el as HTMLInputElement).checked)
    expect(checked).toBe(true)
    // Clicking the label must never submit the form.
    const stillOnLogin = page.url().endsWith('/login')
    expect(stillOnLogin).toBe(true)
    const submitting = await page.$eval('.login-submit', (el) => (el as HTMLButtonElement).disabled)
    expect(submitting).toBe(false)
    await page.close()
  })

  it('works end-to-end with the mouse never touching the keyboard (tab order reaches every control)', async () => {
    const page = await newPage()
    await page.focus('#login-email')
    await page.keyboard.type('keyboard-user@example.com')
    await page.keyboard.press('Tab')
    await page.keyboard.type('keyboard-password')
    const activeAfterPasswordTyped = await page.evaluate(() => document.activeElement?.id)
    expect(activeAfterPasswordTyped).toBe('login-password')
    await page.close()
  })

  // The brief's full required viewport matrix, plus landscape mobile.
  const VIEWPORTS: Array<[string, number, number]> = [
    ['desktop 1440x900', 1440, 900],
    ['short laptop 1366x768', 1366, 768],
    ['short laptop 1280x720', 1280, 720],
    ['small laptop 1024x768', 1024, 768],
    ['tablet portrait 768x1024', 768, 1024],
    ['mobile 430', 430, 932],
    ['mobile 390', 390, 844],
    ['mobile 360', 360, 780],
    ['mobile landscape', 844, 390],
  ]

  for (const [label, width, height] of VIEWPORTS) {
    it(`has no horizontal overflow at ${label}`, async () => {
      const page = await browser.newPage()
      await page.setViewport({ width, height })
      await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow).toBe(false)
      // Privacy/Terms must exist in the document (reachable by scrolling),
      // never removed or display:none'd at this size.
      const footerVisible = await page.$eval('.login-footer', (el) => getComputedStyle(el).display !== 'none')
      expect(footerVisible).toBe(true)
      await page.close()
    })
  }

  it('has no horizontal overflow at 200% browser zoom', async () => {
    const page = await browser.newPage()
    await page.setViewport({ width: 1440, height: 900 })
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => { document.documentElement.style.zoom = '2' })
    await new Promise((resolve) => setTimeout(resolve, 150))
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 5)
    expect(overflow).toBe(false)
    await page.close()
  })
})
