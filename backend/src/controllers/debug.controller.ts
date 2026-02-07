/**
 * Debug endpoint to diagnose Dedalus API connection
 * GET /api/debug/dedalus
 */
import type { Request, Response } from 'express'

const DEDALUS_BASE = process.env.DEDALUS_API_URL ?? 'https://api.dedaluslabs.ai'

export async function debugDedalus(req: Request, res: Response): Promise<void> {
  const key = process.env.DEDALUS_API_KEY
  const project = process.env.DEDALUS_PROJECT
  const hasKey = !!key
  const keyPreview = hasKey ? `${key.slice(0, 10)}...${key.slice(-4)}` : 'not set'

  const result: Record<string, unknown> = {
    DEDALUS_API_KEY: keyPreview,
    DEDALUS_PROJECT: project ?? 'not set',
  }

  if (!hasKey) {
    res.json({ ...result, error: 'DEDALUS_API_KEY is not set in .env' })
    return
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    }
    if (project) headers['X-Dedalus-Project'] = project

    const fetchRes = await fetch(`${DEDALUS_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'anthropic/claude-3-5-sonnet',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 10,
        temperature: 0,
      }),
    })

    const data = await fetchRes.json()
    result.status = fetchRes.status
    result.statusText = fetchRes.statusText
    result.ok = fetchRes.ok

    if (fetchRes.ok) {
      const content = (data as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content
      result.success = true
      result.response = content ?? data
    } else {
      result.error = (data as { error?: { message?: string } })?.error?.message ?? data
    }
  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err)
  }

  res.json(result)
}
