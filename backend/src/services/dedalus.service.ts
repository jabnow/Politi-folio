/**
 * Dedalus Labs - Layer 2: Extraction + normalization
 * Turns news into structured risk events. Uses chat completions API.
 */
import type { DedalusEvent } from '../types/workflow.types.js'

const DEDALUS_BASE = process.env.DEDALUS_API_URL ?? 'https://api.dedaluslabs.ai'
/** Max chars to avoid token limit / payload issues */
const MAX_INPUT_CHARS = 8000

function getApiKey(): string {
  const key = process.env.DEDALUS_API_KEY
  if (!key) throw new Error('DEDALUS_API_KEY is required')
  return key
}

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  }
  const project = process.env.DEDALUS_PROJECT
  if (project) headers['X-Dedalus-Project'] = project
  return headers
}

export async function analyzeNews(text: string): Promise<DedalusEvent | null> {
  getApiKey() // ensure key is set before making request
  const truncated = text.length > MAX_INPUT_CHARS ? text.slice(0, MAX_INPUT_CHARS) + '...[truncated]' : text
  const systemPrompt = `You are a geopolitical risk analyst. Extract structured risk events from news. Respond ONLY with valid JSON matching this schema:
{
  "event_type": "string (e.g. Trade Restriction, Sanctions, Conflict)",
  "affected_countries": ["ISO codes"],
  "affected_industries": ["industry names"],
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summary": "one sentence"
}`

  const res = await fetch(`${DEDALUS_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: process.env.DEDALUS_MODEL ?? 'anthropic/claude-3-5-sonnet',
      messages: [{ role: 'user', content: truncated }],
      system: systemPrompt,
      max_tokens: 512,
      temperature: 0,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    // 5xx = server-side; return null so workflow continues with fallbacks
    if (res.status >= 500) {
      console.warn(`[Dedalus] ${res.status} ${err}`)
      return null
    }
    throw new Error(`Dedalus API error: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) return null

  try {
    const parsed = JSON.parse(content.trim()) as DedalusEvent
    return {
      event_type: parsed.event_type ?? 'Unknown',
      affected_countries: Array.isArray(parsed.affected_countries) ? parsed.affected_countries : [],
      affected_industries: Array.isArray(parsed.affected_industries) ? parsed.affected_industries : [],
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.severity) ? parsed.severity : 'MEDIUM',
      summary: parsed.summary,
    }
  } catch {
    return null
  }
}
