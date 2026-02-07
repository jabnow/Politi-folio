/**
 * Reconciliation controller
 */
import type { Request, Response } from 'express'
import { getTransactionsMock } from '../mocks/transactions.mock.js'

export async function getReconciliation(
  _req: Request,
  res: Response
): Promise<void> {
  const transactions = getTransactionsMock()
  res.json(transactions)
}
