/**
 * Decisions controller
 */
import type { Request, Response } from 'express'
import { getDecisionsMock } from '../mocks/decisions.mock.js'

export async function getDecisions(
  _req: Request,
  res: Response
): Promise<void> {
  const decisions = getDecisionsMock()
  res.json(decisions)
}
