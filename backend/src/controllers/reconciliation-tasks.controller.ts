/**
 * Reconciliation tasks controller - SQLite with mock fallback
 */
import type { Request, Response } from 'express'
import { getReconciliationTasksMock } from '../mocks/reconciliation-tasks.mock.js'
import { getReconciliationTasks as getTasksFromDb, initTables } from '../services/sqlite.service.js'

export async function getReconciliationTasks(
  _req: Request,
  res: Response
): Promise<void> {
  try {
    initTables()
    const tasks = getTasksFromDb()
    res.json(tasks && tasks.length > 0 ? tasks : getReconciliationTasksMock())
  } catch {
    res.json(getReconciliationTasksMock())
  }
}
