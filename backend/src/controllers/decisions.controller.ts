/**
 * Decisions controller
 */
import type { Request, Response } from 'express'

export async function getDecisions(
  _req: Request,
  res: Response
): Promise<void> {
  res.json([])
}
