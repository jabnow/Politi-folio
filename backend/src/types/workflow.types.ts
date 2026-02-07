/**
 * Workflow pipeline types for geopolitical → financial decision flow
 */

export interface NewsArticle {
  id: number
  title: string
  text?: string
  summary?: string
  url?: string
  publish_date?: string
  authors?: string[]
  category?: string
  sentiment?: number
}

export interface WorldNewsResponse {
  news?: NewsArticle[]
  top_news?: { news: NewsArticle[] }[]
}

export interface DedalusEvent {
  event_type: string
  affected_countries: string[]
  affected_industries: string[]
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  summary?: string
}

export interface AgentReasoning {
  geo_risk_assessment: string
  market_impact: string
  portfolio_recommendation: string
  suggested_tickers?: string[]
}

export interface AnalystEstimate {
  fiscal_period: string
  period: string
  earnings_per_share?: number
}

export interface RebalancePlan {
  adjustments: { ticker: string; deltaPercent: number; reason: string }[]
  hedge_with?: string
  freeze_exposure?: string[]
}

export interface WorkflowResult {
  step1_news: NewsArticle[]
  step2_dedalus: DedalusEvent | null
  step3_reasoning: AgentReasoning | null
  step4_estimates: Record<string, AnalystEstimate[]>
  step5_rebalance: RebalancePlan
}

export interface PortfolioHolding {
  ticker: string
  weight?: number
}

export interface KeyEvent {
  id: string
  timestamp: string
  news: NewsArticle[]
  dedalus: DedalusEvent | null
  reasoning: AgentReasoning | null
  estimates: Record<string, AnalystEstimate[]>
  rebalance: RebalancePlan
}
