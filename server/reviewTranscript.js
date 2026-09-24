// Turns an uploaded call transcript into draft answers for the Technical
// Review workspace, using the OpenAI API. This only ever produces a DRAFT:
// it writes into the same `answer` / `status` / `evidence` /
// `capabilityStatus` fields a person would type by hand, and never sets
// `classification` (Public / Customer-only / Confidential) - that stays a
// human judgement call, same as everywhere else in this review. See
// config/technicalContent.mjs for the question list sent to the model, and
// src/data/technicalContent.ts for the shared type this mirrors.
import { technicalContent, STATUS_OPTIONS, CAPABILITY_STATUS_OPTIONS } from '../config/technicalContent.mjs'

const MAX_TRANSCRIPT_CHARS = 200_000

const SYSTEM_PROMPT = `You are helping process a transcript of a call between Harba's team and their technical architect, part of a structured internal technical review.

You will be given a fixed list of review questions (id, section, question, why it matters, and any already-known information) and the transcript text.

For each question that the transcript actually addresses, extract a draft answer. Only use what is explicitly stated or very clearly implied in the transcript - never invent, assume, or fill in plausible-sounding detail that was not actually said. If the transcript does not address a question at all, leave it out of your response entirely.

For each question you include, return:
- id: the question's id, copied exactly
- answer: a clear, well-written summary of what was said, in complete sentences. You may include short quoted phrases from the transcript for precision.
- status: "Answered" if the transcript clearly and fully addresses the question, "Partially answered" if it only partly covers it, or "Needs verification" if it was mentioned but the answer is unclear, hedged, or contradictory.
- capabilityStatus: one of Live, Configurable, Planned, Deprecated, Unknown - only include this field if the transcript indicates which one applies, otherwise omit it.
- evidence: a short pointer to where in the call this came from (e.g. "Discussed when covering Pipeline retries").

Respond with a JSON object of the exact shape { "results": [ { "id": "...", "answer": "...", "status": "...", "capabilityStatus": "...", "evidence": "..." }, ... ] }. Do not include any other text.`

function buildQuestionManifest() {
  return technicalContent.map(({ id, section, question, whyItMatters, knownInformation }) => ({
    id,
    section,
    question,
    whyItMatters,
    knownInformation: knownInformation || undefined,
  }))
}

export class TranscriptTooLargeError extends Error {}
export class TranscriptExtractionError extends Error {}
export class TranscriptNotConfiguredError extends Error {}

/**
 * Calls the OpenAI API to extract draft answers from a transcript.
 * Returns an array of { id, answer, status, capabilityStatus?, evidence } -
 * already validated against the real question ids and enum values, with
 * anything that doesn't validate dropped rather than trusted blindly.
 */
export async function extractAnswersFromTranscript(transcript) {
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    throw new TranscriptTooLargeError(
      `That transcript is too long (${transcript.length.toLocaleString()} characters, limit ${MAX_TRANSCRIPT_CHARS.toLocaleString()}). Try splitting it and uploading in parts.`,
    )
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    console.error('[review] OPENAI_API_KEY is not set. Transcript import is disabled until it is.')
    throw new TranscriptNotConfiguredError('Transcript import is not configured yet.')
  }
  const model = process.env.OPENAI_MODEL || 'gpt-4.1'

  const userContent = JSON.stringify({ questions: buildQuestionManifest(), transcript })

  let response
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
    })
  } catch (error) {
    throw new TranscriptExtractionError(`Could not reach the OpenAI API: ${error.message}`)
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new TranscriptExtractionError(`OpenAI API request failed (${response.status}): ${detail.slice(0, 500)}`)
  }

  const payload = await response.json()
  const content = payload?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new TranscriptExtractionError('OpenAI API returned an unexpected response shape.')
  }

  let parsed
  try {
    parsed = JSON.parse(content)
  } catch {
    throw new TranscriptExtractionError('OpenAI API did not return valid JSON.')
  }

  const results = Array.isArray(parsed?.results) ? parsed.results : []
  const validIds = new Set(technicalContent.map((item) => item.id))
  const validStatuses = new Set(STATUS_OPTIONS)
  const validCapabilityStatuses = new Set(CAPABILITY_STATUS_OPTIONS)

  const cleaned = []
  for (const entry of results) {
    if (!entry || typeof entry !== 'object') continue
    if (typeof entry.id !== 'string' || !validIds.has(entry.id)) continue
    if (typeof entry.answer !== 'string' || !entry.answer.trim()) continue
    const status = validStatuses.has(entry.status) ? entry.status : 'Needs verification'
    const capabilityStatus = validCapabilityStatuses.has(entry.capabilityStatus) ? entry.capabilityStatus : undefined
    const evidence = typeof entry.evidence === 'string' ? entry.evidence : ''
    cleaned.push({ id: entry.id, answer: entry.answer.trim(), status, capabilityStatus, evidence })
  }
  return cleaned
}
