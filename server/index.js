import express from 'express'
import nodemailer from 'nodemailer'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DRAFT_ROUTES, PUBLIC_ROUTES, getIndexableRoutes, getSiteUrl } from '../config/siteConfig.mjs'
import { defaultAnswerState } from '../config/technicalContent.mjs'
import { getAllAnswers, upsertAnswer, replaceAllAnswers, clearAllAnswers } from './db.js'
import { reviewAuth } from './reviewAuth.js'
import {
  extractAnswersFromTranscript,
  TranscriptTooLargeError,
  TranscriptExtractionError,
  TranscriptNotConfiguredError,
} from './reviewTranscript.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Overridable so tests can point a server instance at an isolated,
// separately-built dist directory. Unset in normal use and in production.
const distDir = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.join(__dirname, '..', 'dist')

const app = express()
app.disable('x-powered-by')

function routeFile(routePath) {
  return routePath === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, routePath.replace(/^\//, ''), 'index.html')
}

// Explicit handlers for every known route, each serving its own prerendered
// file with no trailing-slash redirect, so the served URL always matches its
// canonical exactly. See scripts/prerender.mjs for how these files are built.
for (const route of [...PUBLIC_ROUTES, ...DRAFT_ROUTES]) {
  const filePath = routeFile(route.path)
  app.get(route.path, (_req, res) => {
    if (!existsSync(filePath)) {
      console.error(`[server] Missing prerendered file for ${route.path}: ${filePath}. Run "npm run build".`)
      return res.status(500).send('Site is not built correctly. Run "npm run build".')
    }
    res.sendFile(filePath)
  })
}

// Genuine, permanent redirect for the old /trust address (renamed to
// /governance). A real 301 rather than a client-side route change, so
// search engines and old bookmarks/backlinks are pointed at the one
// canonical page instead of leaving two indexable copies. Query strings are
// preserved; there is no further hop after this one.
app.get('/trust', (req, res) => {
  const queryIndex = req.url.indexOf('?')
  const query = queryIndex === -1 ? '' : req.url.slice(queryIndex)
  res.redirect(301, `/governance${query}`)
})

app.get('/robots.txt', (_req, res) => {
  const siteUrl = getSiteUrl()
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Allow: /',
      '',
      'User-agent: OAI-SearchBot',
      'Allow: /',
      '',
      `Sitemap: ${siteUrl}/sitemap.xml`,
      '',
    ].join('\n'),
  )
})

