/**
 * Dedalus Web Search - MCP brave-search for live political/geopolitical events.
 * Second alternative when World News API is unavailable; default fallback is fake data.
 * @see https://docs.dedaluslabs.ai/sdk/quickstart
 *
 * Requires: DEDALUS_API_KEY, DEDALUS_API_URL (optional)
 */
import type { GeopoliticalEvent } from '../mocks/events.mock.js'

const DEDALUS_BASE = process.env.DEDALUS_API_URL ?? 'https://api.dedaluslabs.ai'

const SYSTEM_PROMPT = `You are a geopolitical risk analyst. Use the web search tool to find the latest political and geopolitical news from the past 1-2 days.

Return ONLY a valid JSON array of 5-8 events. Each event must match this schema:
{
  "title": "string",
  "description": "string (1-2 sentences)",
  "type": "sanctions" | "trade" | "policy" | "regulation" | "political" | "compliance",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "country": "string (e.g. USA, China, EU, Taiwan)",
  "source": "string (news outlet or agency)",
  "timestamp": "YYYY-MM-DD HH:MM:SS"
}

Focus on: tariffs, sanctions, elections, semiconductor/chip policy, trade disputes, central bank decisions, regulatory changes.`

/**
 * Fetch live political events via Dedalus MCP web search (brave-search).
 * Returns [] if key missing or API fails.
 */
export async function fetchPoliticalEventsViaWebSearch(): Promise<GeopoliticalEvent[]> {
  const key = process.env.DEDALUS_API_KEY
  if (!key) return []

  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  const project = process.env.DEDALUS_PROJECT
  if (project) headers['X-Dedalus-Project'] = project

  const res = await fetch(`${DEDALUS_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'anthropic/claude-3-5-sonnet',
      messages: [{ role: 'user', content: 'Search for the latest geopolitical and political news from the past 1-2 days. Return a JSON array of 5-8 events.' }],
      system: SYSTEM_PROMPT,
      mcp_servers: ['dedalus-labs/brave-search'],
      max_tokens: 2048,
      temperature: 0,
    }),
  })

  if (!res.ok) {
    console.warn('[Dedalus Web Search]', res.status, await res.text())
    return []
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) return []

  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    const raw = jsonMatch ? jsonMatch[1].trim() : content.trim()
    const arr = JSON.parse(raw) as Record<string, unknown>[]

    if (!Array.isArray(arr) || arr.length === 0) return []

    const events: GeopoliticalEvent[] = arr.slice(0, 10).map((item, i) => ({
      id: i + 1,
      timestamp: (item.timestamp as string) ?? new Date().toISOString().replace('T', ' ').slice(0, 19),
      type: ['sanctions', 'trade', 'policy', 'regulation', 'political', 'compliance'].includes(String(item.type)) ? item.type as GeopoliticalEvent['type'] : 'political',
      severity: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(String(item.severity)) ? item.severity as GeopoliticalEvent['severity'] : 'MEDIUM',
      title: String(item.title ?? 'Untitled'),
      description: String(item.description ?? ''),
      country: String(item.country ?? 'Global'),
      affectedTransactions: 0,
      source: String(item.source ?? 'Web Search'),
    }))
    return events
  } catch {
    return []
  }
}
