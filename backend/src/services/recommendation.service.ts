/**
 * Agent 3 — Recommendation Agent (Dedalus)
 * Turns risk + market alignment into human-understandable posture guidance.
 * Uses Dedalus AI Gateway — no Gemini API key needed.
 */
import { dedalusChat, extractJson } from './dedalus-llm.service.js'

export interface RecommendationInput {
  geo_risk_severity: string
  market_alignment: string
  portfolio_state: 'overweight_semiconductors' | 'balanced' | 'underweight_semiconductors' | 'unknown'
}

export interface RecommendationOutput {
  recommended_posture: 'risk_on' | 'risk_off' | 'defensive' | 'neutral'
  rationale: string
  suggested_actions: string[]
}

const RECOMMENDATION_PROMPT = `You are a portfolio strategy advisor.

Task:
Provide a high-level recommendation based on risk and market alignment.

Rules:
- Do NOT specify allocations or trades
- Do NOT calculate weights
- Focus on posture (risk-on, risk-off, defensive)
- Keep recommendations conservative and explainable

Output JSON only.`

export async function runRecommendation(input: RecommendationInput): Promise<RecommendationOutput | null> {
  const prompt = `${RECOMMENDATION_PROMPT}

Expected output format:
{
  "recommended_posture": "risk_on" | "risk_off" | "defensive" | "neutral",
  "rationale": "Geopolitical risk is high and already reflected in markets",
  "suggested_actions": ["reduce concentrated exposure", "increase defensive balance"]
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
    const parsed = JSON.parse(extractJson(text)) as RecommendationOutput
    const postures = ['risk_on', 'risk_off', 'defensive', 'neutral']
    return {
      recommended_posture: postures.includes(parsed.recommended_posture) ? parsed.recommended_posture : 'neutral',
      rationale: String(parsed.rationale ?? ''),
      suggested_actions: Array.isArray(parsed.suggested_actions) ? parsed.suggested_actions : [],
    }
  } catch {
    return null
  }
}
