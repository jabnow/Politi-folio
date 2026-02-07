/**
 * Geopolitical events controller - SQLite with mock fallback
 */
import type { Request, Response } from 'express'
import { getEventsMock } from '../mocks/events.mock.js'
import { getGeoEvents, initTables } from '../services/sqlite.service.js'

export async function getEvents(_req: Request, res: Response): Promise<void> {
  try {
    initTables()
    const events = getGeoEvents()
    res.json(events && events.length > 0 ? events : getEventsMock())
  } catch {
    res.json(getEventsMock())
  }
}
