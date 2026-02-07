/**
 * Dedalus AI Gateway - shared LLM interface for all agents
 * Uses DEDALUS_API_KEY + DEDALUS_PROJECT. No Gemini API key needed.
 * Steps 1-4 (GeoRisk, Market Sync, Recommendation, Summary) use this.
 */
const DEDALUS_BASE = process.env.DEDALUS_API_URL ?? 'https://api.dedaluslabs.ai'
const DEFAULT_MODEL = 'anthropic/claude-3-5-sonnet'

function getApiKey(): string | null {
  return process.env.DEDALUS_API_KEY ?? null
}

function getHeaders(): Record<string, string> {
  const key = getApiKey()
  if (!key) return {}
  const headers: Record<string, string> = {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  }
  const project = process.env.DEDALUS_PROJECT
  if (project) headers['X-Dedalus-Project'] = project
  return headers
}

export interface ChatOptions {
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
}

/**
 * Call Dedalus chat completions API (OpenAI-compatible).
 * Returns raw text from the model.
 */
export async function dedalusChat(
  userPrompt: string,
  options: ChatOptions = {}
): Promise<string | null> {
  const key = getApiKey()
  if (!key) {
    console.error('[Dedalus] DEDALUS_API_KEY is not set')
    return null
  }

  const {
    systemPrompt,
    maxTokens = 512,
    temperature = 0,
  } = options

  const res = await fetch(`${DEDALUS_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: userPrompt }],
      ...(systemPrompt && { system: systemPrompt }),
      max_tokens: maxTokens,
      temperature,
    }),
  })

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[]; error?: { message?: string; code?: string } }

  if (!res.ok) {
    const errMsg = (data as { error?: { message?: string } })?.error?.message ?? JSON.stringify(data)
    console.error(`[Dedalus] ${res.status} ${res.statusText}:`, errMsg)
    return null
  }

  if (!data?.choices?.[0]?.message?.content) {
    console.error('[Dedalus] Empty or unexpected response:', JSON.stringify(data).slice(0, 200))
    return null
  }
  const content = data.choices?.[0]?.message?.content
  return content?.trim() ?? null
}

/** Extract JSON from model output (handles ```json ... ``` wrappers) */
export function extractJson(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) return jsonMatch[1].trim()
  return text.trim()
}
