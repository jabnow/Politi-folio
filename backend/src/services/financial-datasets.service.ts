/**
 * FinancialDatasets.ai - Layer 4: Analyst estimates by ticker
 * Maps events to real market data.
 */
import type { AnalystEstimate } from '../types/workflow.types.js'

const BASE = 'https://api.financialdatasets.ai'

function getApiKey(): string | null {
  return process.env.FINANCIAL_DATASETS_API_KEY ?? null
}

export async function getAnalystEstimates(
  ticker: string,
  period: 'annual' | 'quarterly' = 'annual'
): Promise<AnalystEstimate[]> {
  const key = getApiKey()
  if (!key) return []

  const url = `${BASE}/analyst-estimates/?ticker=${encodeURIComponent(ticker)}&period=${period}`
  const res = await fetch(url, {
    headers: { 'X-API-KEY': key },
  })

  if (!res.ok) return []

  const data = (await res.json()) as { analyst_estimates?: AnalystEstimate[] }
  const estimates = data.analyst_estimates ?? []
  return estimates
}

export async function getEstimatesForTickers(
  tickers: string[]
): Promise<Record<string, AnalystEstimate[]>> {
  const result: Record<string, AnalystEstimate[]> = {}
  for (const ticker of tickers) {
    result[ticker] = await getAnalystEstimates(ticker)
  }
  return result
}
