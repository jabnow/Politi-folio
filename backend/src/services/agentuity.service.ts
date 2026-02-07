/**
 * Agentuity / Dedalus reasoning - Layer 3: Multi-agent reasoning
 * Agentuity platform agents; fallback to Dedalus for orchestration when Agentuity invoke API is unclear.
 */
import type { DedalusEvent } from '../types/workflow.types.js'
import type { AgentReasoning } from '../types/workflow.types.js'

const DEDALUS_BASE = 'https://api.dedaluslabs.ai'

function getDedalusKey(): string {
  const key = process.env.DEDALUS_API_KEY
  if (!key) throw new Error('DEDALUS_API_KEY is required')
  return key
}

export async function runReasoning(dedalusEvent: DedalusEvent): Promise<AgentReasoning | null> {
  const key = getDedalusKey()
  const context = JSON.stringify(dedalusEvent, null, 2)
  const systemPrompt = `You coordinate three specialist agents: GeoRisk, MarketImpact, Portfolio. Assess impact on a US equity portfolio. Respond ONLY with valid JSON:
{
  "geo_risk_assessment": "GeoRisk Agent: historical analogs, country risk",
  "market_impact": "MarketImpact Agent: sector sensitivity, volatility outlook",
  "portfolio_recommendation": "Portfolio Agent: rebalance, hedge, or hold",
  "suggested_tickers": ["NVDA", "AMD", "SOXX", "XLU", "etc"]
}`

  const res = await fetch(`${DEDALUS_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-5-sonnet',
      messages: [{ role: 'user', content: `Context:\n${context}\n\nAssess impact on US equity portfolio.` }],
      system: systemPrompt,
      max_tokens: 1024,
      temperature: 0,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Reasoning API error: ${res.status} ${err}`)
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (!content) return null

  try {
    const parsed = JSON.parse(content.trim()) as AgentReasoning
    return {
      geo_risk_assessment: String(parsed.geo_risk_assessment ?? ''),
      market_impact: String(parsed.market_impact ?? ''),
      portfolio_recommendation: String(parsed.portfolio_recommendation ?? ''),
      suggested_tickers: Array.isArray(parsed.suggested_tickers) ? parsed.suggested_tickers : [],
    }
  } catch {
    return null
  }
}
