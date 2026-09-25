// Browser-driven tests for the /forgot-password page (see
// src/pages/ForgotPassword.tsx and src/hooks/useForgotPasswordForm.ts).
// Uses puppeteer-core against whatever Chrome/Chromium is already
// installed, and skips cleanly rather than failing on a machine with no
// browser available (same pattern as tests/login.test.ts). Runs against
// the already-built dist/ (npm run build must have been run first).
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { spawn, type ChildProcess } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const PORT = 8099
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

describe.skipIf(!browserPath)('/forgot-password (browser)', () => {
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
    await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle0' })
    return page
  }

  it('renders with exactly one H1 and the expected copy', async () => {
    const page = await newPage()
    const h1Count = await page.$$eval('h1', (els) => els.length)
    expect(h1Count).toBe(1)
    const h1Text = await page.$eval('h1', (el) => el.textContent)
    expect(h1Text).toBe('Reset your password.')
    const bodyText = await page.evaluate(() => document.body.textContent || '')
    expect(bodyText).toContain('PASSWORD HELP')
    expect(bodyText).toMatch(/we.ll send instructions if an eligible account is found/i)
    await page.close()
  })

  it('form posts (never GET), and the address never ends up in the URL', async () => {
    const page = await newPage()
    const methodAttr = await page.$eval('form', (el) => el.getAttribute('method'))
    expect(methodAttr).toBe('post')
    await page.type('#forgot-email', 'person@example.com')
    await page.click('.login-submit')
    await new Promise((resolve) => setTimeout(resolve, 200))
    expect(page.url()).not.toContain('example.com')
    expect(page.url()).not.toContain('?')
    await page.close()
  })

  it('requires an email address and rejects an invalid format, with the error associated to the field', async () => {
    const page = await newPage()
    await page.click('.login-submit')
    await new Promise((resolve) => setTimeout(resolve, 100))
    const invalid = await page.$eval('#forgot-email', (el) => el.getAttribute('aria-invalid'))
    expect(invalid).toBe('true')
    const describedBy = await page.$eval('#forgot-email', (el) => el.getAttribute('aria-describedby'))
    expect(describedBy).toBe('forgot-email-error')
    let errorText = await page.$eval('#forgot-email-error', (el) => el.textContent)
    expect(errorText).toMatch(/enter your work email/i)
    const focused = await page.evaluate(() => document.activeElement?.id)
    expect(focused).toBe('forgot-email')

    await page.type('#forgot-email', 'not-an-email')
    await page.click('.login-submit')
    await new Promise((resolve) => setTimeout(resolve, 100))
    errorText = await page.$eval('#forgot-email-error', (el) => el.textContent)
    expect(errorText).toMatch(/valid email/i)
    await page.close()
  })

  it('shows a loading state, prevents duplicate submission, then the generic response, never revealing whether the account exists', async () => {
    const page = await newPage()
    await page.type('#forgot-email', 'person@example.com')
    await page.click('.login-submit')

    const [disabledDuringSubmit, labelDuringSubmit] = await Promise.all([
      page.$eval('.login-submit', (el) => (el as HTMLButtonElement).disabled),
      page.$eval('.login-submit', (el) => el.textContent),
    ])
    expect(disabledDuringSubmit).toBe(true)
    expect(labelDuringSubmit).toContain('Sending')

    await page.waitForFunction(() => document.querySelector('.login-reset-sent') !== null, { timeout: 5000 })
    const sentText = await page.$eval('.login-reset-sent', (el) => el.textContent)
    expect(sentText).toMatch(/if an eligible account exists for that email address, reset instructions have been sent/i)
    expect(sentText).not.toMatch(/no account|user not found|does not exist|we found your account/i)

    // The form itself is replaced by the confirmation, so a second submit is not possible.
    const formStillPresent = await page.$('form')
    expect(formStillPresent).toBeNull()
    await page.close()
  }, 10000)

  it('links back to /login, and to the marketing home and legal pages, same as /login', async () => {
    const page = await newPage()
    const backToSignIn = await page.$eval('.login-access-help a', (el) => el.getAttribute('href'))
    expect(backToSignIn).toBe('/login')

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

  it('has no horizontal overflow at desktop, tablet and mobile widths', async () => {
    for (const [width, height] of [[1440, 900], [800, 1000], [390, 844]] as const) {
      const page = await browser.newPage()
      await page.setViewport({ width, height })
      await page.goto(`${BASE}/forgot-password`, { waitUntil: 'networkidle0' })
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
      expect(overflow).toBe(false)
      await page.close()
    }
  })
})
