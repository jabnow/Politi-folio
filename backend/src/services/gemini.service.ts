/**
 * LLM Summary — key event summaries, compliance (Dedalus)
 * Uses Dedalus AI Gateway — no Gemini API key needed.
 */
import { dedalusChat } from './dedalus-llm.service.js'

export interface SummaryInput {
  events?: Array<{ type?: string; summary?: string; severity?: string }>
  marketData?: unknown
  rebalance?: { adjustments?: Array<{ ticker: string; reason: string }> }
}

/** Summarize key events and provide compliance-aware recommendations */
export async function summarizeKeyEvents(input: SummaryInput): Promise<string | null> {
  const prompt = `Summarize these geopolitical and market events. Provide:
1. Key events (2-3 bullet points)
2. Compliance considerations (sanctions, restricted sectors)
3. Portfolio impact recommendation

Context:
${JSON.stringify(input, null, 2)}

Respond in plain text, concise.`

  return dedalusChat(prompt, {
    systemPrompt: 'Be concise and factual. No JSON.',
    maxTokens: 512,
    temperature: 0.3,
  })
}
