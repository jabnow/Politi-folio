/**
 * Stored key events - list and retrieve
 */
import type { Request, Response } from 'express'
import { getEvents, getEventById } from '../services/events.store.js'

export async function listKeyEvents(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 50, 100)
  const events = getEvents(limit)
  res.json({ events })
}

export async function getKeyEvent(req: Request, res: Response): Promise<void> {
  const event = getEventById(req.params.id)
  if (!event) {
    res.status(404).json({ error: 'Event not found' })
    return
  }
  res.json(event)
}
