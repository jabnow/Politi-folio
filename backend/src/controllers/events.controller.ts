/**
 * Geopolitical events controller - SQLite → real news (NVDA, TSMC) → mock fallback
 */
import type { Request, Response } from 'express'
import { getEventsMock } from '../mocks/events.mock.js'
import { getGeoEvents, initTables, insertGeoEvent } from '../services/sqlite.service.js'
import { fetchRealCompanyNews } from '../services/real-news.service.js'

export async function getEvents(_req: Request, res: Response): Promise<void> {
  try {
    initTables()
    let events = getGeoEvents()

    if (events && events.length > 0) {
      res.json(events)
      return
    }

    // DB empty: fetch real company news (NVDA, TSMC, semiconductors)
    try {
      const realNews = await fetchRealCompanyNews()
      if (realNews.length > 0) {
        realNews.forEach((e) => {
          const { id: _id, ...rest } = e
          insertGeoEvent(rest)
        })
        events = getGeoEvents()
        if (events && events.length > 0) {
          res.json(events)
          return
        }
      }
    } catch {
      /* fall through to mock */
    }

    res.json(getEventsMock())
  } catch {
    res.json(getEventsMock())
  }
}
