/**
 * Geopolitical events controller
 * Flow: SQLite → World News API → Dedalus Web Search (MCP) → mock fallback
 */
import type { Request, Response } from 'express'
import type { GeopoliticalEvent } from '../mocks/events.mock.js'
import { getEventsMock } from '../mocks/events.mock.js'
import { getGeoEvents, initTables, insertGeoEvent } from '../services/sqlite.service.js'
import { fetchRealCompanyNews } from '../services/real-news.service.js'
import { fetchPoliticalEventsViaWebSearch } from '../services/dedalus-web-search.service.js'

function storeAndReturn(events: GeopoliticalEvent[], res: Response): void {
  events.forEach((e) => {
    const { id: _id, ...rest } = e
    insertGeoEvent(rest)
  })
  const stored = getGeoEvents()
  res.json(stored?.length ? stored : events)
}

export async function getEvents(_req: Request, res: Response): Promise<void> {
  try {
    initTables()
    let events = getGeoEvents()

    if (events && events.length > 0) {
      res.json(events)
      return
    }

    // 1) World News API (NVDA, TSMC, semiconductors)
    try {
      const realNews = await fetchRealCompanyNews()
      if (realNews.length > 0) {
        storeAndReturn(realNews, res)
        return
      }
    } catch {
      /* fall through */
    }

    // 2) Dedalus Web Search (MCP brave-search) – live political events
    try {
      const webEvents = await fetchPoliticalEventsViaWebSearch()
      if (webEvents.length > 0) {
        storeAndReturn(webEvents, res)
        return
      }
    } catch {
      /* fall through */
    }

    // 3) Default: fake data
    res.json(getEventsMock())
  } catch {
    res.json(getEventsMock())
  }
}
