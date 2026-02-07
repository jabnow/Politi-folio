/**
 * Geopolitical events controller
 */
import type { Request, Response } from 'express'
import { getEventsMock } from '../mocks/events.mock.js'

export async function getEvents(_req: Request, res: Response): Promise<void> {
  const events = getEventsMock()
  res.json(events)
}
