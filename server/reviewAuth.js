// Gates the /api/review/* endpoints behind a single shared secret. The
// Technical Review workspace holds confidential company answers and, unlike
// the old browser-only localStorage version, is now backed by a writable
// network API - so it needs at least a basic access check, not just
// obscurity. This is intentionally simple (one shared token, no per-user
// accounts): the workspace is used by a couple of people internally.
export function reviewAuth(req, res, next) {
  const token = process.env.REVIEW_ACCESS_TOKEN
  if (!token) {
    console.error('[review] REVIEW_ACCESS_TOKEN is not set. The Technical Review workspace API is disabled until it is.')
    return res.status(503).json({ ok: false, message: 'The Technical Review workspace is not configured yet.' })
  }
  const header = req.get('authorization') || ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : null
  if (provided !== token) {
    return res.status(401).json({ ok: false, message: 'Incorrect access code.' })
  }
  next()
}
