/**
 * Deterministic rebalance logic - Layer 5: Action & control
 * AI decides what; code decides how much.
 * Portfolio-aware: only returns recommendations for tickers the user holds.
 */
import type {
  DedalusEvent,
  AgentReasoning,
  RebalancePlan,
  PortfolioHolding,
} from '../types/workflow.types.js'

const SEMICONDUCTOR_TICKERS = ['NVDA', 'AMD', 'INTC', 'QCOM']
const HEDGE_TICKERS = ['XLU']

export function computeRebalance(
  dedalusEvent: DedalusEvent | null,
  reasoning: AgentReasoning | null,
  portfolio: PortfolioHolding[] = []
): RebalancePlan {
  const adjustments: { ticker: string; deltaPercent: number; reason: string }[] = []
  const userTickers = new Set(portfolio.map((p) => p.ticker.toUpperCase()))

  /** Only include adjustment if user holds ticker (or portfolio empty = show all) */
  const include = (ticker: string) =>
    portfolio.length === 0 || userTickers.has(ticker.toUpperCase())

  if (!dedalusEvent) {
    return { adjustments }
  }

  const severity = dedalusEvent.severity
  const industries = dedalusEvent.affected_industries.map((i) => i.toLowerCase())
  const isSemiconductor = industries.some(
    (i) => i.includes('semiconductor') || i.includes('chip')
  )

  // Rule: HIGH/CRITICAL + Semiconductors → reduce exposure, hedge with utilities
  if ((severity === 'HIGH' || severity === 'CRITICAL') && isSemiconductor) {
    const reducePct = severity === 'CRITICAL' ? 0.6 : 0.7
    for (const t of SEMICONDUCTOR_TICKERS.slice(0, 2)) {
      if (include(t)) {
        adjustments.push({
          ticker: t,
          deltaPercent: -(reducePct * 10),
          reason: `High severity ${dedalusEvent.event_type}`,
        })
      }
    }
    if (include('XLU')) {
      adjustments.push({
        ticker: 'XLU',
        deltaPercent: 3,
        reason: 'Hedge with utilities',
      })
    }
    return {
      adjustments,
      hedge_with: 'XLU',
      freeze_exposure: ['NVDA', 'AMD'].filter((t) => include(t)),
    }
  }

  // Rule: MEDIUM + tech/semiconductor → modest reduction
  if (severity === 'MEDIUM' && isSemiconductor) {
    if (include('NVDA')) {
      adjustments.push({
        ticker: 'NVDA',
        deltaPercent: -2,
        reason: 'Moderate semiconductor risk',
      })
    }
    if (include('AMD')) {
      adjustments.push({
        ticker: 'AMD',
        deltaPercent: -1.5,
        reason: 'Moderate semiconductor risk',
      })
    }
    return { adjustments }
  }

  return { adjustments }
}
