// Persistence for the Technical Review workspace's answers. Uses Node's
// built-in node:sqlite (no native build step, unlike better-sqlite3 - matters
// on the node:22-alpine production image) writing to a file on the Fly
// Volume mounted at DATA_DIR, so answers survive deploys and restarts. See
// fly.toml for the volume mount and README/LEGAL_INFORMATION_REQUIRED-style
// docs is not needed here; this is an internal tool.
import { DatabaseSync } from 'node:sqlite'
import path from 'node:path'
import { mkdirSync } from 'node:fs'

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), '.data')
mkdirSync(dataDir, { recursive: true })
const dbPath = path.join(dataDir, 'technical-review.db')

const db = new DatabaseSync(dbPath)
db.exec(`
  CREATE TABLE IF NOT EXISTS review_answers (
    question_id TEXT PRIMARY KEY,
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`)

export function getAllAnswers() {
  const rows = db.prepare('SELECT question_id, state_json FROM review_answers').all()
  const answers = {}
  for (const row of rows) {
    try {
      answers[row.question_id] = JSON.parse(row.state_json)
    } catch {
      // A corrupted row should not take down the whole workspace; skip it.
    }
  }
  return answers
}

const upsertStmt = db.prepare(`
  INSERT INTO review_answers (question_id, state_json, updated_at)
  VALUES (?, ?, ?)
  ON CONFLICT(question_id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
`)

export function upsertAnswer(questionId, state) {
  upsertStmt.run(questionId, JSON.stringify(state), new Date().toISOString())
}

export function replaceAllAnswers(answerMap) {
  db.exec('BEGIN')
  try {
    db.exec('DELETE FROM review_answers')
    const now = new Date().toISOString()
    for (const [questionId, state] of Object.entries(answerMap)) {
      upsertStmt.run(questionId, JSON.stringify(state), now)
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function clearAllAnswers() {
  db.exec('DELETE FROM review_answers')
}