app.get('/sitemap.xml', (_req, res) => {
  const siteUrl = getSiteUrl()
  // Only currently-indexable routes: an incomplete legal page (see
  // config/legalConfig.mjs) is noindex and is correctly left out of the
  // sitemap entirely, rather than listed and marked noindex.
  const urls = getIndexableRoutes().map((route) => {
    const loc = route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`
    return `  <url><loc>${loc}</loc></url>`
  }).join('\n')
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
})

// Technical Review workspace API - see server/db.js, server/reviewAuth.js and
// server/reviewTranscript.js. A larger body limit than the working-session
// form's, since this accepts full call transcripts; still bounded, and
// gated behind reviewAuth rather than open to the public internet.
const reviewJson = express.json({ limit: '2mb' })

app.get('/api/review/answers', reviewAuth, (_req, res) => {
  res.json({ ok: true, answers: getAllAnswers() })
})

app.put('/api/review/answers', reviewAuth, reviewJson, (req, res) => {
  const answers = req.body?.answers
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) {
    return res.status(400).json({ ok: false, message: 'Expected a JSON body of the form { "answers": { ... } }.' })
  }
  replaceAllAnswers(answers)
  res.json({ ok: true, answers: getAllAnswers() })
})

app.patch('/api/review/answers/:id', reviewAuth, reviewJson, (req, res) => {
  const patch = req.body
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return res.status(400).json({ ok: false, message: 'Expected a JSON body containing the fields to update.' })
  }
  const current = getAllAnswers()[req.params.id] ?? defaultAnswerState()
  const next = { ...current, ...patch }
  upsertAnswer(req.params.id, next)
  res.json({ ok: true, state: next })
})

app.delete('/api/review/answers', reviewAuth, (_req, res) => {
  clearAllAnswers()
  res.json({ ok: true })
})

app.post('/api/review/transcript', reviewAuth, reviewJson, async (req, res) => {
  const transcript = req.body?.transcript
  if (typeof transcript !== 'string' || !transcript.trim()) {
    return res.status(400).json({ ok: false, message: 'Expected a JSON body of the form { "transcript": "..." }.' })
  }

  let extracted
  try {
    extracted = await extractAnswersFromTranscript(transcript)
  } catch (error) {
    if (error instanceof TranscriptTooLargeError) {
      return res.status(413).json({ ok: false, message: error.message })
    }
    if (error instanceof TranscriptNotConfiguredError) {
      return res.status(503).json({ ok: false, message: error.message })
    }
    if (error instanceof TranscriptExtractionError) {
      console.error('[review] Transcript extraction failed:', error.message)
      return res.status(502).json({ ok: false, message: error.message })
    }
    console.error('[review] Unexpected error extracting transcript:', error)
    return res.status(500).json({ ok: false, message: 'Something went wrong processing that transcript.' })
  }

  const existing = getAllAnswers()
  const updatedIds = []
  const importedAt = new Date().toLocaleString('en-GB')

  for (const result of extracted) {
    const current = existing[result.id] ?? defaultAnswerState()
    const evidenceLine = result.evidence ? `Transcript (${importedAt}): ${result.evidence}` : `Transcript (${importedAt}).`

    let next
    if (!current.answer.trim()) {
      // No human-written answer yet: the extracted draft becomes the answer.
      next = {
        ...current,
        answer: result.answer,
        status: result.status,
        capabilityStatus: result.capabilityStatus ?? current.capabilityStatus,
        evidence: [current.evidence, evidenceLine].filter(Boolean).join('\n'),
      }
    } else {
      // Never overwrite something a person already wrote - append the
      // transcript's version underneath instead, and leave status/capability
      // as the human set them.
      next = {
        ...current,
        answer: `${current.answer}\n\n[From transcript, ${importedAt}]\n${result.answer}`,
        evidence: [current.evidence, evidenceLine].filter(Boolean).join('\n'),
      }
    }
    upsertAnswer(result.id, next)
    updatedIds.push(result.id)
  }

  res.json({ ok: true, updated: updatedIds, answers: getAllAnswers() })
})

app.use(express.static(distDir, { index: false, maxAge: '1y', immutable: true }))

const REQUIRED_FIELDS = ['name', 'email', 'company', 'process']
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
}

// Very small in-memory rate limit: at most 5 submissions per IP per 10 minutes.
const submissionLog = new Map()
function isRateLimited(ip) {
  const now = Date.now()
  const windowMs = 10 * 60 * 1000
  const timestamps = (submissionLog.get(ip) ?? []).filter((t) => now - t < windowMs)
  timestamps.push(now)
  submissionLog.set(ip, timestamps)
  return timestamps.length > 5
}

app.post('/api/working-session', express.json({ limit: '20kb' }), async (req, res) => {
  const body = req.body ?? {}

  // Honeypot: a field real visitors never see or fill in. Bots that fill every field trip this.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.json({ ok: true })
  }

  if (isRateLimited(req.ip)) {
    return res.status(429).json({ ok: false, message: 'Too many requests. Please try again shortly.' })
  }

  const errors = {}
  for (const field of REQUIRED_FIELDS) {
    if (!String(body[field] ?? '').trim()) errors[field] = 'This field is required.'
  }
  if (body.email && !isValidEmail(String(body.email))) errors.email = 'Enter a valid email address.'
  if (!body.privacy) errors.privacy = 'Please confirm you have read the privacy policy.'

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ ok: false, errors })
  }

  const transport = getTransport()
  if (!transport) {
    console.error('[working-session] SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.')
    return res.status(503).json({ ok: false, message: 'Email is not configured yet. Please try again later.' })
  }

  const to = process.env.WORKING_SESSION_TO || 'rob@harba.ai'
  const from = process.env.MAIL_FROM || process.env.SMTP_USER

  const ENQUIRY_TYPE_LABELS = {
    'developer-access': 'Developer access',
    technical: 'Technical discussion',
    demo: 'Demo request',
  }
  const enquiryLabel = ENQUIRY_TYPE_LABELS[body.topic] || (body.topic ? body.topic : '-')

  const text = [
    `Name: ${body.name}`,
    `Work email: ${body.email}`,
    `Company: ${body.company}`,
    `Role: ${body.role || '-'}`,
    `Phone: ${body.phone || '-'}`,
    `Enquiry type: ${enquiryLabel}`,
    '',
    'What part of your business would you like to improve?',
    body.process,
    '',
    'Which systems or platforms are involved?',
    body.systems || '-',
  ].join('\n')

  try {
    await transport.sendMail({
      to,
      from,
      replyTo: body.email,
      subject: ENQUIRY_TYPE_LABELS[body.topic]
        ? `${ENQUIRY_TYPE_LABELS[body.topic]} enquiry from ${body.company}`
        : `Working session enquiry from ${body.company}`,
      text,
    })
    return res.json({ ok: true })
  } catch (error) {
    console.error('[working-session] Failed to send email:', error)
    return res.status(502).json({ ok: false, message: 'Could not send your enquiry. Please try again or email rob@harba.ai directly.' })
  }
})

// Anything else is a genuine 404: real branded page, real HTTP status.
const notFoundFile = path.join(distDir, '404', 'index.html')
app.use((_req, res) => {
  if (existsSync(notFoundFile)) return res.status(404).sendFile(notFoundFile)
  res.status(404).send('Not found')
})

const port = process.env.PORT || 8080
// Bind explicitly to 0.0.0.0: on Alpine's musl libc, Node's default listen()
// binding is not reliably reachable by Fly's IPv4 proxy (seen as a real
// "not listening on the expected address" warning during deploy).
app.listen(port, '0.0.0.0', () => {
  console.log(`Harba server listening on port ${port}`)
})
