/**
 * Agent 2 — Market Sync Agent (Dedalus)
 * Synchronizes geopolitics with market behavior.
 * Uses Dedalus AI Gateway — no Gemini API key needed.
 */
import { dedalusChat, extractJson } from './dedalus-llm.service.js'

export interface MarketSyncInput {
  geo_risk: { severity: string; affected_sectors: string[] }
  market_data: { sector_change_1w: number; sector_change_1m: number }
}

export interface MarketSyncOutput {
  alignment: 'confirmed' | 'lag' | 'divergence' | 'insufficient_data'
  interpretation: string
  confidence: number
}

const MARKET_SYNC_PROMPT = `You are a market synchronization analyst.

Task:
Determine whether current market behavior aligns with the geopolitical risk signal.

Rules:
- Do NOT forecast prices
- Do NOT suggest trades
- Assess confirmation, lag, or divergence
- Explain briefly

Output JSON only.`

export async function runMarketSync(input: MarketSyncInput): Promise<MarketSyncOutput | null> {
  const prompt = `${MARKET_SYNC_PROMPT}

Expected output format:
{
  "alignment": "confirmed" | "lag" | "divergence" | "insufficient_data",
  "interpretation": "Market weakness reflects geopolitical risk",
  "confidence": 0.88
}

Input:
${JSON.stringify(input, null, 2)}`

  const text = await dedalusChat(prompt, {
    systemPrompt: 'Respond ONLY with valid JSON. No markdown, no explanation.',
    maxTokens: 512,
    temperature: 0,
  })
  if (!text) return null

  try {
    const parsed = JSON.parse(extractJson(text)) as MarketSyncOutput
    const align = ['confirmed', 'lag', 'divergence', 'insufficient_data']
    return {
      alignment: align.includes(parsed.alignment) ? parsed.alignment : 'insufficient_data',
      interpretation: String(parsed.interpretation ?? ''),
      confidence: typeof parsed.confidence === 'number' ? Math.min(1, Math.max(0, parsed.confidence)) : 0.5,
    }
  } catch {
    return null
  }
}
