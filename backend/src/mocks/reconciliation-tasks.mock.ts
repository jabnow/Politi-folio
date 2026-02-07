/**
 * Mock reconciliation tasks for demo
 */
export interface ReconciliationTask {
  id: string
  eventType: string
  triggeredBy: string
  status: 'processing' | 'completed' | 'requires_review' | 'failed'
  transactionsScanned: number
  transactionsFlagged: number
  transactionsReconciled: number
  startTime: string
  completionTime?: string
  estimatedSavings: number
  assignedTo?: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

const ts = (d: Date) => d.toISOString().replace('T', ' ').slice(0, 19)

export function getReconciliationTasksMock(): ReconciliationTask[] {
  const now = new Date()
  return [
    {
      id: 'REC-001',
      eventType: 'EU Sanctions Update',
      triggeredBy: 'Automated Policy Monitor',
      status: 'completed',
      transactionsScanned: 1247,
      transactionsFlagged: 125,
      transactionsReconciled: 125,
      startTime: ts(now),
      completionTime: ts(new Date(now.getTime() + 45 * 1000)),
      estimatedSavings: 3200,
      assignedTo: 'AI Engine',
      priority: 'critical',
    },
    {
      id: 'REC-002',
      eventType: 'Belarus Trade Restrictions',
      triggeredBy: 'OFAC Alert',
      status: 'completed',
      transactionsScanned: 892,
      transactionsFlagged: 45,
      transactionsReconciled: 45,
      startTime: ts(new Date(now.getTime() - 5 * 60000)),
      completionTime: ts(new Date(now.getTime() - 5 * 60000 + 32 * 1000)),
      estimatedSavings: 1800,
      assignedTo: 'AI Engine',
      priority: 'high',
    },
    {
      id: 'REC-003',
      eventType: 'ECB AML Guidelines Update',
      triggeredBy: 'Regulatory Feed',
      status: 'processing',
      transactionsScanned: 3421,
      transactionsFlagged: 234,
      transactionsReconciled: 156,
      startTime: ts(new Date(now.getTime() - 11 * 60000)),
      estimatedSavings: 2400,
      priority: 'medium',
    },
    {
      id: 'REC-004',
      eventType: 'Country Risk Update - Brazil',
      triggeredBy: 'Geopolitical Monitor',
      status: 'requires_review',
      transactionsScanned: 567,
      transactionsFlagged: 156,
      transactionsReconciled: 142,
      startTime: ts(new Date(now.getTime() - 25 * 60000)),
      estimatedSavings: 1200,
      assignedTo: 'Compliance Team',
      priority: 'high',
    },
    {
      id: 'REC-005',
      eventType: 'Routine Daily Reconciliation',
      triggeredBy: 'Scheduled Task',
      status: 'completed',
      transactionsScanned: 8945,
      transactionsFlagged: 23,
      transactionsReconciled: 23,
      startTime: ts(new Date(now.getTime() - 5 * 3600000)),
      completionTime: ts(new Date(now.getTime() - 5 * 3600000 + 135 * 1000)),
      estimatedSavings: 4500,
      assignedTo: 'AI Engine',
      priority: 'low',
    },
  ]
}
