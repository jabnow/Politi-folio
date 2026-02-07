/**
 * Geopolitical → Financial workflow pipeline
 * Runs: News → Dedalus → Reasoning → FinancialDatasets → Rebalance
 * Supports: timestamp filtering, event storage, portfolio-aware rebalance
 */
import type { Request, Response } from 'express'
import type { PortfolioHolding } from '../types/workflow.types.js'
import { searchNews, getTopNews } from '../services/world-news.service.js'
import { analyzeNews } from '../services/dedalus.service.js'
import { runReasoning } from '../services/agentuity.service.js'
import { getEstimatesForTickers } from '../services/financial-datasets.service.js'
import { computeRebalance } from '../services/rebalance.service.js'
import { storeEvent } from '../services/events.store.js'
import { storeKeyEvent, initTables, insertGeoEvent, insertReconciliationTask } from '../services/sqlite.service.js'
import type { GeopoliticalEvent } from '../mocks/events.mock.js'

/** Format YYYY-MM-DD HH:MM:SS for World News API */
function toApiDate(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ')
}

export async function runWorkflow(req: Request, res: Response): Promise<void> {
  try {
    const useTopNews = req.query.source === 'top'
    const searchQuery = (req.query.q as string) || 'US politics economy tariffs'
    const fromParam = req.query.from as string | undefined
    const toParam = req.query.to as string | undefined
    const timestampParam = req.query.timestamp as string | undefined

    // Parse portfolio from body (POST) or query (GET: ?portfolio=NVDA,AMD,XLU)
    let portfolio: PortfolioHolding[] = []
    if (req.body?.portfolio && Array.isArray(req.body.portfolio)) {
      portfolio = req.body.portfolio.map((p: { ticker: string; weight?: number } | string) =>
        typeof p === 'string' ? { ticker: p } : { ticker: p.ticker, weight: p.weight }
      )
    } else if (req.query.portfolio && typeof req.query.portfolio === 'string') {
      portfolio = req.query.portfolio.split(',').map((t) => ({ ticker: t.trim() }))
    }

    // Timestamp filtering
    let earliestDate: string | undefined
    let latestDate: string | undefined
    let topNewsDate: string | undefined
    if (timestampParam) {
      const d = new Date(timestampParam)
      if (!isNaN(d.getTime())) {
        earliestDate = toApiDate(d)
        latestDate = toApiDate(new Date(d.getTime() + 86400000))
        topNewsDate = d.toISOString().slice(0, 10)
      }
    } else if (fromParam || toParam) {
      if (fromParam) {
        const d = new Date(fromParam)
        if (!isNaN(d.getTime())) earliestDate = toApiDate(d)
      }
      if (toParam) {
        const d = new Date(toParam)
        if (!isNaN(d.getTime())) latestDate = toApiDate(d)
      }
    }

    // Step 1: Ingest geopolitical events (with optional date range)
    const news = useTopNews
      ? await getTopNews({
          'source-country': 'us',
          ...(topNewsDate && { date: topNewsDate }),
        })
      : await searchNews({
          text: searchQuery,
          language: 'en',
          categories: 'politics,technology,business',
          number: 5,
          ...(earliestDate && { 'earliest-publish-date': earliestDate }),
          ...(latestDate && { 'latest-publish-date': latestDate }),
        })

    const headlines = news.map((n) => `${n.title}. ${n.summary ?? ''}`).join('\n\n')
    if (!headlines.trim()) {
      res.json({
        step1_news: [],
        step2_dedalus: null,
        step3_reasoning: null,
        step4_estimates: {},
        step5_rebalance: { adjustments: [] },
        error: 'No news articles found',
      })
      return
    }

    // Step 2: Dedalus extraction
    const dedalusEvent = await analyzeNews(headlines)

    // Step 3: Multi-agent reasoning
    const reasoning = dedalusEvent ? await runReasoning(dedalusEvent) : null

    // Step 4: Financial mapping (analyst estimates for suggested tickers)
    const tickers = reasoning?.suggested_tickers?.length
      ? reasoning.suggested_tickers.slice(0, 5)
      : ['NVDA', 'AMD', 'SOXX', 'XLU']
    const estimates = await getEstimatesForTickers(tickers)

    // Step 5: Deterministic rebalance (portfolio-aware)
    const rebalance = computeRebalance(dedalusEvent, reasoning, portfolio)

    const result = {
      step1_news: news,
      step2_dedalus: dedalusEvent,
      step3_reasoning: reasoning,
      step4_estimates: estimates,
      step5_rebalance: rebalance,
    }

    // Store as key event - SQLite first, in-memory fallback
    const eventPayload = {
      timestamp: new Date().toISOString(),
      news: result.step1_news,
      dedalus: result.step2_dedalus,
      reasoning: result.step3_reasoning,
      estimates: result.step4_estimates,
      rebalance: result.step5_rebalance,
    }
    let stored: { id: string }
    try {
      initTables()
      const id = `wf-${Date.now()}`

      // Wire workflow results into dashboards: geo_events + reconciliation_tasks
      const dedalus = result.step2_dedalus
      const rebalance = result.step5_rebalance
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
      result.step1_news.forEach((n) => {
        const geo: Omit<GeopoliticalEvent, 'id'> = {
          timestamp: n.publish_date ?? now,
          type: 'political',
          severity: (dedalus?.severity ?? 'MEDIUM') as GeopoliticalEvent['severity'],
          title: n.title,
          description: n.summary ?? n.text?.slice(0, 300) ?? '',
          country: dedalus?.affected_countries?.[0] ?? 'Global',
          affectedTransactions: 0,
          source: n.authors?.[0] ?? 'World News API',
        }
        insertGeoEvent(geo)
      })
      if (rebalance.adjustments.length > 0) {
        insertReconciliationTask({
          id: `rec-${Date.now()}`,
          eventType: dedalus?.event_type ?? 'Workflow Rebalance',
          triggeredBy: 'Geopolitical Workflow',
          status: 'completed',
          transactionsScanned: 0,
          transactionsFlagged: 0,
          transactionsReconciled: rebalance.adjustments.length,
          startTime: now,
          completionTime: now,
          estimatedSavings: 0,
          assignedTo: 'AI Engine',
          priority: 'high',
        })
      }

      const dbStored = storeKeyEvent(eventPayload, id)
      stored = dbStored ?? storeEvent(eventPayload)
    } catch {
      stored = storeEvent(eventPayload)
    }

    res.json({
      ...result,
      key_event_id: stored.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
