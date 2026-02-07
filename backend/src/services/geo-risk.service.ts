/**
 * Agent 1 — GeoRisk Agent (Dedalus)
 * Interprets geopolitical events and produces shared context for downstream agents.
 * Uses Dedalus AI Gateway — no Gemini API key needed.
 */
import { dedalusChat, extractJson } from './dedalus-llm.service.js'

export interface GeoRiskInput {
  headline: string
  country: string
  affected_entities: string[]
}

export interface GeoRiskOutput {
  risk_type: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  affected_sectors: string[]
  market_relevance: string
}

const GEORISK_PROMPT = `You are a geopolitical risk analyst.

Task:
Interpret the geopolitical event and explain its potential financial relevance.

Rules:
- Focus on systemic vs sector-specific impact
- Do NOT mention portfolio weights
- Do NOT suggest trades
- Be concise and factual

Output JSON only.`

export async function runGeoRisk(input: GeoRiskInput): Promise<GeoRiskOutput | null> {
  const prompt = `${GEORISK_PROMPT}

Expected output format:
{
  "risk_type": "string (e.g. trade_restriction, sanctions, conflict)",
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "affected_sectors": ["Semiconductors", "etc"],
  "market_relevance": "Direct revenue and supply chain exposure"
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
    const parsed = JSON.parse(extractJson(text)) as GeoRiskOutput
    return {
      risk_type: String(parsed.risk_type ?? 'unknown'),
      severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.severity) ? parsed.severity : 'MEDIUM',
      affected_sectors: Array.isArray(parsed.affected_sectors) ? parsed.affected_sectors : [],
      market_relevance: String(parsed.market_relevance ?? ''),
    }
  } catch {
    return null
  }
}
