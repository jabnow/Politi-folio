/**
 * Mock transaction data for demo
 */
import type { Transaction } from '../types/transaction.types.js'

export function getTransactionsMock(): Transaction[] {
  return [
    {
      id: '1',
      hash: '0xabc123',
      sender: 'rSender1',
      receiver: 'rReceiver1',
      amount: '1000',
      currency: 'XRP',
      timestamp: new Date(),
      riskScore: 25,
    },
    {
      id: '2',
      hash: '0xdef456',
      sender: 'rSender2',
      receiver: 'rReceiver2',
      amount: '5000',
      currency: 'XRP',
      timestamp: new Date(),
      riskScore: 75,
    },
  ]
}
