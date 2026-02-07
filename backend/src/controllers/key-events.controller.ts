/**
 * Stored key events - SQLite with in-memory fallback
 */
import type { Request, Response } from 'express'
import { getEvents, getEventById } from '../services/events.store.js'
import { getKeyEvents, getKeyEventById, initTables } from '../services/sqlite.service.js'

export async function listKeyEvents(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  try {
    initTables()
    const events = getKeyEvents(limit)
    if (events) {
      res.json({ events })
      return
    }
  } catch {
    /* fall through to mock */
  }
  res.json({ events: getEvents(limit) })
}

export async function getKeyEvent(req: Request, res: Response): Promise<void> {
  try {
    initTables()
    const event = getKeyEventById(req.params.id)
    if (event) {
      res.json(event)
      return
    }
  } catch {
    /* fall through to mock */
  }
  const event = getEventById(req.params.id)
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  res.json(event)
}
