/**
 * News summary for reconciliation View Details - Web Search → Extract → AI Summarize
 */
import type { Request, Response } from 'express'
import { getNewsSummaryForEvent } from '../services/news-summary.service.js'

export async function getNewsSummary(req: Request, res: Response): Promise<void> {
  const eventType = req.query.eventType as string
  if (!eventType?.trim()) {
    res.status(400).json({ error: 'eventType query parameter is required' })
    return
  }

  try {
    const result = await getNewsSummaryForEvent(eventType.trim())
    if (!result) {
      res.status(404).json({ error: 'No news summary found for this event' })
      return
    }
    res.json(result)
  } catch (err) {
    console.error('[News Summary Controller]', err)
    res.status(500).json({ error: 'Failed to fetch news summary' })
  }
}
