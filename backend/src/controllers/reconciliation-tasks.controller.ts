/**
 * Reconciliation tasks controller
 */
import type { Request, Response } from 'express'
import { getReconciliationTasksMock } from '../mocks/reconciliation-tasks.mock.js'

export async function getReconciliationTasks(
  _req: Request,
  res: Response
): Promise<void> {
  const tasks = getReconciliationTasksMock()
  res.json(tasks)
}
